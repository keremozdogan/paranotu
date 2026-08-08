"use client";

/**
 * Scroll ile içerik belirme animasyonu (GSAP + ScrollTrigger).
 *
 * SEO notu: animasyon `gsap.from()` ile kurulur — yani başlangıç durumu
 * JavaScript tarafından atanır. JS çalışmazsa (crawler, no-JS) içerik
 * normal ve görünür halde kalır. Asla `opacity: 0` ile CSS'te gizlemeyin.
 *
 * Erişilebilirlik: `prefers-reduced-motion: reduce` seçen kullanıcıda
 * hiçbir animasyon kurulmaz, içerik doğrudan görünür.
 *
 * Kullanım:
 *   <Reveal>            → tek blok, aşağıdan yumuşak geliş
 *   <Reveal stagger>    → çocuk öğeler görünüme girdikçe sırayla gelir
 */

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Reveal({
  children,
  stagger = false,
  as: Tag = "div",
  className,
  ...rest
}) {
  const scope = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (stagger) {
          /* Grid uzun olabildiği için tek seferde 9 kartı sıralamak yerine
             batch kullanıyoruz: sadece görünüme giren grup animasyona girer,
             son kartlar "geç kalmış" hissi vermez. */
          ScrollTrigger.batch(gsap.utils.toArray(scope.current.children), {
            start: "top 88%",
            once: true,
            onEnter: (batch) =>
              gsap.from(batch, {
                opacity: 0,
                y: 24,
                duration: 0.5,
                stagger: 0.08,
                ease: "power2.out",
                overwrite: true,
              }),
          });
          return;
        }

        gsap.from(scope.current, {
          opacity: 0,
          y: 16,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: {
            trigger: scope.current,
            start: "top 88%",
            once: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope, dependencies: [stagger] },
  );

  return (
    <Tag ref={scope} className={className} {...rest}>
      {children}
    </Tag>
  );
}
