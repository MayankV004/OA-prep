'use client';

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  html: string;
  language?: string;
  className?: string;
}

export function TemplateCodeBlock({ code, html, language = "java", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-2xl border border-border/60 overflow-hidden bg-[#0d1117] flex flex-col shadow-lg shadow-black/20", className)}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 text-xs font-mono text-muted-foreground uppercase opacity-70">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-md transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div
        className="p-5 overflow-x-auto text-sm font-mono prose-pre:!m-0 prose-pre:!p-0 prose-pre:!bg-transparent [&_code]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
