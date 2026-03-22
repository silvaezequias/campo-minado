import { Bomb, Flag, Music, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "./Button";
import { useAudio } from "@/utils/audio";
import { Difficulties, GamePhase } from "@/game/game";
import { DIFFICULTIES } from "@/game/util";

type HeaderProps = {
  currentState: GamePhase;
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
  currentState,
  setDifficulty,
}: HeaderProps) => {
  return (
    <div className="flex flex-col gap-2">
      <VolumneManager />
      {currentState !== "START" && (
        <>
          <DifficultySelector
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
          <GameHeader
            currentState={currentState}
            leftFlags={leftFlags}
            time={time}
            totalBombs={totalBombs}
          />
        </>
      )}
    </div>
  );
};

const VolumneManager = () => {
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

  return (
    <div className="w-full flex justify-end gap-2 items-center text-amber-300">
      <div className="group bg-zinc-800 border-none rounded-xl gap-5 flex px-5 py-2 justify-between">
        <input
          type="range"
          step={0.01}
          min={0}
          max={1}
          value={soundsVolume}
          onInput={(event) =>
            setSoundsVolume(Number((event.target as HTMLInputElement).value))
          }
          className="accent-amber-300 w-full hidden group-hover:inline-block"
        />
        <Button
          icon={soundsEnabled ? Volume2 : VolumeX}
          size="lg"
          aspect="square"
          onClick={toggleSounds}
          className="border-none"
        />
      </div>
      <div className="group bg-zinc-800 border-none rounded-xl gap-5 flex px-5 py-2 justify-between">
        <input
          type="range"
          step={0.01}
          min={0}
          max={1}
          value={musicVolume}
          onInput={(event) =>
            setMusicVolume(Number((event.target as HTMLInputElement).value))
          }
          className="accent-amber-300 w-full hidden group-hover:inline-block"
        />
        <Button
          icon={musicEnabled ? Music : Play}
          size="lg"
          aspect="square"
          onClick={toggleMusic}
          className="border-none"
        />
      </div>
    </div>
  );
};

const GameHeader = (
  props: Omit<HeaderProps, "difficulty" | "setDifficulty">,
) => {
  return (
    <div className="bg-neutral-800/60 border-zinc-800/60 w-full grid grid-cols-3 place-items-center align-middle text-2xl rounded-2xl py-3 px-5 border text-amber-300  tracking-widest">
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
  const { playSound } = useAudio();

  const difficulties = Object.entries(DIFFICULTIES);

  return (
    <div className="bg-neutral-800/60 border-zinc-800/60 w-full grid grid-cols-3 place-items-center align-middle rounded-2xl py-2 px-5 border">
      {difficulties.map(([currentDifficulty, settings]) => {
        const isCurrentButton = difficulty === currentDifficulty;

        return (
          <Button
            key={settings.label}
            size="lg"
            variant={isCurrentButton ? "primary" : "ghost"}
            clickable={!isCurrentButton}
            className="text-zinc-400 text-sm tracking-widest uppercase"
            onClick={() => {
              if (!isCurrentButton) {
                setDifficulty(currentDifficulty as Difficulties);
                playSound("switch", 2);
              }
            }}
          >
            {settings.label}
          </Button>
        );
      })}
    </div>
  );
};
