import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, BookOpen, MapPin } from "lucide-react";
import { Surah } from "@shared/schema";

// Juz (Para) data with starting surah and ayah numbers
const juzData = [
  { number: 1, name: "Alif Lam Meem", arabicName: "الم", startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { number: 2, name: "Sayaqool", arabicName: "سيقول", startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { number: 3, name: "Tilka Rusul", arabicName: "تلك الرسل", startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { number: 4, name: "Lan Tanaloo", arabicName: "لن تنالوا", startSurah: 3, startAyah: 92, endSurah: 4, endAyah: 23 },
  { number: 5, name: "Wal Mohsanat", arabicName: "والمحصنات", startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { number: 6, name: "La Yuhibbullah", arabicName: "لا يحب الله", startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 82 },
  { number: 7, name: "Wa Iza Samiu", arabicName: "وإذا سمعوا", startSurah: 5, startAyah: 83, endSurah: 6, endAyah: 110 },
  { number: 8, name: "Wa Lau Annana", arabicName: "ولو أننا", startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { number: 9, name: "Qal al-Mala", arabicName: "قال الملأ", startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { number: 10, name: "Wa A'lamu", arabicName: "واعلموا", startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { number: 11, name: "Ya'tadhiroona", arabicName: "يعتذرون", startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { number: 12, name: "Wa Ma Min Dabbah", arabicName: "وما من دابة", startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { number: 13, name: "Wa Ma Ubrioo", arabicName: "وما أبرئ", startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { number: 14, name: "Rubama", arabicName: "ربما", startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { number: 15, name: "Subhan Allazi", arabicName: "سبحان الذي", startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { number: 16, name: "Qal Alam", arabicName: "قال ألم", startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { number: 17, name: "Iqtaraba", arabicName: "اقترب", startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { number: 18, name: "Qad Aflaha", arabicName: "قد أفلح", startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { number: 19, name: "Wa Qal Allazina", arabicName: "وقال الذين", startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { number: 20, name: "A'man Khalaq", arabicName: "أمن خلق", startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { number: 21, name: "Utlu Ma Uhiya", arabicName: "اتل ما أوحي", startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { number: 22, name: "Wa Man Yaqnut", arabicName: "ومن يقنت", startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { number: 23, name: "Wa Mali", arabicName: "وما لي", startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { number: 24, name: "Fa Man Azlam", arabicName: "فمن أظلم", startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { number: 25, name: "Ilayhi Yuraddu", arabicName: "إليه يرد", startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { number: 26, name: "Ha'a Meem", arabicName: "حم", startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { number: 27, name: "Qala Fa Ma Khatbukum", arabicName: "قال فما خطبكم", startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { number: 28, name: "Qad Sami Allah", arabicName: "قد سمع الله", startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { number: 29, name: "Tabarak Allazi", arabicName: "تبارك الذي", startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { number: 30, name: "Amma Yatasa'aloon", arabicName: "عم يتساءلون", startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 }
];

interface JuzSelectorProps {
  surahs: Surah[];
  // Pass juzNumber explicitly to avoid relying on async /api/juz-index lookup in parent
  onJuzSelect: (surahNumber: number, ayahNumber: number, juzNumber: number) => void;
  currentSurah: number;
  currentAyah: number;
}

export function JuzSelector({ surahs, onJuzSelect, currentSurah, currentAyah }: JuzSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Find current Juz based on current surah and ayah
  const getCurrentJuz = () => {
    return juzData.find(juz => {
      if (currentSurah < juz.startSurah || currentSurah > juz.endSurah) {
        return false;
      }
      if (currentSurah === juz.startSurah && currentAyah < juz.startAyah) {
        return false;
      }
      if (currentSurah === juz.endSurah && currentAyah > juz.endAyah) {
        return false;
      }
      return true;
    });
  };

  // Load accurate Juz boundaries from server (computed from juz_map.json)
  const { data: juzIndex } = useQuery<{ number: number; startSurah: number; startAyah: number; endSurah: number; endAyah: number; }[]>({
    queryKey: ['/api/juz-index'],
  });

  // Overlay server boundaries onto local names
  const effectiveJuzs = juzData.map((j) => {
    const remote = juzIndex?.find(x => x.number === j.number);
    return {
      ...j,
      startSurah: remote?.startSurah ?? j.startSurah,
      startAyah: remote?.startAyah ?? j.startAyah,
      endSurah: remote?.endSurah ?? j.endSurah,
      endAyah: remote?.endAyah ?? j.endAyah,
    };
  });

  const currentJuz = (function getCurrentJuz() {
    return effectiveJuzs.find(juz => {
      if (currentSurah < juz.startSurah || currentSurah > juz.endSurah) {
        return false;
      }
      if (currentSurah === juz.startSurah && currentAyah < juz.startAyah) {
        return false;
      }
      if (currentSurah === juz.endSurah && currentAyah > juz.endAyah) {
        return false;
      }
      return true;
    });
  })();

  // Filter Juz based on search query
  const filteredJuzs = effectiveJuzs.filter(juz =>
    juz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    juz.arabicName.includes(searchQuery) ||
    juz.number.toString().includes(searchQuery)
  );

  const handleJuzSelect = (juz: typeof effectiveJuzs[0]) => {
    onJuzSelect(juz.startSurah, juz.startAyah, juz.number);
    setIsOpen(false);
  };

  const getSurahName = (surahNumber: number) => {
    const surah = surahs.find(s => s.number === surahNumber);
    return surah ? surah.englishName : `Surah ${surahNumber}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 min-w-[140px] justify-start"
          data-testid="button-juz-selector"
        >
          <MapPin className="w-4 h-4" />
          <div className="flex flex-col items-start">
            <span className="text-xs text-muted-foreground">Para</span>
            <span className="font-medium">
              {currentJuz ? `${currentJuz.number} - ${currentJuz.name}` : "Select Para"}
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Select Juz (Para)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Juz by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Juz List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredJuzs.map((juz) => (
                <Button
                  key={juz.number}
                  variant={currentJuz?.number === juz.number ? "default" : "ghost"}
                  className="w-full justify-start p-4 h-auto"
                  onClick={() => handleJuzSelect(juz)}
                >
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold">Para {juz.number}</span>
                      <span className="text-xs text-muted-foreground">
                        {getSurahName(juz.startSurah)} {juz.startAyah}
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{juz.name}</span>
                      <span className="font-arabic text-sm text-muted-foreground">
                        {juz.arabicName}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Starts: {getSurahName(juz.startSurah)} {juz.startAyah} • 
                      Ends: {getSurahName(juz.endSurah)} {juz.endAyah}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
