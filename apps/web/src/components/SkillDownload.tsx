"use client";

import { useState } from "react";

interface SkillFileProps {
  filename: string;
  language: string;
  content: string;
}

export function SkillFileDisplay({ filename, language, content }: SkillFileProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="rounded-[2rem] border border-border bg-card p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold uppercase tracking-tight text-foreground">
            {filename}
          </h3>
          <p className="text-sm text-muted mt-1">Agent skill definition for Jin AIP</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-xs font-medium uppercase tracking-widest text-muted hover:text-foreground hover:border-white/20 transition-all"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-foreground text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
          >
            Download
          </button>
        </div>
      </div>

      <pre className="overflow-x-auto rounded-2xl border border-border bg-black/90 p-6 font-mono text-xs text-white leading-6">
        <code>{content}</code>
      </pre>
    </div>
  );
}
