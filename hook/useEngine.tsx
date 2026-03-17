"use client";

import { ButtonSize } from "@/components/Button";
import { Dispatch, SetStateAction, useCallback, useState } from "react";

export type Cell = {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

type GameState = "start" | "playing" | "won" | "lost";
type Settings = (typeof DIFFICULTIES)[keyof typeof DIFFICULTIES];

type Board = Cell[][];

type Coords = {
  row: number;
  col: number;
};

export type Difficulties = keyof typeof DIFFICULTIES;

export const DIFFICULTIES = {
  easy: { label: "Fácil", rows: 7, columns: 7, mines: 10 },
  medium: { label: "Médio", rows: 12, columns: 12, mines: 25 },
  hard: { label: "Difícil", rows: 15, columns: 15, mines: 45 },
};

function getCellSize(columns: number) {
  return columns <= 5
    ? "xl"
    : columns <= 8
      ? "lg"
      : columns <= 10
        ? "md"
        : columns <= 12
          ? "md"
          : "smr";
}

export function useGameEngine(
  initialDifficulty: keyof typeof DIFFICULTIES = "easy",
) {
  const [difficulty, setDifficulty] =
    useState<keyof typeof DIFFICULTIES>(initialDifficulty);
  const [config, setConfig] = useState(DIFFICULTIES[difficulty]);
  const [cellSize, setCellSize] = useState<ButtonSize>(
    getCellSize(config.columns),
  );

  const [gameState, setGameState] = useState<GameState>("start");

  const [minesLeft, setMinesLeft] = useState(config.mines);
  const [time, setTime] = useState(0);
  const [coins, setCoins] = useState(125);
  const [isFlagMode, setIsFlagMode] = useState(false);

  const handleChangeDifficulty = (difficulty: Difficulties) => {
    const settings = DIFFICULTIES[difficulty];

    reset(settings);
    setDifficulty(difficulty);
    setConfig(settings);
    setCellSize(getCellSize(settings.columns));
  };

  const [board, setBoard] = useState(() =>
    generateBoard({
      enableBombs: false,
      settings: config,
    }),
  );

  const reset = (settings: Settings = config) => {
    setIsFlagMode(false);
    setGameState("start");
    setBoard(generateBoard({ settings, enableBombs: false }));
    setMinesLeft(settings.mines);
    setTime(0);
  };

  const handleCellClick = useCallback(
    (coord: Coords, forceFlagMode: boolean = false) => {
      if (forceFlagMode || isFlagMode) {
        toggleFlag({
          board,
          coord,
          minesLeft,
          setBoard,
          setMinesLeft,
          setState: setGameState,
          settings: config,
          state: gameState,
        });
      } else {
        revealCell({
          board,
          coord,
          setBoard,
          setState: setGameState,
          settings: config,
          state: gameState,
        });
      }
    },
    [
      setBoard,
      setMinesLeft,
      setGameState,
      isFlagMode,
      board,
      config,
      gameState,
      minesLeft,
    ],
  );

  return {
    board,
    config,
    difficulty,
    gameState,
    minesLeft,
    time,
    coins,
    isFlagMode,
    cellSize,

    setCellSize,
    setConfig,
    setTime,
    revealCell,
    setDifficulty,
    setIsFlagMode,
    setCoins,
    reset,
    toggleFlag,
    generateBoard,
    handleChangeDifficulty,
    handleCellClick,
  };
}

export type Engine = ReturnType<typeof useGameEngine>;

type ToggleFlagProps = {
  coord: Coords;
  board: Board;
  state: GameState;
  settings: Settings;
  minesLeft: number;
  setState: Dispatch<SetStateAction<GameState>>;
  setBoard: Dispatch<SetStateAction<Board>>;
  setMinesLeft: Dispatch<SetStateAction<number>>;
};

type RevealCellProps = {
  coord: Coords;
  board: Board;
  state: GameState;
  settings: Settings;
  setState: Dispatch<SetStateAction<GameState>>;
  setBoard: Dispatch<SetStateAction<Board>>;
};

function revealCell({
  state,
  board,
  coord,
  settings,
  setBoard,
  setState,
}: RevealCellProps) {
  if (state === "lost" || state === "won") {
    return;
  }

  if (state === "start") {
    const newBoard = generateBoard({
      enableBombs: true,
      safeCell: coord,
      settings,
    });

    setState("playing");
    setBoard(newBoard);
    board = newBoard;
    state = "playing";
  }

  const cell = board[coord.row][coord.col];

  if (!cell || cell.isRevealed || cell.isFlagged) return;

  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const start = newBoard[coord.row][coord.col];

  if (start.isMine) {
    newBoard.forEach((row) =>
      row.forEach((cell) => {
        if (cell.isMine) cell.isRevealed = true;
      }),
    );

    setBoard(newBoard);
    setState("lost");
    return;
  }

  const queue: [number, number][] = [[coord.row, coord.col]];

  while (queue.length) {
    const [row, col] = queue.shift()!;

    const current = newBoard[row]?.[col];
    if (!current || current.isRevealed || current.isFlagged) continue;

    current.isRevealed = true;

    if (current.neighborMines === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;

          const nr = row + i;
          const nc = col + j;

          if (newBoard[nr]?.[nc] && !newBoard[nr][nc].isRevealed) {
            queue.push([nr, nc]);
          }
        }
      }
    }
  }

  setBoard(newBoard);

  const hiddenCells = newBoard.flat().filter((cell) => !cell.isRevealed);
  const won = hiddenCells.every((cell) => cell.isMine);

  if (won) setState("won");
}

