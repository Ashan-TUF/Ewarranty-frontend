"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (media.matches) {
      return;
    }

    const html = document.documentElement;
    const previousScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    const scrollContainer = document.querySelector<HTMLElement>(".app-scroll-area");
    const scrollContent = scrollContainer?.firstElementChild;

    const lenis = new Lenis(
      scrollContainer
        ? {
            wrapper: scrollContainer,
            content: (scrollContent as HTMLElement | null) ?? scrollContainer,
            eventsTarget: scrollContainer,
            duration: 1.05,
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1,
            syncTouch: false,
          }
        : {
            duration: 1.05,
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1,
            syncTouch: false,
          }
    );

    let rafId = 0;

    function raf(time: number) {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    }

    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
      html.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  return null;
}
