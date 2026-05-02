import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { analyzeConfig } from "../../src/core/analyzer";

interface EvaluationCase {
  file: string;
  expectedRisk: "low" | "medium" | "high";
  expectedFindings: string[];
}

function readEvaluationCases(): EvaluationCase[] {
  const csv = readFileSync(join(process.cwd(), "samples", "evaluation.csv"), "utf8").trim();
  const [, ...rows] = csv.split(/\r?\n/);

  return rows.map((row) => {
    const [file, expectedRisk, expectedFindings = ""] = row.split(",");

    return {
      file,
      expectedRisk: expectedRisk as EvaluationCase["expectedRisk"],
      expectedFindings: expectedFindings ? expectedFindings.split(";") : []
    };
  });
}

export function runEvaluationTests() {
  for (const item of readEvaluationCases()) {
    const config = readFileSync(join(process.cwd(), "samples", item.file), "utf8");
    const result = analyzeConfig(item.file, config, "en");
    const detectedIds = new Set(result.findings.filter((finding) => finding.severity !== "info").map((finding) => finding.id));

    assert.equal(result.riskLevel, item.expectedRisk, `${item.file} risk level`);

    for (const expectedFinding of item.expectedFindings) {
      assert.ok(detectedIds.has(expectedFinding), `${item.file} should detect ${expectedFinding}`);
    }
  }
}
