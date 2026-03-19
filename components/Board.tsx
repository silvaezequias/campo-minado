import { Cell, Engine, GameState } from "@/hook/useEngine";
import { Button, ButtonSize, ButtonVariant } from "./Button";
import { Bomb, Flag, Goal, X } from "lucide-react";
import { MouseEventHandler } from "react";

type BoardProps = {
  game: Engine;
};

export const Board = ({ game }: BoardProps) => {
  const { config, board, cellSize, previewCells } = game;
  const { columns, rows } = config;

  return (
    <div
      className={`bg-[#1A1A1A] border-zinc-800 border rounded-xl p-1 sm:p-5 py-2 gap-0.5 sm:gap-1 grid overflow-hidden`}
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
              cell={cell}
              size={cellSize}
              key={`x${cell.x}y${cell.y}`}
              gameState={game.gameState}
              isPreview={previewCells.has(`${cell.y}-${cell.x}`)}
              onMouseUp={() => game.clearPreview()}
              onMouseDown={() => game.handleMouseDown(cell)}
              onClick={() => game.handleCellClick(cell)}
              onContextMenu={() => game.handleCellClick(cell, true)}
            />
          );
        });
      })}
    </div>
  );
};

type BoardCellProps = {
  cell: Cell;
  size: ButtonSize;
  isPreview: boolean;
  gameState: GameState;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onContextMenu: MouseEventHandler<HTMLButtonElement>;
  onMouseDown: MouseEventHandler<HTMLButtonElement>;
  onMouseUp: MouseEventHandler<HTMLButtonElement>;
};

const BoardCell = ({
  cell,
  size,
  isPreview,
  gameState,
  onClick,
  onContextMenu,
  onMouseDown,
  onMouseUp,
}: BoardCellProps) => {
  const content = cell.isRevealed && !cell.isMine ? cell.neighborMines : "";

  const icon = getCellIcon({ cell, gameState });
  const fillIconColor = getCellIconColor({ cell, gameState });

  const animation = cell.isMine && cell.isRevealed && "animate-pulse";
  const isClickable =
    gameState === "playing" && !cell.isFlagged && !cell.isMine && !isPreview;

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
      variant={getCellVariant({ cell, isPreview, gameState })}
    >
      {content || ""}
    </Button>
  );
};

type GetCellIconColorProps = {
  cell: Cell;
  gameState: GameState;
};

export function getCellIconColor({
  cell,
  gameState,
}: GetCellIconColorProps): string {
  if (gameState != "playing") {
    if (cell.isTriggered) {
      return "fill-red-600 text-red-600";
    }

    if (cell.isFlagged && !cell.isMine) {
      return "fill-red-500 text-red-500";
    }

    if (cell.isFlagged && cell.isMine) {
      return "fill-amber-300 text-amber-300";
    }

    if (!cell.isFlagged && cell.isMine) {
      return "fill-red-500 text-red-500";
    }

    return "";
  }

  if (cell.isFlagged) {
    return "fill-red-500 text-red-500";
  }

  if (cell.isRevealed && cell.isMine) {
    return "fill-zinc-950 text-zinc-950";
  }

  return "";
}

type GetCellIconProps = {
  cell: Cell;
  gameState: GameState;
};

export function getCellIcon({ cell, gameState }: GetCellIconProps) {
  if (gameState === "lost") {
    if (cell.isTriggered) return Goal;
    if (cell.isFlagged && !cell.isMine) return X;
    if (!cell.isFlagged && cell.isMine) return Bomb;
    if (cell.isFlagged && cell.isMine) return Flag;

    return undefined;
  }

  if (cell.isFlagged) return Flag;

  if (cell.isRevealed && cell.isMine) {
    return Bomb;
  }

  return undefined;
}

type GetCellVariantProps = {
  cell: Cell;
  isPreview: boolean;
  gameState: GameState;
};

export function getCellVariant({
  cell,
  isPreview,
  gameState,
}: GetCellVariantProps): ButtonVariant {
  if (cell.isTriggered) return "danger";
  if (cell.isFlagged) {
    if (cell.isMine && gameState != "playing") return "outline";
    return "danger";
  }
  if (isPreview) return "outline";

  if (cell.isRevealed) {
    if (cell.neighborMines < 1 && !cell.isMine) {
      return "secondary";
    }

    if (cell.isMine) return "danger";

    return "primary";
  }
  return "default";
}
