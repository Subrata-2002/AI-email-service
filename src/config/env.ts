import 'dotenv/config';

export const env = {
  port: parseInt(process.env.PORT ?? '5000', 10),
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  langsmithApiKey: process.env.LANGSMITH_API_KEY,
  langsmithTracing: process.env.LANGSMITH_TRACING === 'true',
  langsmithProject: process.env.LANGSMITH_PROJECT ?? 'ai-email-template-generator',
};
