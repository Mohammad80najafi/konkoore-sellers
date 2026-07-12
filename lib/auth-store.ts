import { mockUsers } from "./mock-data";
import type { User } from "./types";

// Persist the users list in global scope to survive Next.js dev server hot-reloads
const globalUsers = globalThis as unknown as { usersList: User[] };
if (!globalUsers.usersList) {
  globalUsers.usersList = [...mockUsers];
}
export const usersList = globalUsers.usersList;

// Persist the sessions map in global scope to survive Next.js dev server hot-reloads
const globalSessions = globalThis as unknown as { sessionsMap: Map<string, string> };
if (!globalSessions.sessionsMap) {
  globalSessions.sessionsMap = new Map<string, string>();
}
export const sessionsMap = globalSessions.sessionsMap;

// Helper to normalize Persian/Arabic digits to English digits
export function normalizePhone(phone: string): string {
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  
  let normalized = phone.trim();
  
  for (let i = 0; i < 10; i++) {
    normalized = normalized.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
  }
  
  // Remove all non-digit characters
  normalized = normalized.replace(/\D/g, "");
  
  // Normalize format (must start with 09)
  if (normalized.startsWith("989") && normalized.length === 12) {
    normalized = "0" + normalized.slice(2);
  } else if (normalized.startsWith("9") && normalized.length === 10) {
    normalized = "0" + normalized;
  }
  
  return normalized;
}
