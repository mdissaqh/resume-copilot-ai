/**
 * AI MUTATION ENGINE
 * ==================
 * Deterministic, typed mutation engine that replaces the brittle 300-line
 * if/else block in BuilderPage.jsx.
 *
 * Every AI question produces a structured mutation description.
 * This engine validates the mutation and applies it to the canonical resume.
 *
 * Safety guarantees:
 *   - NEVER writes the strings "Yes" or "No" as content
 *   - NEVER overwrites a field with undefined/null when a non-empty value existed
 *   - Creates array items with stable _id before writing nested fields
 *   - Skills items are always stored as string[] not a single string
 */

import { generateId } from './idGenerator';
import { resolveTargetRef } from './resumeBindingMap';
import { setIn } from '../features/builder/utils/pathHelpers';

// ─── Empty item factories ────────────────────────────────────────────────────

const EMPTY_FACTORIES = {
    experience: () => ({
        _id: generateId(), role: '', organization: '', location: '',
        startDate: '', endDate: '', description: '', achievements: ['']
    }),
    projects: () => ({
        _id: generateId(), title: '', description: '', date: '',
        githubUrl: '', liveUrl: '', technologies: [], highlights: ['']
    }),
    education: () => ({
        _id: generateId(), institution: '', degree: '', fieldOfStudy: '',
        score: '', location: '', startDate: '', endDate: ''
    }),
    skills: () => ({
        _id: generateId(), category: 'Core Skills', items: []
    }),
    certifications: () => ({
        _id: generateId(), name: '', issuer: '', date: '', url: '', platform: ''
    }),
    additionalSections: () => ({
        _id: generateId(), id: '', sectionTitle: 'Custom Section', items: []
    }),
    links: () => ({
        _id: generateId(), platform: 'Link', url: ''
    })
};

// ─── Platform detection from URL ────────────────────────────────────────────

const detectPlatform = (url) => {
    if (!url || typeof url !== 'string') return 'Link';
    const lower = url.toLowerCase();
    if (lower.includes('linkedin.com'))  return 'LinkedIn';
    if (lower.includes('github.com'))   return 'GitHub';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'Twitter';
    if (lower.includes('leetcode.com')) return 'LeetCode';
    if (lower.includes('portfolio') || lower.includes('behance') || lower.includes('dribbble')) return 'Portfolio';
    return 'Link';
};

// ─── Parse skill items from a comma-separated string ────────────────────────

const parseSkillItems = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
        return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
};

// ─── SAFETY GUARD: Never write "Yes" or "No" as resume content ──────────────

const isBooleanString = (val) => {
    if (typeof val !== 'string') return false;
    const t = val.trim().toLowerCase();
    return t === 'yes' || t === 'no' || t === 'accept' || t === 'reject';
};

// ─── Main mutation resolver ──────────────────────────────────────────────────

/**
 * Applies an AI question answer to the canonical resume state.
 *
 * @param {Object} params
 * @param {Object} params.question       - The AI question object
 * @param {*}      params.answerValue    - The user's answer
 * @param {Object} params.resumeData     - Current canonical resume state
 * @param {Object} params.bindingMap     - Result of buildBindingMap(resumeData)
 * @returns {{ resumeData: Object, appliedPath: string[]|null, description: string }}
 */
