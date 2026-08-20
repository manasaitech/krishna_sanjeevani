import krishnaFluteImg from "@/assets/cbabb2a5-2787-4997-986f-daf7b88017ff.jpeg";
import kulasekharaImg from "@/assets/57d4ebea-a77c-4f30-88ad-87e99aac7c1f.jpeg";
import kulashekaraHeroImg from "@/assets/kulashekara.png";
import chaitanyaImg from "@/assets/18fc75d6-df05-469c-9855-d79c4931636d.jpeg";
import prabhupadaImg from "@/assets/prabhupada-new.jpg";
import ragaMusiciansImg from "@/assets/2978e827-6b28-45f0-bbce-575e6023a705.jpeg";
import templeSunriseImg from "@/assets/8269a526-98ab-49a2-bcce-928814d51baa.jpeg";
import manuscriptImg from "@/assets/89e81ba6-b688-4575-9b1f-964ace72a456.jpeg";
import meditationImg from "@/assets/70fad00b-8e20-42f8-a986-11f0bd7335f5.jpeg";
import inaugurationImg from "@/assets/af091c30-50ed-4947-85f7-7be2e6a958f4.jpeg";
import soundVibrationImg from "@/assets/caf22ea5-bc7e-46d8-a845-876858c2a009.jpeg";

export {
  krishnaFluteImg,
  kulasekharaImg,
  kulashekaraHeroImg,
  chaitanyaImg,
  prabhupadaImg,
  ragaMusiciansImg,
  templeSunriseImg,
  manuscriptImg,
  meditationImg,
  inaugurationImg,
  soundVibrationImg,
};

export interface HeroSlide {
  id: string;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  align?: "center" | "left" | "right";
  objectPosition?: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    image: krishnaFluteImg,
    badge: "The Divine Therapeutic Music",
    title: "Healing That Begins With Listening",
    subtitle: "Sur Sanjeevan & Mantra Meditation",
    description:
      "An amalgamation of the therapeutic science known as Sur Sanjeevan and the divine power of Hare Krishna Mahamantra to generate a synergetic healing effect across body, mind, and consciousness.",
    primaryCtaText: "Explore Krishna Sanjeevani",
    primaryCtaLink: "/register",
    secondaryCtaText: "Discover Our Inspiration",
    secondaryCtaLink: "/inspiration",
    align: "center",
  },
  {
    id: "slide-2",
    image: kulashekaraHeroImg,
    badge: "Sacred Devotional Heritage",
    title: "The Divine Therapeutic Music",
    subtitle: "Piba Manaḥ Śrī-Kṛṣṇa-Divyauṣadham",
    description:
      "Inspired by the 9th-century Mukundamālā Stotra of King Kulasekhara Alvar, recognizing the Holy Name and classical swaras as the ultimate life-saving elixir for existential wellbeing.",
    primaryCtaText: "Explore the Verses",
    primaryCtaLink: "/inspiration",
    secondaryCtaText: "Learn About Kulasekhara",
    secondaryCtaLink: "/inspiration",
    align: "center",
    objectPosition: "center",
  },
  {
    id: "slide-3",
    image: ragaMusiciansImg,
    badge: "Vedic Science & Ayurveda",
    title: "Cultivating Sattva Through Sound",
    subtitle: "Nada Yoga, Ragas & Dosha Balancing",
    description:
      "Harnessing classical Indian ragas and praharas to elevate mental energy into Sattvic clarity, pacify aggravated humors (Vata, Pitta, Kapha), and align brainwave rhythms.",
    primaryCtaText: "Explore Vedic Science",
    primaryCtaLink: "/vedic-science",
    secondaryCtaText: "View Therapeutic Ragas",
    secondaryCtaLink: "/vedic-science",
    align: "center",
  },
  {
    id: "slide-4",
    image: meditationImg,
    badge: "Maternal & Restorative Care",
    title: "Harmonious Soundscapes for Life",
    subtitle: "Prenatal Guidance, Deep Sleep & Focus",
    description:
      "Guided listening sequences calibrated according to Ayurvedic texts for prenatal harmony, mental calmness, and restorative sleep without pharmacological dependency.",
    primaryCtaText: "Explore Programs",
    primaryCtaLink: "/register",
    secondaryCtaText: "Read the Landmark Story",
    secondaryCtaLink: "/the-beginning",
    align: "center",
  },
];

