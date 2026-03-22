import { useState } from "react";
import { Difficulties } from "./game";
import { useAudio } from "@/utils/audio";
import { Engine } from "./useGameEngine";

export type GameSettings = {
  soundsEnabled: boolean;
  musicEnabled: boolean;
  showTimer: boolean;
  showFlagsLeft: boolean;
  soundsVolume: number;
  musicVolume: number;
  difficulty: Difficulties;
  showHotkeys: boolean;
};

export type GameSettingsHook = ReturnType<typeof useGameSettings>;
export const useGameSettings = (game: Engine) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modeListOpen, setModeListOpen] = useState(false);
  const [modeInfoOpen, setModeInfoOpen] = useState(false);
  const [showFlagsLeft, setShowFlagsLeft] = useState(true);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [showTimer, setShowTimer] = useState(true);

  const {
    soundsEnabled,
    musicEnabled,
    toggleSounds,
    toggleMusic,
    setMusicVolume,
    setSoundsVolume,
    musicVolume,
    soundsVolume,
  } = useAudio();

  const handleChangeSettings = (settings: GameSettings) => {
    setMusicVolume(settings.musicVolume);
    setSoundsVolume(settings.soundsVolume);
    setShowFlagsLeft(settings.showFlagsLeft);
    setShowHotkeys(settings.showHotkeys);
    setShowTimer(settings.showTimer);

    if (soundsEnabled != settings.soundsEnabled) toggleSounds();
    if (musicEnabled != settings.musicEnabled) toggleMusic();
  };

  return {
    difficulty: game.state.difficulty,

    soundsEnabled,
    musicEnabled,
    soundsVolume,
    musicVolume,

    showTimer,
    showHotkeys,
    showFlagsLeft,
    settingsOpen,
    modeInfoOpen,
    modeListOpen,

    setShowTimer,
    setShowHotkeys,
    setShowFlagsLeft,
    setSettingsOpen,
    setModeInfoOpen,
    setModeListOpen,
    handleChangeSettings,
  };
};
