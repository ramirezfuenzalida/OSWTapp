
// Helper for API calls
// The backend is running on the same host but port 3001
const getApiUrl = () => {
    // If we are in dev, use port 3004 (Changed from 3001 to avoid conflict)
    // In production, this would be different
    return `${window.location.protocol}//${window.location.hostname}:3004`;
};

export const API_URL = getApiUrl();
