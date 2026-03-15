import { Difficulties, DIFFICULTIES } from "@/hook/useEngine";
import { Bomb, Flag } from "lucide-react";
import { Button } from "./Button";

type HeaderProps = {
  totalBombs: number;
  time: number;
  leftFlags: number;
  difficulty: Difficulties;
  setDifficulty: (difficulty: Difficulties) => void;
};

const formatTime = (s: number) => {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const Header = ({
  totalBombs = 0,
  time = 0,
  leftFlags = 0,
  difficulty,
  setDifficulty,
}: HeaderProps) => {
  return (
    <div className="flex flex-col gap-2">
      <DifficultySelector
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />
      <GameHeader leftFlags={leftFlags} time={time} totalBombs={totalBombs} />
    </div>
  );
};

const GameHeader = (
  props: Omit<HeaderProps, "difficulty" | "setDifficulty">,
) => {
  return (
    <div className="w-full grid grid-cols-3 place-items-center align-middle text-2xl bg-[#1A1A1A] rounded-2xl py-3 px-5 border border-zinc-800 text-amber-300  tracking-widest">
      <div className="font-semibold grid grid-cols-2 items-center">
        <Bomb className="size-5 fill-amber-300" />
        {props.totalBombs}
      </div>
      <div className="font-semibold items-center gap-2">
        {formatTime(props.time)}
      </div>
      <div className="font-semibold grid grid-cols-2 items-center">
        {props.leftFlags}
        <Flag className="size-5 fill-amber-300" />
      </div>
    </div>
  );
};

type DifficultySelectorProps = {
  difficulty: Difficulties;
  setDifficulty: (difficulty: Difficulties) => void;
};

const DifficultySelector = ({
  difficulty,
  setDifficulty,
}: DifficultySelectorProps) => {
  const difficulties = Object.entries(DIFFICULTIES);

  return (
    <div className="w-full grid grid-cols-3 place-items-center align-middle  bg-[#1A1A1A] rounded-2xl py-2 px-5 border border-zinc-800 ">
      {difficulties.map(([currentDifficulty, settings]) => {
        const isCurrentButton = difficulty === currentDifficulty;

        return (
          <Button
            key={settings.label}
            size="lg"
            variant={isCurrentButton ? "primary" : "ghost"}
            clickable={!isCurrentButton}
            className="text-zinc-400 text-sm tracking-widest uppercase"
            onClick={() =>
              !isCurrentButton &&
              setDifficulty(currentDifficulty as Difficulties)
            }
          >
            {settings.label}
          </Button>
        );
      })}
    </div>
  );
};
