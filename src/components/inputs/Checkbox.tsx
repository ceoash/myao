'use client'

interface CheckboxProps {
    id: string;
    label: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;

}

const Checkbox: React.FC<CheckboxProps> = ({
    id,
    label,
    checked,
    onChange,
    onClick
}) => {
  return (
    <div className="flex gap-2">
              <input id={id} name={id} value={id} type="checkbox" checked={checked} onChange={() => onChange} onClick={() => onClick} />
              <label htmlFor={id} >{label}</label>
    </div>
  )
}

export default Checkbox