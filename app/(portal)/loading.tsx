import { Loader2 } from 'lucide-react';

export default function PortalLoading() {
  return (
    <div className="grid min-h-[400px] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Loading Placement Cell Portal...</span>
      </div>
    </div>
  );
}
