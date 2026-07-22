"use client";

/**
 * Bülten aboneliği. Server Action → .NET API (/api/newsletter/subscribe).
 * site.config.js → features.newsletter ile kapatılabilir.
 */

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { subscribeAction } from "@/app/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Gönderiliyor…" : "Abone Ol"}
    </button>
  );
}

export default function Newsletter({
  variant = "card",
  source = "web",
  title = "Haftada bir, işe yarayan tek bir taktik",
  description = "Bütçe ve birikim rehberlerini e-postana gönderelim. Spam yok, istediğin an çıkarsın.",
}) {
  const [state, formAction] = useActionState(subscribeAction, null);

  const isInline = variant === "inline";

  return (
    <section
      className={
        isInline
          ? "rounded-brand border border-line bg-subtle/60 p-5"
          : "rounded-brand border border-primary-200 bg-gradient-to-br from-primary-50 to-accent-50/50 p-6 sm:p-8"
      }
    >
      <h2 className={`font-bold tracking-tight text-ink ${isInline ? "text-base" : "text-xl"}`}>
        {title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>

      <form action={formAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="source" value={source} />

        {/* Bot tuzağı — ekran okuyucudan ve gözden gizli */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <label htmlFor={`nl-email-${source}`} className="sr-only">
          E-posta adresi
        </label>
        <input
          id={`nl-email-${source}`}
          type="email"
          name="email"
          required
          placeholder="ornek@eposta.com"
          className="w-full rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-primary-500"
        />
        <SubmitButton />
      </form>

      {state ? (
        <p
          role="status"
          className={`mt-2.5 text-sm ${state.success ? "text-primary-700" : "text-red-600"}`}
        >
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
