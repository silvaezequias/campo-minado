"use client";

import { ButtonSize } from "@/components/Button";
import { useCallback, useState } from "react";

export type Cell = {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  powerup: null;
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

  const [gameState, setGameState] = useState<
    "start" | "playing" | "won" | "lost"
  >("start");

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

  const generateBoard = useCallback(
    (props?: {
      generateBombs?: { notInX: number; notInY: number; flagged?: boolean };
      settings?: (typeof DIFFICULTIES)[keyof typeof DIFFICULTIES];
    }) => {
      const settings = props?.settings || config;

      const matrix = Array.from({ length: settings.rows }, (_, row) =>
        Array.from({ length: settings.columns }, (_, column) => ({
          x: column,
          y: row,
          isMine: false,
          isRevealed: false,
          isFlagged: !!props?.generateBombs?.flagged,
          neighborMines: 0,
          powerup: null,
        })),
      );

      let minesPlaced = 0;

      if (props?.generateBombs) {
        while (minesPlaced < settings.mines) {
          const r = Math.floor(Math.random() * settings.rows);
          const c = Math.floor(Math.random() * settings.columns);

          if (
            r !== props.generateBombs.notInY ||
            c !== props.generateBombs.notInX
          ) {
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
    },
    [config],
  );

  const [board, setBoard] = useState(() => generateBoard());

  const reset = (
    settings: (typeof DIFFICULTIES)[keyof typeof DIFFICULTIES] = config,
  ) => {
    setGameState("start");
    setBoard(generateBoard({ settings }));
    setMinesLeft(settings.mines);
  };

  const revealCell = useCallback(
    (r: number, c: number) => {
      let currentBoard = board;

      if (gameState === "start") {
        setGameState("playing");

        const newBoard = generateBoard({
          generateBombs: { notInX: c, notInY: r },
        });

        setBoard(newBoard);
        currentBoard = newBoard;
      } else if (gameState !== "playing") return;

      const cell = currentBoard[r]?.[c];
      if (!cell || cell.isRevealed || cell.isFlagged) return;

      if (isFlagMode) {
        const newBoard = currentBoard.map((row) =>
          row.map((cell) => ({ ...cell })),
        );

        newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;

        setMinesLeft((prev) =>
          newBoard[r][c].isFlagged ? prev - 1 : prev + 1,
        );

        setBoard(newBoard);
        return;
      }

      const newBoard = currentBoard.map((row) =>
        row.map((cell) => ({ ...cell })),
      );

      const start = newBoard[r][c];

      if (start.isMine) {
        newBoard.forEach((row) =>
          row.forEach((cell) => {
            if (cell.isMine) cell.isRevealed = true;
          }),
        );

        setBoard(newBoard);
        setGameState("lost");
        return;
      }

      const queue: [number, number][] = [[r, c]];

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

      if (won) setGameState("won");
    },
    [board, gameState, isFlagMode, generateBoard, setBoard],
  );

  const toggleFlag = (r: number, c: number) => {
    let currentBoard = board;
    if (gameState === "start") {
      setGameState("playing");

      const newBoard = generateBoard({
        generateBombs: { notInX: c, notInY: r },
      });

      setBoard(newBoard);
      currentBoard = newBoard;
    } else if (gameState !== "playing" || currentBoard[r][c].isRevealed) return;

    const newBoard = [...currentBoard.map((row) => [...row])];
    const isNowFlagged = !newBoard[r][c].isFlagged;

    if (isNowFlagged && minesLeft <= 0) return;

    newBoard[r][c].isFlagged = isNowFlagged;
    setBoard(newBoard);
    setMinesLeft((prev) => (isNowFlagged ? prev - 1 : prev + 1));
  };

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
  };
}

export type Engine = ReturnType<typeof useGameEngine>;
