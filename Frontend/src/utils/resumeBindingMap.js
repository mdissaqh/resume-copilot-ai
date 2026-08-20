/**
 * RESUME BINDING MAP
 * ==================
 * Derives a deterministic, authoritative map of every AI-addressable
 * node in the canonical resume, keyed by a stable symbolic reference.
 *
 * The AI receives this map instead of guessing array indexes or inventing
 * node IDs. The application uses it to resolve AI targetRef → actual path.
 *
 * Key format:  "section:_id:field"
 * Examples:
 *   "personalInfo"
 *   "experience:exp_abc123"
 *   "experience:exp_abc123:role"
 *   "experience:exp_abc123:achievement:ach_def"
 *   "education:edu_xyz"
 *   "education:edu_xyz:degree"
 *   "skills:skill_aaa"
 *   "skills:skill_aaa:items"
 *   "projects:proj_bbb"
 *   "projects:proj_bbb:title"
 *   "certifications:cert_ccc"
 *   "links:link_ddd"
 */

/**
 * @typedef {Object} BindingNode
 * @property {string[]}      path      - Array path usable with setIn/updateField
 * @property {string|null}   nodeId    - The stable _id of the primary object (null for scalars like metadata)
 * @property {string|null}   field     - The leaf field name (null for collection roots)
 * @property {string}        section   - Top-level section key
 * @property {boolean}       exists    - Whether this node currently has a non-empty value
 * @property {*}             value     - Current value at this path
 */

/**
 * Build a full binding map from the current canonical resume state.
 *
 * @param {Object} resumeData - The canonical resume JSON (from Zustand)
 * @returns {{ nodes: Object.<string, BindingNode>, summary: string }}
 */
