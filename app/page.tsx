"use client";

import { Board } from "@/components/Board";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { useGameEngine } from "@/hook/useEngine";
import { Bomb, Flag, RotateCcw, Shovel } from "lucide-react";
import { useEffect } from "react";

export default function Minesweeper() {
  const game = useGameEngine("easy");
  const { gameState, isFlagMode, setIsFlagMode, setTime } = game;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState === "playing") {
      const speed = 1000;
      interval = setInterval(() => setTime((t) => t + 1), speed);
    }
    return () => clearInterval(interval);
  }, [gameState, setTime]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-[90%] md:w-[60%] lg:w-[50%] xl:w-[30%] py-10 px-5 flex flex-col gap-5">
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
              Recomeçar
            </Button>
          ) : gameState === "playing" ? (
            <div className="flex gap-5">
              <Button
                variant={isFlagMode ? "default" : "primary"}
                className="w-full rounded-4xl"
                size="lg"
                icon={Shovel}
                onClick={() => setIsFlagMode(false)}
              />
              <Button
                variant={isFlagMode ? "primary" : "default"}
                className="w-full rounded-4xl"
                size="lg"
                icon={Flag}
                onClick={() => setIsFlagMode(true)}
              />
            </div>
          ) : (
            <Button
              variant="primary"
              className="w-full rounded-4xl"
              size="lg"
              icon={Bomb}
              clickable={false}
              onClick={() => setIsFlagMode(false)}
            />
          )}
          {(gameState === "lost" || gameState === "won") && (
            <div
              className={`mt-5 font-black text-2xl text-center uppercase italic animate-pulse ${gameState === "won" ? "text-green-700" : "text-red-700"}`}
            >
              {gameState === "won" ? "Vitória!" : "Explodiu!"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
