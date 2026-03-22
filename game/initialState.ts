import { Difficulties, GameState } from "./game";
import { Modes } from "./mode";
import { DIFFICULTIES, generateBoard, getCellSize } from "./util";

const defaultDifficulty: Difficulties = "easy";
const defaultSettings = DIFFICULTIES[defaultDifficulty];

export const initialState: GameState = {
  time: 0,
  currentState: "START",
  isFlagMode: false,
  mode: Modes.Classic,
  previewCells: new Set(),
  settings: defaultSettings,
  difficulty: defaultDifficulty,
  cellSize: getCellSize(defaultSettings.columns),
  board: generateBoard({
    enableBombs: false,
    settings: defaultSettings,
  }),
};
