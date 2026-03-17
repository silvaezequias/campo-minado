"use client";

import { Board } from "@/components/Board";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { useGameEngine } from "@/hook/useEngine";
import { Flag, RotateCcw, Shovel } from "lucide-react";
import { useCallback, useEffect } from "react";

export default function Minesweeper() {
  const game = useGameEngine("easy");
  const { gameState, isFlagMode, setIsFlagMode, setTime, reset } = game;

  const handleKeyPress = useCallback(
    function (event: KeyboardEvent) {
      switch (event.key) {
        case "r":
          reset();
          break;
        case "f":
          if (gameState === "playing") setIsFlagMode(true);
          break;
        case "c":
          if (gameState === "playing") setIsFlagMode(false);
          break;
        case "m":
          if (gameState === "playing") setIsFlagMode((prev) => !prev);
          break;
      }
    },
    [reset, setIsFlagMode, gameState],
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState === "playing") {
      const speed = 1000;
      interval = setInterval(() => setTime((t) => t + 1), speed);
    }
    return () => clearInterval(interval);
  }, [gameState, setTime]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress, reset]);

  return (
    <div className="w-full h-screen flex justify-center md:items-center">
      <div className="w-full md:w-[60%] lg:w-[50%] xl:w-[30%] py-10 px-5 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Header
            totalBombs={game.config.mines}
            time={game.time}
            leftFlags={game.minesLeft}
            difficulty={game.difficulty}
            setDifficulty={game.handleChangeDifficulty}
          />
          <Board game={game} />
        </div>
        <div className="">
          {gameState === "lost" || gameState === "won" ? (
            <Button
              variant="primary"
              className="w-full rounded-4xl"
              size="lg"
              icon={RotateCcw}
              onClick={() => game.reset()}
            >
              Recomeçar <span className="hidden md:inline-block">(r)</span>
            </Button>
          ) : gameState === "playing" ? (
            <div className="flex gap-5">
              <Button
                variant={isFlagMode ? "default" : "primary"}
                className="w-full rounded-4xl"
                size="md"
                icon={Shovel}
                clickable={isFlagMode}
                onClick={() => setIsFlagMode(false)}
                fillIcon={!isFlagMode ? "fill-zinc-950" : ""}
              >
                <span className="hidden md:inline-block">(c)</span>
              </Button>
              <Button
                variant={isFlagMode ? "primary" : "default"}
                className="w-full rounded-4x"
                size="md"
                icon={Flag}
                clickable={!isFlagMode}
                onClick={() => setIsFlagMode(true)}
                fillIcon={isFlagMode ? "fill-zinc-950" : ""}
              >
                <span className="hidden md:inline-block">(f)</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              className="w-full rounded-4xl"
              size="lg"
              icon={Shovel}
              clickable={false}
              onClick={() => setIsFlagMode(false)}
            />
          )}
          {(gameState === "lost" || gameState === "won") && (
            <div
              className={`mt-5 font-black text-2xl text-center uppercase italic animate-pulse ${gameState === "won" ? "text-green-700" : "text-red-700"}`}
            >
              {gameState === "won" ? "Você venceu!" : "Você perdeu!"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
