import { NextRequest, NextResponse } from "next/server";
import { RuleGenerator } from "@repo/ai-service";
import { db } from "@repo/database";

/**
 * POST /api/ai/generate
 * Generate a rule from natural language
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, userId } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    // Initialize rule generator
    const generator = new RuleGenerator(process.env.GROQ_API_KEY);

    // Generate rule
    const result = await generator.generate(prompt);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          validationErrors: result.validationErrors,
          attempts: result.attempts,
        },
        { status: 400 }
      );
    }

    // Store generated rule in database (if userId provided)
    if (userId && result.rule) {
      try {
        await db.generatedRule.create({
          data: {
            userId,
            name: result.rule.name || "Untitled Rule",
            prompt,
            ruleData: result.rule as any,
            validated: true,
          },
        });
      } catch (dbError) {
        console.error("Failed to store rule in database:", dbError);
        // Continue anyway - don't fail the whole request
      }
    }

    // Track API usage
    try {
      await db.apiUsage.create({
        data: {
          userId: userId || null,
          endpoint: "/api/ai/generate",
          method: "POST",
          statusCode: 200,
          responseTime: 0, // Could track actual time
        },
      });
    } catch (dbError) {
      console.error("Failed to track API usage:", dbError);
    }

    return NextResponse.json({
      success: true,
      rule: result.rule,
      attempts: result.attempts,
    });
  } catch (error) {
    console.error("Error in /api/ai/generate:", error);

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
 * OPTIONS /api/ai/generate
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
