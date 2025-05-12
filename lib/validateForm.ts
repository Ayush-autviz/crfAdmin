import { ZodError, ZodSchema } from 'zod';

/**
 * Validates form data against a Zod schema and returns formatted errors
 *
 * @param schema The Zod schema to validate against
 * @param data The data to validate
 * @returns An object containing the validation result and any formatted errors
 */
export function validateForm<T>(schema: ZodSchema<T>, data: any): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    // Parse and validate the data
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof ZodError) {
      // Format the errors
      const formattedErrors: Record<string, string> = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        formattedErrors[path] = err.message;
      });

      return { success: false, errors: formattedErrors };
    }

    // Handle unexpected errors
    return {
      success: false,
      errors: {
        form: 'An unexpected error occurred during validation'
      }
    };
  }
}

/**
 * Validates a file against size and type constraints
 *
 * @param file The file to validate
 * @param maxSize Maximum file size in bytes
 * @param allowedTypes Array of allowed MIME types
 * @returns An object with validation result and error message if any
 */
export function validateFileUpload(
  file: File | null | undefined,
  maxSize: number,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: true }; // No file is valid (for optional files)
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${maxSizeMB}MB`
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.map(type => type.replace('image/', '').replace('video/', '')).join(', ')}`
    };
  }

  return { valid: true };
}
