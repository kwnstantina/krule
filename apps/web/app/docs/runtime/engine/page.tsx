import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Callout, Code, DocHeader, PrevNext, Prose } from "../../components";

export const metadata: Metadata = {
  title: "Rule engine — krule docs",
};

export default function EnginePage() {
  return (
    <>
      <DocHeader
        eyebrow="Runtime"
        title="Rule engine"
        lede="A small, typed engine that evaluates executable rules against a JSON context. It has no dependencies beyond Zod and runs anywhere TypeScript does."
      />
      <Prose>
        <Callout tone="note">
          <p>
            The engine lives in the monorepo as <code>@repo/core</code> and is imported from the{" "}
            <code>@repo/core/evaluators</code> subpath. It is not published to npm.
          </p>
        </Callout>

        <h2>A rule</h2>
        <p>A rule has a priority, one condition group, and a list of actions:</p>
        <Code title="TypeScript">{`import type { Rule } from "@repo/core/evaluators";

const premiumDiscount: Rule = {
  name: "Premium user discount",
  priority: 10,
  condition: {
    operator: "AND",
    conditions: [
      { field: "userType", operator: "==", value: "premium" },
      { field: "cartValue", operator: ">=", value: 100 },
    ],
  },
  actions: [{ type: "discount", target: "cart", payload: { percentage: 15 } }],
};`}</Code>
        <p>
          Condition groups nest: a group&apos;s <code>conditions</code> can mix leaf conditions and further groups.
          <code>RuleSchema</code> validates the shape with Zod, which is how AI-generated rules are checked before they
          are accepted.
        </p>

        <h2>Operators</h2>
        <table>
          <thead>
            <tr>
              <th>Kind</th>
              <th>Operators</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Comparison</td>
              <td><code>==</code> <code>!=</code> <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code></td>
              <td>Compare <code>context[field]</code> with <code>value</code>. Equality is strict.</td>
            </tr>
            <tr>
              <td>Membership</td>
              <td><code>in</code> <code>not</code></td>
              <td>Whether <code>context[field]</code> is in the array given as <code>value</code>.</td>
            </tr>
            <tr>
              <td>Group</td>
              <td><code>AND</code> <code>OR</code> <code>XOR</code> <code>NAND</code> <code>NOR</code></td>
              <td>Combine the results of a group&apos;s conditions. <code>XOR</code> means exactly one is true.</td>
            </tr>
          </tbody>
        </table>

        <h2>Running rules</h2>
        <Code title="TypeScript">{`import { executeRules } from "@repo/core/evaluators";

const results = executeRules([premiumDiscount], {
  userType: "premium",
  cartValue: 150,
});

results.get("cart");  // { type: "discount", payload: { percentage: 15 } }`}</Code>
        <p>
          <code>executeRules</code> evaluates every rule and returns a <code>Map</code> from each action&apos;s target
          to the action that applied. <code>evaluateCondition(condition, context)</code> is exported too, for checking a
          single condition or group.
        </p>

        <Callout tone="caution">
          <p>
            Rules run in descending priority, and each matching action overwrites the target&apos;s entry. So when two
            matching rules write the same target, <strong>the lowest-priority rule wins</strong>. This is pinned by a
            test and kept deliberately, because existing rules depend on it. Give rules distinct targets, or account
            for it when setting priorities.
          </p>
        </Callout>

        <h2>Custom group operators</h2>
        <p>
          Register a group operator that combines child results your own way. Built-in group operators can&apos;t be
          overridden, and an unknown operator throws a descriptive error.
        </p>
        <Code title="TypeScript">{`import { registerOperator } from "@repo/core/evaluators";

registerOperator({
  name: "MAJORITY",
  evaluate: (results) => results.filter(Boolean).length > results.length / 2,
});`}</Code>

        <p>
          To build and try rules without code, use the <Link href="/docs/runtime/builder">rule builder</Link>.
        </p>
      </Prose>
      <PrevNext href="/docs/runtime/engine" />
    </>
  );
}