export const buildBindingMap = (resumeData) => {
    if (!resumeData) return { nodes: {}, summary: 'empty' };

    const nodes = {};

    const addNode = (key, node) => {
        nodes[key] = node;
    };

    const isEmpty = (val) => {
        if (val === null || val === undefined) return true;
        if (typeof val === 'string') return val.trim() === '';
        if (Array.isArray(val)) return val.length === 0;
        return false;
    };

    // ─── PERSONAL INFO ──────────────────────────────────────────────────────
    addNode('personalInfo', {
        path: ['personalInfo'], nodeId: null, field: null,
        section: 'personalInfo', exists: true, value: resumeData.personalInfo
    });

    const piFields = ['fullName', 'email', 'phone', 'location'];
    piFields.forEach(f => {
        const val = resumeData.personalInfo?.[f] || '';
        addNode(`personalInfo:${f}`, {
            path: ['personalInfo', f], nodeId: null, field: f,
            section: 'personalInfo', exists: !isEmpty(val), value: val
        });
    });

    // Links
    const links = Array.isArray(resumeData.personalInfo?.links) ? resumeData.personalInfo.links : [];
    links.forEach((link, idx) => {
        const lid = link._id || `link_${idx}`;
        addNode(`links:${lid}`, {
            path: ['personalInfo', 'links', idx], nodeId: lid, field: null,
            section: 'personalInfo', exists: !isEmpty(link.url), value: link
        });
        addNode(`links:${lid}:url`, {
            path: ['personalInfo', 'links', idx, 'url'], nodeId: lid, field: 'url',
            section: 'personalInfo', exists: !isEmpty(link.url), value: link.url
        });
    });
    // Synthetic key for "add a link" operations
    addNode('personalInfo:links', {
        path: ['personalInfo', 'links'], nodeId: null, field: 'links',
        section: 'personalInfo', exists: links.length > 0, value: links
    });

    // Summary
    addNode('professionalSummary', {
        path: ['professionalSummary'], nodeId: null, field: 'professionalSummary',
        section: 'summary', exists: !isEmpty(resumeData.professionalSummary),
        value: resumeData.professionalSummary
    });

    // ─── EXPERIENCE ─────────────────────────────────────────────────────────
    const experience = Array.isArray(resumeData.experience) ? resumeData.experience : [];
    addNode('experience', {
        path: ['experience'], nodeId: null, field: null,
        section: 'experience', exists: experience.length > 0, value: experience
    });

    experience.forEach((exp, idx) => {
        const eid = exp._id || `exp_${idx}`;
        addNode(`experience:${eid}`, {
            path: ['experience', idx], nodeId: eid, field: null,
            section: 'experience', exists: true, value: exp
        });

        ['role', 'organization', 'location', 'startDate', 'endDate', 'description'].forEach(f => {
            const val = exp[f] || '';
            addNode(`experience:${eid}:${f}`, {
                path: ['experience', idx, f], nodeId: eid, field: f,
                section: 'experience', exists: !isEmpty(val), value: val
            });
        });

        const achievements = Array.isArray(exp.achievements) ? exp.achievements : [];
        addNode(`experience:${eid}:achievements`, {
            path: ['experience', idx, 'achievements'], nodeId: eid, field: 'achievements',
            section: 'experience', exists: achievements.length > 0, value: achievements
        });
        achievements.forEach((ach, jdx) => {
            addNode(`experience:${eid}:achievement:${jdx}`, {
                path: ['experience', idx, 'achievements', jdx], nodeId: eid, field: `achievements.${jdx}`,
                section: 'experience', exists: !isEmpty(ach), value: ach
            });
        });
    });

    // ─── PROJECTS ───────────────────────────────────────────────────────────
    const projects = Array.isArray(resumeData.projects) ? resumeData.projects : [];
    addNode('projects', {
        path: ['projects'], nodeId: null, field: null,
        section: 'projects', exists: projects.length > 0, value: projects
    });

    projects.forEach((proj, idx) => {
        const pid = proj._id || `proj_${idx}`;
        addNode(`projects:${pid}`, {
            path: ['projects', idx], nodeId: pid, field: null,
            section: 'projects', exists: true, value: proj
        });

        ['title', 'description', 'date', 'githubUrl', 'liveUrl'].forEach(f => {
            const val = proj[f] || '';
            addNode(`projects:${pid}:${f}`, {
                path: ['projects', idx, f], nodeId: pid, field: f,
                section: 'projects', exists: !isEmpty(val), value: val
            });
        });

        const technologies = Array.isArray(proj.technologies) ? proj.technologies : [];
        addNode(`projects:${pid}:technologies`, {
            path: ['projects', idx, 'technologies'], nodeId: pid, field: 'technologies',
            section: 'projects', exists: technologies.length > 0, value: technologies
        });

        const highlights = Array.isArray(proj.highlights) ? proj.highlights : [];
        addNode(`projects:${pid}:highlights`, {
            path: ['projects', idx, 'highlights'], nodeId: pid, field: 'highlights',
            section: 'projects', exists: highlights.length > 0, value: highlights
        });
    });

    // ─── EDUCATION ──────────────────────────────────────────────────────────
    const education = Array.isArray(resumeData.education) ? resumeData.education : [];
    addNode('education', {
        path: ['education'], nodeId: null, field: null,
        section: 'education', exists: education.length > 0, value: education
    });

    education.forEach((edu, idx) => {
        const eduid = edu._id || `edu_${idx}`;
        addNode(`education:${eduid}`, {
            path: ['education', idx], nodeId: eduid, field: null,
            section: 'education', exists: true, value: edu
        });

        ['institution', 'degree', 'fieldOfStudy', 'score', 'location', 'startDate', 'endDate'].forEach(f => {
            const val = edu[f] || '';
            addNode(`education:${eduid}:${f}`, {
                path: ['education', idx, f], nodeId: eduid, field: f,
                section: 'education', exists: !isEmpty(val), value: val
            });
        });
    });

    // ─── SKILLS ─────────────────────────────────────────────────────────────
    const skills = Array.isArray(resumeData.skills) ? resumeData.skills : [];
    addNode('skills', {
        path: ['skills'], nodeId: null, field: null,
        section: 'skills', exists: skills.length > 0, value: skills
    });

    skills.forEach((group, idx) => {
        const sid = group._id || `skill_${idx}`;
        addNode(`skills:${sid}`, {
            path: ['skills', idx], nodeId: sid, field: null,
            section: 'skills', exists: true, value: group
        });
        addNode(`skills:${sid}:category`, {
            path: ['skills', idx, 'category'], nodeId: sid, field: 'category',
            section: 'skills', exists: !isEmpty(group.category), value: group.category
        });
        addNode(`skills:${sid}:items`, {
            path: ['skills', idx, 'items'], nodeId: sid, field: 'items',
            section: 'skills', exists: (group.items?.length || 0) > 0, value: group.items
        });
    });

    // ─── CERTIFICATIONS ─────────────────────────────────────────────────────
    const certifications = Array.isArray(resumeData.certifications) ? resumeData.certifications : [];
    addNode('certifications', {
        path: ['certifications'], nodeId: null, field: null,
        section: 'certifications', exists: certifications.length > 0, value: certifications
    });

    certifications.forEach((cert, idx) => {
        const cid = cert._id || `cert_${idx}`;
        addNode(`certifications:${cid}`, {
            path: ['certifications', idx], nodeId: cid, field: null,
            section: 'certifications', exists: true, value: cert
        });
        ['name', 'issuer', 'date', 'url'].forEach(f => {
            const val = cert[f] || '';
            addNode(`certifications:${cid}:${f}`, {
                path: ['certifications', idx, f], nodeId: cid, field: f,
                section: 'certifications', exists: !isEmpty(val), value: val
            });
        });
    });

    // ─── ADDITIONAL SECTIONS ────────────────────────────────────────────────
    const additionalSections = Array.isArray(resumeData.additionalSections) ? resumeData.additionalSections : [];
    addNode('additionalSections', {
        path: ['additionalSections'], nodeId: null, field: null,
        section: 'additionalSections', exists: additionalSections.length > 0, value: additionalSections
    });

    additionalSections.forEach((sec, idx) => {
        const secid = sec._id || `section_${idx}`;
        addNode(`additionalSections:${secid}`, {
            path: ['additionalSections', idx], nodeId: secid, field: null,
            section: 'additionalSections', exists: true, value: sec
        });
        const items = Array.isArray(sec.items) ? sec.items : [];
        items.forEach((item, jdx) => {
            const iid = (typeof item === 'object' && item._id) ? item._id : `item_${jdx}`;
            addNode(`additionalSections:${secid}:item:${iid}`, {
                path: ['additionalSections', idx, 'items', jdx], nodeId: iid, field: null,
                section: 'additionalSections', exists: true, value: item
            });
        });
    });

    // ─── SUMMARY ────────────────────────────────────────────────────────────
    const summary = {
        totalNodes: Object.keys(nodes).length,
        emptyPersonalInfo: ['fullName', 'email', 'phone'].filter(f => isEmpty(resumeData.personalInfo?.[f])),
        experienceCount: experience.length,
        projectCount: projects.length,
        educationCount: education.length,
        skillsCount: skills.length,
        certificationCount: certifications.length,
        hasLinks: links.length > 0
    };

    return { nodes, summary };
};

