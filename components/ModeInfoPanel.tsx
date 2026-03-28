import { ModeGroup, ModeProps, Modes } from "@/game/mode";
import { Modal, ModalHeader } from "./Modal";

type Props = {
  availableModes: ModeProps[];
  modes: Modes[];
  open: boolean;
  onClose: () => void;
};

export const ModeInfoModal = ({
  availableModes,
  modes,
  open,
  onClose,
}: Props) => {
  if (!open) return null;

  const selectedOptions = availableModes.filter((aM) => modes.includes(aM.id));
  const baseMode = selectedOptions.find((m) => m.group === ModeGroup.Base);
  const modifiers = selectedOptions.filter((m) => m.group !== ModeGroup.Base);

  return (
    <Modal setOpen={onClose}>
      <div className="relative w-[90%] max-w-md bg-neutral-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl ">
        <ModalHeader onClick={onClose} title={"Modo base"} />
        <Mode mode={baseMode!} />
        {!!modifiers.length && (
          <>
            <hr className="border-zinc-800" />
            <ModalHeader
              onClick={onClose}
              hideCloseButton={true}
              title={"Modificadores"}
            />
            {modifiers.map((mode, index) => (
              <>
                <Mode mode={mode} key={mode.id} />
                {index < modifiers.length - 1 && (
                  <div className="flex w-full justify-center">
                    <hr className="border-zinc-800 w-80 border-dashed" />
                  </div>
                )}
              </>
            ))}
          </>
        )}
      </div>
    </Modal>
  );
};

function Mode({ mode }: { mode: ModeProps }) {
  const { label, icon, longDescription, isHard } = mode;
  const Icon = icon!;

  return (
    <div className="px-2">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2 text-zinc-300">
          <div className="flex items-center gap-2">
            <div>
              <span className="font-medium text-start flex gap-2 items-end">
                <span className="flex gap-2 items-center text-xl text-amber-300">
                  <Icon className="size-5" />
                  {label}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-zinc-300 leading-relaxed">{longDescription}</p>

      {isHard && (
        <span className="text-xs text-red-400 uppercase tracking-widest">
          Modo Difícil
        </span>
      )}
    </div>
  );
}
