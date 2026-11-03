// heic-decode ships without type definitions; this covers the part used in
// lib/upload.ts.
declare module "heic-decode" {
  type DecodedImage = { width: number; height: number; data: Uint8ClampedArray };

  function decode(input: { buffer: Uint8Array | ArrayBuffer }): Promise<DecodedImage>;

  export default decode;
}