export const applyAIMutation = ({ question, answerValue, resumeData, bindingMap }) => {
    if (!question || !resumeData) {
        return { resumeData, appliedPath: null, description: 'No-op: missing question or resume' };
    }

    // Safety: never write boolean strings as resume content
    if (isBooleanString(answerValue) && question.type !== 'yes_no') {
        return { resumeData, appliedPath: null, description: `Safety block: "${answerValue}" rejected as resume content` };
    }

    const isYesNo = question.type === 'yes_no' || Boolean(question.proposedText || question.proposal);
    const accepted = isYesNo && (String(answerValue).toLowerCase() === 'yes' || answerValue === 'Accept');
    const rejected = isYesNo && !accepted;

    // ── Yes/No: Apply proposal or skip ──────────────────────────────────────
    if (isYesNo) {
        if (rejected) {
            return { resumeData, appliedPath: null, description: 'User rejected proposal — no mutation applied' };
        }
        // Apply proposedText or proposal.proposed
        const proposedValue = question.proposedText ||
            question.proposal?.proposed ||
            question.proposal?.proposedText;

        if (!proposedValue) {
            return { resumeData, appliedPath: null, description: 'Yes/No accepted but no proposedText found' };
        }

        const path = resolvePathFromQuestion(question, bindingMap);
        if (!path) {
            return { resumeData, appliedPath: null, description: `Could not resolve path for yes_no proposal` };
        }

        // If this is a skills items path, ensure array storage
        const isSkillItems = path.includes('skills') && path[path.length - 1] === 'items';
        const valueToWrite = isSkillItems ? parseSkillItems(proposedValue) : proposedValue;

        const updated = setIn(resumeData, path, valueToWrite);
        const ensured = ensureSectionVisible(updated, path[0]);
        return { resumeData: ensured, appliedPath: path, description: `SET_FIELD via yes_no acceptance` };
    }

    // ── Text answer ─────────────────────────────────────────────────────────
    if (!answerValue || isBooleanString(answerValue)) {
        return { resumeData, appliedPath: null, description: 'Empty or boolean answer — no mutation' };
    }

    // Determine mutation operation from question
    const operation = question.mutation?.operation || inferOperation(question, resumeData);

    if (DEBUG_MODE) {
        console.group(`[MutationEngine] Q: ${question.id}`);
        console.log('operation:', operation);
        console.log('answerValue:', answerValue);
        console.log('question.targetRef:', question.targetRef);
    }

    let result;
    switch (operation) {
        case 'SET_FIELD':
            result = applySetField(question, answerValue, resumeData, bindingMap);
            break;
        case 'ADD_ITEM_AND_SET':
            result = applyAddItemAndSet(question, answerValue, resumeData);
            break;
        case 'ADD_LINK':
            result = applyAddLink(question, answerValue, resumeData, bindingMap);
            break;
        case 'REPLACE_ARRAY':
            result = applyReplaceArray(question, answerValue, resumeData, bindingMap);
            break;
        case 'APPEND_TO_ARRAY':
            result = applyAppendToArray(question, answerValue, resumeData, bindingMap);
            break;
        case 'SKIP':
            result = { resumeData, appliedPath: null, description: 'SKIP operation' };
            break;
        default:
            // Fallback: try to resolve path and set field
            result = applySetField(question, answerValue, resumeData, bindingMap);
    }

    if (DEBUG_MODE) {
        console.log('result path:', result.appliedPath);
        console.groupEnd();
    }

    return result;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DEBUG_MODE = typeof window !== 'undefined' && window.__RESUME_DEBUG__;

/**
 * Infer the operation type from the question when not explicitly specified.
 */
const inferOperation = (question, resumeData) => {
    const target = question.targetRef || {};
    const section = question.targetRef?.section ||
        (Array.isArray(question.targetPath) ? question.targetPath[0] : null);

    // Personal links are always ADD_LINK operations
    if (section === 'personalInfo' && (target.field === 'links' || String(question.message || '').toLowerCase().includes('link'))) {
        return 'ADD_LINK';
    }

    // If targeting a collection root and it's empty → ADD_ITEM_AND_SET
    if (section && target.field === null && !target.nodeId) {
        const collection = resumeData[section];
        if (Array.isArray(collection) && collection.length === 0) {
            return 'ADD_ITEM_AND_SET';
        }
    }

    // Skills items are always REPLACE_ARRAY (comma-separated)
    if (section === 'skills' && (target.field === 'items' || String(question.message || '').toLowerCase().includes('skill'))) {
        return 'REPLACE_ARRAY';
    }

    return 'SET_FIELD';
};

/**
 * Resolve the canonical path from a question's targeting information.
 * Prefers new targetRef → bindingMap, falls back to legacy targetPath.
 */
const resolvePathFromQuestion = (question, bindingMap) => {
    // NEW: targetRef contract
    if (question.targetRef && bindingMap) {
        const path = resolveTargetRef(question.targetRef, bindingMap);
        if (path) return path;
    }

    // LEGACY: targetPath (raw array)
    if (Array.isArray(question.targetPath) && question.targetPath.length > 0) {
        return question.targetPath;
    }

    return null;
};

/**
 * SET_FIELD: Write a value at the resolved path.
 * Handles special cases: skills items (array), date parsing, etc.
 */
const applySetField = (question, answerValue, resumeData, bindingMap) => {
    const path = resolvePathFromQuestion(question, bindingMap);
    if (!path) {
        // Try section-level fallback for simple field writes
        return applyFallbackSectionWrite(question, answerValue, resumeData);
    }

    const section = path[0];
    const field = path[path.length - 1];

    // Skills items: always store as string[]
    if (section === 'skills' && field === 'items') {
        const items = parseSkillItems(answerValue);
        const currentItems = getIn(resumeData, path) || [];
        // Merge: add items not already present
        const merged = [...currentItems];
        items.forEach(item => { if (!merged.includes(item)) merged.push(item); });
        const updated = setIn(resumeData, path, merged);
        return { resumeData: ensureSectionVisible(updated, section), appliedPath: path, description: `REPLACE_ARRAY skills.items` };
    }

    // Personal info links via ADD_LINK route
    if (section === 'personalInfo' && String(field).includes('link')) {
        return applyAddLink(question, answerValue, resumeData, bindingMap);
    }

    // Ensure parent array item exists before writing nested field
    if (path.length >= 3 && typeof path[1] === 'number') {
        const collectionPath = path.slice(0, 2);
        const existingItem = getIn(resumeData, collectionPath);
        if (!existingItem) {
            // Create the item first, then set the field
            const newItem = { ...(EMPTY_FACTORIES[section]?.() || { _id: generateId() }) };
            newItem[field] = answerValue;
            const collPath = [section];
            const arr = Array.isArray(resumeData[section]) ? [...resumeData[section]] : [];
            arr[path[1]] = newItem;
            const updated = setIn(resumeData, collPath, arr);
            return { resumeData: ensureSectionVisible(updated, section), appliedPath: path, description: `ADD_ITEM then SET_FIELD ${path.join('.')}` };
        }
    }

    const updated = setIn(resumeData, path, answerValue);
    return { resumeData: ensureSectionVisible(updated, section), appliedPath: path, description: `SET_FIELD ${path.join('.')}` };
};

/**
 * ADD_ITEM_AND_SET: Create a new item in a collection and populate its fields.
 * Used when the collection is empty (e.g., education: []).
 */
const applyAddItemAndSet = (question, answerValue, resumeData) => {
    const target = question.targetRef || {};
    const collection = target.collection ||
        (Array.isArray(question.targetPath) ? question.targetPath[0] : null) ||
        question.mutation?.collection;

    if (!collection || !EMPTY_FACTORIES[collection]) {
        return { resumeData, appliedPath: null, description: `ADD_ITEM_AND_SET: unknown collection "${collection}"` };
    }

    const factory = EMPTY_FACTORIES[collection];
    const newItem = factory();

    // Populate the specific field if one is targeted
    const field = target.field || (Array.isArray(question.targetPath) ? question.targetPath[2] : null);
    if (field && field in newItem) {
        newItem[field] = answerValue;
    }

    // If multi-field answer is provided (e.g., ADD_ITEM_AND_SET with fields object)
    const fieldsMap = question.mutation?.fields;
    if (fieldsMap && typeof fieldsMap === 'object') {
        Object.assign(newItem, fieldsMap);
    }

    const existingArr = Array.isArray(resumeData[collection]) ? resumeData[collection] : [];
    const updated = setIn(resumeData, [collection], [...existingArr, newItem]);

    return {
        resumeData: ensureSectionVisible(updated, collection),
        appliedPath: [collection, existingArr.length],
        description: `ADD_ITEM_AND_SET ${collection} with _id ${newItem._id}`
    };
};

/**
 * ADD_LINK: Add or update a link in personalInfo.links.
 * Detects platform from URL automatically.
 */
const applyAddLink = (question, answerValue, resumeData, bindingMap) => {
    const currentLinks = Array.isArray(resumeData.personalInfo?.links)
        ? [...resumeData.personalInfo.links]
        : [];

    const url = typeof answerValue === 'string' ? answerValue.trim() : '';
    if (!url) {
        return { resumeData, appliedPath: null, description: 'ADD_LINK: empty URL' };
    }

    // Detect platform from URL
    const platform = detectPlatform(url);

    // Update existing link with same platform, or append
    const existingIdx = currentLinks.findIndex(
        l => (typeof l === 'object' ? l.platform?.toLowerCase() : '') === platform.toLowerCase()
    );

    if (existingIdx >= 0) {
        currentLinks[existingIdx] = { ...currentLinks[existingIdx], url };
    } else {
        currentLinks.push({ _id: generateId(), platform, url });
    }

    const updated = setIn(resumeData, ['personalInfo', 'links'], currentLinks);
    return {
        resumeData: updated,
        appliedPath: ['personalInfo', 'links'],
        description: `ADD_LINK ${platform}: ${url}`
    };
};

/**
 * REPLACE_ARRAY: Replace entire array value (e.g., skill items).
 */
const applyReplaceArray = (question, answerValue, resumeData, bindingMap) => {
    const path = resolvePathFromQuestion(question, bindingMap);
    if (!path) return { resumeData, appliedPath: null, description: 'REPLACE_ARRAY: path not resolved' };

    const items = parseSkillItems(answerValue);
    const updated = setIn(resumeData, path, items);
    return {
        resumeData: ensureSectionVisible(updated, path[0]),
        appliedPath: path,
        description: `REPLACE_ARRAY ${path.join('.')}`
    };
};

/**
 * APPEND_TO_ARRAY: Append a value to an array field.
 */
const applyAppendToArray = (question, answerValue, resumeData, bindingMap) => {
    const path = resolvePathFromQuestion(question, bindingMap);
    if (!path) return { resumeData, appliedPath: null, description: 'APPEND_TO_ARRAY: path not resolved' };

    const current = getIn(resumeData, path);
    const arr = Array.isArray(current) ? [...current] : [];
    arr.push(answerValue);
    const updated = setIn(resumeData, path, arr);
    return {
        resumeData: ensureSectionVisible(updated, path[0]),
        appliedPath: path,
        description: `APPEND_TO_ARRAY ${path.join('.')}`
    };
};

/**
 * Fallback: If the path couldn't be resolved via binding map, try to
 * intelligently write based on section-level analysis.
 * This handles edge cases where AI returns a question without a targetRef.
 */
const applyFallbackSectionWrite = (question, answerValue, resumeData) => {
    const msg = String(question.message || question.id || '').toLowerCase();

    // Personal info scalar fields
    if (msg.includes('full name') || msg.includes('your name')) {
        const updated = setIn(resumeData, ['personalInfo', 'fullName'], answerValue);
        return { resumeData: updated, appliedPath: ['personalInfo', 'fullName'], description: 'Fallback: personalInfo.fullName' };
    }
    if (msg.includes('email')) {
        const updated = setIn(resumeData, ['personalInfo', 'email'], answerValue);
        return { resumeData: updated, appliedPath: ['personalInfo', 'email'], description: 'Fallback: personalInfo.email' };
    }
    if (msg.includes('phone') || msg.includes('mobile') || msg.includes('contact number')) {
        const updated = setIn(resumeData, ['personalInfo', 'phone'], answerValue);
        return { resumeData: updated, appliedPath: ['personalInfo', 'phone'], description: 'Fallback: personalInfo.phone' };
    }
    if (msg.includes('location') || msg.includes('city') || msg.includes('address')) {
        const updated = setIn(resumeData, ['personalInfo', 'location'], answerValue);
        return { resumeData: updated, appliedPath: ['personalInfo', 'location'], description: 'Fallback: personalInfo.location' };
    }
    if (msg.includes('linkedin') || msg.includes('github') || msg.includes('portfolio') || msg.includes('url') || msg.includes('link')) {
        return applyAddLink(question, answerValue, resumeData, null);
    }

    // Summary
    if (msg.includes('summary') || msg.includes('professional background')) {
        const updated = setIn(resumeData, ['professionalSummary'], answerValue);
        return { resumeData: updated, appliedPath: ['professionalSummary'], description: 'Fallback: professionalSummary' };
    }

    // Education → create item if array is empty
    if (msg.includes('degree') || msg.includes('education') || msg.includes('university') || msg.includes('institution') || msg.includes('cgpa') || msg.includes('gpa')) {
        const edu = Array.isArray(resumeData.education) ? resumeData.education : [];
        if (edu.length === 0) {
            const newEdu = { ...EMPTY_FACTORIES.education(), degree: answerValue };
            const updated = setIn(resumeData, ['education'], [newEdu]);
            return { resumeData: ensureSectionVisible(updated, 'education'), appliedPath: ['education', 0], description: 'Fallback: ADD_ITEM education' };
        }
        // Update the last education item's degree field
        const lastIdx = edu.length - 1;
        const updated = setIn(resumeData, ['education', lastIdx, 'degree'], answerValue);
        return { resumeData: updated, appliedPath: ['education', lastIdx, 'degree'], description: 'Fallback: education.degree' };
    }

    // Skills
    if (msg.includes('skill') || msg.includes('technolog') || msg.includes('tool')) {
        const skillsArr = Array.isArray(resumeData.skills) ? resumeData.skills : [];
        if (skillsArr.length === 0) {
            const newGroup = { ...EMPTY_FACTORIES.skills(), items: parseSkillItems(answerValue) };
            const updated = setIn(resumeData, ['skills'], [newGroup]);
            return { resumeData: ensureSectionVisible(updated, 'skills'), appliedPath: ['skills', 0, 'items'], description: 'Fallback: ADD skill group' };
        }
        const items = parseSkillItems(answerValue);
        const currentItems = Array.isArray(skillsArr[0].items) ? [...skillsArr[0].items] : [];
        items.forEach(item => { if (!currentItems.includes(item)) currentItems.push(item); });
        const updated = setIn(resumeData, ['skills', 0, 'items'], currentItems);
        return { resumeData: updated, appliedPath: ['skills', 0, 'items'], description: 'Fallback: skills[0].items' };
    }

    console.warn('[MutationEngine] Could not resolve mutation path for question:', question.id);
    return { resumeData, appliedPath: null, description: `Fallback: could not resolve path for "${question.id}"` };
};

/**
 * Ensures a section appears in metadata.sectionOrder when it has content.
 * This makes newly populated sections immediately visible in the A4.
 */
const ensureSectionVisible = (resumeData, section) => {
    if (!section || !resumeData) return resumeData;

    // Map collection keys to section order keys
    const sectionKeyMap = {
        experience: 'experience',
        projects: 'projects',
        education: 'education',
        skills: 'skills',
        certifications: 'certifications',
        additionalSections: 'additionalSections',
        professionalSummary: 'summary'
    };
    const orderKey = sectionKeyMap[section] || section;

    const currentOrder = Array.isArray(resumeData.metadata?.sectionOrder)
        ? resumeData.metadata.sectionOrder
        : null;

    // If no custom order is set, nothing to do (renderer uses persona default)
    if (!currentOrder) return resumeData;

    if (currentOrder.includes(orderKey)) return resumeData;

    // Append the new section to the end of the order
    const newOrder = [...currentOrder, orderKey];
    return setIn(resumeData, ['metadata', 'sectionOrder'], newOrder);
};

// ─── Utility: safe deep get ──────────────────────────────────────────────────

const getIn = (obj, path) => {
    if (!obj || !path || path.length === 0) return undefined;
    return path.reduce((acc, key) => (acc !== null && acc !== undefined ? acc[key] : undefined), obj);
};
