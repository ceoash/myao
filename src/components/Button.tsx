"use client";

interface ButtonProps {
    label: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    outline?: boolean;
    small?: boolean;
    icon?: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    noBg?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    type = 'submit',
    disabled = false,
    outline = false,
    small = false,
    icon: Icon = null,
}) => {
  return (
    <button
    onClick={onClick}
    disabled={disabled}
    type={type}
    className={`
     w-full
     focus:ring-4 
     focus:outline-none 
     focus:ring-primary-300 
     font-medium 
     rounded-lg 
     text-sm 
     text-center
     ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
     ${outline ? 'border border-primary-default bg-transparent' : 'bg-primary-default text-white'}
     ${small ? 'text-xs px-3 py-2' : 'text-sm px-5 py-2.5'}
     ${small ? 'font-light' : 'font-medium'}
     `
    }
    >
    {Icon && <span className="mr-2">{Icon}</span>}
    {label}
    </button>
  )
}

export default Button