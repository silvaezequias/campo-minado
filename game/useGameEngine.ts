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
      if (state.currentState !== "PLAYING" && state.currentState !== "IDLE")
        return;

      const prevPlacedFlags = state.board.flat(1).filter((c) => c.isFlagged);
      const result = resolveClick(state, cell, forceFlagMode);

      if (result.status === "FIRST_CLICK" || result.status === "FIRST_FLAG") {
        dispatch({ type: Actions.Start });
      }

      if (result.status === "FIRST_NON_FLAG" || result.status === "NON_FLAG") {
        playSound("wrong_move");
      }

      if (forceFlagMode || state.isFlagMode) {
        const currentPlacedFlags = result.board
          .flat(1)
          .filter((c) => c.isFlagged);

        if (currentPlacedFlags.length > prevPlacedFlags.length)
          playSound("place_flag");
        else if (currentPlacedFlags < prevPlacedFlags) playSound("remove_flag");
      } else {
        playOpenSound();
      }
      if (result.status === "LOST") {
        dispatch({ type: Actions.Lost });
        playSound("explosion");
        playSound("lose");
      }

      if (result.status === "WON") {
        dispatch({ type: Actions.Won });
        playSound("win");
        playSound("win_voices");
      }

      dispatch({
        type: Actions.UpdateBoard,
        payload: { board: result.board },
      });
    },
  };

  return {
    state,
    dispatch,
    cellEvents,
  };
};

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

function resolveClick(state: GameState, cell: Cell, forceFlagMode: boolean) {
  if (state.currentState === "IDLE") {
    return resolveFirstClick(state, cell, forceFlagMode);
  }

  if (state.currentState === "PLAYING") {
    return resolvePlayingClick(state, cell, forceFlagMode);
  }

  return {
    board: state.board,
    status: state.currentState,
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

function resolveFirstClick(
  state: GameState,
  cell: Cell,
  forceFlagMode: boolean,
) {
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
      status: canPlaceFlag ? "FIRST_FLAG" : "FIRST_NON_FLAG",
    };
  }

  const revealedBoard = floodRevealCells({
    board,
    coords: [cell.coord],
  });

  const { won, lost } = evaluateGame(revealedBoard);

  return {
    board: revealedBoard,
    status: lost ? "LOST" : won ? "WON" : "FIRST_CLICK",
  };
}

function resolvePlayingClick(
  state: GameState,
  cell: Cell,
  forceFlagMode: boolean,
) {
  let board = state.board;

  const isDecisionMode = state.modes.includes(Modes.Decision);
  const isFlagMode = forceFlagMode || state.isFlagMode;

  if (isFlagMode) {
    if (!isDecisionMode) {
      board = toggleFlag(board, cell.coord, state.settings.mines);
    } else {
      return {
        board,
        status: "NON_FLAG",
      };
    }
  } else {
    if (!cell.isRevealed) {
      board = floodRevealCells({
        board,
        coords: [cell.coord],
      });
    } else {
      board = chordReveal(cell, board);
    }
  }

  const { won, lost } = evaluateGame(board);
  if (lost) board = revealAllMines(board);

  return {
    board,
    status: lost ? "LOST" : won ? "WON" : "PLAYING",
  };
}

function handlePreviewCells(cell: Cell, board: Board) {
  if (!cell.isRevealed || cell.neighborMines === 0)
    return new Set() as Set<string>;

  const neighbors = getAroundCell({ coord: cell.coord, board });
  const hidden = neighbors.filter((c) => !c.isRevealed && !c.isFlagged);
  const newPreview = new Set(
    hidden.map((c) => `${c.coord.row}-${c.coord.col}`),
  );

  return new Set(newPreview);
}

function chordReveal(cell: Cell, board: Board): Board {
  if (!cell || cell.isFlagged) return board;

  if (cell.isRevealed && cell.neighborMines > 0) {
    const neighbors = getAroundCell({ coord: cell.coord, board });

    const flagged = neighbors.filter((c) => c.isFlagged);
    const hidden = neighbors.filter((c) => !c.isRevealed && !c.isFlagged);

    if (flagged.length === cell.neighborMines) {
      const coordsToReveal = hidden.map((neighbor): Coord => neighbor.coord);
      const updatedBoard = floodRevealCells({
        board,
        coords: coordsToReveal,
        allowMultipleTriggered: true,
      });

      return updatedBoard;
    }
  }

  return board;
}
