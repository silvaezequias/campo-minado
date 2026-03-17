import { Cell, Engine } from "@/hook/useEngine";
import { Button, ButtonSize } from "./Button";
import { Bomb, Flag } from "lucide-react";
import { MouseEventHandler } from "react";

type BoardProps = {
  game: Engine;
};

export const Board = ({ game }: BoardProps) => {
  const { config, board, cellSize } = game;
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
              onClick={() =>
                game.handleCellClick({
                  row: cell.y,
                  col: cell.x,
                })
              }
              onContextMenu={() =>
                game.handleCellClick({ row: cell.y, col: cell.x }, true)
              }
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
  onClick: MouseEventHandler<HTMLButtonElement>;
  onContextMenu: MouseEventHandler<HTMLButtonElement>;
};

const BoardCell = ({ cell, size, onClick, onContextMenu }: BoardCellProps) => {
  const content = cell.isRevealed && !cell.isMine ? cell.neighborMines : "";

  const icon = cell.isRevealed
    ? cell.isMine
      ? Bomb
      : undefined
    : cell.isFlagged
      ? Flag
      : undefined;

  const fillIconColor = cell.isRevealed
    ? cell.isMine
      ? "fill-zinc-950"
      : ""
    : cell.isFlagged
      ? "fill-red-500 text-red-500"
      : "";

  const animation = cell.isMine && cell.isRevealed && "animate-pulse";

  return (
    <Button
      size={size}
      aspect="square"
      variant={
        cell.isFlagged
          ? "danger"
          : cell.isRevealed
            ? cell.neighborMines < 1 && !cell.isMine
              ? "secondary"
              : "primary"
            : "default"
      }
      clickable={!cell.isRevealed && !cell.isFlagged}
      icon={icon}
      onClick={onClick}
      onContextMenu={onContextMenu}
      fillIcon={fillIconColor}
      className={`${fillIconColor} ${animation}`}
    >
      {content || ""}
    </Button>
  );
};
