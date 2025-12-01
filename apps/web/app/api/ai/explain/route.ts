import { NextRequest, NextResponse } from "next/server";
import { RuleExplainer } from "@repo/ai-service";
import type { Rule } from "@repo/core/evaluators";

/**
 * POST /api/ai/explain
 * Explain a rule in plain language
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rule, type } = body;

    if (!rule) {
      return NextResponse.json(
        { error: "Rule is required" },
        { status: 400 }
      );
    }

    // Initialize explainer
    const explainer = new RuleExplainer(process.env.GROQ_API_KEY);

    let result;

    // Different types of explanations
    switch (type) {
      case "conditions":
        result = await explainer.explainConditions(rule as Rule);
        break;
      case "actions":
        result = await explainer.explainActions(rule as Rule);
        break;
      case "useCases":
        result = await explainer.suggestUseCases(rule as Rule);
        break;
      default:
        result = await explainer.explain(rule as Rule);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      explanation: result.explanation,
    });
  } catch (error) {
    console.error("Error in /api/ai/explain:", error);

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
 * OPTIONS /api/ai/explain
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
