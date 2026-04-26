import { useEffect, useState } from "react";
import { getWorkspaceStatus } from "../../../core/api/pdf-api";

const POLL_MS = 2200;

export function useWorkspaceStatus(workspaceId) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!workspaceId) return undefined;
    let cancelled = false;
    let timer;

    async function poll() {
      try {
        if (!cancelled) setError("");
        const next = await getWorkspaceStatus(workspaceId);
        if (cancelled) return;
        setStatus(next);
        setLoading(false);
        if (next?.status === "processing" || next?.status === "pending") {
          timer = window.setTimeout(poll, POLL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        setLoading(false);
        setError(err instanceof Error ? err.message : "Unable to fetch workspace status.");
      }
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [workspaceId]);

  return { status, loading, error };
}

