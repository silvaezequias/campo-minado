import { Dispatch, SetStateAction } from "react";
import { Check, LockKeyhole } from "lucide-react";
import { Button } from "./Button";
import { ModeProps, Modes } from "@/game/mode";
import { Modal, ModalHeader } from "./Modal";

type ModeListProps = {
  options: ModeProps[];
  modes: Modes[];
  onChange: (mode: Modes) => void;
  modeListOpen: boolean;
  setModeListOpen: Dispatch<SetStateAction<boolean>>;
};

export const ModeList = ({
  options,
  modes,
  modeListOpen,
  onChange,
  setModeListOpen,
}: ModeListProps) => {
  const activeModes = modes.map((m) => {
    return options.find((o) => o.id === m);
  }) as ModeProps[];

  return (
    <div className="w-full rounded-xl">
      <div className="flex gap-2 text-amber-300 ">
        <Trigger
          activeModes={activeModes}
          open={modeListOpen}
          onToggle={() => setModeListOpen((prev) => !prev)}
        />
      </div>

      {modeListOpen && (
        <Modal setOpen={setModeListOpen}>
          <div className="z-50 w-[90%] md:w-[50%] lg:w-[40%] xl:w-[20%] p-5 gap-3 bg-neutral-900 borde border-zinc-800 rounded-2xl flex flex-col">
            <ModalHeader
              onClick={() => setModeListOpen(false)}
              title="Modos de Jogo"
            />
            <List
              options={options}
              modes={modes}
              onSelect={(mode) => {
                onChange(mode);
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

const Trigger = ({
  activeModes,
  onToggle,
}: {
  activeModes: ModeProps[];
  open: boolean;
  onToggle: () => void;
}) => {
  const MAX_VISIBLE = 3;

  const visibleModes = activeModes.slice(0, MAX_VISIBLE);
  const hiddenCount = activeModes.length - MAX_VISIBLE;

  return (
    <Button
      onClick={onToggle}
      variant="ghost"
      className="w-full justify-center py-3.5 bg-neutral-800/60 border-zinc-800/60"
      title={
        activeModes.length
          ? `Modos ativos: ${activeModes.map((m) => m.label).join(", ")}`
          : "Selecionar modos de jogo"
      }
    >
      <span className="tracking-widest uppercase text-sm flex gap-4 items-center">
        <span className="text-zinc-400 text-xs">modos</span>

        <div className="flex gap-2 items-center justify-center">
          {visibleModes.map((mode) => {
            const Icon = mode.icon;
            return Icon ? (
              <Icon key={mode.id} className="size-5 text-amber-300" />
            ) : null;
          })}

          {hiddenCount > 0 && (
            <span className="text-xs text-zinc-400">+{hiddenCount}</span>
          )}
        </div>
      </span>
    </Button>
  );
};
const List = ({
  options,
  modes,
  onSelect,
}: {
  options: ModeProps[];
  modes: Modes[];
  onSelect: (mode: Modes) => void;
}) => {
  options = options.sort((a, b) => {
    return Number(b.enabled) - Number(a.enabled);
  });

  return (
    <div className="w-full flex flex-col gap-2">
      {options.map((option) => (
        <Item
          key={option.id}
          option={option}
          isSelected={modes.includes(option.id)}
          onClick={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
};

const Item = ({
  option,
  isSelected,
  onClick,
}: {
  option: ModeProps;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const Icon = option.icon;

  return (
    <Button
      onClick={onClick}
      disabled={!option.enabled}
      variant={isSelected ? "outline" : "default"}
      className={`w-full flex items-center justify-between px-4 py-3 border-none ${isSelected && "ring ring-amber-300"}`}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <Icon className="size-5 shrink-0" />

          <div className="flex flex-col items-start">
            <span className="text-sm font-bold uppercase tracking-widest">
              {option.label}
            </span>

            <span className="text-xs font-normal text-start">
              {option.description}
            </span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {option.isHard && (
            <div className="text-red-500 text-xs tracking-widest">Difícil</div>
          )}
          <div className="text-xs border rounded bg-zinc-900 border-zinc-300/10 p-1">
            {option.enabled ? (
              <Check
                size="15"
                className={isSelected ? "text-amber-300" : "text-zinc-900"}
              />
            ) : (
              <LockKeyhole size="15" className="text-red-400" />
            )}
          </div>
        </div>
      </div>
    </Button>
  );
};
