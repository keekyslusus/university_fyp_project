import { runEvaluationTests } from "./core/evaluation.test";
import { runParserTests } from "./core/parser.test";

const tests = [
  ["parser", runParserTests],
  ["evaluation samples", runEvaluationTests]
] as const;

for (const [name, run] of tests) {
  run();
  console.log(`ok - ${name}`);
}

console.log(`\n${tests.length} test groups passed`);
