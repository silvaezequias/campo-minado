"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Howl } from "howler";

const musicList = [
  "/music/01.mp3",
  "/music/02.mp3",
  "/music/04.mp3",
  "/music/05.mp3",
  "/music/06.mp3",
  "/music/07.mp3",
  "/music/08.mp3",
  "/music/09.mp3",
  "/music/10.mp3",
];

const soundsList = {
  explosion: "/sounds/explosion.wav",
  hover: "/sounds/hover.wav",
  lose: "/sounds/lose.wav",
  place_flag: "/sounds/place_flag.wav",
  remove_flag: "/sounds/remove_flag.wav",
  win: "/sounds/win.wav",
  win_voices: "/sounds/win_voices.wav",
  open: "/sounds/open.wav",
  switch: "/sounds/switch.wav",
  wrong_move: "/sounds/wrong_move.wav",
};

type SoundKey = keyof typeof soundsList;

class AudioManager {
  private musicList: string[];
  private sounds = new Map<SoundKey, Howl>();
  private music: Howl | null = null;
  private shuffledList: number[] = [];
  private currentIndex = 0;

  public soundsEnabled = true;
  public musicEnabled = true;
  public soundsVolume = 0.2;
  public musicVolume = 0.02;

  constructor(musicList: string[], soundsList: Record<string, string>) {
    this.musicList = musicList;

    Object.entries(soundsList).forEach(([key, src]) => {
      this.sounds.set(
        key as SoundKey,
        new Howl({
          src: [src],
          preload: true,
          volume: this.soundsVolume,
          html5: false, // Força Web Audio API -> Latência zero + Não pausa Spotify
        }),
      );
    });
  }

  private shuffle() {
    const array = [...Array(this.musicList.length).keys()];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    this.shuffledList = array;
    this.currentIndex = 0;
  }

  setSoundEnabled(value: boolean) {
    this.soundsEnabled = value;
    // Se desativar sons, silencia os que estão tocando
    this.sounds.forEach((sound) => sound.mute(!value));
  }

  setMusicEnabled(value: boolean) {
    this.musicEnabled = value;
    if (!value) this.stopMusic();
    else if (!this.music || !this.music.playing()) this.playMusic();
  }

  playMusic() {
    if (!this.musicEnabled) return;

    if (!this.music) {
      if (this.shuffledList.length === 0) this.shuffle();
      const index = this.shuffledList[this.currentIndex];

      this.music = new Howl({
        src: [this.musicList[index]],
        volume: this.musicVolume,
        html5: true, // Streaming para arquivos longos
        onend: () => this.nextMusic(),
      });
    }

    if (!this.music.playing()) {
      this.music.play();
    }
  }

  nextMusic() {
    if (this.music) {
      this.music.stop();
      this.music.unload(); // Limpa memória da música anterior
    }

    this.currentIndex++;
    if (this.currentIndex >= this.shuffledList.length) this.shuffle();

    const index = this.shuffledList[this.currentIndex];
    this.music = new Howl({
      src: [this.musicList[index]],
      volume: this.musicVolume,
      html5: true,
      onend: () => this.nextMusic(),
    });

    this.music.play();
  }

  stopMusic() {
    if (this.music) this.music.pause();
  }

  playSound(key: SoundKey, rate = 1) {
    if (!this.soundsEnabled) return;

    const sound = this.sounds.get(key);
    if (!sound) return;

    sound.rate(rate);
    sound.volume(this.soundsVolume);
    sound.play();
  }

  setSoundsVolume(volume: number) {
    this.soundsVolume = volume;
    this.sounds.forEach((s) => s.volume(volume));
  }

  setMusicVolume(volume: number) {
    this.musicVolume = volume;
    if (this.music) this.music.volume(volume);
  }
}
let audioManager: AudioManager | null = null;

function getAudioManager() {
  if (typeof window === "undefined") return null;

  if (!audioManager) {
    audioManager = new AudioManager(musicList, soundsList);
  }

  return audioManager;
}

type AudioContextType = {
  soundsEnabled: boolean;
  musicEnabled: boolean;

  soundsVolume: number;
  musicVolume: number;

  toggleSounds: () => void;
  toggleMusic: () => void;
  setMusicEnabled: (bool: boolean) => void;

  setSoundsVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;

  playSound: (key: SoundKey, rate?: number) => void;
  playMusic: () => void;
  stopMusic: () => void;
};

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [soundsEnabled, setSoundsEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("soundsEnabled") !== "false";
  });

  const [musicEnabled, setMusicEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("musicEnabled") !== "false";
  });

  const [soundsVolume, setSoundsVolume] = useState(() => {
    if (typeof window === "undefined") return 0.2;
    return +(localStorage.getItem("soundsVolume") || "0.2") || 0.2;
  });

  const [musicVolume, setMusicVolume] = useState(() => {
    if (typeof window === "undefined") return 0.02;
    return +(localStorage.getItem("musicVolume") || "0.02") || 0.02;
  });

  useEffect(() => {
    localStorage.setItem("soundsVolume", String(soundsVolume));
  }, [soundsVolume]);

  useEffect(() => {
    localStorage.setItem("musicVolume", String(musicVolume));
  }, [musicVolume]);

  useEffect(() => {
    getAudioManager()?.setSoundEnabled(soundsEnabled);
    localStorage.setItem("soundsEnabled", String(soundsEnabled));
  }, [soundsEnabled]);

  useEffect(() => {
    getAudioManager()?.setMusicEnabled(musicEnabled);
    localStorage.setItem("musicEnabled", String(musicEnabled));
  }, [musicEnabled]);

  const value = useMemo(
    () => ({
      soundsEnabled,
      musicEnabled,

      soundsVolume,
      musicVolume,
      setSoundsVolume: (volume: number) => {
        setSoundsVolume(volume);
        getAudioManager()?.setSoundsVolume(volume);
      },
      setMusicVolume: (volume: number) => {
        setMusicVolume(volume);
        getAudioManager()?.setMusicVolume(volume);
      },
      toggleSounds: () => setSoundsEnabled((p) => !p),
      toggleMusic: () => setMusicEnabled((p) => !p),
      setMusicEnabled: (bool: boolean) => setMusicEnabled(bool),

      stopMusic: () => {
        getAudioManager()?.stopMusic();
      },
      playSound: (key: SoundKey, rate = 1) => {
        getAudioManager()?.setSoundsVolume(soundsVolume);
        getAudioManager()?.playSound(key, rate);
      },

      playMusic: () => {
        getAudioManager()?.setMusicVolume(musicVolume);
        getAudioManager()?.playMusic();
      },
    }),
    [soundsEnabled, musicEnabled, musicVolume, soundsVolume],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}

let lastHoverTime = 0;
let lastOpenTime = 0;

export function createAudioHelpers(playSound: AudioContextType["playSound"]) {
  function playHoverSound() {
    const now = Date.now();

    if (now - lastHoverTime < 80) return;
    lastHoverTime = now;

    const rate = 1.05 + Math.random() * 0.1;

    playSound("hover", rate);
  }

  function playOpenSound() {
    const now = Date.now();

    if (now - lastOpenTime < 60) return;
    lastOpenTime = now;

    const rate = 0.95 + Math.random() * 0.1;

    playSound("open", rate);
  }

  return {
    playHoverSound,
    playOpenSound,
  };
}

export function useAudioHelpers() {
  const { playSound } = useAudio();

  return useMemo(() => {
    return createAudioHelpers(playSound);
  }, [playSound]);
}
