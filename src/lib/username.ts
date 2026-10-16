/** Only what a username may contain: letters, numbers, _ and . (up to 30) */
export const cleanUsername = (v: string) => v.replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 30);
