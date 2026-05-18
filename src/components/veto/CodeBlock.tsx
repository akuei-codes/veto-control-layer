import { useState } from "react";

/**
 * Terminal-styled code block with copy button.
 * Shared between /integrations and /docs.
 */
export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="relative border hairline rounded-md bg-background overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b hairline">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <span className="ml-2 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
            {lang ?? "text"}
          </span>
        </div>
        <button
          onClick={copy}
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="font-mono text-[12px] leading-relaxed p-4 overflow-x-auto text-foreground/90">
        {code}
      </pre>
    </div>
  );
}
