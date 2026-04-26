import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/use-auth";
import { getSubscription } from "../api/dashboard-api";
import { limitsForTier } from "./defaults";
import { PlanContext } from "./plan-context-store";
import { normalizeTier, tierDisplayName } from "./tier";

function normalizeUsage(raw) {
  if (!raw || typeof raw !== "object") {
    return { pdfsUsed: 0, researchUsed: 0, chatUsed: 0 };
  }
  return {
    pdfsUsed: Number(raw.pdfs_used ?? raw.pdfs_used_this_month ?? 0) || 0,
    researchUsed: Number(raw.research_used ?? raw.research_used_this_month ?? 0) || 0,
    chatUsed: Number(raw.chat_messages_used ?? raw.chat_messages_used_this_month ?? 0) || 0,
  };
}

function underCap(used, limit) {
  if (limit === -1) return true;
  if (limit == null || Number.isNaN(Number(limit))) return true;
  return used < Number(limit);
}

function mergeLimits(tier, apiLimits) {
  const base = limitsForTier(tier);
  if (!apiLimits || typeof apiLimits !== "object") return base;
  return { ...base, ...apiLimits };
}

function buildValue(user, subscription, loading, error, refresh, quotasReady) {
  if (!user) {
    return {
      tier: "free",
      displayName: "Free",
      limits: limitsForTier("free"),
      usage: { pdfsUsed: 0, researchUsed: 0, chatUsed: 0 },
      isSubscribed: false,
      loading: false,
      quotasReady: true,
      error: "",
      refresh,
      allows: () => false,
      pdfUploadAllowed: false,
      researchAllowed: false,
      chatAllowed: false,
      formatPdfUsage: () => "—",
      formatResearchUsage: () => "—",
      formatChatUsage: () => "—",
    };
  }

  const tier = normalizeTier(user.plan ?? subscription?.plan ?? "free");
  const limits = mergeLimits(tier, subscription?.limits);
  const usage = normalizeUsage(subscription?.usage);
  const pdfUploadAllowed = quotasReady && underCap(usage.pdfsUsed, limits.pdfs_per_month);
  const researchAllowed = quotasReady && underCap(usage.researchUsed, limits.research_per_month);
  const chatAllowed = quotasReady && underCap(usage.chatUsed, limits.chat_messages);

  const formatPdfUsage = () => {
    const u = usage.pdfsUsed;
    const l = limits.pdfs_per_month;
    if (l === -1) return `${u} / Unlimited`;
    return `${u} / ${l}`;
  };
  const formatResearchUsage = () => {
    const u = usage.researchUsed;
    const l = limits.research_per_month;
    if (l === -1) return `${u} / Unlimited`;
    return `${u} / ${l}`;
  };
  const formatChatUsage = () => {
    const u = usage.chatUsed;
    const l = limits.chat_messages;
    if (l === -1) return `${u} / Unlimited`;
    return `${u} / ${l}`;
  };

  const allows = (feature) => Boolean(limits[feature]);

  return {
    tier,
    displayName: tierDisplayName(tier),
    limits,
    usage,
    isSubscribed: Boolean(subscription?.is_subscribed ?? user.is_subscribed),
    loading,
    quotasReady,
    error,
    refresh,
    allows,
    pdfUploadAllowed,
    researchAllowed,
    chatAllowed,
    formatPdfUsage,
    formatResearchUsage,
    formatChatUsage,
  };
}

export function PlanProvider({ children }) {
  const { user, ready: authReady } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quotasReady, setQuotasReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setError("");
      setQuotasReady(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getSubscription();
      setSubscription(data);
    } catch (e) {
      setSubscription(null);
      setError(e instanceof Error ? e.message : "Could not load subscription.");
    } finally {
      setLoading(false);
      setQuotasReady(true);
    }
  }, [user]);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!user) {
      queueMicrotask(() => {
        setSubscription(null);
        setLoading(false);
        setError("");
        setQuotasReady(true);
      });
      return undefined;
    }
    queueMicrotask(() => {
      setQuotasReady(false);
      void refresh();
    });
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when account id changes
  }, [authReady, user?.id, refresh]);

  const value = useMemo(
    () => buildValue(user, subscription, loading, error, refresh, quotasReady),
    [user, subscription, loading, error, refresh, quotasReady],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