/**
 * Resolves a targetRef from an AI question to a concrete canonical path.
 * Returns null if the ref cannot be resolved (invalid target).
 *
 * @param {{ nodeId: string, field?: string } | null} targetRef
 * @param {Object} bindingMap - Result of buildBindingMap()
 * @returns {string[] | null}
 */
export const resolveTargetRef = (targetRef, bindingMap) => {
    if (!targetRef || !bindingMap?.nodes) return null;

    // Try "section:nodeId:field" first
    if (targetRef.nodeId && targetRef.field) {
        // Search for any key that ends with :nodeId:field
        const fullKey = Object.keys(bindingMap.nodes).find(k =>
            k.includes(targetRef.nodeId) && k.endsWith(`:${targetRef.field}`)
        );
        if (fullKey) return bindingMap.nodes[fullKey].path;
    }

    // Try "section:nodeId" for collection item roots
    if (targetRef.nodeId) {
        const rootKey = Object.keys(bindingMap.nodes).find(k =>
            k.includes(targetRef.nodeId) && !bindingMap.nodes[k].field
        );
        if (rootKey) return bindingMap.nodes[rootKey].path;
    }

    // Try direct symbolic key (e.g. "professionalSummary", "personalInfo:fullName")
    if (targetRef.nodeId && bindingMap.nodes[targetRef.nodeId]) {
        return bindingMap.nodes[targetRef.nodeId].path;
    }

    return null;
};

/**
 * Formats the binding map into a compact, AI-readable string description
 * that tells the model what nodes exist and what their IDs are.
 * This is injected into the Copilot prompt.
 *
 * @param {{ nodes: Object }} bindingMap
 * @returns {string} JSON-compatible summary for AI prompt
 */
export const serializeBindingMapForAI = (bindingMap) => {
    if (!bindingMap?.nodes) return '{}';

    // Only send item-level nodes (not leaf fields) to keep prompt size reasonable
    const itemNodes = Object.entries(bindingMap.nodes)
        .filter(([, node]) => node.nodeId && !node.field)
        .map(([key, node]) => ({
            ref: key,
            nodeId: node.nodeId,
            section: node.section,
            path: node.path
        }));

    return JSON.stringify(itemNodes, null, 0);
};
