import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { type FlashCode, withFlash } from "@/lib/flash";
import { UploadError } from "@/lib/upload";

/** Maps a thrown error to the flash code the admin should see. */
export function classifyError(error: unknown): FlashCode {
  if (error instanceof UploadError) return error.code;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 unique constraint, P2003 foreign key constraint, P2025 record
    // missing (e.g. two admins deleting the same row).
    if (error.code === "P2002") return "duplicate";
    if (error.code === "P2003") return "in-use";
    if (error.code === "P2025") return "not-found";
  }

  return "save-failed";
}

type RunActionOptions = {
  /** Path to redirect to when `work` succeeds. */
  onSuccess: string;
  /** Path to redirect to when `work` throws — usually the form it came from. */
  onError: string;
  /** Flash code shown on success. */
  success: FlashCode;
  /** Overrides the code `classifyError` picks, per error code. */
  errorOverrides?: Partial<Record<FlashCode, FlashCode>>;
};

/**
 * Runs a mutation and redirects with a flash code either way, so every admin
 * action reports its outcome through one mechanism.
 *
 * `work` must never call `redirect()` itself: redirect() signals by throwing
 * NEXT_REDIRECT, which the catch below would swallow and turn into a
 * "save-failed" banner. Both redirects here sit outside the try for that
 * reason.
 */
export async function runAction(
  opts: RunActionOptions,
  work: () => Promise<void>
): Promise<never> {
  let failure: FlashCode | null = null;

  try {
    await work();
  } catch (error) {
    failure = classifyError(error);
    failure = opts.errorOverrides?.[failure] ?? failure;
    // Nothing in this app logged action failures before; without this an
    // unexpected error becomes a generic banner and no trace on the server.
    console.error(`[action] ${opts.onSuccess} failed (${failure})`, error);
  }

  redirect(
    failure
      ? withFlash(opts.onError, failure)
      : withFlash(opts.onSuccess, opts.success)
  );
}
