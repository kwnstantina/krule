import { describe, expect, it } from "vitest";
import { classifyOrigin, renderCorpus, type ModuleCorpus } from "./ingest";
import {
  EXTRACTION_JSON_SCHEMA,
  ExtractionResultSchema,
} from "./schema";

describe("classifyOrigin", () => {
  it("treats TypeScript and legacy .NET sources as code", () => {
    expect(classifyOrigin("src/authorise-claim.ts")).toBe("code");
    expect(classifyOrigin("Claims/Handler.cs")).toBe("code");
    expect(classifyOrigin("Lawsys/Form1.vb")).toBe("code");
  });

  it("separates schema from seed data even though both are .sql", () => {
    // A CHECK constraint is a schema rule; a regularity across rows is a data
    // rule. Collapsing them would put every data finding in the wrong section.
    expect(classifyOrigin("db/schema.sql")).toBe("schema");
    expect(classifyOrigin("db/seed.sql")).toBe("data");
  });

  it("treats markdown as documentation", () => {
    expect(classifyOrigin("docs/underwriting-wiki.md")).toBe("docs");
  });

  it("ignores files that carry no business rules", () => {
    expect(classifyOrigin("logo.png")).toBeNull();
    expect(classifyOrigin("tsconfig.json")).toBeNull();
  });
});

describe("renderCorpus", () => {
  const corpus: ModuleCorpus = {
    moduleName: "demo",
    root: "/tmp/demo",
    files: [
      {
        path: "src/a.ts",
        contents: "const a = 1;\nconst b = 2;",
        origin: "code",
        lineCount: 2,
      },
    ],
  };

  it("numbers every line, because provenance cites a line", () => {
    const rendered = renderCorpus(corpus);
    expect(rendered).toContain("   1 | const a = 1;");
    expect(rendered).toContain("   2 | const b = 2;");
  });

  it("labels each file with its path and origin", () => {
    const rendered = renderCorpus(corpus);
    expect(rendered).toContain("FILE: src/a.ts (origin: code, 2 lines)");
  });
});

describe("extraction schema", () => {
  it("accepts a well-formed rule", () => {
    const parsed = ExtractionResultSchema.parse({
      rules: [
        {
          statement: "A claim above 10000 requires senior sign-off.",
          provenance: [{ file: "src/a.ts", line: 93 }],
          confidence: 0.9,
          origins: ["code"],
        },
      ],
    });
    expect(parsed.rules).toHaveLength(1);
  });

  it("rejects a fragment masquerading as a rule statement", () => {
    expect(() =>
      ExtractionResultSchema.parse({
        rules: [
          {
            statement: "too short",
            provenance: [{ file: "src/a.ts", line: 1 }],
            confidence: 0.5,
            origins: ["code"],
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects a rule with no evidence", () => {
    expect(() =>
      ExtractionResultSchema.parse({
        rules: [
          {
            statement: "A rule with nothing backing it up at all.",
            provenance: [],
            confidence: 0.5,
            origins: ["code"],
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects a confidence outside 0..1", () => {
    expect(() =>
      ExtractionResultSchema.parse({
        rules: [
          {
            statement: "A claim above 10000 requires senior sign-off.",
            provenance: [{ file: "src/a.ts", line: 1 }],
            confidence: 1.4,
            origins: ["code"],
          },
        ],
      }),
    ).toThrow();
  });

  it("keeps the hand-written JSON Schema in step with the Zod schema", () => {
    // These two are maintained separately (the SDK's zodOutputFormat helper
    // needs Zod v4 and this workspace is on 3.24), so drift between them is a
    // real risk. Pin the field names and the enum together.
    const rules = EXTRACTION_JSON_SCHEMA.properties as Record<string, unknown>;
    const items = (rules.rules as Record<string, unknown>).items as Record<
      string,
      unknown
    >;
    const properties = items.properties as Record<string, unknown>;

    expect(Object.keys(properties).sort()).toEqual([
      "confidence",
      "notes",
      "origins",
      "provenance",
      "statement",
      "tags",
    ]);
    expect(items.required).toEqual([
      "statement",
      "provenance",
      "confidence",
      "origins",
    ]);
    // Structured outputs require this on every object.
    expect(items.additionalProperties).toBe(false);

    const origins = properties.origins as Record<string, unknown>;
    const originItems = origins.items as Record<string, unknown>;
    expect(originItems.enum).toEqual(["code", "schema", "data", "docs"]);
  });
});