export const FEATURE_PILLARS = [
  {
    id: "sur-sanjeevan",
    title: "Sur Sanjeevan Heritage",
    subtitle: "Therapeutic Classical Science",
    icon: "Music2",
    description:
      "Grounded in the diagnostic modal science of Indian classical ragas, microtones (śrutis), and circadian time theory (Praharas).",
  },
  {
    id: "mahamantra",
    title: "Maha Mantra Potency",
    subtitle: "Transcendental Vibration",
    icon: "Sparkles",
    description:
      "Harnessing the holy names of Krishna to awaken dormant spiritual consciousness, dissolve deep-seated anxiety, and purify the subtle mind.",
  },
  {
    id: "sattva",
    title: "Cultivating Sattva",
    subtitle: "Psychological Equilibrium",
    icon: "HeartPulse",
    description:
      "Soundscapes structured to pacify turbulent Rajas and inert Tamas, cultivating the luminous clarity and serene balance of pure Sattva.",
  },
  {
    id: "dosha",
    title: "Ayurvedic Alignment",
    subtitle: "Bio-Energetic Modulation",
    icon: "Compass",
    description:
      "Aligning sonic frequencies with the biological rhythms of Vata, Pitta, and Kapha to support systemic vitality and immune harmony.",
  },
  {
    id: "lineage",
    title: "Living Sacred Lineage",
    subtitle: "Rooted in Authentic Texts",
    icon: "BookOpen",
    description:
      "Inspired by King Kulasekhara’s Mukundamālā Stotra, Sri Chaitanya’s Śikṣāṣṭakam, and the global kīrtana legacy of Srila Prabhupada.",
  },
];

export const KULASEKHARA_VERSE = {
  title: "Mukundamālā Stotra — Verse 24",
  author: "King Kulasekhara Alvar (9th Century)",
  image: kulasekharaImg,
  audioPath: "/audio/kulasekhara-verse.mp3",
  sanskrit: `व्यामोहप्रशमौषधं मुनिमनोवृत्तिप्रवृत्त्यौषधं
दैत्येन्द्रार्तिकरौषधं त्रिजगतां सञ्जीवनैकौषधम् ।
भक्तात्यन्तहितौषधं भवभयप्रध्वंसनैकौषधं
श्रेयःप्राप्तिकरौषधं पिब मनः श्रीकृष्णदिव्यौषधम् ॥ २४ ॥`,
  transliteration: `vyāmoha-praśamauṣadhaṁ muni-mano-vṛtti-pravṛtty-auṣadhaṁ
daityendrārti-karauṣadhaṁ tri-jagatāṁ sañjīvanaikauṣadham |
bhaktātyanta-hitauṣadhaṁ bhava-bhaya-pradhvaṁsanaikauṣadhaṁ
śreyaḥ-prāpti-karauṣadhaṁ piba manaḥ śrī-kṛṣṇa-divyauṣadham || 24 ||`,
  meaning:
    "O mind, drink the divine medicine of Sri Krishna! It is the medicine that cures all delusion, activates the spiritual absorption of sages, dispels the torment of demonic forces, and is the sole life-giving elixir (sañjīvana) for the three worlds. It is the utmost beneficial remedy for devotees, the destroyer of existential fear, and the granter of supreme auspiciousness.",
  dimensions: [
    {
      sanskrit: "व्यामोह-प्रशमौषधम् (Vyāmoha-praśamauṣadham)",
      meaning: "The medicine that completely pacifies and dispels mental illusion and emotional delusion.",
    },
    {
      sanskrit: "मुनि-मनोवृत्ति-प्रवृत्त्यौषधम् (Muni-mano-vṛtti-pravṛtty-auṣadham)",
      meaning: "The elixir that turns the mind inward and awakens deep meditative absorption in the sages.",
    },
    {
      sanskrit: "त्रिजगतां सञ्जीवनैकौषधम् (Tri-jagatāṁ Sañjīvanaikauṣadham)",
      meaning: "The singular life-giving and restoring medicine (Sanjeevani) for all living beings across the three worlds.",
    },
    {
      sanskrit: "भक्तात्यन्त-हितौषधम् (Bhaktātyanta-hitauṣadham)",
      meaning: "The supreme wholesome remedy that brings ultimate spiritual and physiological wellbeing to devotees.",
    },
    {
      sanskrit: "भव-भय-प्रध्वंसनैकौषधम् (Bhava-bhaya-pradhvaṁsanaikauṣadham)",
      meaning: "The unparalleled medicine that eradicates existential anxiety and the dread of material entrapment.",
    },
    {
      sanskrit: "श्रेयः-प्राप्ति-करौषधम् (Śreyaḥ-prāpti-karauṣadham)",
      meaning: "The curative force that confers everlasting spiritual auspiciousness, peace, and transcendental bliss.",
    },
  ],
};

