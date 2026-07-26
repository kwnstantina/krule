import { Condition, ConditionGroup, Rule, CustomOperator } from './types';

type ComparisonOperator = (a: any, b: any) => boolean;
type GroupOperator = (results: boolean[]) => boolean;

const operatorMap: Record<string, ComparisonOperator> = {
  "==": (a: any, b: any) => a === b,
  "!=": (a: any, b: any) => a !== b,
  ">": (a: number, b: number) => a > b,
  "<": (a: number, b: number) => a < b,
  ">=": (a: number, b: number) => a >= b,
  "<=": (a: number, b: number) => a <= b,
  "in": (a: any, b: any[]) => b.includes(a),
  "not": (a: any, b: any[]) => !b.includes(a),
};

const groupOperators: Record<string, GroupOperator> = {
  AND: (results: boolean[]) => results.every(Boolean),
  OR: (results: boolean[]) => results.some(Boolean),
  XOR: (results: boolean[]) => results.filter(Boolean).length === 1,
  NAND: (results: boolean[]) => !results.every(Boolean),
  NOR: (results: boolean[]) => !results.some(Boolean),
};

const customOperators = new Map<string, CustomOperator>();

export function registerOperator(operator: CustomOperator) {
  if (operator.name in groupOperators) {
    throw new Error(`Cannot override built-in operator: ${operator.name}`);
  }
  customOperators.set(operator.name, operator);
}

export function getOperator(
  name: string
): CustomOperator | GroupOperator | undefined {
  return customOperators.get(name) ?? groupOperators[name];
}

export function evaluateCondition(
  condition: Condition | ConditionGroup,
  context: Record<string, any>
): boolean {
  if ("field" in condition) {
    const { field, operator, value } = condition;
    const compare = operatorMap[operator];
    if (!compare) {
      throw new Error(`Unknown condition operator: ${operator}`);
    }
    return compare(context[field], value);
  }

  const { operator, conditions } = condition as {
    operator: string;
    conditions: Array<Condition | ConditionGroup>;
  };

  // Evaluate children first: group operators take booleans, not raw conditions.
  const results = conditions.map((nested) => evaluateCondition(nested, context));

  // Resolve through getOperator so registered custom operators participate.
  const groupOperator = getOperator(operator);
  if (!groupOperator) {
    throw new Error(`Unknown group operator: ${operator}`);
  }

  return typeof groupOperator === "function"
    ? groupOperator(results)
    : groupOperator.evaluate(results);
}

export function executeRules(
  rules: Rule[],
  context: Record<string, any>
): Map<string, any> {
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);
  const results = new Map<string, any>();

  for (const rule of sortedRules) {
    if (evaluateCondition(rule.condition, context)) {
      for (const action of rule.actions) {
        results.set(action.target, {
          type: action.type,
          payload: action.payload
        });
      }
    }
  }
  return results;
}
