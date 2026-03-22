import {
  Brain,
  Timer,
  Heart,
  Shuffle,
  Bomb,
  Grip,
  FlagOff,
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

export type ModeProps = {
  id: Modes;
  label: string;
  description: string;
  longDescription: string;
  icon: JSX.ElementType;
  isHard?: boolean;
};

export const MODES: ModeProps[] = [
  {
    id: Modes.Classic,
    label: "Clássico",
    description: "A experiência original",
    longDescription:
      "A experiência tradicional do campo minado. Use lógica e atenção para identificar bombas com base nos números exibidos. Ideal para quem quer jogar da forma original.",
    icon: Bomb,
  },
  {
    id: Modes.Points,
    label: "Pontos",
    description: "Leitura visual com pontos",
    longDescription:
      "Os números são substituídos por pontos visuais. A lógica continua a mesma, mas a leitura exige mais atenção e percepção visual.",
    icon: Grip,
  },
  {
    id: Modes.Life,
    label: "Vida",
    description: "Erre sem perder na hora",
    longDescription:
      "Você tem uma segunda chance. Ao clicar em uma bomba, não perde imediatamente. Ideal para partidas mais relaxadas ou para aprender o jogo.",
    icon: Heart,
  },
  {
    id: Modes.Decision,
    label: "Decisão",
    description: "Sem marcações, só escolhas",
    longDescription:
      "Sem marcações ou bandeiras. Cada jogada é definitiva, exigindo mais confiança na sua leitura e aumentando o risco a cada escolha.",
    icon: FlagOff,
  },
  {
    id: Modes.Memory,
    label: "Memória",
    description: "Memorize antes de sumir",
    longDescription:
      "Os números aparecem por um curto período e depois desaparecem. Você precisa memorizar o tabuleiro e usar lógica para continuar.",
    icon: Brain,
    isHard: true,
  },
  {
    id: Modes.Pressure,
    label: "Pressão",
    description: "Pense rápido ou perca",
    longDescription:
      "Você precisa resolver o tabuleiro contra o tempo. Decisões rápidas são essenciais, reduzindo o tempo para análise e aumentando a tensão.",
    icon: Timer,
    isHard: true,
  },
  {
    id: Modes.Chaos,
    label: "Caos",
    description: "Nada fica no lugar",
    longDescription:
      "O tabuleiro não é estático. Bombas podem mudar de posição durante a partida, exigindo adaptação constante e quebrando padrões previsíveis.",
    icon: Shuffle,
    isHard: true,
  },
];
