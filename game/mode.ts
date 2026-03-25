import {
  Brain,
  Timer,
  Heart,
  Shuffle,
  Bomb,
  FlagOff,
  Dice5,
} from "lucide-react";
import { JSX } from "react";

export enum Modes {
  Classic = "CLASSIC",
  Points = "POINTS",
  Memory = "MEMORY",
  Pressure = "PRESSURE",
  Life = "LIFE",
  Chaos = "CHAOS",
  Decision = "DECISION",
}

export enum ModeGroup {
  Base = "BASE",
  Cognitive = "COGNITIVE",
  Modifier = "MODIFIER",
  Chaos = "CHAOS",
}

export type ModeProps = {
  id: Modes;
  label: string;
  description: string;
  longDescription: string;
  icon: JSX.ElementType;
  isHard?: boolean;
  enabled: boolean;
  group: ModeGroup;
};

export const MODE_CONFLICTS: Modes[][] = [
  [Modes.Classic, Modes.Chaos, Modes.Memory],
];

export const MODES: ModeProps[] = [
  {
    id: Modes.Classic,
    label: "Clássico",
    description: "A experiência original",
    longDescription:
      "A experiência tradicional do campo minado. Use lógica e atenção para identificar bombas com base nos números exibidos. Ideal para quem quer jogar da forma original.",
    icon: Bomb,
    enabled: true,
    group: ModeGroup.Base,
  },
  {
    id: Modes.Points,
    label: "Pontos",
    description: "Leitura visual com pontos",
    longDescription:
      "Os números são substituídos por pontos visuais. A lógica continua a mesma, mas a leitura exige mais atenção e percepção visual.",
    icon: Dice5,
    enabled: true,
    group: ModeGroup.Cognitive,
  },
  {
    id: Modes.Decision,
    label: "Decisão",
    description: "Sem marcações, só escolhas",
    longDescription:
      "Sem marcações ou bandeiras. Cada jogada é definitiva, exigindo mais confiança na sua leitura e aumentando o risco a cada escolha.",
    icon: FlagOff,
    enabled: true,
    group: ModeGroup.Modifier,
  },
  {
    id: Modes.Life,
    label: "Vida",
    description: "Erre sem perder na hora",
    longDescription:
      "Você tem uma segunda chance. Ao clicar em uma bomba, não perde imediatamente. Ideal para partidas mais relaxadas ou para aprender o jogo.",
    icon: Heart,
    enabled: true,
    group: ModeGroup.Modifier,
  },
  {
    id: Modes.Memory,
    label: "Memória",
    description: "Memorize antes de sumir",
    longDescription:
      "Os números aparecem por um curto período e depois desaparecem. Você precisa memorizar o tabuleiro e usar lógica para continuar.",
    icon: Brain,
    isHard: true,
    enabled: true,
    group: ModeGroup.Base,
  },
  {
    id: Modes.Pressure,
    label: "Pressão",
    description: "Pense rápido ou perca",
    longDescription:
      "Você precisa resolver o tabuleiro contra o tempo. Decisões rápidas são essenciais, reduzindo o tempo para análise e aumentando a tensão.",
    icon: Timer,
    isHard: true,
    enabled: false,
    group: ModeGroup.Modifier,
  },
  {
    id: Modes.Chaos,
    label: "Caos",
    description: "Nada fica no lugar",
    longDescription:
      "O tabuleiro não é estático. Bombas podem mudar de posição durante a partida, exigindo adaptação constante e quebrando padrões previsíveis.",
    icon: Shuffle,
    isHard: true,
    enabled: false,
    group: ModeGroup.Base,
  },
];

export function toggleMode(
  activeModes: Modes[],
  modeToToggleId: Modes,
): Modes[] {
  const modeToToggle = MODES.find((m) => m.id === modeToToggleId);

  if (!modeToToggle) return activeModes;

  const isActive = activeModes.includes(modeToToggle.id);

  // 🔴 REMOVE
  if (isActive) {
    const result = activeModes.filter((id) => id !== modeToToggle.id);

    const hasBase = result.some(
      (m) => MODES.find((M) => M.id === m)?.group === ModeGroup.Base,
    );

    if (!hasBase) {
      result.push(Modes.Classic);
    }

    return result;
  }

  // 🟡 REMOVE CONFLITOS
  const conflicts = hasConflict(activeModes, modeToToggle.id);

  let result = activeModes.filter((id) => !conflicts.includes(id));

  const hasBase = result.some(
    (m) => MODES.find((M) => M.id === m)?.group === ModeGroup.Base,
  );

  if (!hasBase) {
    result.push(Modes.Classic);
  }

  // 🔵 REGRA DE GRUPO BASE (1 ativo)
  if (modeToToggle.group === ModeGroup.Base) {
    result = result.filter((id) => {
      const mode = MODES.find((m) => m.id === id);
      return mode?.group !== ModeGroup.Base;
    });
  }

  // 🟢 ADICIONA NOVO
  result.push(modeToToggle.id);

  return result;
}

function hasConflict(activeModes: Modes[], modeToAdd: Modes): Modes[] {
  return activeModes.filter((active) => {
    return MODE_CONFLICTS.some((conflictGroup) => {
      return (
        conflictGroup.includes(active) && conflictGroup.includes(modeToAdd)
      );
    });
  });
}
