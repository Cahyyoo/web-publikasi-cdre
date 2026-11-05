import { unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteUploadedImage,
  getOptionalFile,
  resolveImage,
  resolveUploadPath,
  saveUploadedImage,
} from "@/lib/upload";
import { MAX_EDGE } from "@/lib/upload-limits";

// Keeps these tests off the real public/uploads folder.
vi.mock("fs/promises", () => ({
  mkdir: vi.fn(async () => {}),
  unlink: vi.fn(async () => {}),
  writeFile: vi.fn(async () => {}),
}));

const UPLOAD_ROOT = path.resolve(process.cwd(), "public", "uploads");
const written = vi.mocked(writeFile);

async function pngFile(width = 10, height = 10, name = "foto.png") {
  const buffer = await sharp({
    create: { width, height, channels: 3, background: "#123456" },
  })
    .png()
    .toBuffer();
  return new File([new Uint8Array(buffer)], name, { type: "image/png" });
}

beforeEach(() => {
  written.mockClear();
  vi.mocked(unlink).mockClear();
});

describe("resolveUploadPath", () => {
  it("resolves a file inside the upload folder", () => {
    expect(resolveUploadPath("posts/a.webp")).toBe(path.join(UPLOAD_ROOT, "posts", "a.webp"));
  });

  it.each([
    "../secret.txt",
    "posts/../../secret.txt",
    "..\\secret.txt",
    "../uploads-evil/a.webp",
    path.resolve(UPLOAD_ROOT, "..", "secret.txt"),
    "",
    ".",
  ])("refuses %j", (relative) => {
    expect(resolveUploadPath(relative)).toBeNull();
  });
});

describe("saveUploadedImage", () => {
  it("converts to WebP and returns the public path", async () => {
    const url = await saveUploadedImage(await pngFile(), "posts");

    expect(url).toMatch(/^\/uploads\/posts\/[0-9a-f-]{36}\.webp$/);
    const [target, output] = written.mock.calls[0];
    expect(target).toBe(path.join(UPLOAD_ROOT, "posts", path.basename(url)));
    expect((await sharp(output as Buffer).metadata()).format).toBe("webp");
  });

  it("shrinks a photo to the maximum edge", async () => {
    await saveUploadedImage(await pngFile(MAX_EDGE + 100, 100), "posts");

    const { width } = await sharp(written.mock.calls[0][1] as Buffer).metadata();
    expect(width).toBe(MAX_EDGE);
  });

  it("does not enlarge a small photo", async () => {
    await saveUploadedImage(await pngFile(20, 10), "posts");

    const { width } = await sharp(written.mock.calls[0][1] as Buffer).metadata();
    expect(width).toBe(20);
  });

  it.each([
    ["an empty file", new File([], "a.png", { type: "image/png" }), "upload-empty"],
    ["a file over the limit", new File(["12345"], "a.png", { type: "image/png" }), "upload-large"],
    ["a file that is not an image", new File(["x"], "a.txt", { type: "text/plain" }), "upload-type"],
  ])("rejects %s without writing to disk", async (_label, file, code) => {
    await expect(saveUploadedImage(file, "posts", { maxBytes: 4 })).rejects.toMatchObject({ code });
    expect(written).not.toHaveBeenCalled();
  });

  it("does not write a file that only claims to be an image", async () => {
    const fake = new File(["<script>alert(1)</script>"], "a.png", { type: "image/png" });

    await expect(saveUploadedImage(fake, "posts")).rejects.toThrow();
    expect(written).not.toHaveBeenCalled();
  });
});

describe("deleteUploadedImage", () => {
  it("deletes a file inside the upload folder", async () => {
    await deleteUploadedImage("/uploads/posts/a.webp");
    expect(unlink).toHaveBeenCalledWith(path.join(UPLOAD_ROOT, "posts", "a.webp"));
  });

  it.each([
    "/uploads/../../secret.txt",
    "/banners/hero.jpg",
    "/avatar-placeholder.svg",
    "https://picsum.photos/a.jpg",
    "",
    null,
    undefined,
  ])("leaves %j alone", async (url) => {
    await deleteUploadedImage(url);
    expect(unlink).not.toHaveBeenCalled();
  });

  it("ignores a file that is already gone", async () => {
    vi.mocked(unlink).mockRejectedValueOnce(Object.assign(new Error(), { code: "ENOENT" }));
    await expect(deleteUploadedImage("/uploads/posts/a.webp")).resolves.toBeUndefined();
  });
});

describe("getOptionalFile", () => {
  it("returns a chosen file", () => {
    const data = new FormData();
    data.set("photo", new File(["x"], "a.png"));
    expect(getOptionalFile(data, "photo")).toBeInstanceOf(File);
  });

  it("treats the empty file of an untouched input as no file", () => {
    const data = new FormData();
    data.set("photo", new File([], ""));
    expect(getOptionalFile(data, "photo")).toBeNull();
  });

  it("ignores a text value", () => {
    const data = new FormData();
    data.set("photo", "not a file");
    expect(getOptionalFile(data, "photo")).toBeNull();
  });
});

describe("resolveImage", () => {
  it("saves a new photo when one was chosen", async () => {
    const data = new FormData();
    data.set("photo", await pngFile());

    const url = await resolveImage(data, "posts", "/uploads/posts/old.webp");
    expect(url).toMatch(/^\/uploads\/posts\/[0-9a-f-]{36}\.webp$/);
  });

  it("keeps the current image when no photo was chosen", async () => {
    await expect(resolveImage(new FormData(), "posts", "/uploads/posts/old.webp")).resolves.toBe(
      "/uploads/posts/old.webp"
    );
  });

  it("requires a photo when there is no current image", async () => {
    await expect(resolveImage(new FormData(), "posts")).rejects.toMatchObject({
      code: "upload-required",
    });
  });
});
