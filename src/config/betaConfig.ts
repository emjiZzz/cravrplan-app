// Beta Configuration
// Easy switching between mock data and API modes

export const BETA_CONFIG = {
  // Set to true to use mock data as default (BETA MODE)
  USE_MOCK_DATA_AS_DEFAULT: true,

  // Set to true to enable background API calls when limits allow
  ENABLE_BACKGROUND_API: true,

  // Daily API limit (Spoonacular free tier)
  DAILY_API_LIMIT: 150,

  // Debug mode (logs API calls and limits)
  DEBUG_MODE: import.meta.env.DEV,
};

// Helper function to check if we should use mock data
export function shouldUseMockData(): boolean {
  return BETA_CONFIG.USE_MOCK_DATA_AS_DEFAULT;
}

// Helper function to check if background API is enabled
export function isBackgroundApiEnabled(): boolean {
  return BETA_CONFIG.ENABLE_BACKGROUND_API;
}
