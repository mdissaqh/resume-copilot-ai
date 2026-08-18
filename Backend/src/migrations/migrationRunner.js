import { migrateV2ToV3 } from './v2ToV3.js';
import Resume from '../models/resume.model.js';

export const CURRENT_SCHEMA_VERSION = 3;

/**
 * Runs deterministic migration sequence on a raw resume document object.
 */
export const runResumeMigrations = (document) => {
    if (!document) return document;

    let migrated = { ...document };

    if (!migrated.schemaVersion || migrated.schemaVersion < 3) {
        migrated = migrateV2ToV3(migrated);
    }

    return migrated;
};

/**
 * Ensures an in-memory document is migrated and persisted to database if needed.
 */
export const ensureDocumentUpToDate = async (resumeDoc) => {
    if (!resumeDoc) return null;

    if (!resumeDoc.schemaVersion || resumeDoc.schemaVersion < CURRENT_SCHEMA_VERSION) {
        const docObj = resumeDoc.toObject ? resumeDoc.toObject() : resumeDoc;
        const migratedData = runResumeMigrations(docObj);

        if (resumeDoc._id) {
            await Resume.updateOne(
                { _id: resumeDoc._id },
                {
                    $set: {
                        schemaVersion: CURRENT_SCHEMA_VERSION,
                        content: migratedData.content,
                        metadata: migratedData.metadata,
                        aiState: migratedData.aiState
                    }
                }
            );
        }

        return migratedData;
    }

    return resumeDoc;
};
