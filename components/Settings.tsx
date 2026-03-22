import { Dispatch, JSX, SetStateAction } from "react";
import { Volume2, Music, Timer, Flag, Settings, Keyboard } from "lucide-react";
import { Button } from "./Button";
import { DifficultySelector } from "./Header";
import { GameSettings } from "@/game/useGameSettings";
import { Modal, ModalHeader } from "./Modal";

type Props = {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  settingsOpen: boolean;
  setSettingsOpen: Dispatch<SetStateAction<boolean>>;
};

export const SettingsDropdown = ({
  settings,
  onChange,
  settingsOpen,
  setSettingsOpen,
}: Props) => {
  const update = (partial: Partial<GameSettings>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div className="w-fit rounded-xl">
      <Button
        onClick={() => setSettingsOpen((prev) => !prev)}
        variant="ghost"
        aspect="square"
        className="p-3 bg-neutral-800/60 border-zinc-800/60"
      >
        <span className="tracking-widest uppercase text-sm text-amber-300 flex justify-between gap-2 items-center">
          <Settings />
        </span>
      </Button>

      {/* Dropdown */}
      {settingsOpen && (
        <Modal setOpen={setSettingsOpen}>
          <div className="absolute z-50 w-full flex justify-center right-0">
            <div className="mt-2 w-[90%] md:w-[50%] lg:w-[40%] xl:w-[20%] p-3 shadow-2xl bg-neutral-900 border border-zinc-800 rounded-2xl flex flex-col gap-5">
              <ModalHeader
                title="Configurações"
                onClick={() => setSettingsOpen(false)}
              />
              <DifficultySelector
                difficulty={settings.difficulty}
                setDifficulty={(d) => update({ difficulty: d })}
              />

              {/* 🔊 Sounds */}
              <SettingRow
                icon={Volume2}
                label="Efeitos Sonoros"
                right={
                  <Toggle
                    value={settings.soundsEnabled}
                    onChange={(v) => update({ soundsEnabled: v })}
                  />
                }
              />
              <Slider
                value={settings.soundsVolume}
                onChange={(v) => update({ soundsVolume: v })}
                disabled={!settings.soundsEnabled}
              />

              {/* 🎵 Music */}
              <SettingRow
                icon={Music}
                label="Música"
                right={
                  <Toggle
                    value={settings.musicEnabled}
                    onChange={(v) => update({ musicEnabled: v })}
                  />
                }
              />
              <Slider
                value={settings.musicVolume}
                onChange={(v) => update({ musicVolume: v })}
                disabled={!settings.musicEnabled}
              />

              {/* ⏱ Timer */}
              <SettingRow
                icon={Timer}
                label="Mostrar Tempo"
                right={
                  <Toggle
                    value={settings.showTimer}
                    onChange={(v) => update({ showTimer: v })}
                  />
                }
              />

              {/* 🚩 Flags */}
              <SettingRow
                icon={Flag}
                label="Mostrar Bandeiras Restantes"
                right={
                  <Toggle
                    value={settings.showFlagsLeft}
                    onChange={(v) => update({ showFlagsLeft: v })}
                  />
                }
              />

              {/* 🚩 Flags */}
              <SettingRow
                icon={Keyboard}
                label="Mostrar Atalhos de Teclado"
                right={
                  <Toggle
                    value={settings.showHotkeys}
                    onChange={(v) => update({ showHotkeys: v })}
                  />
                }
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const SettingRow = ({
  icon: Icon,
  label,
  right,
}: {
  icon: JSX.ElementType;
  label: string;
  right: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-amber-300">
        <Icon className="size-5" />
        <span className="text-sm uppercase tracking-widest">{label}</span>
      </div>

      {right}
    </div>
  );
};

//
// 🔹 Toggle
//
const Toggle = ({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) => {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full transition ${
        value ? "bg-amber-300" : "bg-zinc-600"
      } relative`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${
          value ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
};

//
// 🔹 Slider
//
const Slider = ({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) => {
  return (
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-amber-300 disabled:opacity-30"
    />
  );
};
