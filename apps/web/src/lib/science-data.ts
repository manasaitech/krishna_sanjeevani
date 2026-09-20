export interface GunaDetail {
  id: "sattva" | "rajas" | "tamas";
  name: "Sattva" | "Rajas" | "Tamas";
  sanskrit: string;
  subhead: string;
  qualities: string[];
  mentalEffect: string;
  musicRole: string;
  color: string;
  lightBg: string;
  badgeBorder: string;
}

export const GUNAS_DATA: Record<string, GunaDetail> = {
  sattva: {
    id: "sattva",
    name: "Sattva",
    sanskrit: "सत्त्व",
    subhead: "Light · Clarity · Harmony",
    qualities: [
      "Psychological clarity and lucidity",
      "Inward peace, stillness and contemplative joy",
      "Emotional balance and harmonious awareness",
      "Natural state of mental equilibrium",
    ],
    mentalEffect:
      "Acts as an internal medicine or psycho-spiritual balm that restores the mind to its essential, undisturbed nature.",
    musicRole:
      "Therapeutic music is calibrated to illuminate Sattva, acting through purified sound to gently suppress turbulent agitation and inertia.",
    color: "#C9A84C",
    lightBg: "rgba(201, 168, 76, 0.12)",
    badgeBorder: "border-amber-500/40",
  },
  rajas: {
    id: "rajas",
    name: "Rajas",
    sanskrit: "रजस्",
    subhead: "Activity · Passion · Restlessness",
    qualities: [
      "Kinetic drive, ambition and desire",
      "Mental agitation and excessive stimulation",
      "Hyperactivity, tension and impatience",
      "Sensory seeking and restless dispersion",
    ],
    mentalEffect:
      "When aggravated, Rajas causes anxiety, stress, emotional fluctuation, and somatic hyper-reactivity.",
    musicRole:
      "Sound should avoid unnecessarily exciting Rajas. However, its kinetic dynamism is selectively used to counter heavy, sluggish Tamasic states.",
    color: "#C85A32",
    lightBg: "rgba(200, 90, 50, 0.12)",
    badgeBorder: "border-orange-500/40",
  },
  tamas: {
    id: "tamas",
    name: "Tamas",
    sanskrit: "तमस्",
    subhead: "Inertia · Darkness · Heaviness",
    qualities: [
      "Stagnation, dullness and cognitive fog",
      "Lethargy, fatigue and physical heaviness",
      "Resistance to movement and change",
      "Obscuration of discriminative intellect",
    ],
    mentalEffect:
      "Deepens melancholy, withdrawal, psychological immobility, and lack of spiritual vitality.",
    musicRole:
      "Therapeutic sound must never deepen Tamas. In grounding contexts (such as Karuṇa Rasa), its stillness is combined with Sattva to cool inflamed heat.",
    color: "#5A6472",
    lightBg: "rgba(90, 100, 114, 0.14)",
    badgeBorder: "border-slate-500/40",
  },
};

export interface RasaDetail {
  id: string;
  name: string;
  sanskrit: string;
  translation: string;
  gunaProfile: string;
  therapeuticEffect: string;
  doshaTarget: string;
  musicalAttributes: string;
  note: string;
}

