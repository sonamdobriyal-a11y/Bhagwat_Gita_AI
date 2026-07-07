"use client";

import { usePathname } from "next/navigation";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTutorial = !pathname.startsWith("/admin") && pathname !== "/chat";

  return (
    <>
      {children}
      {showTutorial ? <OnboardingTutorial /> : null}
    </>
  );
}