export const CHAITANYA_SIKSASTAKAM = {
  title: "Śrī Śikṣāṣṭakam — Verse 1",
  author: "Śrī Caitanya Mahāprabhu (15th Century)",
  image: chaitanyaImg,
  sanskrit: `चेतोदर्पणमार्जनं भवमहादावाग्नि-निर्वपणं
श्रेयःकैरवचन्द्रिकावितरणं विद्यावधूजीवनम् ।
आनन्दाम्बुधिवर्धनं प्रतिपदं पूर्णामृतास्वादनं
सर्वात्मस्नपनं परं विजयते श्रीकृष्णसङ्कीर्तनम् ॥ १ ॥`,
  transliteration: `ceto-darpaṇa-mārjanaṁ bhava-mahā-dāvāgni-nirvāpaṇaṁ
śreyaḥ-kairava-candrikā-vitaraṇaṁ vidyā-vadhū-jīvanam |
ānandāmbudhi-vardhanaṁ prati-padaṁ pūrṇāmṛtāsvādanaṁ
sarvātma-snapanaṁ paraṁ vijayate śrī-kṛṣṇa-saṅkīrtanam || 1 ||`,
  meaning:
    "All glories to the Sri Krishna Sankirtana, which cleanses the mirror of the heart, extinguishes the blazing forest fire of material suffering, spreads the soothing moonlight of supreme auspiciousness, is the life of all transcendental knowledge, expands the ocean of spiritual bliss, allows one to taste the nectar for which we are always anxious, and completely bathes and refreshes the soul at every step.",
  lines: [
    {
      term: "चेतो-दर्पण-मार्जनम् (Ceto-darpaṇa-mārjanam)",
      meaning: "Cleanses the dust from the mirror of consciousness and restores original mental purity.",
    },
    {
      term: "भव-महा-दावाग्नि-निर्वपणम् (Bhava-mahā-dāvāgni-nirvāpaṇam)",
      meaning: "Extinguishes the blazing forest fire of existential anxiety, stress, and somatic distress.",
    },
    {
      term: "श्रेयः-कैरव-चन्द्रिका-वितरणम् (Śreyaḥ-kairava-candrikā-vitaraṇam)",
      meaning: "Diffuses the cooling, soothing moonlight that causes the white lotus of good fortune to blossom.",
    },
    {
      term: "विद्या-वधू-जीवनम् (Vidyā-vadhū-jīvanam)",
      meaning: "The very life-breath of transcendental wisdom and holistic understanding.",
    },
    {
      term: "आनन्दाम्बुधि-वर्धनम् (Ānandāmbudhi-vardhanam)",
      meaning: "Continuously expands the boundless ocean of spiritual and emotional joy.",
    },
    {
      term: "प्रति-पदं पूर्णामृतास्वादनम् (Prati-padaṁ Pūrṇāmṛtāsvādanam)",
      meaning: "Enables the listener to taste the full nectar of immortality at every single step.",
    },
    {
      term: "सर्वात्म-स्नपनम् (Sarvātma-snapanam)",
      meaning: "Thoroughly bathes, purifies, and refreshes the mind, sensory organs, and the inner soul.",
    },
    {
      term: "परं विजयते श्रीकृष्णसङ्कीर्तनम् (Paraṁ Vijayate Śrī-Kṛṣṇa-Saṅkīrtanam)",
      meaning: "Supreme victory to the congregational singing and chanting of the Holy Names of Krishna.",
    },
  ],
};

