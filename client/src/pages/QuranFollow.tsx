import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { matchAyahText, renderHighlightedWords, type MatchResult } from "@/lib/matcher";
import { createOnDeviceSTT } from "@/lib/stt_vosk";

type Ayah = { surah: number; ayah: number; text: string };
type Timing = { surah: number; ayah: number; startMs: number; endMs: number };
type TranslationAyah = { surah: number; ayah: number; text: string };

export default function QuranFollow() {
  const [surahs, setSurahs] = useState<number[]>([]);
  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<TranslationAyah[]>([]);
  const [timings, setTimings] = useState<Timing[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [reciter, setReciter] = useState<string>("ar.alafasy");
  // Audio URL template, supports {surah3} token (e.g. 001, 114)
  const [audioUrlTemplate, setAudioUrlTemplate] = useState<string>(
    "/api/surah-audio/minshawi_murattal/{surah3}"
  );
  // Current ayah/translation/timing memos must be defined before URL computations
  const currentAyah = useMemo(() => ayahs[currentAyahIndex], [ayahs, currentAyahIndex]);
  const currentTranslation = useMemo(() => translations.find(t => t.ayah === currentAyah?.ayah), [translations, currentAyah]);
  const currentTiming = useMemo(() => timings.find(t => t.ayah === currentAyah?.ayah), [timings, currentAyah]);

  const audioUrl = useMemo(() => {
    const s3 = String(currentSurah).padStart(3, "0");
    return audioUrlTemplate.replace("{surah3}", s3);
  }, [currentSurah, audioUrlTemplate]);
  const [useAyahAudio, setUseAyahAudio] = useState<boolean>(true);
  const ayahAudioUrl = useMemo(() => {
    const a = currentAyah?.ayah ?? 1;
    return `/api/audio/128/${reciter}/${a}.mp3`;
  }, [currentAyah, reciter]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  // Recording state (MediaRecorder -> WEBM)
  const [isRecording, setIsRecording] = useState(false);
  const [recordUrl, setRecordUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [sttCloud, setSttCloud] = useState(false);
  const [sttOnDevice, setSttOnDevice] = useState(true);
  const [liveConfidence, setLiveConfidence] = useState<string>("—");
  const [manualTranscript, setManualTranscript] = useState<string>("");
  const [lastMatchRes, setLastMatchRes] = useState<MatchResult | null>(null);
  const sttControllerRef = useRef<ReturnType<typeof createOnDeviceSTT> | null>(null);

  // Load data files from /public/data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ar, en, tm] = await Promise.all([
          fetch("/data/quran_ar.json").then(r => r.json()),
          fetch("/data/quran_en.json").then(r => r.json()),
          fetch("/data/timings_minshawi.json").then(r => r.json()),
        ]);
        // Expect shape: { surah: number, ayah: number, text }
        setAyahs(ar.filter((a: Ayah) => a.surah === currentSurah));
        setTranslations(en.filter((t: TranslationAyah) => t.surah === currentSurah));
        setTimings(tm.filter((t: Timing) => t.surah === currentSurah));
        setSurahs([...new Set(ar.map((a: Ayah) => a.surah))]);
        setCurrentAyahIndex(0);
      } catch (e) {
        console.error("Failed to load data:", e);
      }
    };
    loadData();
  }, [currentSurah]);

  // (memos moved up)

  // Play/Pause with highlighting using timings
  const play = () => {
    setIsPlaying(true);
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.playbackRate = playSpeed;
    if (useAyahAudio && currentAyah) {
      const playIndex = (idx: number) => {
        const a = ayahs[idx];
        if (!a) { setIsPlaying(false); return; }
        const url = `/api/audio/128/${reciter}/${a.ayah}.mp3`;
        audio.src = url;
        audio.load();
        audio.play().catch(() => {
          // If audio fails, still advance highlighting using timer
          startHighlightTimer();
        });
        audio.onended = () => {
          const next = idx + 1;
          setCurrentAyahIndex(next);
          if (next < ayahs.length) {
            playIndex(next);
          } else {
            setIsPlaying(false);
          }
        };
      };
      playIndex(currentAyahIndex);
    } else {
      // Use full-surah audio template
      audio.onended = () => setIsPlaying(false);
      audio.src = audioUrl;
      audio.load();
      audio.play().catch(() => {
        // No audio available – proceed with simulated highlighting only
      });
      startHighlightTimer();
    }
  };

  const pause = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopHighlightTimer();
  };

  const startHighlightTimer = () => {
    stopHighlightTimer();
    const tick = () => {
      if (!isPlaying) return;
      const nextIndex = currentAyahIndex + 1;
      if (nextIndex < ayahs.length) {
        setCurrentAyahIndex(nextIndex);
      } else {
        pause();
      }
    };
    // Use timing per ayah if available; else 3s per ayah
    const ms = Math.max(500, Math.floor(((currentTiming?.endMs ?? 3000) - (currentTiming?.startMs ?? 0)) / playSpeed));
    highlightTimerRef.current = window.setInterval(tick, ms);
  };

  const stopHighlightTimer = () => {
    if (highlightTimerRef.current) {
      window.clearInterval(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
  };

  // Jump by text command (stub): parse "Yasin 5" or "Surah Yā Sīn ayah 5"
  const jumpByText = (query: string) => {
    try {
      const q = query.trim().toLowerCase();
      const m = q.match(/(\d+)[^\d]+(\d+)/); // naive: surahNumber ayahNumber
      if (m) {
        const s = parseInt(m[1], 10);
        const a = parseInt(m[2], 10);
        setCurrentSurah(s);
        setCurrentAyahIndex(Math.max(0, ayahs.findIndex(x => x.ayah === a)));
        return;
      }
      // TODO: name-based surah parsing (Yasin -> 36)
    } catch {}
  };

  // Mic recording to WEBM
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recordedChunksRef.current = [];
      mr.ondataavailable = e => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordUrl(url);
        setRecordedBlob(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);

      // Start on-device STT if enabled
      if (sttOnDevice) {
        sttControllerRef.current = createOnDeviceSTT((partial) => {
          setManualTranscript(partial);
          if (currentAyah) {
            const res = matchAyahText(currentAyah.text, partial);
            setLastMatchRes(res);
            setLiveConfidence(`${res.accuracy}%`);
          }
        }, { lang: 'ar', interimResults: true, continuous: true });
        if (sttControllerRef.current.isSupported) {
          sttControllerRef.current.start();
        }
      }
    } catch (e) {
      console.error("Recording error:", e);
    }
  };

  const uploadRecording = async () => {
    try {
      if (!recordedBlob) return;
      const res = await fetch('/api/upload-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'audio/webm' },
        body: recordedBlob,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      alert(`Uploaded: ${data.url}`);
    } catch (e) {
      console.error('Upload error:', e);
      alert('Upload failed');
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      // Stop STT if running
      sttControllerRef.current?.stop();
    } catch {}
  };

  const runManualMatch = () => {
    if (!currentAyah) return;
    const res = matchAyahText(currentAyah.text, manualTranscript);
    setLastMatchRes(res);
    setLiveConfidence(`${res.accuracy}%`);
  };

  useEffect(() => {
    return () => {
      stopHighlightTimer();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Qur’an Follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={currentSurah}
              onChange={e => setCurrentSurah(parseInt(e.target.value, 10))}
              className="border rounded px-2 py-1"
            >
              {surahs.map(s => (
                <option key={s} value={s}>Surah {s}</option>
              ))}
            </select>
            <input
              id="searchAyah"
              placeholder="Search (e.g. Yasin 5)"
              className="border rounded px-2 py-1"
              onKeyDown={e => {
                if (e.key === "Enter") jumpByText((e.target as HTMLInputElement).value);
              }}
            />
            <Button onClick={() => {
              const el = document.getElementById("searchAyah") as HTMLInputElement | null;
              if (el?.value) jumpByText(el.value);
            }}>Jump</Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={play}>▶</Button>
            <Button variant="secondary" onClick={pause}>⏸</Button>
            <label className="flex items-center gap-2">Speed
              <input type="range" min={0.8} max={1.2} step={0.05} value={playSpeed}
                     onChange={e => setPlaySpeed(parseFloat(e.target.value))} />
            </label>
            <select value={reciter} onChange={e => setReciter(e.target.value)} className="border rounded px-2 py-1">
              <option value="ar.alafasy">Alafasy</option>
              <option value="ar.husary">Husary</option>
              <option value="ar.minshawi">Minshawi</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm">Audio URL template (use {`{surah3}`} for 3-digit surah number)</label>
            <input
              value={audioUrlTemplate}
              onChange={e => setAudioUrlTemplate(e.target.value)}
              className="border rounded px-2 py-1"
              placeholder="https://download.quranicaudio.com/quran/minshawi_murattal/{surah3}.mp3"
            />
            <div className="text-xs text-muted-foreground break-all">Current URL: {audioUrl}</div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={useAyahAudio} onChange={e => setUseAyahAudio(e.target.checked)} /> Use per-ayah audio (proxy)</label>
            <div className="text-xs text-muted-foreground break-all">Ayah URL: {ayahAudioUrl}</div>
            <audio ref={el => (audioRef.current = el)} src={useAyahAudio ? ayahAudioUrl : audioUrl} controls className="mt-1" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={startRecording} disabled={isRecording}>🎤 Start</Button>
            <Button onClick={stopRecording} disabled={!isRecording}>■ Stop</Button>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sttCloud} onChange={e => setSttCloud(e.target.checked)} /> Use Cloud STT
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sttOnDevice} onChange={e => setSttOnDevice(e.target.checked)} /> On-device STT
            </label>
            <Badge variant="outline">{liveConfidence}</Badge>
          </div>

          {!sttOnDevice && (
            <div className="space-y-2">
              <label className="text-sm">Paste transcript (temporary demo) — Arabic</label>
              <textarea
                className="border rounded px-2 py-1 w-full h-20"
                value={manualTranscript}
                onChange={e => setManualTranscript(e.target.value)}
                placeholder={currentAyah?.text ?? "Paste Arabic transcription here"}
              />
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={runManualMatch}>Analyze</Button>
                {lastMatchRes && (
                  <div className="text-xs text-muted-foreground">Jaccard {Math.round(lastMatchRes.jaccard*100)}% • Accuracy {lastMatchRes.accuracy}%</div>
                )}
              </div>
            </div>
          )}

          {recordUrl && (
            <div className="flex items-center gap-2">
              <audio src={recordUrl} controls />
              <a href={recordUrl} download={`recording_${Date.now()}.webm`} className="text-sm underline">Save WEBM</a>
              <Button variant="outline" onClick={uploadRecording}>Submit</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ayahs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ayahs.map((a, idx) => (
              <div key={`${a.surah}:${a.ayah}`} className={`p-3 rounded border ${idx===currentAyahIndex?"bg-primary/10 border-primary":"bg-muted/30"}`}>
                <div className="text-2xl font-arabic" dir="rtl">
                  {idx === currentAyahIndex && lastMatchRes
                    ? (
                      <span>
                        {renderHighlightedWords(lastMatchRes).map((t, i) => (
                          <span key={i} className={t.ok?"text-green-700":"text-red-700"}>
                            {t.word}{" "}
                          </span>
                        ))}
                      </span>
                    )
                    : a.text}
                </div>
                <div className="text-sm text-muted-foreground">{translations.find(t => t.ayah === a.ayah)?.text ?? ""}</div>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mistakes (coming soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            After recording, on-device STT (Vosk WASM) will transcribe and we’ll match your recitation to the current surah window using normalization + fuzzy match, then highlight differences.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
