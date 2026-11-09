/**
 * Time utility functions using Asia/Kolkata timezone
 */

export const KITCHEN_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns current Date in Asia/Kolkata
 */
export function getNowInKolkata(): Date {
  const now = new Date();
  // Get string in Asia/Kolkata
  const kolkataStr = now.toLocaleString('en-US', { timeZone: KITCHEN_TIMEZONE });
  return new Date(kolkataStr);
}

/**
 * Parse date string YYYY-MM-DD into a Date in Asia/Kolkata
 */
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Format Date as YYYY-MM-DD in Asia/Kolkata
 */
export function formatDateString(date: Date): string {
  const kolkataStr = date.toLocaleDateString('en-CA', { timeZone: KITCHEN_TIMEZONE });
  return kolkataStr; // en-CA yields YYYY-MM-DD
}

/**
 * Parse time string HH:mm or HH:mm:ss to hours and minutes
 */
export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const parts = timeStr.split(':');
  return {
    hours: parseInt(parts[0] || '0', 10),
    minutes: parseInt(parts[1] || '0', 10),
  };
}

/**
 * Computes whether the cutoff for a target meal date and default delivery time has passed.
 * Default cutoff is 5 hours prior to delivery time.
 */
export function checkMealCutoffPassed(
  targetDateStr: string,
  deliveryTimeStr: string,
  cutoffHours: number = 5
): { isCutoffPassed: boolean; cutoffTime: Date; targetDeliveryTime: Date } {
  const currentKolkata = getNowInKolkata();
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const { hours, minutes } = parseTimeString(deliveryTimeStr);

  const targetDeliveryTime = new Date(year, month - 1, day, hours, minutes, 0);

  // Cutoff is target delivery time minus cutoffHours
  const cutoffTime = new Date(targetDeliveryTime.getTime() - cutoffHours * 60 * 60 * 1000);

  const isCutoffPassed = currentKolkata.getTime() >= cutoffTime.getTime();

  return {
    isCutoffPassed,
    cutoffTime,
    targetDeliveryTime,
  };
}
