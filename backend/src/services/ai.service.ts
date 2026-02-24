import Anthropic from '@anthropic-ai/sdk';
import { AppError } from '../middleware/error.middleware';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface InventoryContext {
  warehouses: Array<{
    id: string;
    name: string;
    location: string;
    products: Array<{
      id: string;
      name: string;
      sku: string;
      quantity: number;
      unit: string;
      minStock: number;
      category?: string;
    }>;
  }>;
}

export interface AiResponse {
  reply: string;
  productLink?: {
    label: string;
    warehouseId: string;
    productId?: string;
  };
}

// Create the Anthropic client once at module level
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(inventory: InventoryContext): string {
  return `Eres un asistente inteligente de gestión de inventario.
Tu función es ayudar al usuario a consultar y gestionar su inventario de forma eficiente.

INVENTARIO ACTUAL DEL USUARIO:
${JSON.stringify(inventory, null, 2)}

INSTRUCCIONES:
1. Responde SIEMPRE en español de forma clara y concisa
2. Si el usuario pregunta por un producto específico, indica:
   - El nombre del producto
   - La cantidad disponible y la unidad
   - El almacén donde se encuentra
   - Si el stock está bajo o en cero, avísalo claramente
3. Si el usuario pregunta en qué almacén está un producto, indícalo claramente
4. Si el producto no existe en el inventario, dilo claramente
5. Puedes hacer búsquedas parciales (por ejemplo "tornillos" puede encontrar "Tornillos M6")
6. Cuando hagas referencia a un producto o almacén específico, incluye siempre la información de navegación

FORMATO DE RESPUESTA:
Responde con un JSON válido con esta estructura:
{
  "reply": "Tu respuesta en texto natural aquí",
  "productLink": {
    "label": "Ver en almacén",
    "warehouseId": "id-del-almacen",
    "productId": "id-del-producto-opcional"
  }
}

Si no hay un producto/almacén específico que enlazar, omite el campo "productLink".
Si hay múltiples productos relevantes, enlaza al más relevante.

EJEMPLOS:
- "¿Cuántos tornillos M6 tengo?" → Indica cantidad, almacén, estado stock + link al almacén
- "¿En qué almacén están las cajas?" → Lista todos los almacenes con cajas + link al primero
- "¿Qué productos tienen stock bajo?" → Lista productos con stock ≤ minStock
- "Dame un resumen del almacén principal" → Resumen de productos de ese almacén`;
}

export async function askInventoryAssistant(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  inventory: InventoryContext
): Promise<AiResponse> {
  const systemPrompt = buildSystemPrompt(inventory);

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [...conversationHistory, { role: 'user', content: userMessage }],
    });

    const firstBlock = response.content[0] as { type: string; text?: string };
    if (firstBlock.type !== 'text' || !firstBlock.text) {
      throw new AppError('AI service unavailable', 503);
    }

    const responseText = firstBlock.text;

    try {
      return JSON.parse(responseText) as AiResponse;
    } catch {
      return { reply: responseText };
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    // eslint-disable-next-line no-console
    console.error('Anthropic API error:', err);
    throw new AppError('AI service unavailable', 503);
  }
}
