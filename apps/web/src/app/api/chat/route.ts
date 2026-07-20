import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { prisma } from '@repo/database';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function buildSystemPrompt(): Promise<string> {
  // Fetch live menu from DB to give the AI real context
  const menuItems = await prisma.menuItem.findMany({
    where: { isAvailable: true },
    include: { category: true },
    orderBy: { category: { name: 'asc' } },
  });

  const menuText = menuItems
    .map(item =>
      `- ${item.name} (${item.category.name}) — Rs. ${Number(item.price).toLocaleString()} (ID: ${item.id})` +
      (item.description ? ` | ${item.description}` : '') +
      (item.isSpicy ? ' 🌶 Spicy' : '') +
      (item.isVegetarian ? ' 🥦 Veg' : '') +
      (item.isFeatured ? ' ⭐ Popular' : '')
    )
    .join('\n');

  return `You are "Dawat AI", the warm and knowledgeable assistant for Dawat E Khaas — a premium restaurant in Dera Ismail Khan, Pakistan.

Your personality:
- Friendly, enthusiastic about food, and slightly witty
- You speak in natural English (casual tone, never robotic)
- You always recommend confidently and describe food in mouth-watering ways
- Keep responses concise — 2-4 sentences max unless asked for more detail
- Never make up items. Only recommend from the menu below.

LIVE MENU:
${menuText}

BUSINESS INFO:
- Location: Main Boulevard, Dera Ismail Khan
- Hours: 12:00 PM – 12:00 AM (daily)
- Services: Delivery & Pickup
- Delivery Area: Dera Ismail Khan city

HOW TO HELP CUSTOMERS:
- If they ask for recommendations, suggest 2-3 items with brief descriptions
- If they ask about spicy food, refer to 🌶 tagged items
- If they ask about vegetarian, refer to 🥦 tagged items
- If they ask about tracking, tell them to click "Track Order" in the top navbar
- If they ask how to order, tell them to browse the menu and click "+ Add", OR use the interactive cards you provide.
- If asked something you don't know, say "Let me check with our team — feel free to call us!"
- Never discuss politics, religion, or anything off-topic. Politely redirect.

FORMATTING RULES (CRITICAL):
- You MUST format your responses using rich Markdown.
- Use **bold** for menu item names and strong emphasis.
- Use *italics* for descriptions or light emphasis.
- Use bullet points (-) when listing 2 or more items.
- Use ### Headers for sections if the response is long.
- Keep responses visually beautiful and easy to scan.
- INTERACTIVE CARDS: When you suggest a specific menu item, you MUST output a special markdown image tag so the chat can render a real "Add to Cart" button for that item.
  - The format is EXACTLY: \`![item name](item:item_id)\`
  - Example: \`![Classic Smash Burger](item:cuid_12345)\`
  - Always include this card when recommending a dish so the user can buy it instantly!

Always end with something helpful like a specific recommendation or an invitation to order.`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
      return NextResponse.json(
        { error: 'Groq API key not configured. Add GROQ_API_KEY to your .env file.' },
        { status: 500 }
      );
    }

    const systemPrompt = await buildSystemPrompt();

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      max_tokens: 400,
      temperature: 0.7,
    });

    // Return a real streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    console.error('[chat API]', err);
    return NextResponse.json({ error: 'AI is currently unavailable.' }, { status: 500 });
  }
}
