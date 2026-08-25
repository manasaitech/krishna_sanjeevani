import { useState, useEffect } from "react";
import { Sparkles, Heart } from "lucide-react";

interface Verse {
  sanskrit: string;
  transliteration: string;
  translation: string;
  verseNo: number;
}

const VERSES: Verse[] = [
  {
    verseNo: 24,
    sanskrit:
      "व्यामोहप्रशमौषधं मुनिमनोवृत्तिप्रवृत्त्यौषधं\nदैत्येन्द्रार्तिकरौषधं त्रिजगतां सञ्जीवनैकौषधम् ।\nभक्ताभीष्टकरौषधं भवभयप्रध्वंसनैकौषधं\nश्रेयःप्राप्तिकरौषधं पिब मनः श्रीकृष्णदिव्यौषधम् ॥",
    transliteration:
      "vyāmoha-praśamauṣadhaṁ muni-mano-vṛtti-pravṛtty-auṣadhaṁ\ndaityendrārtti-karauṣadhaṁ tri-jagatāṁ sañjīvanaikauṣadham |\nbhaktābhīṣṭa-karauṣadhaṁ bhava-bhaya-pradhvaṁsanaikauṣadhaṁ\nśreyaḥ-prāpti-karauṣadhaṁ piba manaḥ śrī-kṛṣṇa-divyauṣadham ||",
    translation:
      "The medicine to cure delusion, the medicine to inspire the minds of sages, the life-giving medicine for the three worlds, the medicine that destroys worldly fear — O mind, drink the divine medicine of Sri Krishna!",
  },
  {
    verseNo: 1,
    sanskrit: "घुष्यते यस्य नगरे रङ्गयात्रा दिने दिने ।\nतमहं शिरसा वन्दे राजानं कुलशेखरम् ॥",
    transliteration:
      "ghuṣyate yasya nagare raṅga-yātrā dine dine |\ntam ahaṁ śirasā vande rājānaṁ kulaśekharam ||",
    translation:
      "I bow my head to King Kulasekhara, in whose capital city the festival of the pilgrimage to Sri Ranga is proclaimed day after day.",
  },
  {
    verseNo: 33,
    sanskrit:
      "कृष्ण त्वदीयपदपङ्कजपञ्जरान्तम्\nअद्यैव मे विशतु मानसराजहंसः ।\nप्राणप्रयाणसमये कफवातपित्तैः\nकण्ठावरोधनविधौ स्मरणं कुतस्ते ॥",
    transliteration:
      "kṛṣṇa tvadīya-pada-paṅkaja-pañjarāntam\nadyaiva me viśatu mānasa-rāja-haṁsaḥ |\nprāṇa-prayāṇa-samaye kapha-vāta-pittaiḥ\nkaṇṭhāvarodhana-vidhau smaraṇaṁ kutas te ||",
    translation:
      "O Lord Krishna, let the royal swan of my mind enter today into the enclosure of Your lotus feet, lest at the time of death my throat is choked by bodily humors and I fail to remember You.",
  },
];

export function KulasekharaVerse() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false); // Trigger fade-out
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % VERSES.length);
        setFade(true);
      }, 500);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const activeVerse = VERSES[index];

  return (
    <div className="relative flex flex-col w-full max-w-[380px] mx-auto px-4 py-8">
      {/* Scroll Top Roller */}
      <div className="relative h-4 w-full bg-gradient-to-b from-[#8C2D19] via-[#A83820] to-[#8C2D19] rounded-sm shadow-md z-20">
        {/* Gold Left Cap */}
        <div className="absolute -left-2 -top-1 w-3.5 h-6 bg-gradient-to-b from-amber-500 via-amber-300 to-amber-500 rounded-l-md border-r border-amber-700 shadow-sm" />
        {/* Gold Right Cap */}
        <div className="absolute -right-2 -top-1 w-3.5 h-6 bg-gradient-to-b from-amber-500 via-amber-300 to-amber-500 rounded-r-md border-l border-amber-700 shadow-sm" />
      </div>

      {/* Scroll Body */}
      <div className="flex-1 min-h-[340px] flex flex-col justify-between -my-1 py-10 px-6 bg-[#FFFDF9] border-x border-border shadow-lift relative overflow-hidden text-foreground">
        {/* Background watermark overlay */}
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#C9A84C_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />

        {/* Scroll Header */}
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-cat/40" />
            <h3 className="text-[11px] font-bold tracking-[0.25em] text-cat uppercase font-sans">
              Daily Verse
            </h3>
            <span className="h-px w-6 bg-cat/40" />
          </div>
          <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-serif">
            Mukundamālā Stotra · Verse {activeVerse.verseNo}
          </span>
        </div>

        {/* Verse Content with Transition */}
        <div
          className={`flex flex-col items-center text-center my-auto py-4 transition-all duration-500 z-10 ${
            fade ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-98 blur-sm"
          }`}
        >
          {/* Sanskrit Devanagari */}
          <p className="text-base sm:text-lg font-serif font-semibold leading-relaxed text-foreground whitespace-pre-line">
            {activeVerse.sanskrit}
          </p>

          {/* Transliteration */}
          <p className="mt-3 text-[11px] text-muted-foreground font-serif italic max-w-[90%] leading-relaxed">
            {activeVerse.transliteration}
          </p>

          {/* Translation */}
          <p className="mt-4 text-xs text-cat font-medium font-sans leading-relaxed border-t border-border pt-3">
            "{activeVerse.translation}"
          </p>
        </div>

        {/* Scroll Footer */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-serif z-10 pt-2 border-t border-border/60">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cat" /> King Kulasekhara
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-cat" /> Bhakti Rasāyana
          </span>
        </div>
      </div>

      {/* Scroll Bottom Roller */}
      <div className="relative h-4 w-full bg-gradient-to-b from-[#8C2D19] via-[#A83820] to-[#8C2D19] rounded-sm shadow-md z-20">
        {/* Gold Left Cap */}
        <div className="absolute -left-2 -top-1 w-3.5 h-6 bg-gradient-to-b from-amber-500 via-amber-300 to-amber-500 rounded-l-md border-r border-amber-700 shadow-sm" />
        {/* Gold Right Cap */}
        <div className="absolute -right-2 -top-1 w-3.5 h-6 bg-gradient-to-b from-amber-500 via-amber-300 to-amber-500 rounded-r-md border-l border-amber-700 shadow-sm" />
      </div>
    </div>
  );
}
