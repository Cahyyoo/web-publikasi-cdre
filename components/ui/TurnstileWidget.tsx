"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string }) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile challenge. Rendered explicitly because the script's
 * automatic render only runs once, so the widget would be missing after a
 * next/link navigation back to this page. Inside a <form> it adds the hidden
 * `cf-turnstile-response` field that the server action verifies.
 */
export default function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  // A token is single-use and the form stays mounted after submitting, so a
  // retry (e.g. after a rejected photo) needs a fresh one.
  useEffect(() => {
    if (wasPending.current && !pending && widgetId.current) {
      window.turnstile?.reset(widgetId.current);
    }
    wasPending.current = pending;
  }, [pending]);

  const renderWidget = useCallback(() => {
    if (!container.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
    });
  }, [siteKey]);

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [renderWidget]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={renderWidget}
      />
      <div ref={container} />
    </>
  );
}
