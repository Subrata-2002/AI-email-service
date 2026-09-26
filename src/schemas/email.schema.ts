import { z } from 'zod';

// Request validation schema
export const emailRequestSchema = z.object({
  purpose: z.string().min(1, 'purpose is required'),
  recipient_name: z.string().min(1, 'recipient_name is required'),
  tone: z.string().min(1, 'tone is required'),
});

// Structured output schema for the LLM response
export const emailOutputSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
});

export type EmailRequest = z.infer<typeof emailRequestSchema>;
export type EmailOutput = z.infer<typeof emailOutputSchema>;
