// DigiCB Risk Management — risk scoring helpers (server-safe, pure).
export function inherentScore(likelihood: number, impact: number): number {
  return Math.max(1, Math.min(25, likelihood * impact));
}

export function scoreToLevel(score: number): string {
  if (score >= 20) return "extreme";
  if (score >= 12) return "high";
  if (score >= 6) return "medium";
  return "low";
}

const CONTROL_FACTOR: Record<string, number> = {
  weak: 1.0,
  adequate: 0.7,
  strong: 0.4,
};

export function residualScore(inherent: number, controlEffectiveness: string): number {
  const factor = CONTROL_FACTOR[controlEffectiveness] ?? 0.7;
  return Math.round(inherent * factor);
}
