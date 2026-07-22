"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { contactAction } from "@/app/actions";

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-primary-500";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Gönderiliyor…" : "Mesajı gönder"}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(contactAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {/* Bot tuzağı */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
            Ad Soyad
          </label>
          <input id="name" name="name" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            E-posta
          </label>
          <input id="email" name="email" type="email" required className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink">
          Konu
        </label>
        <input id="subject" name="subject" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
          Mesaj
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          minLength={10}
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="flex items-center gap-4">
        <SubmitButton />
        {state ? (
          <p
            role="status"
            className={`text-sm ${state.success ? "text-primary-700" : "text-red-600"}`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