function toggleFlag({
  state,
  board,
  coord,
  settings,
  minesLeft,
  setState,
  setBoard,
  setMinesLeft,
}: ToggleFlagProps) {
  if (state === "lost" || state === "won") {
    return;
  }

  if (state === "start") {
    const newBoard = generateBoard({
      enableBombs: true,
      safeCell: { ...coord },
      settings,
    });

    setState("playing");
    setBoard(newBoard);
    board = newBoard;
    state = "playing";
  }

  if (state === "playing") {
    if (board[coord.row][coord.col].isRevealed) return;
  }

  const newBoard = [...board.map((row) => [...row])];
  const isNowFlagged = !newBoard[coord.row][coord.col].isFlagged;

  if (isNowFlagged && minesLeft <= 0) return;

  newBoard[coord.row][coord.col].isFlagged = isNowFlagged;
  setBoard(newBoard);
  setMinesLeft((prev) => (isNowFlagged ? prev - 1 : prev + 1));
}

type GenerateBoardProps = {
  enableBombs: boolean;
  safeCell?: Coords & { flagged?: boolean };
  settings: Settings;
};

function generateBoard({
  settings,
  safeCell,
  enableBombs,
}: GenerateBoardProps) {
  const matrix = Array.from({ length: settings.rows }, (_, row) => {
    return Array.from({ length: settings.columns }, (_, column) => {
      const safeCellIsCurrentCell =
        safeCell?.row === row && safeCell?.col === column;

      return {
        x: column,
        y: row,
        isMine: false,
        isRevealed: false,
        isFlagged: safeCellIsCurrentCell && !!safeCell?.flagged,
        neighborMines: 0,
      };
    });
  });

  let minesPlaced = 0;

  if (enableBombs) {
    while (minesPlaced < settings.mines) {
      const r = Math.floor(Math.random() * settings.rows);
      const c = Math.floor(Math.random() * settings.columns);

      if (r !== safeCell?.row || c !== safeCell?.col) {
        if (!matrix[r][c].isMine) {
          matrix[r][c].isMine = true;
          minesPlaced++;
        }
      }
    }
    for (let r = 0; r < settings.rows; r++) {
      for (let c = 0; c < settings.columns; c++) {
        if (!matrix[r][c].isMine) {
          let count = 0;

          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (matrix[r + i]?.[c + j]?.isMine) count++;
            }
          }

          matrix[r][c].neighborMines = count;
        }
      }
    }
  }

  return matrix;
}
