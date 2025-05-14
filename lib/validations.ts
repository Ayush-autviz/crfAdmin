import { z } from 'zod';

// Maximum file sizes in bytes
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// Helper function to validate file size and type
const validateFile = (
  file: File | null | undefined,
  maxSize: number,
  allowedTypes: string[],
  errorMessages: { size: string; type: string }
): z.ZodEffects<z.ZodType<File | null | undefined>, File | null | undefined, File | null | undefined> => {
  return z.any()
    .refine(
      (file) => !file || file instanceof File,
      { message: 'Invalid file' }
    )
    .refine(
      (file) => !file || file.size <= maxSize,
      { message: errorMessages.size }
    )
    .refine(
      (file) => !file || allowedTypes.includes(file.type),
      { message: errorMessages.type }
    ) as z.ZodEffects<z.ZodType<File | null | undefined>, File | null | undefined, File | null | undefined>;
};

// Create Course Schema
export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  thumbnail: validateFile(
    undefined,
    MAX_IMAGE_SIZE,
    ALLOWED_IMAGE_TYPES,
    {
      size: `Thumbnail must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      type: 'Thumbnail must be a valid image file (PNG, JPG or GIF)'
    }
  )
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// Update Course Schema
export const updateCourseSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  thumbnail: validateFile(
    undefined,
    MAX_IMAGE_SIZE,
    ALLOWED_IMAGE_TYPES,
    {
      size: `Thumbnail must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      type: 'Thumbnail must be a valid image file (PNG, JPG or GIF)'
    }
  ).refine((file) => !!file, { message: 'Thumbnail is required' }),
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// Add Lecture Schema
export const addLectureSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  file: validateFile(
    undefined,
    MAX_VIDEO_SIZE,
    ALLOWED_VIDEO_TYPES,
    {
      size: `Video must be less than ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
      type: 'Video must be a valid video file (MP4, WebM, or OGG)'
    }
  ).refine((file) => !!file, { message: 'Video file is required' }),
  thumbnail: validateFile(
    undefined,
    MAX_IMAGE_SIZE,
    ALLOWED_IMAGE_TYPES,
    {
      size: `Thumbnail must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      type: 'Thumbnail must be a valid image file (PNG, JPG or GIF)'
    }
  ).refine((file) => !!file, { message: 'Thumbnail is required' }),
  file_size: z.number().optional()
});

export type AddLectureInput = z.infer<typeof addLectureSchema>;

// Update Lecture Schema
export const updateLectureSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  file: validateFile(
    undefined,
    MAX_VIDEO_SIZE,
    ALLOWED_VIDEO_TYPES,
    {
      size: `Video must be less than ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
      type: 'Video must be a valid video file (MP4, WebM, or OGG)'
    }
  ),
  thumbnail: validateFile(
    undefined,
    MAX_IMAGE_SIZE,
    ALLOWED_IMAGE_TYPES,
    {
      size: `Thumbnail must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      type: 'Thumbnail must be a valid image file (PNG, JPG or GIF)'
    }
  ),
  file_size: z.number().optional()
});

export type UpdateLectureInput = z.infer<typeof updateLectureSchema>;

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