export const PRABHUPADA_LEGACY = {
  name: "His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda",
  role: "Founder-Acharya of the International Society for Krishna Consciousness (ISKCON)",
  image: prabhupadaImg,
  description:
    "Srila Prabhupada traveled the globe at age 69 to share the transformative power of kīrtana and Vedic sound therapy with humanity. He taught that sound is the primal element of creation — and that immersing oneself in the Holy Name awakens dormant spiritual consciousness, alleviates psychological distress, and grants everlasting peace.",
  points: [
    "Pioneered global kīrtana across six continents, inspiring millions to embrace therapeutic sound.",
    "Translated and commented on 80+ volumes of Vedic literature, including Bhagavad-gītā As It Is and Śrīmad-Bhāgavatam.",
    "Emphasized the Hare Krishna Mahamantra as the prime acoustic therapy for human consciousness in the modern age.",
  ],
};

export const LANDMARK_EVENT = {
  date: "30 May 2026",
  location: "ISKCON Kharghar, Navi Mumbai",
  title: "Inauguration of India's First Holistic Cancer Healing Retreat",
  guest: "Hon’ble Governor of Maharashtra, Shri Jishnu Dev Varma",
  description:
    "On 30 May 2026, Hon’ble Governor of Maharashtra Shri Jishnu Dev Varma inaugurated India’s first Holistic Cancer Healing Retreat at ISKCON Kharghar and officially launched ‘Krishna Sanjeevani’ — the specialized divine music therapy designed to bring emotional comfort and holistic support to cancer patients.",
  quote:
    "Music and devotion have the power to touch the deepest layers of the human spirit. Krishna Sanjeevani represents a noble endeavor to bring solace and strength to those facing life's toughest battles.",
  attendees: "200+ cancer patients, oncologists, researchers, and dignitaries in attendance.",
};

export const EXPLORE_CARDS = [
  {
    title: "Vedic Science",
    subtitle: "Raga Chikitsa & The Science of Sound",
    description:
      "Explore how ancient Gandharva Veda, circadian time theory (Praharas), and Ayurvedic Dosha modulation form the psycho-acoustic foundation of Krishna Sanjeevani.",
    link: "/vedic-science",
    tag: "Science & Ayurveda",
    image: manuscriptImg,
  },
  {
    title: "Our Inspiration",
    subtitle: "Spiritual Masters & Sacred Verses",
    description:
      "Discover the devotional lineage behind the platform — from King Kulasekhara’s Mukundamālā Stotra to Lord Chaitanya and Srila Prabhupada.",
    link: "/inspiration",
    tag: "Sacred Heritage",
    image: prabhupadaImg,
    imagePosition: "object-top",
  },
  {
    title: "A Landmark Beginning",
    subtitle: "Inauguration at ISKCON Kharghar",
    description:
      "Read about the historic launch on 30 May 2026 by the Hon’ble Governor of Maharashtra at the Holistic Cancer Healing Retreat.",
    link: "/the-beginning",
    tag: "Milestone Event",
    image: inaugurationImg,
  },
];
