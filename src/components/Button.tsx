"use client";

interface ButtonProps {
    label?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    outline?: boolean;
    small?: boolean;
    icon?: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    noBg?: boolean;
    children?: React.ReactNode;
    options?: {
        color?: 'primary' | 'danger';
    }
    danger?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    type = 'submit',
    disabled = false,
    outline = false,
    small = false,
    icon: Icon = null,
    children,
    danger,
    options = {
        color: 'primary'
    }
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
     font-bold 
     rounded-lg 
     text-sm 
     text-center
     border-2 border-orange-500
     ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
     ${outline ? ' bg-transparent text-orange-500' : 'bg-orange-400 text-white'}
     ${small ? 'text-xs px-3 py-2' : 'text-sm px-5 py-2.5'}
     ${small ? 'font-light' : 'font-medium'}
     ${danger && 'bg-red-400 border border-red-500 text-white'}
     `
    }
    >
    {Icon && <span className="mr-2">{Icon}</span>}
    {label}
    {children}
    </button>
  )
}

export default Button