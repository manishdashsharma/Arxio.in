import { apiBinaryRequest } from "./client";

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    queueMicrotask(() => URL.revokeObjectURL(url));
  }
}

/**
 * @param {string} workspaceId
 * @param {"pptx" | "quick_pptx"} format
 * @param {string} [filenameHint] base name from original file (no extension)
 */
export async function downloadWorkspaceExport(workspaceId, format, filenameHint = "arxio") {
  const safeBase = String(filenameHint || "arxio")
    .replace(/[/\\?%*:|"<>]/g, "")
    .slice(0, 80) || "arxio";
  const suffix = format === "quick_pptx" ? "quick-5" : "deck-15";
  const blob = await apiBinaryRequest(`/export/${encodeURIComponent(workspaceId)}/${encodeURIComponent(format)}`, {
    auth: true,
  });
  triggerBlobDownload(blob, `${safeBase}-${suffix}.pptx`);
}
