import { useReducer, useState } from "react";
import { gameReducer } from "./reducer";
import { initialState } from "./initialState";
import { Actions, Board, Cell, Coord, GameState } from "./game";
import {
  getAroundCell,
  floodRevealCells,
  generateBoard,
  getFlaggedCount,
  revealAllMines,
} from "./util";
import { useAudio, useAudioHelpers } from "@/utils/audio";
import { Modes } from "./mode";

export type Engine = ReturnType<typeof useGameEngine>;

type ActionResult = {
  board: Board;
  hitMine?: boolean;
  placedFlag?: boolean;
  removedFlag?: boolean;
  revealed?: boolean;
  invalidFlagAttempt?: boolean;
};

export const useGameEngine = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isBoardSuffling, setIsBoardSuffling] = useState(false);

  const { playSound } = useAudio();
  const { playOpenSound } = useAudioHelpers();

  const cellEvents = {
    mouseDown: (cell: Cell) => {
      if (state.currentState === "PLAYING") {
        const previewList = handlePreviewCells(cell, state.board);

        dispatch({
          type: Actions.SetPreviewCells,
          payload: { cells: previewList },
        });
      }
    },

    mouseUp: () => {
      if (state.currentState === "PLAYING") {
        dispatch({ type: Actions.ClearPreviewCells });
      }
    },

    handleCellClick: (cell: Cell, forceFlagMode = false) => {
      if (state.currentState === "WON" || state.currentState === "LOST") return;

      const result = resolveClick(state, cell, forceFlagMode, state.board);

      if (!cell.isRevealed) {
        const triggerChaos =
          result.revealed &&
          state.modes.includes(Modes.Chaos) &&
          shouldTriggerChaos(state);

        if (result.revealed || result.placedFlag || result.removedFlag) {
          dispatch({ type: Actions.IncrementChaos });
        }

        if (triggerChaos) {
          setIsBoardSuffling(true);

          setTimeout(() => {
            result.board = applyChaos(result.board);
            setIsBoardSuffling(false);

            dispatch({
              type: Actions.UpdateBoard,
              payload: { board: result.board },
            });
          }, 1500);

          return;
        }
      }
      if (state.currentState === "IDLE" && !result.invalidFlagAttempt) {
        dispatch({ type: Actions.Start });
      }

      if (result.invalidFlagAttempt) {
        playSound("wrong_move");
      }

      if (result.placedFlag) playSound("place_flag");
      if (result.removedFlag) playSound("remove_flag");
      if (result.revealed) playOpenSound();

      if (result.hitMine) {
        const hasLifeMode = state.modes.includes(Modes.Life);

        if (hasLifeMode && state.life > 1) {
          dispatch({ type: Actions.Damage });
          playSound("explosion");
        } else {
          const board = revealAllMines(result.board);

          dispatch({ type: Actions.Lost });
          dispatch({ type: Actions.Damage });

          playSound("explosion");
          playSound("lose");

          dispatch({
            type: Actions.UpdateBoard,
            payload: { board },
          });

          return;
        }
      }

      const { won } = evaluateGame(result.board);

      let finalBoard = result.board;

      if (won) {
        finalBoard = revealAllMines(result.board);

        dispatch({ type: Actions.Won });
        playSound("win");
        playSound("win_voices");
      }

      dispatch({
        type: Actions.UpdateBoard,
        payload: { board: finalBoard },
      });
    },
  };

  return {
    state,
    dispatch,
    cellEvents,
    isBoardSuffling,
  };
};

function resolveClick(
  state: GameState,
  cell: Cell,
  forceFlagMode: boolean,
  oldBoard: Board,
): ActionResult {
  if (state.currentState === "IDLE") {
    return resolveFirstClick(state, cell, forceFlagMode, oldBoard);
  }

  if (state.currentState === "PLAYING") {
    return resolvePlayingClick(state, cell, forceFlagMode);
  }

  return { board: state.board };
}

function resolveFirstClick(
  state: GameState,
  cell: Cell,
  forceFlagMode: boolean,
  oldBoard: Board,
): ActionResult {
  const isFlagMode = forceFlagMode || state.isFlagMode;
  const canPlaceFlag = state.flagsEnabled && isFlagMode;

  if (isFlagMode) {
    if (!state.flagsEnabled) {
      return {
        board: oldBoard,
        invalidFlagAttempt: true,
      };
    }
  }

  const board = generateBoard({
    enableBombs: true,
    settings: state.settings,
    safeCellCoord: {
      ...cell.coord,
      flagged: canPlaceFlag,
    },
  });

  if (isFlagMode) {
    return {
      board,
      placedFlag: canPlaceFlag,
    };
  }

  const isChaosMode = state.modes.includes(Modes.Chaos);

  let revealedBoard: Board;

  if (isChaosMode) {
    const newBoard = structuredClone(board);
    newBoard[cell.coord.row][cell.coord.col].isRevealed = true;
    revealedBoard = newBoard;
  } else {
    revealedBoard = floodRevealCells({
      board,
      coords: [cell.coord],
    });
  }

  return {
    board: revealedBoard,
    revealed: true,
    hitMine: cell.isMine,
  };
}

