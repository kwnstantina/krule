import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { requestKey } from "./cache";
import { DEFAULT_MODEL } from "./constants";
import { createProvider } from "./factory";
import { CachingProvider, RecordedProvider } from "./recorded";
import { EMPTY_USAGE, type CompletionRequest, type LlmProvider } from "./types";

const Schema = z.object({ answer: z.string().min(1) });

function request(
  overrides: Partial<CompletionRequest<{ answer: string }>> = {},
): CompletionRequest<{ answer: string }> {
  return {
    system: "you are a test",
    corpus: "some corpus",
    task: "do the thing",
    jsonSchema: { type: "object" },
    schema: Schema,
    schemaName: "test-v1",
    ...overrides,
  };
}

class CountingProvider implements LlmProvider {
  readonly name = "counting";
  calls = 0;

  async complete<T>(req: CompletionRequest<T>) {
    this.calls += 1;
    return {
      data: req.schema.parse({ answer: "hello" }),
      usage: { ...EMPTY_USAGE, inputTokens: 10, outputTokens: 5 },
      model: DEFAULT_MODEL,
      provider: this.name,
    };
  }
}

describe("requestKey", () => {
  it("is stable for the same request", () => {
    expect(requestKey(request(), DEFAULT_MODEL)).toBe(
      requestKey(request(), DEFAULT_MODEL),
    );
  });

  it("changes when the corpus changes", () => {
    expect(requestKey(request({ corpus: "a" }), DEFAULT_MODEL)).not.toBe(
      requestKey(request({ corpus: "b" }), DEFAULT_MODEL),
    );
  });

  it("changes when effort changes, since the answer can differ", () => {
    expect(requestKey(request({ effort: "low" }), DEFAULT_MODEL)).not.toBe(
      requestKey(request({ effort: "max" }), DEFAULT_MODEL),
    );
  });

  it("changes with the model", () => {
    expect(requestKey(request(), "model-a")).not.toBe(
      requestKey(request(), "model-b"),
    );
  });
});

describe("RecordedProvider", () => {
  it("fails with an actionable message when nothing is recorded", async () => {
    const dir = await mkdtemp(join(tmpdir(), "krule-llm-"));
    const provider = new RecordedProvider(dir);
    await expect(provider.complete(request())).rejects.toThrow(
      /No recorded response/,
    );
  });

  it("replays what the caching provider recorded, under the same key", async () => {
    const dir = await mkdtemp(join(tmpdir(), "krule-llm-"));
    const inner = new CountingProvider();
    const caching = new CachingProvider(inner, dir, DEFAULT_MODEL);

    const first = await caching.complete(request());
    expect(first.data.answer).toBe("hello");
    expect(inner.calls).toBe(1);

    // The whole point: a separate offline provider finds the same entry. This
    // is what breaks if the two disagree about the model in the cache key.
    const replayed = await new RecordedProvider(dir).complete(request());
    expect(replayed.data.answer).toBe("hello");
    expect(replayed.provider).toBe("recorded");
    expect(inner.calls).toBe(1);
  });
});

describe("CachingProvider", () => {
  it("does not call through a second time for the same request", async () => {
    const dir = await mkdtemp(join(tmpdir(), "krule-llm-"));
    const inner = new CountingProvider();
    const caching = new CachingProvider(inner, dir, DEFAULT_MODEL);

    await caching.complete(request());
    const second = await caching.complete(request());

    expect(inner.calls).toBe(1);
    expect(second.provider).toContain("replayed");
  });

  it("calls through again when the corpus changes", async () => {
    const dir = await mkdtemp(join(tmpdir(), "krule-llm-"));
    const inner = new CountingProvider();
    const caching = new CachingProvider(inner, dir, DEFAULT_MODEL);

    await caching.complete(request({ corpus: "one" }));
    await caching.complete(request({ corpus: "two" }));

    expect(inner.calls).toBe(2);
  });
});

describe("createProvider", () => {
  it("falls back to offline replay when auto finds no key", () => {
    const provider = createProvider({ kind: "auto", apiKey: undefined });
    // Guards the demo: no key must never mean a crash mid-presentation.
    expect(provider.name).toBe("recorded");
  });

  it("uses the live provider behind a cache when a key is present", () => {
    const provider = createProvider({ kind: "auto", apiKey: "sk-ant-test" });
    expect(provider.name).toBe("anthropic+cache");
  });

  it("honours an explicit recorded request even with a key present", () => {
    const provider = createProvider({ kind: "recorded", apiKey: "sk-ant-test" });
    expect(provider.name).toBe("recorded");
  });

  it("rejects an unknown effort rather than silently defaulting", () => {
    expect(() => createProvider({ effort: "turbo" as never })).not.toThrow();
    const previous = process.env.KRULE_EFFORT;
    process.env.KRULE_EFFORT = "turbo";
    try {
      expect(() => createProvider()).toThrow(/KRULE_EFFORT/);
    } finally {
      if (previous === undefined) delete process.env.KRULE_EFFORT;
      else process.env.KRULE_EFFORT = previous;
    }
  });
});
