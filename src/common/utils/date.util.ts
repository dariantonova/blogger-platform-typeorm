/**
 * Converts a Unix timestamp (in seconds) to a JavaScript Date object.
 * @param timestamp Unix timestamp (in seconds)
 * @returns Date object
 */
export const unixToDate = (timestamp: number): Date =>
  new Date(timestamp * 1000);
