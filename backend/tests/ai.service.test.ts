import Anthropic from '@anthropic-ai/sdk';

// IMPORTANT: jest.mock is hoisted before imports.
// When ai.service.ts is imported it runs `new Anthropic(...)` at module level.
// By the time beforeAll runs, mock.results[0] is already populated.
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: jest.fn() },
  })),
}));

process.env.ANTHROPIC_API_KEY = 'test-api-key';

// Import service AFTER the mock is declared (ts-jest respects hoisting)
import { askInventoryAssistant } from '../src/services/ai.service';

const mockInventory = {
  warehouses: [
    {
      id: 'wh-1',
      name: 'Main Warehouse',
      location: 'Madrid',
      products: [
        {
          id: 'p-1',
          name: 'Tornillos M6',
          sku: 'TM6-001',
          quantity: 10,
          unit: 'unidades',
          minStock: 5,
          category: 'Hardware',
        },
      ],
    },
  ],
};

let mockCreate: jest.Mock;

beforeAll(() => {
  // ai.service.ts creates the Anthropic client at module level.
  // The constructor was intercepted by jest.mock — results[0] is our instance.
  const instance = (Anthropic as unknown as jest.Mock).mock.results[0]?.value;
  mockCreate = instance?.messages?.create as jest.Mock;
});

beforeEach(() => {
  mockCreate?.mockReset();
});

function makeTextResponse(text: string) {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text }],
    model: 'claude-opus-4-6',
    stop_reason: 'end_turn',
    usage: { input_tokens: 100, output_tokens: 50 },
  };
}

describe('askInventoryAssistant', () => {
  it('calls Anthropic API with correct model and max_tokens', async () => {
    mockCreate.mockResolvedValueOnce(
      makeTextResponse(JSON.stringify({ reply: 'Test response' })),
    );

    await askInventoryAssistant('test message', [], mockInventory);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
      }),
    );
  });

  it('includes the serialized inventory in the system prompt', async () => {
    mockCreate.mockResolvedValueOnce(
      makeTextResponse(JSON.stringify({ reply: 'Response' })),
    );

    await askInventoryAssistant('test', [], mockInventory);

    const callArgs = mockCreate.mock.calls[0][0] as { system: string };
    expect(callArgs.system).toContain('Main Warehouse');
    expect(callArgs.system).toContain('Tornillos M6');
  });

  it('appends user message to conversation history in the messages array', async () => {
    const history = [{ role: 'user' as const, content: 'Previous message' }];
    mockCreate.mockResolvedValueOnce(
      makeTextResponse(JSON.stringify({ reply: 'Response' })),
    );

    await askInventoryAssistant('new message', history, mockInventory);

    const callArgs = mockCreate.mock.calls[0][0] as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(callArgs.messages).toHaveLength(2);
    expect(callArgs.messages[0]).toEqual({ role: 'user', content: 'Previous message' });
    expect(callArgs.messages[1]).toEqual({ role: 'user', content: 'new message' });
  });

  it('parses a valid JSON response with productLink correctly', async () => {
    const aiJson = {
      reply: 'Tienes 10 tornillos M6 en Main Warehouse.',
      productLink: {
        label: 'Ver en almacén',
        warehouseId: 'wh-1',
        productId: 'p-1',
      },
    };
    mockCreate.mockResolvedValueOnce(makeTextResponse(JSON.stringify(aiJson)));

    const result = await askInventoryAssistant('test', [], mockInventory);

    expect(result.reply).toBe('Tienes 10 tornillos M6 en Main Warehouse.');
    expect(result.productLink).toEqual({
      label: 'Ver en almacén',
      warehouseId: 'wh-1',
      productId: 'p-1',
    });
  });

  it('parses a valid JSON response without productLink', async () => {
    const aiJson = { reply: 'No encontré el producto.' };
    mockCreate.mockResolvedValueOnce(makeTextResponse(JSON.stringify(aiJson)));

    const result = await askInventoryAssistant('test', [], mockInventory);

    expect(result.reply).toBe('No encontré el producto.');
    expect(result.productLink).toBeUndefined();
  });

  it('returns plain text as reply when response is not valid JSON', async () => {
    mockCreate.mockResolvedValueOnce(makeTextResponse('Esta es una respuesta en texto plano'));

    const result = await askInventoryAssistant('test', [], mockInventory);

    expect(result.reply).toBe('Esta es una respuesta en texto plano');
    expect(result.productLink).toBeUndefined();
  });

  it('throws AppError 503 when the Anthropic API call fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Connection refused'));

    await expect(
      askInventoryAssistant('test', [], mockInventory),
    ).rejects.toMatchObject({ statusCode: 503 });
  });

  it('reads the API key from environment variables', () => {
    expect(process.env.ANTHROPIC_API_KEY).toBe('test-api-key');
    // The client was constructed with the env var — verify no hardcoded key was used
    const constructorCall = (Anthropic as unknown as jest.Mock).mock.calls[0];
    expect(constructorCall[0]).toHaveProperty('apiKey');
    expect(constructorCall[0].apiKey).toBe(process.env.ANTHROPIC_API_KEY);
  });
});
