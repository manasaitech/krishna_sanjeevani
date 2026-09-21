import { createFileRoute } from "@tanstack/react-router";
import { useMode } from "@/core/mode";
import { SurawaliHome } from "@/modes/surawali/pages/SurawaliHome";
import { EmotionHome } from "@/modes/emotion-remediation/pages/EmotionHome";

export const Route = createFileRoute("/home")({
  validateSearch: (search: Record<string, unknown>): { flag?: string } => ({
    flag: typeof search["flag"] === "string" ? search["flag"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Home — Krishna Sanjeevani" },
      {
        name: "description",
        content: "Vedic Sound Therapy & Surawali Dashboard.",
      },
    ],
  }),
  component: HomePageComponent,
});

function HomePageComponent() {
  const { isEmotionMode } = useMode();
  return isEmotionMode ? <EmotionHome /> : <SurawaliHome />;
}
