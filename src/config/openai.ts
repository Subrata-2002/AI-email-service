import { ChatOpenAI } from '@langchain/openai';
import { env } from './env.js';

/**
 * Shared ChatOpenAI instance used across the AI layer.
 * LangChain's ChatOpenAI internally uses the OpenAI SDK — no duplicate calls needed.
 * Routes through OpenRouter when OPENROUTER_API_KEY is set.
 */
const isOpenRouter = !!process.env.OPENROUTER_API_KEY;

export const chatModel = new ChatOpenAI({
  model: env.openaiModel,
  apiKey: isOpenRouter ? process.env.OPENROUTER_API_KEY : env.openaiApiKey,
  temperature: 0.7,
  ...(isOpenRouter && {
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
    },
  }),
});
