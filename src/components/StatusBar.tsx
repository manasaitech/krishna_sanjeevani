import { useEffect, useState } from "react";
import { SignalHigh, Wifi, BatteryFull } from "lucide-react";

export function StatusBar() {
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="sticky top-0 z-40 flex items-center justify-between bg-background/85 px-6 pt-2 pb-1 text-[11px] font-medium text-muted-foreground backdrop-blur-xl select-none"
    >
      <span className="tabular-nums text-foreground">{time}</span>
      <span className="flex items-center gap-1.5">
        <SignalHigh className="h-3.5 w-3.5" strokeWidth={2.5} />
        <Wifi className="h-3.5 w-3.5" strokeWidth={2.5} />
        <BatteryFull className="h-4 w-4" strokeWidth={2.5} />
      </span>
    </div>
  );
}
