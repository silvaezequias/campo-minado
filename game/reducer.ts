import {
  ChangeDifficultyAction,
  ChangeGameMode,
  ClearPreviewCellsAction,
  LostAction,
  ResetAction,
  SetFlagMode,
  SetPreviewCellsAction,
  SetTimeAction,
  StartAction,
  UpdateBoard,
  WonAction,
} from "./actions";
import { Actions, GameAction, GameState } from "./game";

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case Actions.Lost:
      return LostAction(state);
    case Actions.Won:
      return WonAction(state);
    case Actions.Start:
      return StartAction(state);
    case Actions.Reset:
      return ResetAction(state, action);
    case Actions.SetTime:
      return SetTimeAction(state, action);
    case Actions.UpdateBoard:
      return UpdateBoard(state, action);
    case Actions.SetFlagMode:
      return SetFlagMode(state, action);
    case Actions.SetPreviewCells:
      return SetPreviewCellsAction(state, action);
    case Actions.ClearPreviewCells:
      return ClearPreviewCellsAction(state);
    case Actions.ChangeDifficulty:
      return ChangeDifficultyAction(state, action);
    case Actions.ChangeGameMode:
      return ChangeGameMode(state, action);

    default:
      return state;
  }
}
