import { z } from 'zod';

// Movie suggestion schema
export const movieSuggestionSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  posterUrl: z.string().url("Invalid URL format"),
  suggestedBy: z.string().min(1, "Suggested by is required").max(100, "Suggested by must be less than 100 characters"),
});

// Movie vote schema
export const movieVoteSchema = z.object({
  movieId: z.string().min(1, "Movie ID is required"),
});

// Schedule movie schema
export const scheduleMovieSchema = z.object({
  movieId: z.string().min(1, "Movie ID is required"),
  date: z.any(),
});

// Search movie schema
export const searchMovieSchema = z.object({
  query: z.string().min(1, "Query is required").max(100, "Query must be less than 100 characters"),
});

// Schedule ID schema
export const scheduleIdSchema = z.object({
  id: z.string().min(1, "Schedule ID is required"),
});

// Generic ID schema
export const idSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Utility function to validate request data
export async function validateRequestData(request: Request, schema: z.ZodSchema) {
  try {
    const data = await request.json();
    return { data: schema.parse(data) as any, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(err => err.message).join(", ");
      return { data: null, error: errorMessage };
    }
    return { data: null, error: "Invalid JSON" };
  }
}

// Utility function to validate URL parameters
export function validateParams(params: Record<string, string>, schema: z.ZodSchema) {
  try {
    return { data: schema.parse(params) as any, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(err => err.message).join(", ");
      return { data: null, error: errorMessage };
    }
    return { data: null, error: "Invalid parameters" };
  }
}

// Utility function to validate search parameters
export function validateSearchParams(url: string, schema: z.ZodSchema) {
  try {
    const { searchParams } = new URL(url);
    const params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return { data: schema.parse(params) as any, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(err => err.message).join(", ");
      return { data: null, error: errorMessage };
    }
    return { data: null, error: "Invalid search parameters" };
  }
}