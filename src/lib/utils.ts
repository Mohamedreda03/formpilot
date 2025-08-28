import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Clean image URL from timestamps and unnecessary query parameters
 * @param url - The image URL to clean
 * @returns Clean URL without timestamps
 */
export function cleanImageUrl(url: string): string {
  if (!url) return url;

  // Remove any timestamp parameters (?t=...)
  let cleanUrl = url.split("?t=")[0];

  // Ensure proper query parameter format for Appwrite URLs
  if (cleanUrl.includes("/view") && !cleanUrl.includes("?project=")) {
    // This shouldn't happen, but just in case
    console.warn("Image URL missing project parameter:", cleanUrl);
  }

  return cleanUrl;
}
