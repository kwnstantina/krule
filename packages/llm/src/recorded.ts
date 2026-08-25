import { readRecord, requestKey, toRecord, writeRecord } from "./cache";
import { DEFAULT_CACHE_DIR, DEFAULT_MODEL } from "./constants";
import type { CompletionRequest, CompletionResult, LlmProvider } from "./types";

/**
 * Replays a previously recorded response and never touches the network.
 *
 * This exists so a demo or a CI run cannot fail on a missing key, a rate limit
 * or a dropped connection. It is also how the fixture's extraction result stays
 * reproducible: the recorded run is committed, so the same input gives the same
 * kontract every time.
 */
export class RecordedProvider implements LlmProvider {
  readonly name = "recorded";

  constructor(
    private readonly cacheDir: string = DEFAULT_CACHE_DIR,
    // Must match the model the recording was made under, or the cache
    // key will not line up with what CachingProvider wrote.
    private readonly model: string = DEFAULT_MODEL,
  ) {}

  async complete<T>(
    request: CompletionRequest<T>,
  ): Promise<CompletionResult<T>> {
    const key = requestKey(request, this.model);
    const record = await readRecord(this.cacheDir, key);

    if (record === null) {
      throw new Error(
        "No recorded response for this request (key " +
          key.slice(0, 12) +
          "... in " +
          this.cacheDir +
          "). The recorded provider never calls the API. Set " +
          "ANTHROPIC_API_KEY and re-run to record one.",
      );
    }

    // Validate on the way out as well as the way in. A recorded file is an
    // ordinary file on disk that a human may have edited; replaying something
    // that no longer satisfies the schema would fail confusingly downstream.
    return {
      data: request.schema.parse(record.data),
      usage: record.usage,
      model: record.model,
      provider: this.name,
    };
  }
}

/**
 * Wraps a live provider so every successful response is written to disk, and
 * an already-recorded response short-circuits the call.
 *
 * Read-through as well as write-through: the second `krule discover` over an
 * unchanged module costs nothing and returns instantly, which also makes the
 * demo fast on a re-run.
 */
export class CachingProvider implements LlmProvider {
  readonly name: string;

  constructor(
    private readonly inner: LlmProvider,
    private readonly cacheDir: string = DEFAULT_CACHE_DIR,
    private readonly model: string,
  ) {
    this.name = inner.name + "+cache";
  }

  async complete<T>(
    request: CompletionRequest<T>,
  ): Promise<CompletionResult<T>> {
    const key = requestKey(request, this.model);
    const hit = await readRecord(this.cacheDir, key);
    if (hit !== null) {
      return {
        data: request.schema.parse(hit.data),
        usage: hit.usage,
        model: hit.model,
        provider: this.inner.name + " (replayed)",
      };
    }

    const result = await this.inner.complete(request);
    await writeRecord(this.cacheDir, key, toRecord(request, result));
    return result;
  }
}
