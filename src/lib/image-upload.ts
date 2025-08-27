import { storage } from "./appwrite";
import { ID } from "appwrite";

// Configuration - you'll need to set these in your environment
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "forms-images";
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

/**
 * Upload an image file to Appwrite Storage
 * @param file - The image file to upload
 * @returns Promise<string> - The URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error("Image size must be less than 5MB");
    }

    // Generate unique file ID
    const fileId = ID.unique();

    // Upload file to Appwrite Storage
    const response = await storage.createFile(BUCKET_ID, fileId, file);

    // Return the URL to access the file
    const imageUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=${PROJECT_ID}`;

    return imageUrl;
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Delete an image from Appwrite Storage
 * @param imageUrl - The URL of the image to delete
 * @returns Promise<void>
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract file ID from URL
    const fileId = extractFileIdFromUrl(imageUrl);

    if (!fileId) {
      throw new Error("Invalid image URL format");
    }

    // Delete file from Appwrite Storage
    await storage.deleteFile(BUCKET_ID, fileId);
  } catch (error: any) {
    console.error("Delete error:", error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Extract file ID from Appwrite storage URL
 * @param url - The image URL from Appwrite
 * @returns string | null - The file ID or null if invalid
 */
function extractFileIdFromUrl(url: string): string | null {
  try {
    // URL format: https://[endpoint]/storage/buckets/[bucket]/files/[fileId]/view?project=[project]
    const urlParts = url.split("/");
    const filesIndex = urlParts.findIndex((part) => part === "files");

    if (filesIndex !== -1 && urlParts[filesIndex + 1]) {
      const fileIdPart = urlParts[filesIndex + 1];
      // Remove query parameters if any
      return fileIdPart.split("?")[0];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get optimized image URL with specific dimensions
 * @param imageUrl - The original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @returns string - Optimized image URL
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  width?: number,
  height?: number
): string {
  const url = new URL(imageUrl);

  if (width) url.searchParams.set("width", width.toString());
  if (height) url.searchParams.set("height", height.toString());

  return url.toString();
}

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @returns boolean - True if valid
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "File must be an image" };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "Image size must be less than 5MB" };
  }

  // Check image dimensions (optional - you can implement this if needed)
  // This would require reading the image to get dimensions

  return { valid: true };
}
