import { Action, Actions } from "./game";
import { DIFFICULTIES, generateBoard, getCellSize } from "./util";

export const ResetAction: Action<Actions.Reset> = (state, action) => {
  const settings = action?.payload.settings || state.settings;

  return {
    ...state,
    time: 0,
    isFlagMode: false,
    settings: settings,
    currentState: "IDLE",
    minesLeft: settings.mines,
    board: generateBoard({ enableBombs: false, settings: settings }),
    cellSize: getCellSize(settings.columns),
  };
};

export const StartAction: Action<Actions.Start> = (state) => {
  if (state.currentState !== "IDLE") return state;

  return {
    ...state,
    currentState: "PLAYING",
  };
};

export const SetPreviewCellsAction: Action<Actions.SetPreviewCells> = (
  state,
  action,
) => {
  if (!action) return state;

  return {
    ...state,
    previewCells: action.payload.cells,
  };
};

export const ClearPreviewCellsAction: Action<Actions.ClearPreviewCells> = (
  state,
) => {
  return {
    ...state,
    previewCells: new Set(),
  };
};

export const ChangeDifficultyAction: Action<Actions.ChangeDifficulty> = (
  state,
  action,
) => {
  if (!action?.payload.difficulty) return state;

  const newSettings = DIFFICULTIES[action.payload.difficulty];

  return {
    ...ResetAction(state, {
      type: Actions.Reset,
      payload: { settings: newSettings },
    }),
    difficulty: action.payload.difficulty,
  };
};

export const ChangeGameMode: Action<Actions.ChangeGameMode> = (
  state,
  action,
) => {
  if (!action?.payload.modes) return state;

  return {
    ...ResetAction(state, {
      type: Actions.Reset,
      payload: { settings: state.settings },
    }),
    modes: action.payload.modes,
  };
};

export const UpdateBoard: Action<Actions.UpdateBoard> = (state, action) => {
  if (!action?.payload.board) return state;

  return {
    ...state,
    board: action.payload.board,
  };
};

export const SetFlagMode: Action<Actions.SetFlagMode> = (state, action) => {
  if (action?.payload.isFlagMode === undefined) return state;

  return {
    ...state,
    isFlagMode: action.payload.isFlagMode,
  };
};

export const LostAction: Action<Actions.Lost> = (state) => {
  return {
    ...state,
    currentState: "LOST",
  };
};

export const WonAction: Action<Actions.Won> = (state) => {
  return {
    ...state,
    currentState: "WON",
  };
};

export const SetTimeAction: Action<Actions.SetTime> = (state, action) => {
  if (action?.payload.time === undefined) return state;

  return {
    ...state,
    time: action.payload.time,
  };
};