export const THERAPEUTIC_RASAS: RasaDetail[] = [
  {
    id: "santa",
    name: "Śānta",
    sanskrit: "शान्त",
    translation: "Tranquility · Peace · Deep Serenity",
    gunaProfile: "Pure Sāttvic",
    therapeuticEffect:
      "Quiets sensory turbulence, stabilizes neural oscillations, and dissolves psychological agitation into profound contemplative stillness.",
    doshaTarget: "Universally balancing for Tridoṣa aggravation; ideal for profound stress relief.",
    musicalAttributes: "Even melodic contours, prolonged fundamental notes (Vādin), meditative tempo (Vilambit Laya).",
    note: "The primary foundational state for spiritual self-realization and restorative cellular recovery.",
  },
  {
    id: "sringara",
    name: "Śṛṅgāra",
    sanskrit: "शृङ्गार",
    translation: "Love · Erotic · Aesthetic Romance",
    gunaProfile: "Sāttvic-Rājasic",
    therapeuticEffect:
      "Evokes delicate emotional warmth, sensory refinement, and gentle kinetic movement to dissolve stagnant emotional holding.",
    doshaTarget: "Therapeutically appropriate for heavy, sluggish Kapha; less suited for inflamed Pitta.",
    musicalAttributes: "Lyrical microtonal glides (Meend), ornamental swaras (Gamaka), uplifting morning/evening ragas.",
    note: "Transmutes mundane desire into refined devotional affection and creative vitality.",
  },
  {
    id: "karuna",
    name: "Karuṇa",
    sanskrit: "करुण",
    translation: "Pathos · Compassion · Tender Sadness",
    gunaProfile: "Sāttvic-Tāmasic (Grounding Stillness)",
    therapeuticEffect:
      "Provides profound emotional grounding; draws excessive heat and frantic movement downward into peaceful acceptance.",
    doshaTarget: "Highly recommended for aggravated Vāta (air) and Pitta (bile) to counteract heat and restlessness.",
    musicalAttributes: "Flattened microtones (Komal Gandhar, Komal Dhaivat), evocative pauses, deep resonant acoustic decay.",
    note: "Fosters involuntary psycho-somatic release (tears, sigh of relief) that purifies pent-up emotional toxicity.",
  },
  {
    id: "adbhuta",
    name: "Adbhuta",
    sanskrit: "अद्भुत",
    translation: "Wonder · Awe · Transcendental Amazement",
    gunaProfile: "Pure Sāttvic",
    therapeuticEffect:
      "Expands cognitive horizons, interrupts repetitive anxiety loops, and attunes consciousness to the vastness of the Divine.",
    doshaTarget: "Universally balancing across all three Doṣas, especially when mental fixedness is present.",
    musicalAttributes: "Ascending phrases (Arohana) that leap octaves, unexpected harmonious transitions, luminous scale notes.",
    note: "Elevates ordinary perception into transcendental appreciation of cosmic order.",
  },
  {
    id: "vira",
    name: "Vīra",
    sanskrit: "वीर",
    translation: "Heroic · Courage · Divine Vitality",
    gunaProfile: "Sāttvic-Rājasic",
    therapeuticEffect:
      "Infuses confidence, resilience, and righteous focus; eliminates lethargy, defeatism, and psycho-physical inertia.",
    doshaTarget: "Potently invigorates Kapha (sluggishness) and revives depleted mental strength.",
    musicalAttributes: "Rhythmic precision (Drut Laya), prominent fifth (Pancham), assertive ascending sequences.",
    note: "Awakens the soul's dormant spiritual energy to overcome existential difficulties.",
  },
];

export const NINE_EMOTIONAL_STATES = [
  { term: "Śama", sanskrit: "शम", meaning: "Tranquility & serene stillness", rasa: "Śānta" },
  { term: "Rati", sanskrit: "रति", meaning: "Love, affection & delight", rasa: "Śṛṅgāra" },
  { term: "Hāsa", sanskrit: "हास", meaning: "Laughter, mirth & joy", rasa: "Hāsya" },
  { term: "Śoka", sanskrit: "शोक", meaning: "Sorrow & compassionate grief", rasa: "Karuṇa" },
  { term: "Krodha", sanskrit: "क्रोध", meaning: "Anger & assertive fervor", rasa: "Raudra" },
  { term: "Utsāha", sanskrit: "उत्साह", meaning: "Enthusiasm, valor & courage", rasa: "Vīra" },
  { term: "Bhaya", sanskrit: "भय", meaning: "Apprehension & existential awe", rasa: "Bhayānaka" },
  { term: "Jugupsā", sanskrit: "जुगुप्सा", meaning: "Revulsion & detachment", rasa: "Bībhatsa" },
  { term: "Vismaya", sanskrit: "विस्मय", meaning: "Wonder, awe & curiosity", rasa: "Adbhuta" },
];

export interface DoshaDetail {
  id: string;
  name: string;
  sanskrit: string;
  elements: string;
  inherentGunas: string;
  aggravationSigns: string;
  balancingPrinciple: string;
  recommendedRasas: string[];
  contraindicatedRasas: string[];
  therapeuticLogic: string;
}

