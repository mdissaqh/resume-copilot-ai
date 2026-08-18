import { getGuestDraft, clearGuestDraft } from './guestDraftManager';
import { migrateGuestResumeApi } from '../features/builder/api/builder.api';

/**
 * Idempotently migrates guest draft envelope after successful user login/registration.
 * Redirects to the real Resume builder page upon successful migration.
 */
export const handlePostAuthNavigation = async (navigate) => {
    const draft = getGuestDraft();

    if (draft && draft.content) {
        try {
            const result = await migrateGuestResumeApi({
                guestDraftId: draft.guestDraftId,
                guestResume: draft.content,
                guestAnalysis: draft.analysis,
                aiState: draft.aiState
            });

            if (result && result.resumeId) {
                clearGuestDraft();
                navigate(`/build/${result.resumeId}`);
                return;
            }
        } catch (error) {
            console.error("Post-auth guest migration error:", error);
        }
    }

    // Default post-auth route if no guest draft exists
    navigate("/dashboard");
};
