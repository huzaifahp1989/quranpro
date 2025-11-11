import { useState, useEffect } from "react";
import { Search, BookOpen, ChevronRight, Play, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Surah } from "@shared/schema";

interface AyahSelectorProps {
  surahs: Surah[];
  onAyahSelect: (surahNumber: number, ayahNumber: number) => void;
  currentSurah?: number;
  currentAyah?: number;
}

interface AyahReference {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  ayahNumber: number;
  totalAyahs: number;
}

export function AyahSelector({ surahs, onAyahSelect, currentSurah, currentAyah }: AyahSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'surahs' | 'ayahs'>('surahs');

  // Filter surahs based on search
  const filteredSurahs = surahs.filter((surah) =>
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.name.includes(searchQuery) ||
    surah.number.toString().includes(searchQuery) ||
    surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate ayah references for selected surah
  const generateAyahReferences = (surah: Surah): AyahReference[] => {
    return Array.from({ length: surah.numberOfAyahs }, (_, index) => ({
      surahNumber: surah.number,
      surahName: surah.name,
      surahEnglishName: surah.englishName,
      ayahNumber: index + 1,
      totalAyahs: surah.numberOfAyahs,
    }));
  };

  const selectedSurahData = surahs.find(s => s.number === selectedSurah);
  const ayahReferences = selectedSurahData ? generateAyahReferences(selectedSurahData) : [];

  // Filter ayahs based on search
  const filteredAyahs = ayahReferences.filter((ayah) =>
    ayah.ayahNumber.toString().includes(searchQuery)
  );

  const handleSurahClick = (surah: Surah) => {
    setSelectedSurah(surah.number);
    setViewMode('ayahs');
    setSearchQuery("");
  };

  const handleAyahClick = (ayahRef: AyahReference) => {
    onAyahSelect(ayahRef.surahNumber, ayahRef.ayahNumber);
    setIsOpen(false);
    setViewMode('surahs');
    setSelectedSurah(null);
    setSearchQuery("");
  };

  const handleBackToSurahs = () => {
    setViewMode('surahs');
    setSelectedSurah(null);
    setSearchQuery("");
  };

  const getCurrentLocationText = () => {
    if (currentSurah && currentAyah) {
      const surah = surahs.find(s => s.number === currentSurah);
      if (surah) {
        return `${surah.englishName} ${currentAyah}:${surah.numberOfAyahs}`;
      }
    }
    return "Select Ayah";
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setViewMode('surahs');
      setSelectedSurah(null);
      setSearchQuery("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 min-w-[200px] justify-start"
          data-testid="ayah-selector-trigger"
        >
          <MapPin className="w-4 h-4" />
          <span className="truncate">{getCurrentLocationText()}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {viewMode === 'surahs' ? 'Select Surah' : `Select Ayah from ${selectedSurahData?.englishName}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2">
            {viewMode === 'ayahs' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSurahs}
                className="gap-1"
              >
                ← Back to Surahs
              </Button>
            )}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={viewMode === 'surahs' ? "Search surahs..." : "Search ayah number..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 pb-6">
          {viewMode === 'surahs' ? (
            <div className="space-y-2">
              {filteredSurahs.map((surah) => (
                <Card 
                  key={surah.number} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    currentSurah === surah.number ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSurahClick(surah)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="min-w-[2.5rem] justify-center">
                          {surah.number}
                        </Badge>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-arabic text-lg">{surah.name}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-medium">{surah.englishName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{surah.englishNameTranslation}</span>
                            <span>•</span>
                            <span>{surah.numberOfAyahs} verses</span>
                            <span>•</span>
                            <span>{surah.revelationType}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredSurahs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No surahs found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {selectedSurahData && (
                <Card className="mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Badge variant="secondary">{selectedSurahData.number}</Badge>
                      <span className="font-arabic">{selectedSurahData.name}</span>
                      <span>•</span>
                      <span>{selectedSurahData.englishName}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedSurahData.englishNameTranslation} • {selectedSurahData.numberOfAyahs} verses
                    </p>
                  </CardHeader>
                </Card>
              )}
              
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {filteredAyahs.map((ayahRef) => (
                  <Button
                    key={`${ayahRef.surahNumber}-${ayahRef.ayahNumber}`}
                    variant={
                      currentSurah === ayahRef.surahNumber && currentAyah === ayahRef.ayahNumber
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="aspect-square p-0 text-sm"
                    onClick={() => handleAyahClick(ayahRef)}
                  >
                    {ayahRef.ayahNumber}
                  </Button>
                ))}
              </div>
              
              {filteredAyahs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No ayahs found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}