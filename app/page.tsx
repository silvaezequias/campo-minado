"use client";

import React, { useCallback, useEffect } from "react";
import { ArrowRight, Flag, RotateCcw, Shovel, LucideIcon } from "lucide-react";

import { Actions, Difficulties } from "@/game/game";
import { Modes, toggleMode } from "@/game/mode";
import { Engine, useGameEngine } from "@/game/useGameEngine";
import { useGameSettings } from "@/game/useGameSettings";
import { useAudio } from "@/utils/audio";

import { Board } from "@/components/Board";
import { Button as BaseButton } from "@/components/Button";
import { Header } from "@/components/Header";

interface SubComponentProps {
  game: Engine;
}

const StartGame: React.FC<SubComponentProps> = ({ game }) => {
  const { playMusic, stopMusic } = useAudio();
  const { dispatch } = game;

  useEffect(() => {
    stopMusic();
  }, [stopMusic]);

  const handleStart = (difficulty: Difficulties) => {
    dispatch({ type: Actions.ChangeDifficulty, payload: { difficulty } });
    playMusic();
  };

  const difficultyOptions: {
    label: string;
    value: Difficulties;
    variant: "success" | "primary" | "danger";
  }[] = [
    { label: "Fácil", value: "easy", variant: "success" },
    { label: "Médio", value: "medium", variant: "primary" },
    { label: "Difícil", value: "hard", variant: "danger" },
  ];

  return (
    <div className="bg-[#1A1A1A] p-10 border aspect-square border-zinc-800 rounded-xl flex flex-col justify-center items-center gap-10">
      <h3 className="text-amber-300 font-bold text-xl sm:text-3xl text-center">
        Escolha uma dificuldade para começar o jogo
      </h3>
      <div className="flex gap-5 flex-wrap justify-center">
        {difficultyOptions.map((opt) => (
          <BaseButton
            key={opt.value}
            className="text-xl md:text-2xl w-full md:w-fit"
            variant={opt.variant}
            onClick={() => handleStart(opt.value)}
          >
            {opt.label}
          </BaseButton>
        ))}
      </div>
    </div>
  );
};

const GameControls: React.FC<SubComponentProps & { showHotkeys: boolean }> = ({
  game,
  showHotkeys,
}) => {
  const { state, dispatch } = game;
  const { currentState, isFlagMode, settings, difficulty, flagsEnabled } =
    state;

  const nextDifficulty: Record<Difficulties, Difficulties> = {
    easy: "medium",
    medium: "hard",
    hard: "easy",
  };

  const buttonMessage = {
    easy: "Ir para nível Médio",
    medium: "Ir para nível Difícil",
    hard: "Você é fera!",
    retry: (
      <>
        Recomeçar{" "}
        {showHotkeys && <span className="hidden md:inline-block">(r)</span>}
      </>
    ),
  };

  if (currentState === "LOST" || currentState === "WON") {
    const isWon = currentState === "WON";
    return (
      <div className="flex flex-col gap-5">
        <BaseButton
          variant="primary"
          className="w-full rounded-4xl font-semibold"
          size="lg"
          icon={isWon ? ArrowRight : RotateCcw}
          onClick={() => {
            if (isWon) {
              dispatch({
                type: Actions.ChangeDifficulty,
                payload: { difficulty: nextDifficulty[difficulty] },
              });
            } else {
              dispatch({ type: Actions.Reset, payload: { settings } });
            }
          }}
        >
          {isWon ? buttonMessage[difficulty] : buttonMessage.retry}
        </BaseButton>
        <div
          className={`font-black text-2xl text-center uppercase italic animate-pulse ${isWon ? "text-green-700" : "text-red-700"}`}
        >
          {isWon ? "Você venceu!" : "Você perdeu!"}
        </div>
      </div>
    );
  }

  if (currentState === "PLAYING") {
    return (
      <div className="flex gap-2">
        <ControlButton
          active={!isFlagMode}
          icon={Shovel}
          hotkey="d"
          showHotkeys={showHotkeys}
          className="w-full"
          onClick={() =>
            dispatch({
              type: Actions.SetFlagMode,
              payload: { isFlagMode: false },
            })
          }
        />
        <ControlButton
          active={isFlagMode}
          icon={Flag}
          hotkey="f"
          disabled={!flagsEnabled}
          showHotkeys={showHotkeys}
          className="w-full"
          onClick={() =>
            dispatch({
              type: Actions.SetFlagMode,
              payload: { isFlagMode: true },
            })
          }
        />
        <ControlButton
          icon={RotateCcw}
          hotkey="r"
          showHotkeys={showHotkeys}
          className="w-fit"
          onClick={() =>
            dispatch({ type: Actions.Reset, payload: { settings } })
          }
        />
      </div>
    );
  }

  return null;
};

const ControlButton = ({
  active = false,
  icon,
  hotkey,
  showHotkeys,
  onClick,
  className,
  disabled,
}: {
  active?: boolean;
  icon: LucideIcon;
  hotkey: string;
  showHotkeys: boolean;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) => (
  <BaseButton
    variant={active ? "primary" : "default"}
    className={`rounded-4xl font-normal text-xl ${className}`}
    size="lg"
    icon={icon}
    onClick={onClick}
    disabled={disabled}
    fillIcon={active ? "fill-zinc-950" : ""}
  >
    {showHotkeys && <span className="hidden md:inline-block">({hotkey})</span>}
  </BaseButton>
);

export default function Minesweeper() {
  const game = useGameEngine();
  const { state, dispatch } = game;
  const { settings, currentState, isFlagMode, time, modes, flagsEnabled } =
    state;

  const gameSettings = useGameSettings(game);
  const { showHotkeys } = gameSettings;

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === "r") {
        dispatch({ type: Actions.Reset, payload: { settings } });
        return;
      }

      if (currentState !== "PLAYING") return;

      const keyMap: Record<string, boolean | undefined> = {
        f: true,
        d: false,
        m: !isFlagMode,
      };

      if (keyMap[key] !== undefined) {
        dispatch({
          type: Actions.SetFlagMode,
          payload: { isFlagMode: flagsEnabled ? keyMap[key] : false },
        });
      }
    },
    [currentState, dispatch, settings, isFlagMode, flagsEnabled],
  );

  const handleChangeMode = (mode: Modes) => {
    const modelist = toggleMode(modes, mode);

    dispatch({
      type: Actions.ChangeGameMode,
      payload: { modes: modelist },
    });
  };

  useEffect(() => {
    if (currentState !== "PLAYING") return;

    const interval = setInterval(() => {
      dispatch({ type: Actions.SetTime, payload: { time: time + 1 } });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentState, time, dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-screen flex justify-center items-center bg-zinc-950 text-white">
      <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[50%] xl:w-[30%] py-10 px-5 flex flex-col gap-2">
        <Header
          state={state}
          gameSettings={gameSettings}
          onChangeGameMode={handleChangeMode}
          setDifficulty={(difficulty) =>
            dispatch({
              type: Actions.ChangeDifficulty,
              payload: { difficulty },
            })
          }
        />

        <main className="flex flex-col gap-2">
          {currentState === "START" ? (
            <StartGame game={game} />
          ) : (
            <>
              <Board game={game} />
              <GameControls game={game} showHotkeys={showHotkeys} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
