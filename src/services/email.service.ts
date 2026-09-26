import { runEmailGraph } from '../ai/graph/email.graph.js';
import { logger } from '../utils/logger.js';
import type { EmailRequest, EmailOutput } from '../schemas/email.schema.js';

export interface EmailGenerationResult {
  data: EmailOutput;
  aiResponseTimeMs: number;
}

/**
 * Business logic layer. Orchestrates the AI workflow and measures response time.
 * Kept separate from the HTTP controller layer.
 */
export async function generateEmailTemplate(input: EmailRequest): Promise<EmailGenerationResult> {
  logger.info('Email generation started');

  const start = Date.now();
  const data = await runEmailGraph(input);
  const aiResponseTimeMs = Date.now() - start;

  logger.info(`AI generation completed in ${aiResponseTimeMs}ms`);

  return { data, aiResponseTimeMs };
}
