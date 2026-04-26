const TIERS = ["free", "student", "pro", "scholar"];

const DISPLAY = {
  free: "Free",
  student: "Student",
  pro: "Pro",
  scholar: "Scholar",
};

export function normalizeTier(value) {
  const t = String(value ?? "free")
    .toLowerCase()
    .trim();
  if (TIERS.includes(t)) return t;
  return "free";
}

export function tierRank(tier) {
  const t = normalizeTier(tier);
  return TIERS.indexOf(t);
}

export function tierAtLeast(currentTier, minimumTier) {
  return tierRank(currentTier) >= tierRank(minimumTier);
}

export function tierDisplayName(tier) {
  return DISPLAY[normalizeTier(tier)] || "Free";
}
