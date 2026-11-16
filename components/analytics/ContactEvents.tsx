"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * 電話（tel:）と LINE のリンクが押されたことを、ページ全体で拾って GA4 に送る（contact_tel / contact_line）。
 * どこで押されたかは、いちばん近い data-ga-location（header・mobile_menu・footer・floating_dock・cta など）。無ければ body。
 * LINE のリンクはいまは無い（lib/site.ts の contact.lineUrl が空）。足せば、そのまま contact_line として数える。
 * 電話番号そのものは送らない。
 */
export function ContactEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const link_location = a.closest("[data-ga-location]")?.getAttribute("data-ga-location") ?? "body";
      if (href.startsWith("tel:")) track("contact_tel", { link_location });
      else if (/lin\.ee|line\.me/.test(href)) track("contact_line", { link_location });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
