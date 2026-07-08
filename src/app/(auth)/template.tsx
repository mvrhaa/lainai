"use client";

import { usePathname } from "next/navigation";

/** Per-route entrance animation for the auth screens. */
export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in-up">
      {children}
    </div>
  );
}