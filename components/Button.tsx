import { JSX, MouseEventHandler } from "react";

export type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "danger"
  | "ghost";
export type ButtonAspect = "no-aspect" | "square";
export type ButtonSize = "smr" | "sm" | "md" | "lg" | "xl";

export type ButtonProps = {
  variant?: ButtonVariant;
  aspect?: ButtonAspect;
  size?: ButtonSize;
  children?: React.ReactNode;
  icon?: JSX.ElementType;
  className?: string;
  clickable?: boolean;
  fillIcon?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onContextMenu?: MouseEventHandler<HTMLButtonElement>;
};

export const Button = ({
  variant = "default",
  aspect = "no-aspect",
  size = "md",
  clickable = true,
  children,
  icon: Icon,
  className,
  fillIcon,
  onClick,
  onContextMenu,
}: ButtonProps) => {
  const variantStyle = {
    default: "bg-zinc-800 border-none",
    primary: "bg-amber-300 border-amber-900/60 text-zinc-950",
    secondary: "bg-amber-300/60 border-amber-900/40 text-zinc-950/50",
    danger: "bg-zinc-900 ring ring-red-500 text-red-500",
    ghost: "text-white border-none",
  }[variant];

  const aspectStyle = {
    "no-aspect": "",
    square: "aspect-square px-0 py-0",
  }[aspect];

  const sizeStyle = {
    smr: "text-xs gap-2 font-bold tracking-wider rounded-lg",
    sm: "text-sm gap-2 font-bold tracking-wider rounded-lg",
    md: "text-sm gap-3 font-bold rounded-xl",
    lg: "text-3xl gap-3 font-bold rounded-xl",
    xl: "text-5xl gap-4 font-bold rounded-xl",
  }[size];

  const paddingStyle = {
    none: "",
    smr: "px-2 py-1 ",
    sm: "px-3 py-1",
    md: "px-4 py-2",
    lg: "px-5 py-2",
    xl: "px-6 py-3",
  }[aspect === "no-aspect" ? size : "none"];

  const iconButtonSizeStyle = {
    smr: "size-3",
    sm: "size-5",
    md: "size-4",
    lg: "size-6",
    xl: "size-15",
  }[size];

  const clicableStyle = clickable
    ? "active:translate-y-[2px] border-b-4 active:border-none"
    : "border-b-none";

  const hoverStyle = {
    default: "hover:bg-zinc-700 cursor-pointer",
    primary: "hover:opacity-80 cursor-pointer",
    secondary: "hover:opacity-80 cursor-pointer",
    danger: "hover:bg-zinc-950 cursor-pointer",
    ghost: "hover:bg-zinc-800 cursor-pointer",
  }[variant];

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        tracking-wide uppercase justify-center 
        flex items-center transition-all select-none
        ${variantStyle} ${sizeStyle} ${clicableStyle} ${aspectStyle} ${className}
        ${clickable ? hoverStyle : ""} ${paddingStyle}
        `}
    >
      {Icon && <Icon className={`${fillIcon} ${iconButtonSizeStyle}`} />}
      {children}
    </button>
  );
};