function resolvePlayingClick(
  state: GameState,
  cell: Cell,
  forceFlagMode: boolean,
): ActionResult {
  let board = state.board;

  const isFlagMode = forceFlagMode || state.isFlagMode;

  if (isFlagMode) {
    if (!state.flagsEnabled) {
      return {
        board,
        invalidFlagAttempt: true,
      };
    }

    const before = getFlaggedCount(board);
    board = toggleFlag(board, cell.coord, state.settings.mines);
    const after = getFlaggedCount(board);

    return {
      board,
      placedFlag: after > before,
      removedFlag: after < before,
    };
  }

  if (!cell.isRevealed) {
    const wasMine = cell.isMine;

    const isChaosMode = state.modes.includes(Modes.Chaos);

    if (!cell.isRevealed) {
      const wasMine = cell.isMine;

      if (isChaosMode) {
        const newBoard = structuredClone(board);
        newBoard[cell.coord.row][cell.coord.col].isRevealed = true;
        board = newBoard;
      } else {
        board = floodRevealCells({
          board,
          coords: [cell.coord],
        });
      }

      return {
        board,
        revealed: true,
        hitMine: wasMine,
      };
    }
    return {
      board,
      revealed: true,
      hitMine: wasMine,
    };
  }

  board = chordReveal(cell, board);

  return {
    board,
    revealed: true,
  };
}

function evaluateGame(board: Board) {
  let hiddenNonMine = 0;

  for (const row of board) {
    for (const cell of row) {
      if (!cell.isRevealed && !cell.isMine) hiddenNonMine++;
    }
  }

  return {
    won: hiddenNonMine === 0,
  };
}

function toggleFlag(board: Board, coord: Coord, minesCount: number): Board {
  const newBoard = structuredClone(board);
  const cell = newBoard[coord.row]?.[coord.col];

  if (!cell || cell.isRevealed) return newBoard;
  if (!cell.isFlagged && minesCount - getFlaggedCount(newBoard) <= 0)
    return newBoard;

  cell.isFlagged = !cell.isFlagged;

  return newBoard;
}

function handlePreviewCells(cell: Cell, board: Board) {
  if (!cell.isRevealed || cell.neighborMines === 0) return new Set<string>();

  const neighbors = getAroundCell({ coord: cell.coord, board });
  const hidden = neighbors.filter((c) => !c.isRevealed && !c.isFlagged);

  return new Set(hidden.map((c) => `${c.coord.row}-${c.coord.col}`));
}

function chordReveal(cell: Cell, board: Board): Board {
  if (!cell || cell.isFlagged) return board;

  if (cell.isRevealed && cell.neighborMines > 0) {
    const neighbors = getAroundCell({ coord: cell.coord, board });

    const flagged = neighbors.filter((c) => c.isFlagged);
    const hidden = neighbors.filter((c) => !c.isRevealed && !c.isFlagged);

    if (flagged.length === cell.neighborMines) {
      const coordsToReveal = hidden.map((n): Coord => n.coord);

      return floodRevealCells({
        board,
        coords: coordsToReveal,
        allowMultipleTriggered: true,
      });
    }
  }

  return board;
}

function applyChaos(board: Board): Board {
  let newBoard = structuredClone(board);

  let revealedCount = 0;

  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.isRevealed) revealedCount++;
      cell.isRevealed = false;
    }
  }

  const revealedCells: Cell[] = [];
  const hiddenCells: Cell[] = [];

  let minesToPlace = 0;

  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.isMine) minesToPlace++;
      hiddenCells.push(cell);
      cell.isMine = false;
    }
  }

  placeMinesWithConstraints(newBoard, revealedCells, hiddenCells, minesToPlace);

  newBoard = recalculateBoardNumbers(newBoard);

  newBoard = revealRandomSafeCells(newBoard, revealedCount);

  return newBoard;
}

function placeMinesWithConstraints(
  board: Board,
  revealedCells: Cell[],
  hiddenCells: Cell[],
  minesToPlace: number,
) {
  const shuffled = shuffleArray(hiddenCells);

  for (const cell of shuffled) {
    if (minesToPlace <= 0) break;

    cell.isMine = true;

    if (!isValidBoard(board, revealedCells)) {
      cell.isMine = false;
    } else {
      minesToPlace--;
    }
  }

  if (minesToPlace > 0) {
    const remaining = shuffleArray(hiddenCells);

    for (const cell of remaining) {
      if (minesToPlace <= 0) break;

      if (!cell.isMine) {
        cell.isMine = true;
        minesToPlace--;
      }
    }
  }
}
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function isValidBoard(board: Board, revealedCells: Cell[]) {
  for (const cell of revealedCells) {
    const neighbors = getAroundCell({ coord: cell.coord, board });

    const mineCount = neighbors.filter((c) => c.isMine).length;

    if (mineCount !== cell.neighborMines) {
      return false;
    }
  }

  return true;
}

function recalculateBoardNumbers(board: Board): Board {
  const newBoard = structuredClone(board);

  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.isMine) continue;

      const neighbors = getAroundCell({ coord: cell.coord, board: newBoard });
      cell.neighborMines = neighbors.filter((c) => c.isMine).length;
    }
  }

  return newBoard;
}

function revealRandomSafeCells(board: Board, count: number): Board {
  const newBoard = structuredClone(board);

  const safeCells = getSafeCells(newBoard);
  const shuffled = shuffleArray(safeCells);

  const selected = shuffled.slice(0, count);

  for (const cell of selected) {
    newBoard[cell.coord.row][cell.coord.col].isRevealed = true;
  }

  return newBoard;
}

function getSafeCells(board: Board): Cell[] {
  const safe: Cell[] = [];

  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && cell.neighborMines > 0) {
        safe.push(cell);
      }
    }
  }

  return safe;
}

function shouldTriggerChaos(state: GameState) {
  const nextClicks = state.chaos.chaosClicks + 1;
  return nextClicks >= state.chaos.chaosThreshold;
}
