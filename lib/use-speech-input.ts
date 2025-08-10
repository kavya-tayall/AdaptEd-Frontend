// lib/use-speech-input.ts
"use client";

import { useEffect, useRef, useState } from "react";

type Opts = {
  lang?: string;
  interim?: boolean;
  onResult?: (text: string) => void;
  onError?: (e: string) => void;
};

export function useSpeechInput(opts: Opts = {}) {
  const { lang = "en-US", interim = false, onResult, onError } = opts;
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = interim;
    rec.continuous = true;

    rec.onresult = (ev: any) => {
      let final = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) final += ev.results[i][0].transcript;
      }
      if (final && onResult) onResult(final.trim());
    };
    rec.onerror = (e: any) => onError?.(e?.error ?? "speech-error");
    rec.onend = () => setListening(false);

    recRef.current = rec;
    return () => rec && rec.stop();
  }, [lang, interim, onResult, onError]);

  const start = () => {
    if (!recRef.current) return;
    try {
      recRef.current.start();
      setListening(true);
    } catch {}
  };
  const stop = () => {
    if (!recRef.current) return;
    try {
      recRef.current.stop();
    } catch {}
  };

  return { listening, start, stop, supported };
}
