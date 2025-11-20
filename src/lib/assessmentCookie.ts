// Cookie utilities for tracking assessment completion
export const ASSESSMENT_COOKIE_NAME = 'lp_assessment_completed';
export const ASSESSMENT_EXPIRY_HOURS = 24;

interface AssessmentCookieData {
    completed: boolean;
    completedAt: string;
    score?: number;
    recommendedKitId?: string;
}

export function setAssessmentCookie(data: AssessmentCookieData): void {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + ASSESSMENT_EXPIRY_HOURS);

    const cookieValue = encodeURIComponent(JSON.stringify(data));
    document.cookie = `${ASSESSMENT_COOKIE_NAME}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
}

export function getAssessmentCookie(): AssessmentCookieData | null {
    const cookies = document.cookie.split(';');
    const assessmentCookie = cookies.find(cookie =>
        cookie.trim().startsWith(`${ASSESSMENT_COOKIE_NAME}=`)
    );

    if (!assessmentCookie) return null;

    try {
        const cookieValue = assessmentCookie.split('=')[1];
        const data = JSON.parse(decodeURIComponent(cookieValue));
        return data;
    } catch {
        return null;
    }
}

export function clearAssessmentCookie(): void {
    document.cookie = `${ASSESSMENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function hasCompletedAssessment(): boolean {
    const data = getAssessmentCookie();
    return data?.completed === true;
}
