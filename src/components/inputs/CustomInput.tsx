import React, { useEffect, useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

// Define the props type
interface InputProps {
  id: string;
  type: string;
  label: string;
  disabled?: boolean;
}

const CustomInput: React.FC<InputProps> = ({ id, type, label, disabled = false }) => {
  const { register, watch, setValue, trigger } = useFormContext();
  const [loaded, setLoaded] = useState<boolean>(false);
  const value = watch(id); // Watch the value of this specific input
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const checkAutofill = () => {
      const input = inputRef.current;
      if (input && !loaded) {
        // If the input is autofilled by the browser, the value would be populated
        if (input.value) {
          setValue(id, input.value); // Update React Hook Form's value
          trigger(id); // Trigger validation
          setLoaded(true); // Prevent multiple triggers
        }
      }
    };

    // Periodically check for autofill
    const interval = setInterval(checkAutofill, 200);

    return () => clearInterval(interval);
  }, [id, loaded, setValue, trigger]);

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        {...register(id)}
        disabled={disabled}
        ref={inputRef}
      />
    </div>
  );
};

export default CustomInput;
