"use client";

import { usePathname } from "next/navigation";

/**
 * Wraps every dashboard route in a keyed mount animation so navigating
 * between routes fades/slides the new page in. `template.tsx` remounts
 * on each navigation; keying by pathname makes the transition reliable.
 *
 * `flex h-full flex-col` also gives page content a real height to fill,
 * so inner `overflow-y-auto` regions (agent list, chat) scroll
 * correctly instead of being clipped.
 */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="flex h-full flex-col animate-page-in">
      {children}
    </div>
  );
}