"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
  Underline,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

export default function RichTextEditorInner({
  initialValue,
  onChange,
}: {
  initialValue: string;
  onChange: (html: string) => void;
}) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={initialValue}
      onChange={(_event, editor) => onChange(editor.getData())}
      config={{
        licenseKey: "GPL",
        plugins: [Essentials, Paragraph, Heading, Bold, Italic, Underline, Link, List, BlockQuote],
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "|",
          "link",
          "bulletedList",
          "numberedList",
          "blockQuote",
          "|",
          "undo",
          "redo",
        ],
      }}
    />
  );
}
