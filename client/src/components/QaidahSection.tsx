import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ArabicLetter {
  arabic: string;
  name: string;
  transliteration: string;
  pronunciation: string;
  position: {
    isolated: string;
    initial: string;
    medial: string;
    final: string;
  };
}

interface TajweedRule {
  id: string;
  title: string;
  arabicTitle: string;
  description: string;
  examples: {
    arabic: string;
    transliteration: string;
    translation: string;
    reference?: string;
  }[];
  keyPoints: string[];
}

const arabicAlphabet: ArabicLetter[] = [
  { arabic: "ا", name: "Alif", transliteration: "A", pronunciation: "as in 'father'", position: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" } },
  { arabic: "ب", name: "Baa", transliteration: "B", pronunciation: "as in 'boy'", position: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" } },
  { arabic: "ت", name: "Taa", transliteration: "T", pronunciation: "as in 'top'", position: { isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" } },
  { arabic: "ث", name: "Thaa", transliteration: "Th", pronunciation: "as in 'think'", position: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" } },
  { arabic: "ج", name: "Jeem", transliteration: "J", pronunciation: "as in 'jam'", position: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" } },
  { arabic: "ح", name: "Hha", transliteration: "Ḥ", pronunciation: "strong 'h' from throat", position: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" } },
  { arabic: "خ", name: "Khaa", transliteration: "Kh", pronunciation: "as in 'Bach' (German)", position: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" } },
  { arabic: "د", name: "Daal", transliteration: "D", pronunciation: "as in 'day'", position: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" } },
  { arabic: "ذ", name: "Dhaal", transliteration: "Dh", pronunciation: "as in 'this'", position: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" } },
  { arabic: "ر", name: "Raa", transliteration: "R", pronunciation: "rolled 'r'", position: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" } },
  { arabic: "ز", name: "Zay", transliteration: "Z", pronunciation: "as in 'zoo'", position: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" } },
  { arabic: "س", name: "Seen", transliteration: "S", pronunciation: "as in 'sun'", position: { isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" } },
  { arabic: "ش", name: "Sheen", transliteration: "Sh", pronunciation: "as in 'she'", position: { isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" } },
  { arabic: "ص", name: "Saad", transliteration: "S", pronunciation: "heavy 's' (emphatic)", position: { isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" } },
  { arabic: "ض", name: "Daad", transliteration: "D", pronunciation: "heavy 'd' (emphatic)", position: { isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" } },
  { arabic: "ط", name: "Toa", transliteration: "Ṭ", pronunciation: "heavy 't' (emphatic)", position: { isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" } },
  { arabic: "ظ", name: "Dhaa", transliteration: "Dh", pronunciation: "heavy 'dh' (emphatic)", position: { isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" } },
  { arabic: "ع", name: "Ayn", transliteration: "'", pronunciation: "guttural sound from throat", position: { isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" } },
  { arabic: "غ", name: "Ghayn", transliteration: "Gh", pronunciation: "like French 'r'", position: { isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" } },
  { arabic: "ف", name: "Faa", transliteration: "F", pronunciation: "as in 'fun'", position: { isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" } },
  { arabic: "ق", name: "Qaaf", transliteration: "Q", pronunciation: "deep 'k' from throat", position: { isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" } },
  { arabic: "ك", name: "Kaaf", transliteration: "K", pronunciation: "as in 'king'", position: { isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" } },
  { arabic: "ل", name: "Laam", transliteration: "L", pronunciation: "as in 'love'", position: { isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" } },
  { arabic: "م", name: "Meem", transliteration: "M", pronunciation: "as in 'moon'", position: { isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" } },
  { arabic: "ن", name: "Noon", transliteration: "N", pronunciation: "as in 'noon'", position: { isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" } },
  { arabic: "ه", name: "Ha", transliteration: "H", pronunciation: "as in 'hat'", position: { isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه" } },
  { arabic: "و", name: "Waaw", transliteration: "W", pronunciation: "as in 'way'", position: { isolated: "و", initial: "و", medial: "ـو", final: "ـو" } },
  { arabic: "ي", name: "Yaa", transliteration: "Y", pronunciation: "as in 'yes'", position: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" } },
];

const tajweedRules: TajweedRule[] = [
  {
    id: "noon-tanween",
    title: "Noon Sakinah & Tanween Rules",
    arabicTitle: "أحكام النون الساكنة والتنوين",
    description: "Rules for pronouncing Noon with Sukoon (ن) and Tanween (ً ٌ ٍ) when followed by different letters.",
    keyPoints: [
      "Idhaar (Clear pronunciation) - with throat letters: ء ه ع ح غ خ",
      "Idghaam (Merging) - with letters: ي ر م ل و ن",
      "Iqlaab (Conversion to Meem) - with letter: ب",
      "Ikhfaa (Hiding/Nasal sound) - with remaining 15 letters"
    ],
    examples: [
      { arabic: "مِنْ هَادٍ", transliteration: "min hādin", translation: "from a guide", reference: "Example of Idhaar" },
      { arabic: "مَنْ يَعْمَلْ", transliteration: "man ya'mal", translation: "whoever does", reference: "Example of Idghaam" },
      { arabic: "سَمِيعٌ بَصِيرٌ", transliteration: "samī'un basīr", translation: "All-Hearing, All-Seeing", reference: "Example of Iqlaab" },
      { arabic: "مِنْ كُلِّ", transliteration: "min kulli", translation: "from every", reference: "Example of Ikhfaa" },
    ]
  },
  {
    id: "meem-sakinah",
    title: "Meem Sakinah Rules",
    arabicTitle: "أحكام الميم الساكنة",
    description: "Rules for pronouncing Meem with Sukoon (م) when followed by different letters.",
    keyPoints: [
      "Ikhfaa Shafawi (Labial hiding) - when followed by ب",
      "Idghaam Shafawi (Labial merging) - when followed by another م",
      "Idhaar Shafawi (Clear pronunciation) - with all other letters"
    ],
    examples: [
      { arabic: "تَرْمِيهِم بِحِجَارَةٍ", transliteration: "tarmīhim bi-hijārah", translation: "striking them with stones", reference: "Al-Fil 105:4 - Ikhfaa Shafawi" },
      { arabic: "لَهُم مَّا يَشَاءُونَ", transliteration: "lahum mā yashā'ūn", translation: "for them is whatever they wish", reference: "Az-Zumar 39:34 - Idghaam Shafawi" },
      { arabic: "وَهُمْ فِيهَا", transliteration: "wahum fīhā", translation: "and they will be therein", reference: "Example of Idhaar Shafawi" },
    ]
  },
  {
    id: "madd",
    title: "Madd (Elongation) Rules",
    arabicTitle: "أحكام المد",
    description: "Rules for elongating vowels in Arabic recitation.",
    keyPoints: [
      "Madd Tabee'i (Natural) - 2 counts",
      "Madd Waajib Muttasil (Connected) - 4-5 counts",
      "Madd Jaa'iz Munfasil (Separated) - 4-5 counts",
      "Madd Laazim (Obligatory) - 6 counts"
    ],
    examples: [
      { arabic: "قَالَ", transliteration: "qāla", translation: "he said", reference: "Madd Tabee'i" },
      { arabic: "جَاءَ", transliteration: "jā'a", translation: "came", reference: "Madd Waajib Muttasil" },
      { arabic: "يَا أَيُّهَا", transliteration: "yā ayyuhā", translation: "O you", reference: "Madd Jaa'iz Munfasil" },
      { arabic: "الضَّالِّينَ", transliteration: "ad-dāllīn", translation: "those who have gone astray", reference: "Al-Fatihah 1:7 - Madd Laazim" },
    ]
  },
  {
    id: "qalqalah",
    title: "Qalqalah (Echo Sound)",
    arabicTitle: "القلقلة",
    description: "The echoing or bouncing sound produced when certain letters have sukoon.",
    keyPoints: [
      "Letters of Qalqalah: ق ط ب ج د",
      "Minor Qalqalah - when letter has sukoon",
      "Major Qalqalah - when letter has shaddah"
    ],
    examples: [
      { arabic: "يَخْلُقُ", transliteration: "yakhluq", translation: "He creates", reference: "Qalqalah on ق" },
      { arabic: "أَحَطتُ", transliteration: "ahaTtu", translation: "I have encompassed", reference: "An-Naml 27:22 - Qalqalah on ط" },
      { arabic: "وَاجْعَل", transliteration: "waj'al", translation: "and make", reference: "Qalqalah on ج" },
      { arabic: "الْحَمْدُ", transliteration: "al-hamdu", translation: "praise", reference: "Al-Fatihah 1:2 - Qalqalah on د" },
    ]
  },
  {
    id: "ghunnah",
    title: "Ghunnah (Nasal Sound)",
    arabicTitle: "الغنة",
    description: "The nasal sound produced from the nose when pronouncing ن and م.",
    keyPoints: [
      "Duration: 2 counts",
      "Produced from the nose",
      "Occurs with ن and م",
      "Increased with Idghaam and Ikhfaa"
    ],
    examples: [
      { arabic: "مِنَ النَّاسِ", transliteration: "mina an-nās", translation: "from the people", reference: "Al-Baqarah 2:8 - Ghunnah with Idghaam" },
      { arabic: "إِنَّ", transliteration: "inna", translation: "indeed", reference: "Ghunnah with Shaddah on ن" },
      { arabic: "ثُمَّ", transliteration: "thumma", translation: "then", reference: "Ghunnah with Shaddah on م" },
    ]
  },
  {
    id: "raa-rules",
    title: "Rules of Raa (Heavy & Light)",
    arabicTitle: "أحكام الراء - التفخيم والترقيق",
    description: "Rules for pronouncing the letter Raa (ر) as heavy or light.",
    keyPoints: [
      "Heavy Raa - with Fatha or Damma",
      "Light Raa - with Kasra or after Kasra",
      "Exception: After ي in same word"
    ],
    examples: [
      { arabic: "رَبِّ", transliteration: "rabbi", translation: "my Lord", reference: "Heavy Raa with Fatha" },
      { arabic: "رُسُل", transliteration: "rusul", translation: "messengers", reference: "Heavy Raa with Damma" },
      { arabic: "رِزْق", transliteration: "rizq", translation: "provision", reference: "Light Raa with Kasra" },
      { arabic: "فِرْعَوْن", transliteration: "fir'awn", translation: "Pharaoh", reference: "Light Raa after Kasra" },
    ]
  },
  {
    id: "laam-tajweed",
    title: "Laam in Allah's Name",
    arabicTitle: "لام لفظ الجلالة",
    description: "Rules for pronouncing the Laam in the name of Allah (الله).",
    keyPoints: [
      "Heavy Laam - with Fatha or Damma",
      "Light Laam - with Kasra",
      "Always heavy if preceded by ال (the)"
    ],
    examples: [
      { arabic: "بِسْمِ اللَّهِ", transliteration: "bismillāh", translation: "In the name of Allah", reference: "Al-Fatihah 1:1 - Light Laam" },
      { arabic: "قُلْ هُوَ اللَّهُ", transliteration: "qul huwallāhu", translation: "Say: He is Allah", reference: "Al-Ikhlas 112:1 - Heavy Laam" },
      { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "al-hamdu lillāh", translation: "Praise be to Allah", reference: "Al-Fatihah 1:2 - Light Laam" },
    ]
  },
  {
    id: "sifaat",
    title: "Characteristics of Letters (Sifaat)",
    arabicTitle: "صفات الحروف",
    description: "The inherent qualities that give each Arabic letter its unique sound.",
    keyPoints: [
      "Hams (Whispered) vs Jahr (Voiced)",
      "Shiddah (Intensity) vs Rakhawah (Softness) vs Tawassut (Medium)",
      "Isti'laa (Elevated) vs Istifaal (Lowered)",
      "Itbaaq (Covered) vs Infitaah (Open)",
      "Idhlaaq (Fluent) vs Ismat (Prevented)"
    ],
    examples: [
      { arabic: "صِرَاطَ", transliteration: "sirāTa", translation: "path", reference: "Heavy letters: ص ط" },
      { arabic: "قُرْآن", transliteration: "qur'ān", translation: "Quran", reference: "Heavy letter: ق" },
      { arabic: "فَرْ مُرْ", transliteration: "far mur", translation: "", reference: "Letters of Idhlaaq: ف ر م" },
    ]
  }
];

// Map to actual filenames present in client/public/audio/letters/
// If you change filenames in that folder, update these values to match exactly (without .mp3 extension)
// Map Arabic letters to available audio filenames in /public/audio/letters
// These filenames were verified in the project root public folder.
const letterAudioMap: { [key: string]: string } = {
  "ا": "alif",
  "ب": "baa",
  "ت": "taa",
  "ث": "thaa",
  "ج": "jeem",
  // "ح" is the heavy throat 'haa' (ح). Use the heavy clip if available.
  "ح": "haa_h",
  "خ": "khaa",
  "د": "dal",
  // "ذ" (Dhaal) corresponds to thal.mp3 in the assets
  "ذ": "thal",
  "ر": "raa",
  // "ز" is Zay
  "ز": "zay",
  "س": "seen",
  "ش": "sheen",
  "ص": "saad",
  "ض": "daad",
  // "ط" is the heavy 'Taa' -> use taa_h.mp3
  "ط": "taa_h",
  // "ظ" often pronounced like a heavy 'z' -> zaa.mp3
  "ظ": "zaa",
  // "ع" uses ayn.mp3 in assets
  "ع": "ayn",
  // "غ" uses ghayn.mp3 in assets
  "غ": "ghayn",
  "ف": "faa",
  "ق": "qaaf",
  "ك": "kaaf",
  "ل": "laam",
  "م": "meem",
  "ن": "noon",
  // "ه" is the light 'haa' (ه) -> use haa.mp3
  "ه": "haa",
  // "و" Waaw
  "و": "waaw",
  // "ي" Yaa
  "ي": "yaa",
};

export function QaidahSection() {
  const [selectedLetter, setSelectedLetter] = useState<ArabicLetter | null>(null);
  const [selectedRule, setSelectedRule] = useState<TajweedRule | null>(null);
  const [currentAudioName, setCurrentAudioName] = useState<string | null>(null);
  const [currentAudioError, setCurrentAudioError] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  const playLetterAudio = async (arabicLetter: string) => {
    try {
      // Get the audio filename for this letter
      const audioFilename = letterAudioMap[arabicLetter];
      if (!audioFilename) {
        setCurrentAudioError('Audio unavailable. Falling back to speech.');
        speak(arabicLetter);
        return;
      }

      const audioUrl = `/audio/letters/${audioFilename}.mp3`;

      // Reset previous error and set current audio name
      setCurrentAudioError(null);
      setCurrentAudioName(`${audioFilename}.mp3`);

      // Get or create a single reusable audio element
      let audio = currentAudioRef.current;
      if (!audio) {
        audio = new Audio();
        audio.volume = 1.0;
        audio.preload = 'auto';
        // Central error handler (shows friendly message; benign aborts can happen when switching quickly)
        audio.addEventListener('error', () => {
          if (currentAudioRef.current === audio) {
            const code = audio!.error?.code ?? 0;
            setCurrentAudioError(
              code
                ? `Audio load/play error (code ${code}). If you switched letters quickly, this can be harmless.`
                : `Audio error occurred. If you switched letters quickly, this can be harmless.`
            );
          }
        });
        currentAudioRef.current = audio;
      }

      // If the audio is already playing, pause it first
      if (!audio.paused) {
        audio.pause();
      }

      // Set the new source and play
      audio.src = audioUrl;
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      // Silently ignore common user gesture errors; log others
      const message = (error as Error).message || '';
      if (!message.includes('user gesture') && !message.includes('play()')) {
        console.error('Audio playback error:', error);
      }
      setCurrentAudioError('Could not play audio. Falling back to speech.');
      speak(arabicLetter);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="alphabet" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="alphabet" data-testid="tab-alphabet">
            Arabic Alphabet
          </TabsTrigger>
          <TabsTrigger value="tajweed" data-testid="tab-tajweed">
            Tajweed Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alphabet">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Alif Baa - Learn Arabic Alphabet</span>
                <span className="font-arabic text-2xl">حروف الهجاء</span>
              </CardTitle>
              <CardDescription>
                28 letters of the Arabic alphabet with pronunciation guide. Click on any letter to hear its pronunciation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {arabicAlphabet.map((letter, index) => (
                  <Card
                    key={`${letter.arabic}-${index}`}
                    // Simplify hover/active styles to avoid any chance of z-index overlays
                    // causing visual overlap across grid items
                    className="cursor-pointer transition-all hover:bg-muted/40 active:bg-muted/60"
                    onClick={() => {
                      setSelectedLetter(letter);
                      playLetterAudio(letter.arabic);
                    }}
                    data-testid={`letter-${letter.name.toLowerCase()}-${letter.transliteration.toLowerCase()}`}
                  >
                    <CardContent className="p-4 text-center flex flex-col items-center justify-between gap-4 min-h-[180px]">
                      <div className="text-5xl font-arabic arabic-letter-display mt-2">{letter.arabic}</div>
                      <div className="flex flex-col gap-1 w-full">
                        <div className="text-sm font-semibold break-words px-1">{letter.name}</div>
                        <div className="text-xs text-muted-foreground break-words px-1">{letter.transliteration}</div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Ensure the displayed letter matches the audio being played
                          setSelectedLetter(letter);
                          playLetterAudio(letter.arabic);
                        }}
                        aria-label={`Hear pronunciation of ${letter.name}`}
                        data-testid={`button-speak-${letter.name.toLowerCase()}-${letter.transliteration.toLowerCase()}`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedLetter && (
                <Card className="mt-6 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4">
                      <span className="text-5xl font-arabic arabic-letter-display">{selectedLetter.arabic}</span>
                      <div>
                        <div className="text-xl">{selectedLetter.name}</div>
                        <div className="text-sm text-muted-foreground">{selectedLetter.transliteration}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentAudioName && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Playing audio:</span>
                        <Badge variant="outline">{currentAudioName}</Badge>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium mb-2">Pronunciation:</p>
                      <p className="text-sm text-muted-foreground">{selectedLetter.pronunciation}</p>
                    </div>
                    {currentAudioError && (
                      <div className="text-xs text-red-600">
                        {currentAudioError}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium mb-2">Letter Forms (positions in word):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-arabic arabic-letter-display mb-1">{selectedLetter.position.isolated}</div>
                          <div className="text-xs text-muted-foreground">Isolated</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-arabic arabic-letter-display mb-1">{selectedLetter.position.initial}</div>
                          <div className="text-xs text-muted-foreground">Initial</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-arabic arabic-letter-display mb-1">{selectedLetter.position.medial}</div>
                          <div className="text-xs text-muted-foreground">Medial</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-arabic arabic-letter-display mb-1">{selectedLetter.position.final}</div>
                          <div className="text-xs text-muted-foreground">Final</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tajweed">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Tajweed Rules</span>
                  <span className="font-arabic text-2xl">أحكام التجويد</span>
                </CardTitle>
                <CardDescription>
                  Essential rules for proper Quranic recitation
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {tajweedRules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{rule.title}</span>
                      <span className="font-arabic text-xl">{rule.arabicTitle}</span>
                    </CardTitle>
                    <CardDescription>{rule.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Key Points:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {rule.keyPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Examples:</h4>
                      <div className="space-y-3">
                        {rule.examples.map((example, index) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl font-arabic arabic-letter-display" dir="rtl">{example.arabic}</div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speak(example.arabic);
                                  }}
                                  className="h-8 w-8"
                                  aria-label={`Hear pronunciation of example: ${example.transliteration}`}
                                  data-testid={`button-speak-example-${rule.id}-${index}`}
                                >
                                  <Volume2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="text-sm italic text-muted-foreground mb-1">
                                {example.transliteration}
                              </div>
                            </div>
                            <div className="text-sm italic text-muted-foreground mb-1">
                              {example.transliteration}
                            </div>
                            <div className="text-sm">
                              {example.translation}
                            </div>
                            {example.reference && (
                              <div className="text-xs text-muted-foreground mt-2">
                                Reference: {example.reference}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
