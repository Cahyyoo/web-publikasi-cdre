"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

// CKEditor touches browser APIs at load time, so it must never be rendered
// on the server (dynamic + ssr:false is the documented way to opt a client
// component out of Next.js's server-side render pass).
const RichTextEditorInner = dynamic(() => import("./RichTextEditorInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-md border border-slate-300 text-sm text-slate-400">
      Memuat editor...
    </div>
  ),
});

export default function RichTextEditor({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  // The editor owns its own content once mounted; feeding `value` back into it
  // on every keystroke makes CKEditor re-set its document and jump the caret,
  // so it only ever receives the initial HTML.
  const initialValue = useRef(defaultValue).current;

  return (
    <div>
      <RichTextEditorInner initialValue={initialValue} onChange={setValue} />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
