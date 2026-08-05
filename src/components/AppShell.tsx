import type { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { PlayerBar } from "@/components/PlayerBar";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Constrain content width; defaults to the wide streaming layout. */
  narrow?: boolean;
  chrome?: boolean;
};

export function AppShell({
  title,
  subtitle,
  children,
  narrow = false,
  chrome = true,
}: Props) {
  return (
    <div className="min-h-dvh bg-background">
      {chrome && <AppSidebar />}
      <div className={cn(chrome && "lg:pl-[264px] xl:pl-[288px]")}>
        {chrome && <TopBar title={title} subtitle={subtitle} />}
        <main
          className={cn(
            "mx-auto px-5 pt-6 pb-40 md:px-8 md:pt-8",
            narrow ? "max-w-3xl" : "max-w-[1600px]",
          )}
        >
          {children}
        </main>
      </div>
      <PlayerBar />
    </div>
  );
}
