import { createFileRoute } from "@tanstack/react-router";
import { useMode, getActiveMode } from "@/core/mode";
import { SurawaliHome } from "@/modes/surawali/pages/SurawaliHome";
import { EmotionHome } from "@/modes/emotion-remediation/pages/EmotionHome";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Krishna Sanjeevani" },
      {
        name: "description",
        content: "Vedic Sound Therapy & Surawali Dashboard.",
      },
    ],
  }),
  component: SurawaliHome,
});
