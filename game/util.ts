import { Board, Cell, Coord, Settings } from "./game";

export const DIFFICULTIES = {
  easy: { label: "Fácil", rows: 7, columns: 7, mines: 10 },
  medium: { label: "Médio", rows: 12, columns: 12, mines: 25 },
  hard: { label: "Difícil", rows: 15, columns: 15, mines: 45 },
};

export function getCellSize(columns: number) {
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

type GenerateBoardProps = {
  enableBombs: boolean;
  safeCellCoord?: Coord & { flagged?: boolean };
  settings: Settings;
};

export function getRandomChaosThreshold() {
  return Math.floor(Math.random() * 4) + 2;
}

export function getFlaggedCount(board: Board) {
  const flagged = board.flat(1).filter((cell) => cell.isFlagged);
  return flagged.length;
}

export function generateBoard({
  settings,
  safeCellCoord,
  enableBombs,
}: GenerateBoardProps): Board {
  const matrix = Array.from({ length: settings.rows }, (_, row) => {
    return Array.from({ length: settings.columns }, (_, column) => {
      const safeCellIsCurrentCell =
        safeCellCoord?.row === row && safeCellCoord?.col === column;

      return {
        coord: { col: column, row },
        isMine: false,
        isTriggered: false,
        isRevealed: false,
        isFlagged: safeCellIsCurrentCell && !!safeCellCoord?.flagged,
        neighborMines: 0,
        id: crypto.randomUUID(),
      } as Cell;
    });
  });

  let minesPlaced = 0;

  if (enableBombs) {
    while (minesPlaced < settings.mines) {
      const r = Math.floor(Math.random() * settings.rows);
      const c = Math.floor(Math.random() * settings.columns);

      if (r !== safeCellCoord?.row || c !== safeCellCoord?.col) {
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

type GetAroundCellProps = {
  coord: Coord;
  board: Board;
};

export function getAroundCell(
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

type RevealCellsProps = {
  coords: Coord[];
  board: Board;
  allowMultipleTriggered?: boolean;
};

export function floodRevealCells({
  board,
  coords,
  allowMultipleTriggered = false,
}: RevealCellsProps & { allowMultipleTriggered?: boolean }): Board {
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

            if (
              newBoard[nr]?.[nc] &&
              !newBoard[nr][nc].isRevealed &&
              !newBoard[nr][nc].isFlagged
            ) {
              queue.push([nr, nc]);
            }
          }
        }
      }
    }
  });

  return newBoard;
}

export function revealAllMines(board: Board): Board {
  const newBoard = structuredClone(board);

  for (let row = 0; row < newBoard.length; row++) {
    for (let col = 0; col < newBoard[row].length; col++) {
      const cell = newBoard[row][col];

      if (cell.isMine) {
        cell.isRevealed = true;
      }
    }
  }

  return newBoard;
}
