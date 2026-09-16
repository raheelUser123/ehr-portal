"use client";

import { useEffect, useRef } from "react";

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const cmd = (command: string, argument?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, argument);
    onChange(ref.current?.innerHTML || "");
  };

  return (
    <div className="tpn-editor">
      <div className="tpn-editor-toolbar">
        <button type="button" onClick={() => cmd("bold")}><b>B</b></button>
        <button type="button" onClick={() => cmd("italic")}><i>I</i></button>
        <button type="button" onClick={() => cmd("underline")}><u>U</u></button>
        <button type="button" onClick={() => cmd("insertOrderedList")}>1.</button>
        <button type="button" onClick={() => cmd("insertUnorderedList")}>•</button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Enter link URL");
            if (url) cmd("createLink", url);
          }}
        >
          🔗
        </button>
        <button type="button" onClick={() => cmd("removeFormat")}>Clear</button>
      </div>
      <div
        ref={ref}
        className="tpn-editor-area"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || "Type here..."}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
}
