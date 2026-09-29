// DigiCB rich text editor — MS Word-style formatting toolbar + contentEditable.
// Supports bold, italic, underline, strikethrough, headings, lists, alignment,
// font size, font color, clear formatting. Also exports content as a .doc
// (Word-compatible HTML) file.
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Eraser,
  Type,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarBtnProps {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}

function ToolbarBtn({ onClick, title, active, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded text-foreground transition hover:bg-accent",
        active && "bg-primary/15 text-primary",
      )}
    >
      {children}
    </button>
  );
}

const FONT_SIZES = [
  { label: "10", value: "2" },
  { label: "12", value: "3" },
  { label: "14", value: "4" },
  { label: "16", value: "5" },
  { label: "18", value: "6" },
  { label: "24", value: "7" },
];

const COLORS = [
  "#000000",
  "#374151",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

export function RichTextEditor({
  value,
  onChange,
  readOnly,
  placeholder,
  recordNumber,
  title,
}: {
  value: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  recordNumber?: string;
  title?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  // Sync external value into the editor only on mount / when value changes
  // externally (e.g. loading a record). We avoid clobbering the cursor on
  // every keystroke by checking if the innerHTML already matches.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = useCallback(
    (command: string, val?: string) => {
      document.execCommand(command, false, val);
      editorRef.current?.focus();
      syncActive();
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    },
    [onChange],
  );

  const syncActive = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
      });
    } catch {
      /* queryCommandState can throw in some browsers — ignore */
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    syncActive();
  };

  const downloadWord = () => {
    const html = editorRef.current?.innerHTML ?? value;
    const full = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${title ?? "DigiCB Document"}</title>
<!--[if gte mso 9]><xml>
<w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument>
</xml><![endif]-->
<style>
@page { margin: 1in; }
body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; }
h1 { font-size: 18pt; color: #1e3a5f; }
h2 { font-size: 14pt; color: #1e3a5f; }
h3 { font-size: 12pt; color: #2c4a6e; }
table { border-collapse: collapse; }
td, th { border: 1px solid #999; padding: 4px 8px; }
</style>
</head>
<body>
${recordNumber ? `<p style="color:#666;font-size:9pt">Document No: ${recordNumber}</p>` : ""}
${html}
</body>
</html>`;
    const blob = new Blob(["\ufeff", full], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title ?? "digicb-document").replace(/[^a-z0-9_-]/gi, "_")}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (readOnly) {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={downloadWord}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground hover:bg-accent"
          >
            <Download className="h-3.5 w-3.5" /> Download as Word
          </button>
        </div>
        <div
          className="prose prose-sm max-w-none rounded-md border border-border bg-background p-4 text-foreground"
          dangerouslySetInnerHTML={{
            __html: value || `<p class="text-muted-foreground">${placeholder ?? "No content."}</p>`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-input bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
        <ToolbarBtn onClick={() => exec("undo")} title="Undo">
          <Undo2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("redo")} title="Redo">
          <Redo2 className="h-4 w-4" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarBtn onClick={() => exec("bold")} title="Bold (Ctrl+B)" active={activeFormats.bold}>
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => exec("italic")}
          title="Italic (Ctrl+I)"
          active={activeFormats.italic}
        >
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => exec("underline")}
          title="Underline (Ctrl+U)"
          active={activeFormats.underline}
        >
          <Underline className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => exec("strikeThrough")}
          title="Strikethrough"
          active={activeFormats.strikeThrough}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarBtn onClick={() => exec("formatBlock", "H1")} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("formatBlock", "H2")} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("formatBlock", "H3")} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("formatBlock", "P")} title="Paragraph">
          <Type className="h-4 w-4" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarBtn
          onClick={() => exec("insertUnorderedList")}
          title="Bullet List"
          active={activeFormats.insertUnorderedList}
        >
          <List className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => exec("insertOrderedList")}
          title="Numbered List"
          active={activeFormats.insertOrderedList}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarBtn
          onClick={() => exec("justifyLeft")}
          title="Align Left"
          active={activeFormats.justifyLeft}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => exec("justifyCenter")}
          title="Align Center"
          active={activeFormats.justifyCenter}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => exec("justifyRight")}
          title="Align Right"
          active={activeFormats.justifyRight}
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => exec("justifyFull")}
          title="Justify"
          active={activeFormats.justifyFull}
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-border" />
        <select
          title="Font size"
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => exec("fontSize", e.target.value)}
          className="h-8 rounded border border-border bg-background px-1 text-xs"
          defaultValue=""
        >
          <option value="" disabled>
            Size
          </option>
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="mx-1 flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={`Text color ${c}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("foreColor", c)}
              className="h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarBtn onClick={() => exec("removeFormat")} title="Clear Formatting">
          <Eraser className="h-4 w-4" />
        </ToolbarBtn>
        <div className="ml-auto">
          <button
            type="button"
            onClick={downloadWord}
            title="Download as MS Word"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" /> Word
          </button>
        </div>
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onMouseUp={syncActive}
        onKeyUp={syncActive}
        data-placeholder={placeholder}
        className={cn(
          "digicb-richtext min-h-[260px] max-w-none overflow-y-auto p-4 text-sm text-foreground focus:outline-none",
        )}
      />
    </div>
  );
}
