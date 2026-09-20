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
        content: "Vedic Sound Therapy & Emotion Remediation Dashboard.",
      },
    ],
  }),
  component: HomeDashboard,
});

function HomeDashboard() {
  const { mode, isEmotionMode } = useMode();
  const active = mode || getActiveMode();
  const showEmotion = isEmotionMode ?? (active === "emotion_remediation");

  return showEmotion ? <EmotionHome /> : <SurawaliHome />;
}
