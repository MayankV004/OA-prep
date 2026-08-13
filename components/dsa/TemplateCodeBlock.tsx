'use client';

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl bg-surface-sunken shadow-e1",
        className
      )}
    >
      {/* Toolbar — tone only, no rule line */}
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <span className="font-mono text-2xs uppercase tracking-[0.1em] text-text-muted">
          {language}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
        >
          {copied ? (
            <Check aria-hidden className="size-4 text-success" strokeWidth={3} />
          ) : (
            <Copy aria-hidden className="size-4" />
          )}
        </Button>
      </div>

      {/*
        Shiki output (lib/shiki.ts, theme `github-dark`) is injected verbatim.
        In dark mode we drop its inline background so the block reads as one
        surface; in light mode the highlighter keeps its own canvas so the
        token colours stay legible.
      */}
      <div
        className="overflow-x-auto p-4 pt-0 font-mono text-sm [&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4 dark:[&_pre]:bg-transparent! [&_code]:bg-transparent!"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
