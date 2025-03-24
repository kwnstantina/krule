import { Condition, ConditionGroup ,Rule,CustomOperator} from './types';

const operatorMap = {
  "==": (a: any, b: any) => a === b,
  "!=": (a: any, b: any) => a !== b,
  ">": (a: number, b: number) => a > b,
  "<": (a: number, b: number) => a < b,
  ">=": (a: number, b: number) => a >= b,
  "<=": (a: number, b: number) => a <= b,
  "in": (a: any, b: any[]) => b.includes(a),
  "not": (a: any, b: any[]) => !b.includes(a),
};

const groupOperators = {
  AND: (conditions: boolean[]) => conditions.every(Boolean),
  OR: (conditions: boolean[]) => conditions.some(Boolean),
  XOR: (conditions: boolean[]) => 
    conditions.filter(Boolean).length === 1,
  NAND: (conditions: boolean[]) => 
    !conditions.every(Boolean),
  NOR: (conditions: boolean[]) => 
    !conditions.some(Boolean),
};

export function evaluateCondition(
  condition: Condition | ConditionGroup,
  context: Record<string, any>
): boolean {
  if ("field" in condition) {
    const { field, operator, value } = condition;
    const contextValue = context[field];
    return operatorMap[operator as keyof typeof operatorMap](contextValue, value) as any;
  } else {
    const { operator, conditions } = condition as any;
    const groupOperator = operator as keyof typeof groupOperators;
    return groupOperators[groupOperator](conditions);
  }
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

const customOperators = new Map<string, CustomOperator>();


export function registerOperator(operator: CustomOperator) {
  if (operator.name in groupOperators) {
    throw new Error(`Cannot override built-in operator: ${operator.name}`);
  }
  customOperators.set(operator.name, operator);
}

export function getOperator(name: string): CustomOperator | any {
  return customOperators.get(name) || groupOperators[name as keyof typeof groupOperators];
}