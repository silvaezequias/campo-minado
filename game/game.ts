import { ButtonSize } from "@/components/Button";
import { DIFFICULTIES } from "./util";

export type ActionMap = Record<
  Actions,
  | Record<string, string | number | boolean | Set<string | number | boolean>>
  | undefined
> & {
  SET_PREVIEW_CELLS: {
    cells: Set<string>;
  };
};

export type GamePhase = "PLAYING" | "WON" | "LOST" | "IDLE" | "START";

export enum Actions {
  Won = "WON",
  Lost = "LOST",
  Start = "START",
  Reset = "RESET",
  SetTime = "SET_TIME",
  UpdateBoard = "UPDATE_BOARD",
  SetFlagMode = "SET_FLAG_MODE",
  SetPreviewCells = "SET_PREVIEW_CELLS",
  ClearPreviewCells = "CLEAR_PREVIEW_CELLS",
  ChangeDifficulty = "CHANGE_DIFFICULTY",
}

export type GameAction =
  | { type: Actions.Won }
  | { type: Actions.Lost }
  | { type: Actions.Start }
  | { type: Actions.ClearPreviewCells }
  | { type: Actions.SetTime; payload: { time: number } }
  | { type: Actions.UpdateBoard; payload: { board: Board } }
  | { type: Actions.Reset; payload: { settings: Settings } }
  | { type: Actions.SetFlagMode; payload: { isFlagMode: boolean } }
  | { type: Actions.SetPreviewCells; payload: { cells: Set<string> } }
  | { type: Actions.ChangeDifficulty; payload: { difficulty: Difficulties } };

export type Action<T extends Actions> = (
  state: GameState,
  action?: Extract<GameAction, { type: T }>,
) => GameState;

export type Difficulties = keyof typeof DIFFICULTIES;
export type Settings = (typeof DIFFICULTIES)[keyof typeof DIFFICULTIES];

export type GameState = {
  currentState: GamePhase;
  difficulty: Difficulties;
  settings: Settings;
  cellSize: ButtonSize;
  previewCells: Set<string>;
  time: number;
  isFlagMode: boolean;
  board: Board;
};

export type Coord = {
  row: number;
  col: number;
};

export type Cell = {
  coord: Coord;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  isTriggered?: boolean;
};

export type Board = Cell[][];
