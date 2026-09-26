import type { Request, Response, NextFunction } from 'express';
import { emailRequestSchema } from '../schemas/email.schema.js';
import { generateEmailTemplate } from '../services/email.service.js';
import { logger } from '../utils/logger.js';

export async function generateEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate request body with Zod
    const parsed = emailRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      res.status(400).json({
        success: false,
        error: { message: firstError?.message ?? 'Invalid request' },
      });
      return;
    }

    const { purpose, recipient_name, tone } = parsed.data;
    const { data, aiResponseTimeMs } = await generateEmailTemplate({ purpose, recipient_name, tone });

    res.status(200).json({
      success: true,
      data,
      metadata: {
        tone,
        purpose,
        ai_response_time_ms: aiResponseTimeMs,
      },
    });
  } catch (error) {
    logger.error(`Email generation failed: ${(error as Error).message}`);
    next(error);
  }
}
