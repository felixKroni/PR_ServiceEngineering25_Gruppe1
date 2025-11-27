const DEFAULT_API_URL = 'http://localhost:5001/api';

export const environment = {
    apiBaseUrl: import.meta.env.NG_APP_API_URL ?? DEFAULT_API_URL
};
