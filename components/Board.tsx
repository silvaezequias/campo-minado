"use client";
import { Engine } from "@/game/useGameEngine";
import { Button, ButtonSize, ButtonVariant } from "./Button";
import { Bomb, Crosshair, Flag, FlagOff, Goal } from "lucide-react";
import { MouseEventHandler, useEffect, useState } from "react";
import { Cell, GamePhase } from "@/game/game";
import { Modes } from "@/game/mode";

type DisplayModes = Modes[];

type BoardProps = {
  game: Engine;
};

export const Board = ({ game }: BoardProps) => {
  const { state, cellEvents } = game;
  const { settings, board, cellSize, currentState, previewCells, modes } =
    state;
  const { columns, rows } = settings;

  return (
    <div
      className={`bg-neutral-800/60 border-zinc-800/60 border rounded-xl p-1 sm:p-5 py-2 gap-0.5 sm:gap-1 grid overflow-hidden`}
      onContextMenu={(event) => event.preventDefault()}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {board.map((row) => {
        return row.map((cell) => {
          return (
            <BoardCell
              modes={modes}
              cell={cell}
              size={cellSize}
              key={`x${cell.coord.col}y${cell.coord.row}`}
              currentState={currentState}
              isPreview={previewCells.has(
                `${cell.coord.row}-${cell.coord.col}`,
              )}
              onMouseUp={() => cellEvents.mouseUp()}
              onMouseDown={() => cellEvents.mouseDown(cell)}
              onClick={() => cellEvents.handleCellClick(cell)}
              onContextMenu={() => cellEvents.handleCellClick(cell, true)}
            />
          );
        });
      })}
    </div>
  );
};

type BoardCellProps = {
  cell: Cell;
  modes: DisplayModes;
  size: ButtonSize;
  isPreview: boolean;
  currentState: GamePhase;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onContextMenu: MouseEventHandler<HTMLButtonElement>;
  onMouseDown: MouseEventHandler<HTMLButtonElement>;
  onMouseUp: MouseEventHandler<HTMLButtonElement>;
};

const BoardCell = ({
  cell,
  size,
  modes,
  isPreview,
  currentState,
  onClick,
  onContextMenu,
  onMouseDown,
  onMouseUp,
}: BoardCellProps) => {
  const content =
    cell.isRevealed && !cell.isMine ? (
      <DisplayCellContent modes={modes}>
        <GetCellContent modes={modes} number={cell.neighborMines} />
      </DisplayCellContent>
    ) : (
      ""
    );

  const icon = getCellIcon({ cell, currentState });
  const fillIconColor = getCellIconColor({ cell, currentState });

  const animation = cell.isMine && cell.isRevealed && "animate-pulse";
  const isClickable =
    (currentState === "PLAYING" || currentState === "IDLE") &&
    !cell.isFlagged &&
    !isPreview;

  return (
    <Button
      icon={icon}
      aspect="square"
      size={size}
      fillIcon={fillIconColor}
      className={`${fillIconColor} ${animation}`}
      clickable={isClickable}
      onClick={onClick}
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      variant={getCellVariant({ cell, isPreview, currentState })}
    >
      {content || ""}
    </Button>
  );
};

type DisplayCellContentProps = {
  children: React.ReactNode;
  modes: DisplayModes;
};

const DisplayCellContent = ({ children, modes }: DisplayCellContentProps) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const DELAY = 5000;
  const FADE_DURATION = 5000;

  useEffect(() => {
    if (!modes.includes(Modes.Memory)) return;

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 0);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, DELAY + FADE_DURATION);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [modes]);

  if (!visible) return null;

  return (
    <div
      className="w-full h-full"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms ease`,
      }}
    >
      {children}
    </div>
  );
};

type GetCellContentProps = {
  children?: React.ReactNode;
  number: number;
  modes: DisplayModes;
};

const GetCellContent = ({ number, modes }: GetCellContentProps) => {
  const dicePatterns: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const contentByMode = {
    [Modes.Points]: (
      <div className="grid grid-cols-3 grid-rows-3 w-[80%] h-[80%] p-[5%]">
        {Array.from({ length: 9 }).map((_, i) => {
          const isActive = dicePatterns[number]?.includes(i);

          return (
            <div key={i} className="flex items-center justify-center">
              {isActive && (
                <span className="w-[60%] aspect-square bg-zinc-950 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    ),
  };

  const contentToDisplay =
    modes.includes(Modes.Points) && contentByMode[Modes.Points];

  return (
    <div className="w-full h-full flex items-center justify-center">
      {contentToDisplay || number || ""}
    </div>
  );
};

type GetCellIconColorProps = {
  cell: Cell;
  currentState: GamePhase;
};

export function getCellIconColor({
  cell,
  currentState,
}: GetCellIconColorProps): string {
  if (currentState === "LOST") {
    if (cell.isTriggered) return "text-red-400 border-red-400/30";
    if (cell.isFlagged && cell.isMine) return "text-red-400 border-red-400";
    if (cell.isFlagged && !cell.isMine) return "text-red-400 border-red-400/20";
    if (cell.isFlagged) return "fill-red-400 text-red-400";
    if (cell.isMine) return "fill-zinc-950 text-zinc-950";
  } else if (currentState === "PLAYING" || currentState === "WON") {
    if (cell.isFlagged) return "fill-red-400 text-red-400 border-red-400/20";
  }

  return "";
}

type GetCellIconProps = {
  cell: Cell;
  currentState: GamePhase;
};

export function getCellIcon({ cell, currentState }: GetCellIconProps) {
  if (currentState === "LOST") {
    if (cell.isTriggered) return Crosshair;
    if (cell.isFlagged && !cell.isMine) return FlagOff;
    if (!cell.isFlagged && cell.isMine) return Bomb;
    if (cell.isFlagged && cell.isMine) return Goal;

    return undefined;
  }

  if (cell.isFlagged) return Flag;

  // if (cell.isMine) {
  if (cell.isRevealed && cell.isMine) {
    return Bomb;
  }

  return undefined;
}

type GetCellVariantProps = {
  cell: Cell;
  isPreview: boolean;
  currentState: GamePhase;
};

export function getCellVariant({
  cell,
  isPreview,
  currentState,
}: GetCellVariantProps): ButtonVariant {
  if (currentState === "PLAYING" || currentState === "WON") {
    if (isPreview) return "outline";
    if (cell.isFlagged) return "outline";

    if (cell.isRevealed) {
      if (cell.isMine) return "danger";
      if (cell.neighborMines < 1 && !cell.isMine) return "secondary";
      return "primary";
    }
  } else if (currentState === "LOST") {
    if (cell.isFlagged && !cell.isMine) return "outline";
    if (cell.isFlagged && cell.isMine) return "outline";

    if (cell.isTriggered) return "outline";
    if (cell.isMine) return "danger";

    if (cell.isRevealed) {
      if (cell.neighborMines < 1 && !cell.isMine) return "secondary";
      else return "primary";
    }
  } else if (currentState === "IDLE") return "default";

  return "default";
}
