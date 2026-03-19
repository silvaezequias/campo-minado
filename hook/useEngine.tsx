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
  isTriggered?: boolean;
};

export type GameState = "start" | "playing" | "won" | "lost";
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
  const [previewCells, setPreviewCells] = useState<Set<string>>(new Set());

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

  function handleMouseDown(cell: Cell) {
    if (gameState !== "playing") return;
    if (!cell.isRevealed || cell.neighborMines === 0) return;

    const coord = { col: cell.x, row: cell.y };
    const neighbors = getAroundCell({ coord, board });
    const hidden = neighbors.filter((c) => !c.isRevealed && !c.isFlagged);
    const newPreview = new Set(hidden.map((c) => `${c.y}-${c.x}`));

    setPreviewCells(newPreview);
  }

  function clearPreview() {
    setPreviewCells(new Set());
  }
  const handleCellClick = useCallback(
    (cell: Cell, forceFlagMode: boolean = false) => {
      const coord = { col: cell.x, row: cell.y };
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
    previewCells,

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
    handleMouseDown,
    clearPreview,
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

type RevealCellsProps = {
  coords: Coords[];
  board: Board;
  allowMultipleTriggered?: boolean;
};

function revealCells({
  board,
  coords,
  allowMultipleTriggered = false,
}: RevealCellsProps & { allowMultipleTriggered?: boolean }): Cell[][] {
  const newBoard = structuredClone(board);

  let triggered = false;

  coords.forEach(({ row, col }) => {
    const start = newBoard[row]?.[col];
    if (!start || start.isRevealed || start.isFlagged) return;

    const queue: [number, number][] = [[row, col]];

    while (queue.length) {
      const [r, c] = queue.shift()!;

      const current = newBoard[r]?.[c];
      if (!current || current.isRevealed || current.isFlagged) continue;

      current.isRevealed = true;

      if (current.isMine) {
        if (allowMultipleTriggered) {
          current.isTriggered = true;
        } else if (!triggered) {
          current.isTriggered = true;
          triggered = true;
        }

        continue;
      }

      if (current.neighborMines === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            const nr = r + i;
            const nc = c + j;

            if (newBoard[nr]?.[nc] && !newBoard[nr][nc].isRevealed) {
              queue.push([nr, nc]);
            }
          }
        }
      }
    }
  });

  return newBoard;
}

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

  if (!cell || cell.isFlagged) return;

  if (cell.isRevealed && cell.neighborMines > 0) {
    const neighbors = getAroundCell({ coord, board });

    const flagged = neighbors.filter((c) => c.isFlagged);
    const hidden = neighbors.filter((c) => !c.isRevealed && !c.isFlagged);

    if (flagged.length >= cell.neighborMines) {
      const coordsToReveal = hidden.map(
        (neighbor): Coords => ({
          col: neighbor.x,
          row: neighbor.y,
        }),
      );

      setBoard((prev) => {
        const newBoard = revealCells({
          board: prev,
          coords: coordsToReveal,
          allowMultipleTriggered: true,
        });
        updateGame({ board: newBoard, setBoard, setState });
        return newBoard;
      });
    }

    return;
  }

  const newBoard = revealCells({ board, coords: [coord] });

  updateGame({
    board: newBoard,
    setBoard,
    setState,
  });
}

function updateGame({
  board,
  setBoard,
  setState,
}: {
  board: Cell[][];
  setBoard: (b: Cell[][]) => void;
  setState: (s: GameState) => void;
}) {
  const { won, lost } = evaluateGame(board);

  if (lost) {
    for (const row of board) {
      for (const cell of row) {
        if (cell.isMine) cell.isRevealed = true;
      }
    }

    setState("lost");
  } else if (won) setState("won");

  setBoard(board);
}

function evaluateGame(board: Board) {
  let hiddenNonMine = 0;
  let mineRevealed = false;

  for (const row of board) {
    for (const cell of row) {
      if (!cell.isRevealed && !cell.isMine) hiddenNonMine++;
      if (cell.isRevealed && cell.isMine) mineRevealed = true;
    }
  }

  return {
    won: hiddenNonMine === 0,
    lost: mineRevealed,
  };
}

type GetAroundCellProps = {
  coord: Coords;
  board: Board;
};

function getAroundCell(
  { coord, board }: GetAroundCellProps,
  filter?: (cell: Cell) => boolean,
) {
  const directions = [
    { col: -1, row: -1 },
    { col: 0, row: -1 },
    { col: 1, row: -1 },
    { col: -1, row: 0 },
    { col: 1, row: 0 },
    { col: -1, row: 1 },
    { col: 0, row: 1 },
    { col: 1, row: 1 },
  ];

  return directions
    .map(({ col, row }) => ({
      col: coord.col + col,
      row: coord.row + row,
    }))
    .filter(({ row, col }) => board[row] && board[row][col])
    .map(({ row, col }) => board[row][col])
    .filter((cell) => (filter ? filter(cell) : true));
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
