import { useReducer } from "react";
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

      const result = resolveClick(state, cell, forceFlagMode);

      if (state.currentState === "IDLE") {
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
  };
};

function resolveClick(
  state: GameState,
  cell: Cell,
  forceFlagMode: boolean,
): ActionResult {
  if (state.currentState === "IDLE") {
    return resolveFirstClick(state, cell, forceFlagMode);
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
): ActionResult {
  const isDecisionMode = state.modes.includes(Modes.Decision);
  const isFlagMode = forceFlagMode || state.isFlagMode;
  const canPlaceFlag = !isDecisionMode && isFlagMode;

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

  const revealedBoard = floodRevealCells({
    board,
    coords: [cell.coord],
  });

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

  const isDecisionMode = state.modes.includes(Modes.Decision);
  const isFlagMode = forceFlagMode || state.isFlagMode;

  if (isFlagMode) {
    if (isDecisionMode) {
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
    board = floodRevealCells({
      board,
      coords: [cell.coord],
    });

    return {
      board,
      revealed: true,
      hitMine: cell.isMine,
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
