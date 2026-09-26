import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { emailChain } from '../llm/openai.js';
import { emailOutputSchema, type EmailOutput, type EmailRequest } from '../../schemas/email.schema.js';

// Typed state for the email generation workflow
const EmailStateAnnotation = Annotation.Root({
  purpose: Annotation<string>(),
  recipient_name: Annotation<string>(),
  tone: Annotation<string>(),
  subject: Annotation<string | undefined>(),
  body: Annotation<string | undefined>(),
  error: Annotation<string | undefined>(),
});

type EmailState = typeof EmailStateAnnotation.State;

// Node 1: Validate that required inputs are present
async function validateInput(state: EmailState): Promise<Partial<EmailState>> {
  if (!state.purpose || !state.recipient_name || !state.tone) {
    throw new Error('Missing required input fields: purpose, recipient_name, tone');
  }
  return {};
}

// Node 2: Call the LLM chain to generate the email
async function generateEmail(state: EmailState): Promise<Partial<EmailState>> {
  const result = await emailChain.invoke({
    purpose: state.purpose,
    recipient_name: state.recipient_name,
    tone: state.tone,
  }) as EmailOutput;

  return {
    subject: result.subject,
    body: result.body,
  };
}

// Node 3: Validate that the LLM output has required fields
async function validateOutput(state: EmailState): Promise<Partial<EmailState>> {
  const parsed = emailOutputSchema.safeParse({
    subject: state.subject,
    body: state.body,
  });

  if (!parsed.success) {
    throw new Error('AI returned invalid output: missing subject or body');
  }

  return {};
}

const graph = new StateGraph(EmailStateAnnotation)
  .addNode('validateInput', validateInput)
  .addNode('generateEmail', generateEmail)
  .addNode('validateOutput', validateOutput)
  .addEdge(START, 'validateInput')
  .addEdge('validateInput', 'generateEmail')
  .addEdge('generateEmail', 'validateOutput')
  .addEdge('validateOutput', END)
  .compile();

export async function runEmailGraph(input: EmailRequest): Promise<EmailOutput> {
  const result = await graph.invoke({
    purpose: input.purpose,
    recipient_name: input.recipient_name,
    tone: input.tone,
  });

  return {
    subject: result.subject!,
    body: result.body!,
  };
}
