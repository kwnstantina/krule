export { discoverModule, detectCommit } from "./discover";
export type { DiscoverOptions, DiscoverResult } from "./discover";

export { ingestModule, renderCorpus, classifyOrigin } from "./ingest";
export type { ModuleCorpus, SourceFile } from "./ingest";

export {
  ExtractedRuleSchema,
  ExtractionResultSchema,
  EXTRACTION_JSON_SCHEMA,
} from "./schema";
export type { ExtractedRule, ExtractionResult } from "./schema";

export {
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionTask,
} from "./prompts";
