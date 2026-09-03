'use client';

import React from 'react';

// Authentic SVG Company Logos
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function AmazonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.924 10.364c-.11-.83-.49-1.28-1.2-1.28-.7 0-1.12.44-1.21 1.28h2.41zm3.896 5.486c-.15.11-.37.13-.53.04-1.07-.84-1.32-1.26-1.9-2.09-1.04 1.34-2.29 2.22-3.89 2.22-2.14 0-3.66-1.48-3.66-3.79 0-1.78.96-3.14 2.45-3.83 1.26-.59 3.01-.7 4.39-.85v-.31c0-.64-.04-1.41-.44-1.94-.37-.5-.98-.71-1.63-.71-1.17 0-2.19.64-2.45 1.93-.04.2-.18.35-.37.36l-2.09-.23c-.19-.04-.33-.2-.31-.41.44-2.34 2.43-3.64 4.96-3.64 1.39 0 2.76.4 3.73 1.39.99 1.01 1.15 2.37 1.15 3.8v4.06c0 1.28.53 1.83 1.03 2.51.15.2.14.46-.03.62-.48.42-1.32 1.17-1.62 1.48zm4.35 4.54c-3.12 2.3-7.56 3.51-11.47 3.51-5.5 0-10.45-2.12-14.2-5.65-.33-.31-.04-.73.35-.49 4.09 2.47 9.07 3.96 14.23 3.96 3.49 0 7.42-.93 10.63-2.88.49-.3.87.21.46.55zM22.84 19.3c.36.46.99.23 1.16-.27-.47-1.48-1.57-3.49-3.23-3.92-.37-.1-.67.24-.51.57.65 1.35 1.83 2.74 2.58 3.62z"/>
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="1.5" y="1.5" width="9.5" height="9.5" rx="1.5" />
      <rect x="13" y="1.5" width="9.5" height="9.5" rx="1.5" />
      <rect x="1.5" y="13" width="9.5" height="9.5" rx="1.5" />
      <rect x="13" y="13" width="9.5" height="9.5" rx="1.5" />
    </svg>
  );
}

function MetaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 16.5c-2.3 0-4.2-1.7-4.7-3.9-.2-.7-.3-1.4-.3-2.1 0-1.8.8-3.4 2.1-4.4 1.3-1 3-1.4 4.7-1 1.7.4 3.1 1.6 3.8 3.2.3.6.4 1.3.4 2 0 1.9-.9 3.6-2.3 4.6-1 1-2.3 1.6-3.7 1.6zm0-9.5c-1.3 0-2.4.6-3.1 1.5-.7.9-.9 2.1-.7 3.2.3 1.4 1.5 2.5 3 2.7.4.1.8.1 1.2 0 1.5-.3 2.6-1.5 2.8-3 .1-.5.1-1.1 0-1.6-.3-1.2-1.3-2.2-2.5-2.6-.2-.1-.5-.2-.7-.2zM4.1 6.8C1.5 8.9 0 12.1 0 15.6c0 1.8.4 3.5 1.3 5 1.8 3.1 5.1 5 8.7 5 3.3 0 6.3-1.6 8.2-4.2l-2.4-1.6C14.4 21.6 12.3 23 10 23c-2.8 0-5.3-1.5-6.6-3.8-.7-1.1-1-2.4-1-3.7 0-2.8 1.2-5.4 3.3-7l-1.6-1.7zm15.8 0l-1.6 1.7c2.1 1.6 3.3 4.2 3.3 7 0 1.3-.3 2.6-1 3.7-1.3 2.3-3.8 3.8-6.6 3.8-2.3 0-4.4-1.4-5.8-3.2l-2.4 1.6c1.9 2.6 4.9 4.2 8.2 4.2 3.6 0 6.9-1.9 8.7-5 .9-1.5 1.3-3.2 1.3-5 0-3.5-1.5-6.7-4.1-8.8z"/>
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1 .08 2.02-.49 2.64-1.24z"/>
    </svg>
  );
}

function UberIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6.5c0 1.38-1.12 2.5-2.5 2.5S8 14.88 8 13.5V7h2v6.5c0 .28.22.5.5.5s.5-.22.5-.5V7z"/>
    </svg>
  );
}

function NetflixIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.398 0v24c1.848-.307 3.73-.615 5.578-.883V13.88l3.65 10.12h4.976V0h-5.26v10.12L10.658 0H5.398z"/>
    </svg>
  );
}

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.97 16.036.5 13.064.5 7.158.5 3.5 3.58 3.5 8.163c0 4.148 2.571 5.952 6.786 7.42 2.378.835 3.197 1.574 3.197 2.614 0 .977-.859 1.503-2.384 1.503-2.158 0-5.145-1.077-7.27-2.302l-.934 5.568c2.19.988 5.178 1.534 8.204 1.534 6.223 0 10.395-3.057 10.395-7.85 0-4.322-2.73-6.09-7.518-7.5zm0 0"/>
    </svg>
  );
}

function AtlassianIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.667 9.873c-.225-.262-.638-.276-.878-.029L5.05 15.65c-.246.253-.153.68.188.807 2.052.766 4.79.803 6.945-.251.353-.173.45-.609.213-.933L11.667 9.873zm1.189-7.608c-.222-.266-.639-.279-.877-.027l-2.072 2.2c-.244.259-.148.687.195.807 2.923 1.026 6.347 3.393 7.643 8.356.103.395.539.582.884.378l2.023-1.196c.307-.181.391-.581.186-.874C19.043 9.324 15.827 4.619 12.856 2.265z"/>
    </svg>
  );
}

function BloombergIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8.5a5.5 5.5 0 0 0 3.2-10 5 5 0 0 0-3.2-10zM8 6h6a2 2 0 1 1 0 4H8zm6.5 12H8v-4h6.5a2 2 0 1 1 0 4z"/>
    </svg>
  );
}

const COMPANIES = [
  { name: 'Google', icon: GoogleIcon, focus: 'Graphs & DP' },
  { name: 'Amazon', icon: AmazonIcon, focus: 'OA High Frequency' },
  { name: 'Microsoft', icon: MicrosoftIcon, focus: 'Arrays & Trees' },
  { name: 'Uber', icon: UberIcon, focus: 'Hard Intervals' },
  { name: 'Meta', icon: MetaIcon, focus: 'Speed & Edge Cases' },
  { name: 'Apple', icon: AppleIcon, focus: 'Core Architecture' },
  { name: 'Netflix', icon: NetflixIcon, focus: 'Concurrency & Design' },
  { name: 'Stripe', icon: StripeIcon, focus: 'Parsing & Precision' },
  { name: 'Atlassian', icon: AtlassianIcon, focus: 'Intervals & State' },
  { name: 'Bloomberg', icon: BloombergIcon, focus: 'Stacks & Heaps' },
];

function MarqueeTrack() {
  return (
    <div className="flex shrink-0 items-center gap-4 pr-4 animate-marquee">
      {COMPANIES.map((company) => {
        const Icon = company.icon;
        return (
          <div
            key={company.name}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border/80 shadow-2xs hover:border-primary/50 transition-colors shrink-0 group select-none cursor-default"
          >
            <Icon className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              {company.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              • {company.focus}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function CompanyMarquee() {
  return (
    <section className="py-12 relative overflow-hidden border-y border-border/40 bg-card/20">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Curated OA Question Sets & Mock Tests for Top Engineering Rounds
        </p>
      </div>

      {/* Infinite Seamless Scrolling Track (Two Sibling Tracks) */}
      <div className="relative w-full overflow-hidden flex items-center">
        {/* Left Edge Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 sm:w-36 z-10 bg-gradient-to-r from-background to-transparent" />

        {/* Primary Track */}
        <MarqueeTrack />
        {/* Duplicate Track (for 100% Seamless Looping) */}
        <MarqueeTrack />

        {/* Right Edge Mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-36 z-10 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
