import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Volume2, Search, BookOpen } from "lucide-react";
import axios from "axios";

type SearchResult = {
  text: string;
  surah: { number: number; name: string; englishName: string };
  ayah: { number: number; numberInSurah: number };
};

export default function Transcribe() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [matches, setMatches] = useState<SearchResult[]>([]);
  const [enMatches, setEnMatches] = useState<SearchResult[]>([]);
  const [details, setDetails] = useState<Record<number, any>>({});
  const [tafseer, setTafseer] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const [contextMode, setContextMode] = useState<'ayah' | 'snippet' | 'surah'>('snippet');
  const [contexts, setContexts] = useState<Record<string, any[]>>({});
  const [reciter, setReciter] = useState('ar.alafasy');
  const [autoSearch, setAutoSearch] = useState(true);
  const normalize = (s: string) => s.replace(/[\u064B-\u0652]/g, '').trim();
  const tokens = normalize(transcript).split(/\s+/).filter(t => t.length > 1);
  const highlightArabic = (text: string) => {
    const t = normalize(text);
    if (tokens.length === 0) return <span>{text}</span>;
    let parts: Array<{str: string; match: boolean}> = [{ str: t, match: false }];
    tokens.forEach(tok => {
      const next: Array<{str: string; match: boolean}> = [];
      parts.forEach(p => {
        if (!p.match) {
          const split = p.str.split(new RegExp(`(${tok})`, 'g'));
          for (let i = 0; i < split.length; i++) {
            const s = split[i];
            if (s === tok) next.push({ str: s, match: true });
            else if (s) next.push({ str: s, match: false });
          }
        } else {
          next.push(p);
        }
      });
      parts = next;
    });
    return (
      <span>
        {parts.map((p, i) => p.match ? <mark key={i} className="px-0.5 rounded bg-secondary/60">{p.str}</mark> : <span key={i}>{p.str}</span>)}
      </span>
    );
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = "ar-SA";
      recog.interimResults = true;
      recog.continuous = true;
      recog.onresult = (event: any) => {
        let t = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          t += event.results[i][0].transcript;
        }
        setTranscript(t.trim());
        try {
          const isFinal = Array.from(event.results).some((r: any) => r.isFinal);
          if (isFinal || (t && t.length > 5)) {
            if (autoSearch) {
              performSearch();
            }
          }
        } catch {}
      };
      recog.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recog;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      setMatches([]);
      setAudioUrl(null);
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const performSearch = async () => {
    const q = transcript.trim();
    if (!q) return;
    setIsSearching(true);
    try {
      const { data } = await axios.get<{ results: SearchResult[] }>(`/api/search`, { params: { q } });
      setMatches(data.results || []);
      const en = await axios.get<{ results: any[] }>(`/api/search/en`, { params: { q } });
      setEnMatches((en.data.results || []).map((r: any) => ({
        text: r.englishText,
        surah: r.surah,
        ayah: r.ayah,
      })));
      const uniqueAyahs = new Set<number>();
      [...(data.results||[]), ...((en.data.results||[]).map((r:any)=>({text:r.englishText, surah:r.surah, ayah:r.ayah})))].forEach((m:any)=>{
        if (m?.ayah?.number) uniqueAyahs.add(m.ayah.number);
      });
      for (const num of uniqueAyahs) {
        try {
          const d = await axios.get(`/api/ayah/${num}`);
          setDetails(prev => ({ ...prev, [num]: d.data }));
        } catch {}
      }
      const top = (data.results && data.results[0]) || (en.data.results && en.data.results[0]) || null;
      if (top && top.ayah?.number) {
        const surahNum = top.surah?.number;
        const ayahInSurah = top.ayah?.numberInSurah;
        if (surahNum && ayahInSurah) {
          try { await fetchContext(surahNum, ayahInSurah); } catch {}
          try { await fetchMeaning(surahNum, ayahInSurah); } catch {}
        }
      }
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!autoSearch) return;
    const q = transcript.trim();
    if (!q) return;
    const t = setTimeout(() => {
      performSearch();
    }, 1200);
    return () => clearTimeout(t);
  }, [transcript, autoSearch]);

  const playAyahAudio = (ayahGlobalNumber: number) => {
    const url = `/api/audio/128/ar.alafasy/${ayahGlobalNumber}.mp3`;
    setAudioUrl(url);
    const audio = new Audio(url);
    audio.play();
  };

  const fetchContext = async (surahNum: number, ayahInSurah: number) => {
    const key = `${surahNum}:${ayahInSurah}:${contextMode}`;
    if (contexts[key]) return;
    const { data } = await axios.get(`/api/surah/${surahNum}/${reciter}`);
    let verses: any[] = data;
    if (contextMode === 'snippet') {
      const idx = verses.findIndex((v: any) => v.ayah?.numberInSurah === ayahInSurah);
      const start = Math.max(0, idx - 2);
      const end = Math.min(verses.length, idx + 3);
      verses = verses.slice(start, end);
    } else if (contextMode === 'ayah') {
      verses = verses.filter((v: any) => v.ayah?.numberInSurah === ayahInSurah);
    }
    setContexts(prev => ({ ...prev, [key]: verses }));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transcribe Recitation</span>
              <span className="font-arabic text-2xl">تسجيل التلاوة</span>
            </CardTitle>
            <CardDescription>Listen to a recitation and find matching ayahs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Button onClick={() => setContextMode('ayah')} variant={contextMode==='ayah'?'default':'outline'}>Ayah</Button>
              <Button onClick={() => setContextMode('snippet')} variant={contextMode==='snippet'?'default':'outline'}>Snippet</Button>
              <Button onClick={() => setContextMode('surah')} variant={contextMode==='surah'?'default':'outline'}>Whole Surah</Button>
              <Button onClick={() => setAutoSearch(!autoSearch)} variant={autoSearch?'secondary':'outline'} data-testid="toggle-auto-search">
                {autoSearch ? 'Auto Search: On' : 'Auto Search: Off'}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={startListening} disabled={isListening} data-testid="button-start-listening" className="gap-2">
                <Mic className="w-4 h-4" />
                Start Listening
              </Button>
              <Button onClick={stopListening} disabled={!isListening} variant="outline" data-testid="button-stop-listening" className="gap-2">
                <Square className="w-4 h-4" />
                Stop
              </Button>
              <Button onClick={performSearch} disabled={!transcript || isSearching} variant="secondary" data-testid="button-search-transcript" className="gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>

            <div className="p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Transcript</div>
              <div className="text-lg font-arabic arabic-letter-display" dir="rtl">{transcript || '...'}</div>
            </div>

            {audioUrl && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Playing:</span>
                <Badge variant="outline">{audioUrl}</Badge>
                <Volume2 className="w-4 h-4" />
              </div>
            )}

            <div className="space-y-3">
              {matches.length > 0 ? (
                [...matches, ...enMatches].slice(0, 8).map((m, idx) => {
                  const d = m.ayah?.number ? details[m.ayah.number] : null;
                  const arabic = d?.ayah?.text || null;
                  const english = d?.englishTranslation?.text || m.text;
                  const surahNum = d?.ayah?.surah?.number || m.surah.number;
                  const ayahInSurah = d?.ayah?.numberInSurah || m.ayah.numberInSurah;
                  const audioNum = d?.ayah?.number || m.ayah.number;
                  const tafKey = `${surahNum}:${ayahInSurah}`;
                  const ctxKey = `${surahNum}:${ayahInSurah}:${contextMode}`;
                  return (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold">{m.surah.englishName} • Ayah {ayahInSurah}</div>
                        <div className="text-sm text-muted-foreground">Surah {surahNum} • {m.surah.name}{d?.ayah?.juzNumber ? ` • Juz ${d.ayah.juzNumber}` : ''}{d?.ayah?.pageNumber ? ` • Page ${d.ayah.pageNumber}` : ''}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => playAyahAudio(audioNum)} data-testid={`button-play-match-${idx}`}>
                          Play
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => fetchMeaning(surahNum, ayahInSurah)} data-testid={`button-meaning-${idx}`} className="gap-1">
                          <BookOpen className="w-4 h-4" /> Meaning
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => fetchContext(surahNum, ayahInSurah)} data-testid={`button-context-${idx}`}>
                          Show {contextMode === 'surah' ? 'Surah' : contextMode === 'snippet' ? 'Snippet' : 'Ayah'}
                        </Button>
                      </div>
                    </div>
                    {arabic && (
                      <div className="text-2xl font-arabic arabic-letter-display" dir="rtl">{highlightArabic(arabic)}</div>
                    )}
                    {english && (
                      <div className="text-sm mt-2">{english}</div>
                    )}
                    {tafseer[tafKey] && (
                      <div className="text-sm mt-3 p-2 border rounded">
                        {tafseer[tafKey]}
                      </div>
                    )}
                    {contexts[ctxKey] && contexts[ctxKey].length > 0 && (
                      <div className="mt-3 space-y-2">
                        {contexts[ctxKey].map((v: any) => (
                          <div key={v.ayah?.number} className="p-2 rounded border">
                            <div className="text-xs text-muted-foreground">{v.ayah?.surah?.englishName} • Ayah {v.ayah?.numberInSurah}</div>
                            <div className="text-xl font-arabic arabic-letter-display" dir="rtl">{v.ayah?.text}</div>
                            <div className="text-sm mt-1">{v.englishTranslation?.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )})
              ) : (
                <div className="text-sm text-muted-foreground">No matches yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
  const fetchMeaning = async (surahNum: number, ayahInSurah: number) => {
    try {
      const { data } = await axios.get(`/api/tafseer/maarif/${surahNum}/${ayahInSurah}`);
      const key = `${surahNum}:${ayahInSurah}`;
      setTafseer(prev => ({ ...prev, [key]: data.text || '' }));
    } catch {}
  };
