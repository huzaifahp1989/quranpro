// Simple on-device STT using Web Speech API as a fallback to Vosk WASM
// This provides a unified interface for starting/stopping recognition and
// streaming partial transcripts to a callback.

export type STTOptions = {
  lang?: string; // e.g. 'ar' or 'ar-SA'
  interimResults?: boolean;
  continuous?: boolean;
};

export type STTController = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  isSupported: boolean;
};

export function createOnDeviceSTT(
  onPartial: (text: string) => void,
  opts: STTOptions = { lang: 'ar', interimResults: true, continuous: true }
): STTController {
  const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  let recognition: any = null;

  const isSupported = !!SR;
  if (isSupported) {
    recognition = new SR();
    recognition.lang = opts.lang || 'ar';
    recognition.interimResults = opts.interimResults ?? true;
    recognition.continuous = opts.continuous ?? true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      // Aggregate interim results
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        transcript += res[0]?.transcript || '';
      }
      if (transcript) onPartial(transcript.trim());
    };

    recognition.onerror = (e: any) => {
      console.warn('STT error:', e);
    };

    recognition.onend = () => {
      // Auto-restart if continuous
      if (opts.continuous) {
        try { recognition.start(); } catch {}
      }
    };
  }

  return {
    isSupported,
    async start() {
      if (!recognition) return;
      try { recognition.start(); } catch {}
    },
    async stop() {
      if (!recognition) return;
      try { recognition.stop(); } catch {}
    },
  };
}

