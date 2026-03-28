import { Difficulties, GameState } from "./game";
import { Modes } from "./mode";
import {
  DIFFICULTIES,
  generateBoard,
  getCellSize,
  getRandomChaosThreshold,
} from "./util";

const defaultDifficulty: Difficulties = "easy";
const defaultSettings = DIFFICULTIES[defaultDifficulty];

export const initialState: GameState = {
  life: 1,
  time: 0,
  currentState: "START",
  isFlagMode: false,
  flagsEnabled: true,
  modes: [Modes.Classic],
  previewCells: new Set(),
  settings: defaultSettings,
  difficulty: defaultDifficulty,
  cellSize: getCellSize(defaultSettings.columns),
  chaos: {
    chaosClicks: 0,
    shouldTriggerChaos: false,
    chaosThreshold: getRandomChaosThreshold(),
  },
  board: generateBoard({
    enableBombs: false,
    settings: defaultSettings,
  }),
};
