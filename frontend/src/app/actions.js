"use server";

/**
 * Server Actions — form gönderimleri buradan .NET API'ye gider.
 *
 * Neden Server Action? Backend adresi ve ileride eklenecek API anahtarı
 * tarayıcıya sızmaz; istemci tarafında ekstra fetch kodu yazmaya gerek kalmaz.
 */

import {
  subscribeToNewsletter,
  sendContactMessage,
  postComment,
} from "@/services/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** @param {unknown} _prevState @param {FormData} formData */
export async function subscribeAction(_prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  const source = String(formData.get("source") || "web");

  /* Bot tuzağı — gizli alan doluysa sessizce başarılı gibi davran. */
  if (formData.get("website")) {
    return { success: true, message: "Teşekkürler!" };
  }

  if (!EMAIL_RE.test(email)) {
    return { success: false, message: "Geçerli bir e-posta adresi gir." };
  }

  return await subscribeToNewsletter({ email, source });
}

/** @param {unknown} _prevState @param {FormData} formData */
export async function contactAction(_prevState, formData) {
  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    subject: String(formData.get("subject") || "").trim(),
    message: String(formData.get("message") || "").trim(),
  };

  if (formData.get("website")) return { success: true, message: "Teşekkürler!" };

  if (!payload.name || !EMAIL_RE.test(payload.email) || payload.message.length < 10) {
    return {
      success: false,
      message: "Ad, geçerli e-posta ve en az 10 karakterlik bir mesaj gerekli.",
    };
  }

  return await sendContactMessage(payload);
}

/** @param {unknown} _prevState @param {FormData} formData */
export async function commentAction(_prevState, formData) {
  const payload = {
    slug: String(formData.get("slug") || ""),
    author: String(formData.get("author") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    content: String(formData.get("content") || "").trim(),
  };

  if (!payload.slug || !payload.author || payload.content.length < 3) {
    return { success: false, message: "Ad ve yorum alanları zorunlu." };
  }

  return await postComment(payload);
}
