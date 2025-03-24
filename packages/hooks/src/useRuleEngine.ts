import { useEffect, useMemo, useState, useCallback } from 'react';
import { evaluateCondition, executeRules, Rule, ConditionGroup,registerOperator } from '@repo/core/src/evaluators';

interface UseRuleEngineResult {
  results: Map<string, any>;
  updateRule: (index: number, newRule: Rule) => void;
  updateContext: (newContext: Record<string, any>) => void;
  rules: Rule[];
  context: Record<string, any>;
  result: ConditionGroup;
  reevaluate: () => ConditionGroup;
}

const useRuleEngine = (initialRules: Rule[], initialContext: Record<string, any>): UseRuleEngineResult => {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [context, setContext] = useState<Record<string, any>>(initialContext);
  const [results, setResults] = useState<Map<string, any>>(new Map());

  const result = useMemo<ConditionGroup>(() => evaluateCondition(rules, context), [rules, context]);

  useEffect(() => {
    setResults(executeRules(rules, context));
  }, [rules, context]);

  const updateRule = useCallback((index: number, newRule: Rule) => {
    setRules((prevRules: any) => {
      const updatedRules = [...prevRules];
      updatedRules[index] = newRule;
      return updatedRules;
    });
  }, []);

  const updateContext = useCallback((newContext: Record<string, any>) => {
    setContext((prevContext: any) => ({
      ...prevContext,
      ...newContext
    }));
  }, []);

  const reevaluate = useCallback(() => evaluateCondition(rules, context), [rules, context]);

  return {
    results,
    updateRule,
    updateContext,
    rules,
    context,
    result,
    reevaluate,
  };
};

export default useRuleEngine;