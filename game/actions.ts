import { Action, Actions, Settings } from "./game";
import { Modes } from "./mode";
import {
  DIFFICULTIES,
  generateBoard,
  getCellSize,
  getRandomChaosThreshold,
} from "./util";

function getInitialLife(settings: Settings, modes: Modes[]) {
  const hasLifeMode = modes.includes(Modes.Life);

  if (!hasLifeMode) return 1;

  switch (settings.mines) {
    case 10: // fácil
      return 3;
    case 25: // médio
      return 6;
    case 45: // difícil
      return 9;
    default:
      return 3;
  }
}

export const ResetAction: Action<Actions.Reset> = (state, action) => {
  const settings = action?.payload.settings || state.settings;

  const life = getInitialLife(settings, state.modes);

  return {
    ...state,
    time: 0,
    life: life,
    isFlagMode: false,
    settings: settings,
    currentState: "IDLE",
    minesLeft: settings.mines,
    flagsEnabled: !(
      state.modes.includes(Modes.Chaos) || state.modes.includes(Modes.Decision)
    ),
    board: generateBoard({ enableBombs: false, settings: settings }),
    cellSize: getCellSize(settings.columns),
    chaos: {
      chaosClicks: 0,
      chaosThreshold: getRandomChaosThreshold(),
      shouldTriggerChaos: true,
      isShuffling: false,
    },
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
    ...ResetAction(
      { ...state, modes: action.payload.modes },
      { type: Actions.Reset, payload: { settings: state.settings } },
    ),
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

export const DamageAction: Action<Actions.Damage> = (state) => {
  return {
    ...state,
    life: Math.max(0, state.life - 1),
  };
};

export const IncrementChaosAction: Action<Actions.IncrementChaos> = (state) => {
  const nextClicks = state.chaos.chaosClicks + 1;

  if (nextClicks >= state.chaos.chaosThreshold) {
    return {
      ...state,
      chaos: {
        ...state.chaos,
        chaosClicks: 0,
        chaosThreshold: getRandomChaosThreshold(),
        shouldTriggerChaos: true,
      },
    };
  }

  return {
    ...state,
    chaos: {
      ...state.chaos,
      chaosClicks: nextClicks,
      shouldTriggerChaos: false,
    },
  };
};
