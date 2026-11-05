"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withFlash } from "@/lib/flash";
import { prisma } from "@/lib/prisma";
import { getOptionalFile, saveUploadedImage, UploadError } from "@/lib/upload";
import { readString, TESTIMONIAL_MAX_LENGTH } from "@/lib/forms";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { PUBLIC_MAX_UPLOAD_BYTES } from "@/lib/upload-limits";

const submissions = createRateLimiter({
  limit: 5,
  windowMs: 60 * 60 * 1000,
});

/** Fails closed: a missing secret or an unreachable Cloudflare rejects the form. */
async function passesTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({ secret, response: token }),
        signal: AbortSignal.timeout(5000),
      }
    );
    const result: { success?: boolean } = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("[turnstile] verification request failed", error);
    return false;
  }
}

export async function submitTestimonial(formData: FormData) {
  const ip = getClientIp();
  if (submissions.isBlocked(ip)) {
    redirect(withFlash("/testimoni", "rate-limited"));
  }
  submissions.hit(ip);

  if (!(await passesTurnstile(readString(formData, "cf-turnstile-response")))) {
    redirect(withFlash("/testimoni", "turnstile-failed"));
  }

  const name = readString(formData, "name");
  const title = readString(formData, "title");
  const quote = readString(formData, "quote");

  if (!name || !title || !quote) {
    redirect(withFlash("/testimoni", "testimoni-wajib"));
  }

  if (
    name.length > TESTIMONIAL_MAX_LENGTH.name ||
    title.length > TESTIMONIAL_MAX_LENGTH.title ||
    quote.length > TESTIMONIAL_MAX_LENGTH.quote
  ) {
    redirect(withFlash("/testimoni", "testimoni-terlalu-panjang"));
  }

  let imageUrl = "/avatar-placeholder.svg";
  const photo = getOptionalFile(formData, "photo");
  if (photo) {
    try {
      imageUrl = await saveUploadedImage(photo, "testimonials", {
        // Anonymous visitors get a tighter cap than the admin forms.
        maxBytes: PUBLIC_MAX_UPLOAD_BYTES,
      });
    } catch (error) {
      if (error instanceof UploadError) {
        redirect(withFlash("/testimoni", error.code));
      }
      throw error;
    }
  }

  // Public submissions always start hidden — an admin must approve them
  // from /admin/testimonials before they appear on the homepage.
  await prisma.testimonial.create({
    data: { name, title, quote, imageUrl, isPublished: false },
  });

  revalidatePath("/admin/testimonials");
  redirect(withFlash("/testimoni", "testimoni-terkirim"));
}
