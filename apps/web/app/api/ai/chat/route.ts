import { NextRequest } from "next/server";
import { RuleGenerator, ContextManager, SYSTEM_PROMPT } from "@repo/ai-service";
import { db } from "@repo/database";

/**
 * POST /api/ai/chat
 * Conversational AI endpoint with streaming support
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, userId, history } = body;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required and must be a string" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize services
    const generator = new RuleGenerator(process.env.GROQ_API_KEY);
    const contextManager = new ContextManager(SYSTEM_PROMPT);

    // Load conversation history from database or request
    if (conversationId && userId) {
      try {
        const messages = await db.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: "asc" },
          take: 10, // Last 10 messages for context
        });

        // Import into context manager
        const conversationMessages = messages.map((msg: typeof messages[number]) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
          timestamp: msg.createdAt,
        }));

        contextManager.import(conversationMessages);
      } catch (dbError) {
        console.error("Failed to load conversation history:", dbError);
      }
    } else if (history && Array.isArray(history)) {
      // Use provided history
      contextManager.import(history);
    }

    // Add current message
    contextManager.addUserMessage(message);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Get streaming response from AI
          const groqMessages = contextManager.getMessages();
          const generator = new RuleGenerator(process.env.GROQ_API_KEY);

          let fullResponse = "";

          // Stream each chunk
          for await (const chunk of generator.generateStream(message)) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
          }

          // Add assistant response to context
          contextManager.addAssistantMessage(fullResponse);

          // Save conversation to database
          if (conversationId && userId) {
            try {
              // Save user message
              await db.message.create({
                data: {
                  conversationId,
                  role: "user",
                  content: message,
                },
              });

              // Save assistant message
              await db.message.create({
                data: {
                  conversationId,
                  role: "assistant",
                  content: fullResponse,
                },
              });

              // Update conversation timestamp
              await db.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
              });
            } catch (dbError) {
              console.error("Failed to save messages:", dbError);
            }
          }

          // Send completion signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error instanceof Error ? error.message : "Stream error" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/chat:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * OPTIONS /api/ai/chat
 * CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
