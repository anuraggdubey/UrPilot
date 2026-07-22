import { ZodError } from 'zod';

export function errorPayload(error: unknown) {
  if (error instanceof ZodError) {
    return {
      error: 'Invalid request body',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: 'Unknown error' };
}
