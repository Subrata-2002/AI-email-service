import { chatModel } from '../../config/openai.js';
import { emailOutputSchema } from '../../schemas/email.schema.js';
import { emailPromptTemplate } from '../prompts/email.prompt.js';

/**
 * Builds the LangChain chain: prompt | model with structured output.
 * Using .withStructuredOutput() ensures the LLM returns validated JSON
 * matching the Zod schema — no fragile text parsing needed.
 */
const structuredModel = chatModel.withStructuredOutput(emailOutputSchema);
export const emailChain = emailPromptTemplate.pipe(structuredModel);
