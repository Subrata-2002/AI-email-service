import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the AI graph so tests don't make real OpenAI calls
vi.mock('../ai/graph/email.graph.js', () => ({
  runEmailGraph: vi.fn(),
}));

// Mock env config to avoid requiring real API keys in tests
vi.mock('../config/env.js', () => ({
  env: {
    port: 5000,
    openaiApiKey: 'test-key',
    openaiModel: 'gpt-4o-mini',
    langsmithTracing: false,
    langsmithProject: 'test',
  },
}));

import { runEmailGraph } from '../ai/graph/email.graph.js';
import { generateEmailTemplate } from '../services/email.service.js';
import { emailRequestSchema } from '../schemas/email.schema.js';

const mockRunEmailGraph = vi.mocked(runEmailGraph);

describe('emailRequestSchema', () => {
  it('validates a valid request', () => {
    const result = emailRequestSchema.safeParse({
      purpose: 'Follow up after demo',
      recipient_name: 'Rahul',
      tone: 'friendly',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing purpose', () => {
    const result = emailRequestSchema.safeParse({ recipient_name: 'Rahul', tone: 'friendly' });
    expect(result.success).toBe(false);
  });

  it('rejects missing recipient_name', () => {
    const result = emailRequestSchema.safeParse({ purpose: 'Follow up', tone: 'friendly' });
    expect(result.success).toBe(false);
  });

  it('rejects missing tone', () => {
    const result = emailRequestSchema.safeParse({ purpose: 'Follow up', recipient_name: 'Rahul' });
    expect(result.success).toBe(false);
  });

  it('rejects empty string purpose', () => {
    const result = emailRequestSchema.safeParse({ purpose: '', recipient_name: 'Rahul', tone: 'friendly' });
    expect(result.success).toBe(false);
  });
});

describe('generateEmailTemplate service', () => {
  beforeEach(() => {
    mockRunEmailGraph.mockReset();
  });

  it('returns email data and response time on success', async () => {
    mockRunEmailGraph.mockResolvedValueOnce({
      subject: 'Following up on our demo',
      body: 'Hi Rahul, thanks for joining the demo...',
    });

    const result = await generateEmailTemplate({
      purpose: 'Follow up after demo',
      recipient_name: 'Rahul',
      tone: 'friendly',
    });

    expect(result.data.subject).toBe('Following up on our demo');
    expect(result.data.body).toContain('Rahul');
    expect(result.aiResponseTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('propagates errors from the AI graph', async () => {
    mockRunEmailGraph.mockRejectedValueOnce(new Error('OpenAI API error'));

    await expect(
      generateEmailTemplate({ purpose: 'Test', recipient_name: 'Alice', tone: 'formal' })
    ).rejects.toThrow('OpenAI API error');
  });
});
