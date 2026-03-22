import { Dispatch, SetStateAction } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "./Button";
import { ModeProps, Modes } from "@/game/mode";
import { Modal, ModalHeader } from "./Modal";

type ModeListProps = {
  options: ModeProps[];
  value: Modes;
  onChange: (mode: Modes) => void;
  modeListOpen: boolean;
  setModeListOpen: Dispatch<SetStateAction<boolean>>;
};

export const ModeList = ({
  options,
  value,
  modeListOpen,
  onChange,
  setModeListOpen,
}: ModeListProps) => {
  const selected = options.find((opt) => opt.id === value);

  return (
    <div className="w-full rounded-xl">
      <div className="flex gap-2 text-amber-300 ">
        <Trigger
          selected={selected}
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
              value={value}
              onSelect={(mode) => {
                onChange(mode);
                setModeListOpen(false);
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

const Trigger = ({
  selected,
  open,
  onToggle,
}: {
  selected?: ModeProps;
  open: boolean;
  onToggle: () => void;
}) => {
  const SelectedIcon = selected?.icon;

  return (
    <Button
      onClick={onToggle}
      variant="ghost"
      className="w-full justify-center py-3 bg-neutral-800/60 border-zinc-800/60"
    >
      <span className="tracking-widest uppercase text-sm flex gap-2 text-amber-300 items-center">
        {selected ? (
          <>
            {SelectedIcon && <SelectedIcon className="size-5" />}
            {selected.label}
          </>
        ) : (
          "Selecionar Modo"
        )}
        <ChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </span>
    </Button>
  );
};

const List = ({
  options,
  value,
  onSelect,
}: {
  options: ModeProps[];
  value: Modes;
  onSelect: (mode: Modes) => void;
}) => {
  return (
    <div className="w-full flex flex-col gap-1">
      {options.map((option) => (
        <Item
          key={option.id}
          option={option}
          isSelected={option.id === value}
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
      clickable={!isSelected}
      variant={isSelected ? "outline" : "default"}
      className="w-full flex items-center justify-between px-4 py-3"
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <Icon className="size-5 shrink-0" />

          <div className="flex flex-col items-start">
            <span className="text-sm font-bold uppercase tracking-widest">
              {option.label}
            </span>

            <span className="text-xs font-semibold text-start">
              {option.description}
            </span>
          </div>
        </div>

        {isSelected ? (
          <>
            <div className="text-xs hidden md:inline-block">Selecionado</div>
            <div className="text-xs md:hidden">
              <Check />
            </div>
          </>
        ) : option.isHard ? (
          <div className="text-red-400 text-xs">Difícil</div>
        ) : null}
      </div>
    </Button>
  );
};