export const DOSHAS_DATA: DoshaDetail[] = [
  {
    id: "vata",
    name: "Vāta",
    sanskrit: "वात",
    elements: "Air & Ether (Vāyu + Ākāśa)",
    inherentGunas: "Rājasic-Sāttvic (Mobile, Dry, Subtle, Cold)",
    aggravationSigns: "Mental anxiety, erratic restlessness, insomnia, somatic tension, digestive variability.",
    balancingPrinciple: "Opposites balance: Warm, grounding, slow, cohesive stillness.",
    recommendedRasas: ["Karuṇa (Pathos)", "Śānta (Peace)"],
    contraindicatedRasas: ["Śṛṅgāra (Erotic)", "Vīra (Heroic)"],
    therapeuticLogic:
      "Because Vāta is inherently kinetic and volatile, active Rājasic rasas (like Vīra and Śṛṅgāra) would further agitate excess movement. Karuṇa's deep, melancholic grounding counteracts dispersion and anchors the nervous system.",
  },
  {
    id: "pitta",
    name: "Pitta",
    sanskrit: "पित्त",
    elements: "Fire & Water (Tejas + Jala)",
    inherentGunas: "Rājasic-Sāttvic (Hot, Sharp, Light, Intense)",
    aggravationSigns: "Irritability, inflammatory stress, hyper-acidity, intense perfectionism, somatic heat.",
    balancingPrinciple: "Opposites balance: Cooling, gentle, pacifying, non-combative harmonies.",
    recommendedRasas: ["Karuṇa (Compassion)", "Śānta (Tranquility)"],
    contraindicatedRasas: ["Vīra (Aggressive/Heroic)", "Raudra (Fury)"],
    therapeuticLogic:
      "Pitta's fiery intensity is aggravated by ambitious, surging soundscapes. The cooling, contemplative tenderness of Karuṇa and Śānta extinguishes internal heat and fosters surrender and peace.",
  },
  {
    id: "kapha",
    name: "Kapha",
    sanskrit: "कफ",
    elements: "Earth & Water (Pṛthvī + Jala)",
    inherentGunas: "Tāmasic-Sāttvic (Heavy, Slow, Cold, Dense)",
    aggravationSigns: "Lethargy, depression, cognitive fog, lymphatic congestion, attachment, sluggishness.",
    balancingPrinciple: "Opposites balance: Uplifting, dynamic, stimulating, rhythmic vibrancy.",
    recommendedRasas: ["Śṛṅgāra (Romantic/Joyful)", "Vīra (Heroic/Energizing)"],
    contraindicatedRasas: ["Deep Tāmasic drones without tempo", "Heavy mournful sorrow"],
    therapeuticLogic:
      "Kapha's dense, immobile nature requires the kinetic impetus of Rajas. Śṛṅgāra and Vīra infuse vitality, inspire movement, and break the heavy inertia of Tamas.",
  },
];

export const TRIDOSHA_BALANCING = {
  title: "When All Three Doṣas Are Aggravated (Sannipāta)",
  description:
    "When a patient suffers from multi-systemic imbalance with all three somatic humors disturbed, specialized rasas with universal harmonizing profiles are indicated.",
  recommended: ["Adbhuta (Wonder)", "Śānta (Tranquil)"],
  rationale:
    "Adbhuta (wonder) disrupts entrenched neuropathways through awe, while Śānta (tranquility) provides a universal neutral ground where autonomic stability can spontaneously re-establish itself without over-stimulating any individual humor.",
};

export const GANDHARVA_MURCHANA_MODEL = {
  title: "The Modal Architecture of the Gāndharva Tradition",
  concept: "Mūrcchanā & Vādin Predominance",
  summary:
    "Ancient Indian music therapy was not founded upon isolated single notes, but on complete modal structures known as Mūrcchanā. Each scale is anchored by a predominant tonal center (Vādin), which embodies a specific composition of Sattva, Rajas, and Tamas.",
  steps: [
    {
      step: "1. Somatic Assessment",
      label: "Identify Aggravated Doṣa",
      detail: "Determining whether Vāta (kinetic), Pitta (thermal), or Kapha (inertial) requires pacification.",
    },
    {
      step: "2. Guna Profiling",
      label: "Determine Opposing Guna",
      detail: "Applying Sāmānya-Viśeṣa Siddhānta: selecting the quality profile that neutralizes the excess.",
    },
    {
      step: "3. Rasa Selection",
      label: "Choose Therapeutic Rasa",
      detail: "Matching the therapeutic intent with Śānta, Karuṇa, Adbhuta, Śṛṅgāra, or Vīra.",
    },
    {
      step: "4. Mūrcchanā & Vādin",
      label: "Calibrate Raga & Scale",
      detail: "Selecting a modal scale whose predominant note (Vādin) and microtonal intervals induce the targeted affective state.",
    },
    {
      step: "5. Realignment",
      label: "Conscious Equilibrium",
      detail: "The listener actively experiences aesthetic relish, illuminating Sattva and restoring holistic balance.",
    },
  ],
};
