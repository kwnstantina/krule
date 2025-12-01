import { NextRequest, NextResponse } from "next/server";
import { TestGenerator } from "@repo/ai-service";
import type { Rule } from "@repo/core/evaluators";

/**
 * POST /api/ai/test-scenarios
 * Generate test scenarios for a rule
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rule, type = "all", count = 3 } = body;

    if (!rule) {
      return NextResponse.json(
        { error: "Rule is required" },
        { status: 400 }
      );
    }

    // Initialize test generator
    const generator = new TestGenerator(process.env.GROQ_API_KEY);

    let result;

    // Different types of test scenarios
    switch (type) {
      case "positive":
        result = await generator.generatePositiveCases(rule as Rule, count);
        break;
      case "negative":
        result = await generator.generateNegativeCases(rule as Rule, count);
        break;
      case "edge":
        result = await generator.generateEdgeCases(rule as Rule);
        break;
      case "suite":
        result = await generator.generateSuite(rule as Rule);
        break;
      default:
        result = await generator.generate(rule as Rule);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      scenarios: result.scenarios,
    });
  } catch (error) {
    console.error("Error in /api/ai/test-scenarios:", error);

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
 * OPTIONS /api/ai/test-scenarios
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
