import { X } from "lucide-react";
import { Button } from "./Button";

export const ModalHeader = ({
  title,
  onClick,
  hideCloseButton,
}: {
  title: string;
  hideCloseButton?: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="text-amber-300 flex justify-between items-center px-2">
      <span className="font-medium text-2xl">{title}</span>
      {!hideCloseButton && (
        <Button onClick={onClick}>
          <X />
        </Button>
      )}
    </div>
  );
};

export const Modal = ({
  setOpen,
  children,
}: {
  children: React.ReactNode;
  setOpen: (bool: boolean) => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setOpen(false)}
      />
      {children}
    </div>
  );
};
