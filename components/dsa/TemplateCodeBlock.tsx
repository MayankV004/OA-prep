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
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Defense-in-depth: strip script tags and inline event attributes
  const safeHtml = (html || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden border border-border/80 dark:border-white/10 bg-[#090D12] shadow-xl my-4 group/code",
        className
      )}
    >
      {/* Specular top beam */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0D1219]/90 border-b border-white/[0.08] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/70">
            {language}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2.5 rounded-lg text-xs font-mono text-white/70 hover:text-white hover:bg-white/10 transition-colors gap-1.5"
          aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" strokeWidth={2.5} />
              <span className="text-[11px] text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Shiki Code Render */}
      <div
        className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed [&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:p-2 [&_pre]:bg-transparent! [&_code]:bg-transparent!"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </div>
  );
}

