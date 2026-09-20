import type { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { PlayerBar } from "@/components/PlayerBar";
import { SessionCompleteModal } from "@/components/SessionCompleteModal";
import { useApp } from "@/lib/app-state";
import { cn } from "@/lib/utils";

type Props = {
  title?: string | undefined;
  subtitle?: string | undefined;
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
  const { sessionCompleteModalOpen, closeSessionCompleteModal, completedSessionData } = useApp();

  return (
    <div className="min-h-dvh bg-background">
      {chrome && <AppSidebar />}
      <div className={cn(chrome && "lg:pl-[270px] xl:pl-[280px]")}>
        {chrome && <TopBar title={title} subtitle={subtitle} />}
        <main
          className={cn(
            "mx-auto px-4 pt-5 pb-36 md:px-7 md:pt-6 max-w-[1440px]",
            narrow && "max-w-3xl",
          )}
        >
          {children}
        </main>
      </div>
      <PlayerBar />
      <SessionCompleteModal
        isOpen={sessionCompleteModalOpen}
        onClose={closeSessionCompleteModal}
        track={completedSessionData?.track}
        durationSeconds={completedSessionData?.durationSeconds}
      />
    </div>
  );
}

