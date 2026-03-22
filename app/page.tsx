"use client";

import { Board } from "@/components/Board";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Actions, Difficulties } from "@/game/game";
import { Engine, useGameEngine } from "@/game/useGameEngine";
import { getFlaggedCount } from "@/game/util";
import { useAudio } from "@/utils/audio";
import { ArrowRight, Flag, RotateCcw, Shovel } from "lucide-react";
import { useCallback, useEffect } from "react";

export default function Minesweeper() {
  const game = useGameEngine();
  const { state, dispatch } = game;
  const { settings, currentState, isFlagMode, time, difficulty } = state;

  const buttonMessage = {
    easy: "Ir para nível Médio",
    medium: "Ir para nível Difícil",
    hard: "Você é fera!",
    retry: (
      <>
        Recomeçar <span className="hidden md:inline-block">(r)</span>
      </>
    ),
  };

  const nextDifficulty: Record<Difficulties, Difficulties> = {
    easy: "medium",
    medium: "hard",
    hard: "easy",
  };

  const handleKeyPress = useCallback(
    function (event: KeyboardEvent) {
      switch (event.key) {
        case "r":
          dispatch({
            type: Actions.Reset,
            payload: { settings: settings },
          });
          break;
        case "f":
          if (currentState === "PLAYING")
            dispatch({
              type: Actions.SetFlagMode,
              payload: {
                isFlagMode: true,
              },
            });
          break;
        case "d":
          if (currentState === "PLAYING")
            dispatch({
              type: Actions.SetFlagMode,
              payload: {
                isFlagMode: false,
              },
            });
          break;
        case "m":
          if (currentState === "PLAYING")
            dispatch({
              type: Actions.SetFlagMode,
              payload: {
                isFlagMode: !isFlagMode,
              },
            });
          break;
      }
    },
    [currentState, dispatch, settings, isFlagMode],
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentState === "PLAYING") {
      const speed = 1000;
      interval = setInterval(
        () =>
          dispatch({
            type: Actions.SetTime,
            payload: { time: time + 1 },
          }),
        speed,
      );
    }
    return () => clearInterval(interval);
  }, [currentState, time, dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-screen flex justify-center md:items-center">
      <div className="w-full md:w-[60%] lg:w-[50%] xl:w-[30%] py-10 px-5 flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Header
            totalBombs={settings.mines}
            time={time}
            leftFlags={settings.mines - getFlaggedCount(state.board)}
            difficulty={difficulty}
            currentState={currentState}
            setDifficulty={(difficulty) => {
              dispatch({
                type: Actions.ChangeDifficulty,
                payload: { difficulty },
              });
            }}
          />
          {currentState === "START" ? (
            <StartGame game={game} />
          ) : (
            <Board game={game} />
          )}
        </div>
        {currentState !== "START" && (
          <div>
            {currentState === "LOST" || currentState === "WON" ? (
              <Button
                variant="primary"
                className="w-full rounded-4xl font-semibold"
                size="lg"
                icon={currentState === "WON" ? ArrowRight : RotateCcw}
                onClick={() => {
                  if (currentState === "WON")
                    dispatch({
                      type: Actions.ChangeDifficulty,
                      payload: { difficulty: nextDifficulty[difficulty] },
                    });
                  else
                    dispatch({
                      type: Actions.Reset,
                      payload: { settings },
                    });
                }}
              >
                {currentState === "WON"
                  ? buttonMessage[difficulty]
                  : buttonMessage.retry}
              </Button>
            ) : currentState === "PLAYING" ? (
              <div className="flex gap-2">
                <Button
                  variant={isFlagMode ? "default" : "primary"}
                  className="w-full rounded-4xl font-semibold"
                  size="lg"
                  icon={Shovel}
                  clickable={isFlagMode}
                  onClick={() =>
                    dispatch({
                      type: Actions.SetFlagMode,
                      payload: { isFlagMode: false },
                    })
                  }
                  fillIcon={!isFlagMode ? "fill-zinc-950" : ""}
                >
                  <span className="hidden md:inline-block">(d)</span>
                </Button>
                <Button
                  variant={isFlagMode ? "primary" : "default"}
                  className="w-full rounded-4xl font-semibold"
                  size="lg"
                  icon={Flag}
                  clickable={!isFlagMode}
                  onClick={() =>
                    dispatch({
                      type: Actions.SetFlagMode,
                      payload: { isFlagMode: true },
                    })
                  }
                  fillIcon={isFlagMode ? "fill-zinc-950" : ""}
                >
                  <span className="hidden md:inline-block">(f)</span>
                </Button>
                <Button
                  variant={"default"}
                  className="w-full rounded-4xl font-semibold"
                  size="lg"
                  icon={RotateCcw}
                  onClick={() =>
                    dispatch({
                      type: Actions.Reset,
                      payload: { settings },
                    })
                  }
                  fillIcon={isFlagMode ? "fill-zinc-950" : ""}
                >
                  <span className="hidden md:inline-block">(r)</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                className="w-full rounded-4xl font-semibold"
                size="lg"
                icon={Shovel}
                clickable={false}
                onClick={() =>
                  dispatch({
                    type: Actions.SetFlagMode,
                    payload: { isFlagMode: false },
                  })
                }
              />
            )}
            {(currentState === "LOST" || currentState === "WON") && (
              <div
                className={`mt-5 font-black text-2xl text-center uppercase italic animate-pulse ${currentState === "WON" ? "text-green-700" : "text-red-700"}`}
              >
                {currentState === "WON" ? "Você venceu!" : "Você perdeu!"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type StartGameProps = {
  game: Engine;
};

function StartGame({ game }: StartGameProps) {
  const { setMusicEnabled, playMusic, stopMusic } = useAudio();

  const { dispatch } = game;

  useEffect(() => {
    stopMusic();
  }, [setMusicEnabled, stopMusic]);

  const handleStart = (difficulty: Difficulties) => {
    dispatch({
      type: Actions.ChangeDifficulty,
      payload: { difficulty },
    });

    playMusic();
  };

  return (
    <div
      className={`bg-[#1A1A1A] p-10 border border-zinc-800 aspect-square rounded-xl flex flex-col justify-center items-center gap-10`}
    >
      <h3 className="text-amber-300 font-bold text-4xl text-center">
        Escolha uma dificuldade para começar o jogo
      </h3>
      <div className="flex gap-5">
        <Button variant="default" size="lg" onClick={() => handleStart("easy")}>
          Fácil
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => handleStart("medium")}
        >
          Médio
        </Button>
        <Button
          variant="danger"
          size="lg"
          onClick={() => handleStart("medium")}
        >
          Difícil
        </Button>
      </div>
    </div>
  );
}
