'use client';

import { useEffect } from 'react';

/**
 * Remove attributes injetados por extensões (ex.: rtrvr-*) para evitar hydration mismatch.
 */
export function HydrationScrubber() {
  useEffect(() => {
    const scrub = (el: Element) => {
      const toRemove: string[] = [];
      for (const attr of Array.from(el.attributes)) {
        if (attr.name.startsWith('rtrvr-')) {
          toRemove.push(attr.name);
        }
      }
      toRemove.forEach((name) => el.removeAttribute(name));
    };

    const root = document.documentElement;
    scrub(root);
    scrub(document.body);
    root.querySelectorAll('[rtrvr-role],[rtrvr-listeners]').forEach(scrub);
  }, []);

  return null;
}
