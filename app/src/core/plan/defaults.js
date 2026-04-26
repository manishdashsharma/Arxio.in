export const DEFAULT_LIMITS_BY_TIER = {
  free: {
    pdfs_per_month: 3,
    research_per_month: 5,
    chat_messages: 10,
    ppt: false,
    rag: false,
    academic_mode: false,
    history_days: 7,
    presentation_mode: false,
    share_links: false,
    comparison: false,
    priority_ai: false,
  },
  student: {
    pdfs_per_month: 20,
    research_per_month: 30,
    chat_messages: 50,
    ppt: true,
    rag: false,
    academic_mode: false,
    history_days: 180,
    presentation_mode: true,
    share_links: true,
    comparison: false,
    priority_ai: false,
  },
  pro: {
    pdfs_per_month: 60,
    research_per_month: 100,
    chat_messages: -1,
    ppt: true,
    rag: false,
    academic_mode: false,
    history_days: -1,
    presentation_mode: true,
    share_links: true,
    comparison: true,
    priority_ai: true,
  },
  scholar: {
    pdfs_per_month: -1,
    research_per_month: -1,
    chat_messages: -1,
    ppt: true,
    rag: true,
    academic_mode: true,
    history_days: -1,
    presentation_mode: true,
    share_links: true,
    comparison: true,
    priority_ai: true,
  },
};

export function limitsForTier(tier) {
  const t = String(tier ?? "free").toLowerCase();
  return DEFAULT_LIMITS_BY_TIER[t] ? { ...DEFAULT_LIMITS_BY_TIER[t] } : { ...DEFAULT_LIMITS_BY_TIER.free };
}
