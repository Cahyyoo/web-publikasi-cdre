"use client";

import { useEffect, useRef, useState } from "react";
import {
  HEIC_EXTENSIONS,
  MAX_EDGE,
  MAX_UPLOAD_BYTES,
  RAW_EXTENSIONS,
  fileExtension,
} from "@/lib/upload-limits";

const QUALITY = 0.92;
// Already small enough: re-encoding would only cost quality.
const KEEP_BELOW_BYTES = 1.5 * 1024 * 1024;
const RESIZABLE = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif";

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; text: string; preview: string }
  | { kind: "info"; text: string }
  | { kind: "error"; text: string };

function formatMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

function toBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/** Resizes to MAX_EDGE as WebP (JPEG where WebP can't be encoded), or null if not worth it. */
async function shrink(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  if (scale === 1 && file.size <= KEEP_BELOW_BYTES) {
    bitmap.close();
    return { kept: true as const, width, height };
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await toBlob(canvas, "image/webp");
  // Browsers that can't encode WebP silently return PNG instead.
  if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg");
  if (!blob || blob.size >= file.size) throw new Error("no gain");

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const resized = new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${ext}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
  return { kept: false as const, resized, width, height, outWidth: canvas.width, outHeight: canvas.height };
}

/**
 * File input for photos that shrinks camera originals (~30–50MB) in the
 * browser before the form is sent: longest edge capped at MAX_EDGE,
 * re-encoded as WebP. Uploads stay fast on slow connections and the server
 * re-encodes the result anyway (lib/upload.ts). The resized file replaces the
 * input's selection, so forms and server actions are unchanged.
 *
 * When a photo can't be shrunk here it is sent as-is for the server to
 * handle: GIFs (kept animated), HEIC outside Safari (converted server-side)
 * and anything the device fails to decode. Selections the server would
 * reject anyway — RAW files, other formats, or an unshrunk file over
 * `maxBytes` — mark the input invalid with a message, so the form cannot be
 * submitted. It is also invalid while a resize is still running.
 */
export default function ImageFileInput({
  id = "photo",
  name = "photo",
  required = false,
  maxBytes = MAX_UPLOAD_BYTES,
  className = "",
  statusClassName = "mt-1.5 text-xs text-slate-500",
}: {
  id?: string;
  name?: string;
  required?: boolean;
  /** Largest file the server accepts unshrunk; match the form's server action. */
  maxBytes?: number;
  className?: string;
  statusClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Each selection gets a number, so a slow resize of an earlier pick can
  // never overwrite a newer one.
  const runRef = useRef(0);

  useEffect(
    () => () => {
      if (status.kind === "done") URL.revokeObjectURL(status.preview);
    },
    [status]
  );

  async function processSelection(input: HTMLInputElement) {
    const file = input.files?.[0];
    const run = ++runRef.current;
    const stale = () => run !== runRef.current;
    const fail = (text: string) => {
      input.setCustomValidity(text);
      setStatus({ kind: "error", text });
    };
    const sendAsIs = (text: string) => {
      if (file && file.size > maxBytes) {
        fail(
          `Foto ${formatMB(file.size)} tidak bisa dikecilkan di perangkat ini dan melebihi batas ${formatMB(maxBytes)}. Coba dari laptop, atau kecilkan dulu.`
        );
        return;
      }
      input.setCustomValidity("");
      setStatus({ kind: "info", text });
    };

    input.setCustomValidity("");
    if (!file) {
      setStatus({ kind: "idle" });
      return;
    }

    const ext = fileExtension(file.name);
    const heic = HEIC_EXTENSIONS.includes(ext) || /^image\/hei[cf]/.test(file.type);
    if (RAW_EXTENSIONS.includes(ext)) {
      fail("Format RAW kamera tidak didukung. Gunakan file JPEG dari kamera.");
      return;
    }
    if (file.type === "image/gif") {
      sendAsIs(`${formatMB(file.size)} · GIF dikirim apa adanya`);
      return;
    }
    if (!heic && !RESIZABLE.has(file.type)) {
      fail("Format harus JPG, PNG, WEBP, GIF, atau HEIC.");
      return;
    }

    setStatus({ kind: "working" });
    input.setCustomValidity("Tunggu sebentar, foto sedang dikecilkan.");

    try {
      const result = await shrink(file);
      if (stale()) return;
      if (result.kept) {
        input.setCustomValidity("");
        setStatus({ kind: "info", text: `${formatMB(file.size)} · ${result.width}×${result.height}` });
        return;
      }
      const transfer = new DataTransfer();
      transfer.items.add(result.resized);
      input.files = transfer.files;
      input.setCustomValidity("");
      setStatus({
        kind: "done",
        preview: URL.createObjectURL(result.resized),
        text: `Foto dikecilkan: ${formatMB(file.size)} → ${formatMB(result.resized.size)} (${result.width}×${result.height} → ${result.outWidth}×${result.outHeight})`,
      });
    } catch {
      if (stale()) return;
      // Keep the original selection; the server resizes (or converts) it.
      sendAsIs(
        heic
          ? `${formatMB(file.size)} · foto HEIC akan dikonversi otomatis di server`
          : `${formatMB(file.size)} · dikirim apa adanya, diproses server`
      );
    }
  }

  // A file picked before hydration fired no React onChange; handle it now.
  useEffect(() => {
    if (inputRef.current?.files?.length) void processSelection(inputRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  return (
    <>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={ACCEPT}
        required={required}
        onChange={(e) => void processSelection(e.currentTarget)}
        className={className}
      />
      {status.kind === "working" && (
        <p className={statusClassName} aria-live="polite">
          Mengecilkan foto…
        </p>
      )}
      {status.kind === "info" && (
        <p className={statusClassName} aria-live="polite">
          {status.text}
        </p>
      )}
      {status.kind === "error" && (
        <p className={`${statusClassName} !text-red-600`} role="alert">
          {status.text}
        </p>
      )}
      {status.kind === "done" && (
        <div className={`${statusClassName} flex items-center gap-3`} aria-live="polite">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
          <img src={status.preview} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
          <span>{status.text}</span>
        </div>
      )}
    </>
  );
}
