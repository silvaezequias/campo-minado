import { ModeProps, Modes } from "@/game/mode";
import { Modal, ModalHeader } from "./Modal";

type Props = {
  modes: ModeProps[];
  value: Modes;
  open: boolean;
  onClose: () => void;
};

export const ModeInfoModal = ({ modes, value, open, onClose }: Props) => {
  if (!open) return null;

  const selected = modes.find((m) => m.id === value);
  if (!selected) return null;

  const Icon = selected.icon;

  return (
    <Modal setOpen={onClose}>
      <div className="relative w-[90%] max-w-md bg-neutral-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        <ModalHeader onClick={onClose} title={selected.description} />
        <div className="flex justify-between">
          <div className="flex flex-col gap-2 text-zinc-300">
            <div className="flex items-center gap-2">
              <div>
                <span className="font-medium text-start flex gap-2 items-end">
                  <span className="flex gap-2 items-center text-2xl  text-amber-300">
                    <Icon className="size-5" />
                    {selected.label}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">
          {selected.longDescription}
        </p>

        {selected.isHard && (
          <span className="text-xs text-red-400 uppercase tracking-widest">
            Modo Difícil
          </span>
        )}
      </div>
    </Modal>
  );
};
