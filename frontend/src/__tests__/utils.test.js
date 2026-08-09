import { describe, it, expect } from "vitest";

// Utility functions under test
function calculateRiskLevel(score) {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

function parseBP(bpString) {
  if (!bpString || !bpString.includes("/")) return { sys: 120, dia: 80 };
  const parts = bpString.split("/");
  return {
    sys: parseInt(parts[0], 10) || 120,
    dia: parseInt(parts[1], 10) || 80,
  };
}

describe("Frontend Clinical Utility Functions", () => {
  it("should classify scores >= 70 as HIGH risk", () => {
    expect(calculateRiskLevel(91)).toBe("HIGH");
    expect(calculateRiskLevel(70)).toBe("HIGH");
  });

  it("should classify scores between 40 and 69 as MEDIUM risk", () => {
    expect(calculateRiskLevel(55)).toBe("MEDIUM");
    expect(calculateRiskLevel(40)).toBe("MEDIUM");
  });

  it("should classify scores < 40 as LOW risk", () => {
    expect(calculateRiskLevel(25)).toBe("LOW");
    expect(calculateRiskLevel(0)).toBe("LOW");
  });

  it("should correctly parse blood pressure strings", () => {
    expect(parseBP("140/90")).toEqual({ sys: 140, dia: 90 });
    expect(parseBP("120/80")).toEqual({ sys: 120, dia: 80 });
    expect(parseBP("invalid")).toEqual({ sys: 120, dia: 80 });
  });
});
