export const systemLimits = {
  /** Max pins published per hour per Pinterest account (per userId for MVP) */
  MAX_PUBLISHES_PER_HOUR_PER_ACCOUNT: 5,
  /** Max pins published per day per project */
  MAX_PUBLISHES_PER_DAY_PER_PROJECT: 25,
  /** Min minutes between publishes to the same board */
  MIN_MINUTES_BETWEEN_PINS: 10,
  /** Max retry attempts for a failed publish job */
  MAX_RETRY_ATTEMPTS: 3,
  /** Base minutes for retry backoff (attemptCount × this value) */
  MAX_RETRY_BACKOFF_MINUTES: 5,
  /** Max board sync attempts per hour per user */
  MAX_BOARD_SYNC_ATTEMPTS_PER_HOUR: 10,
};

// Legacy aliases for backward compatibility
export const MAX_PINS_PER_HOUR_PER_USER = systemLimits.MAX_PUBLISHES_PER_HOUR_PER_ACCOUNT;
export const MAX_PINS_PER_DAY_PER_USER = systemLimits.MAX_PUBLISHES_PER_DAY_PER_PROJECT;
