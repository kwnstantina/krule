import { NextRequest, NextResponse } from "next/server";
import { Validator } from "@repo/ai-service";
import { db } from "@repo/database";

/**
 * POST /api/ai/validate
 * Validate a rule with AI-assisted error explanations
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rule, userId } = body;

    if (!rule) {
      return NextResponse.json(
        { error: "Rule is required" },
        { status: 400 }
      );
    }

    // Initialize validator
    const validator = new Validator(process.env.GROQ_API_KEY);

    // Validate rule
    const result = await validator.validate(rule);

    // Store validation attempt in database
    try {
      await db.validationAttempt.create({
        data: {
          ruleData: rule as any,
          success: result.valid,
          errors: result.errors ? (result.errors as any) : null,
          aiExplanation: result.aiExplanation || null,
        },
      });
    } catch (dbError) {
      console.error("Failed to store validation attempt:", dbError);
    }

    // If valid, optionally check logic
    if (result.valid) {
      const logicCheck = await validator.checkLogic(rule);

      return NextResponse.json({
        valid: true,
        issues: logicCheck.issues,
        warnings: logicCheck.warnings,
      });
    }

    // Get fix suggestions for invalid rules
    let suggestions: string[] = [];
    if (result.errors) {
      suggestions = await validator.suggestFixes(rule, result.errors);
    }

    return NextResponse.json({
      valid: false,
      errors: result.errors,
      aiExplanation: result.aiExplanation,
      suggestions,
    });
  } catch (error) {
    console.error("Error in /api/ai/validate:", error);

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
 * OPTIONS /api/ai/validate
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
