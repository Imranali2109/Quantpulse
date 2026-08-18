import { ExplanationEvidence } from "./interfaces";

export function buildExplanation(
  evidence: string[],
  conflicts: string[]
): ExplanationEvidence {
  // Deduplicate and return
  return { 
    evidence: Array.from(new Set(evidence)), 
    conflicts: Array.from(new Set(conflicts)) 
  };
}
