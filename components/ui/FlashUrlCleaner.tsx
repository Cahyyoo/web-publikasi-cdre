"use client";

import { useEffect } from "react";

/**
 * Strips `?flash=` from the address bar after the banner has rendered, so a
 * refresh doesn't show a stale "berhasil disimpan".
 *
 * Uses history.replaceState rather than router.replace on purpose: the latter
 * triggers a full RSC refetch just to drop one query param. The banner is
 * already in the DOM and stays put.
 */
export default function FlashUrlCleaner() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("flash")) return;

    url.searchParams.delete("flash");
    window.history.replaceState(
      window.history.state,
      "",
      url.pathname + url.search + url.hash
    );
  }, []);

  return null;
}
