import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/database";

/**
 * GET /api/ai/conversations
 * Get all conversations for a user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get conversations
    const conversations = await db.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50, // Limit to recent 50 conversations
    });

    return NextResponse.json({
      success: true,
      conversations: conversations.map((conv: typeof conversations[number]) => ({
        id: conv.id,
        title: conv.title || `Conversation ${conv.id.slice(0, 8)}`,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        lastMessage: conv.messages[0]?.content || "",
        messageCount: conv.messages.length,
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/ai/conversations:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/conversations
 * Create a new conversation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Create conversation
    const conversation = await db.conversation.create({
      data: {
        userId,
        title: title || null,
      },
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/ai/conversations:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/conversations
 * Delete a conversation
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: "conversationId and userId are required" },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.userId !== userId) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Delete conversation (cascade will delete messages)
    await db.conversation.delete({
      where: { id: conversationId },
    });

    return NextResponse.json({
      success: true,
      message: "Conversation deleted",
    });
  } catch (error) {
    console.error("Error in DELETE /api/ai/conversations:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/ai/conversations
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
