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
  const askedRef = useRef<boolean>(false);
  const emittedRef = useRef<string>("");
  const onResultRef = useRef<typeof onResult>();
  const onErrorRef = useRef<typeof onError>();

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = interim;
    rec.continuous = true;

    rec.onresult = (ev: any) => {
      // Build full transcript (final + interim) for delta emission
      let full = "";
      for (let i = 0; i < ev.results.length; i++) {
        full += ev.results[i][0].transcript;
      }
      const prev = emittedRef.current || "";
      const delta = full.slice(prev.length);
      if (delta && onResultRef.current) onResultRef.current(delta);
      // Always advance the baseline to avoid duplicating interims
      emittedRef.current = full;
    };
    rec.onerror = (e: any) => onErrorRef.current?.(e?.error ?? "speech-error");
    rec.onend = () => { setListening(false); emittedRef.current = ""; };

    recRef.current = rec;
    return () => {
      try { rec.onresult = null; rec.onend = null; rec.onerror = null; rec.stop(); } catch {}
      if (recRef.current === rec) recRef.current = null;
    };
  }, [lang, interim]);

  const start = () => {
    const ensurePermission = async () => {
      if (askedRef.current) return;
      askedRef.current = true;
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch (e: any) {
        onErrorRef.current?.("mic-permission-denied");
      }
    };
    ensurePermission().finally(() => {
      if (!recRef.current) {
        onErrorRef.current?.("speech-not-supported");
        return;
      }
      try {
        emittedRef.current = "";
        recRef.current.start();
        setListening(true);
      } catch {}
    });
  };
  const stop = () => {
    if (!recRef.current) return;
    try {
      recRef.current.abort ? recRef.current.abort() : recRef.current.stop();
      setListening(false);
    } catch {}
  };

  return { listening, start, stop, supported };
}
