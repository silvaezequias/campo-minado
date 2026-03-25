import { Bomb, CircleQuestionMark, Flag, Heart } from "lucide-react";
import { Button } from "./Button";
import { useAudio } from "@/utils/audio";
import { Difficulties, GamePhase, GameState } from "@/game/game";
import { DIFFICULTIES, getFlaggedCount } from "@/game/util";
import { ModeList } from "./ModeList";
import { MODES, Modes } from "@/game/mode";
import { SettingsDropdown } from "./Settings";
import { ModeInfoModal } from "./ModeInfoPanel";
import { GameSettings, GameSettingsHook } from "@/game/useGameSettings";

type HeaderProps = {
  state: GameState;
  onChangeGameMode: (mode: Modes) => void;
  setDifficulty: (difficulty: Difficulties) => void;
  gameSettings: GameSettingsHook;
};

const formatTime = (s: number) => {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const Header = ({
  state,
  onChangeGameMode,
  setDifficulty,
  gameSettings,
}: HeaderProps) => {
  const {
    difficulty,
    modeInfoOpen,
    settingsOpen,
    modeListOpen,
    showFlagsLeft,
    showTimer,

    setModeInfoOpen,
    setModeListOpen,
    setSettingsOpen,

    handleChangeSettings,
  } = gameSettings;

  const { modes, time, life, settings, currentState } = state;

  const isDecisionMode = modes.includes(Modes.Decision);
  const leftFlags = settings.mines - getFlaggedCount(state.board);
  const totalBombs = settings.mines;

  const onChangeSettings = (settings: GameSettings) => {
    if (difficulty !== settings.difficulty) setDifficulty(settings.difficulty);
    handleChangeSettings(settings);
  };

  return (
    <div className="flex flex-col gap-2">
      {currentState !== "START" && (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              aspect="square"
              className="p-3 bg-neutral-800/60 border-zinc-800/60"
              onClick={() => {
                setModeInfoOpen(true);
                setModeListOpen(false);
                setSettingsOpen(false);
              }}
            >
              <CircleQuestionMark className="text-amber-300" />
            </Button>
            <ModeList
              modes={modes}
              options={MODES}
              onChange={onChangeGameMode}
              modeListOpen={modeListOpen}
              setModeListOpen={(isOpen) => {
                setSettingsOpen(false);
                setModeInfoOpen(false);
                setModeListOpen(isOpen);
              }}
            />

            <SettingsDropdown
              onChange={onChangeSettings}
              settings={gameSettings}
              settingsOpen={settingsOpen}
              setSettingsOpen={(isOpen) => {
                setSettingsOpen(isOpen);
                setModeInfoOpen(false);
                setModeListOpen(false);
              }}
            />
          </div>
          <GameHeader
            time={time}
            life={life}
            modes={modes}
            leftFlags={isDecisionMode ? 0 : leftFlags}
            totalBombs={totalBombs}
            currentState={currentState}
            showTimer={showTimer}
            showFlagsLeft={showFlagsLeft}
          />
        </>
      )}

      <ModeInfoModal
        availableModes={MODES}
        modes={modes}
        open={modeInfoOpen}
        onClose={() => setModeInfoOpen(false)}
      />
    </div>
  );
};

type GameHeaderProps = {
  modes: Modes[];
  currentState: GamePhase;
  totalBombs: number;
  time: number;
  life: number;
  leftFlags: number;
  showTimer: boolean;
  showFlagsLeft: boolean;
};

const GameHeader = (props: GameHeaderProps) => {
  const isLifeMode = props.modes.includes(Modes.Life);

  let grid = 1;

  if (props.showTimer) grid++;
  if (props.showFlagsLeft) grid++;
  if (isLifeMode) grid++;

  return (
    <div
      className="bg-neutral-800/60 border-zinc-800/60 w-full grid place-items-center align-middle text-2xl rounded-2xl py-3 px-5 border text-amber-300  tracking-widest"
      style={{
        gridTemplateColumns: `repeat(${grid}, 1fr)`,
      }}
    >
      <div className="font-semibold grid grid-cols-2 items-center">
        <Bomb className="size-5 fill-amber-300" />
        {props.totalBombs}
      </div>
      {props.showTimer && (
        <div className="font-semibold items-center gap-2">
          {formatTime(props.time)}
        </div>
      )}
      {props.showFlagsLeft && (
        <div className="font-semibold grid grid-cols-2 items-center">
          {props.leftFlags}
          <Flag className="size-5 fill-amber-300" />
        </div>
      )}

      {isLifeMode && (
        <div className="font-semibold grid grid-cols-2 items-center">
          {props.life}
          <Heart className="size-5 fill-amber-300" />
        </div>
      )}
    </div>
  );
};

type DifficultySelectorProps = {
  difficulty: Difficulties;
  setDifficulty: (difficulty: Difficulties) => void;
};

export const DifficultySelector = ({
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
