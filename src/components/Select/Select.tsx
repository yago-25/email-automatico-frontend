import { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  width?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Selecione uma opção",
  value,
  onChange,
  width = "100%",
}) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={selectRef}
      className="relative"
      style={{ width }}
    >
      <div
        className="flex justify-between items-center border rounded-md px-4 py-2 bg-white cursor-pointer hover:shadow transition"
        onClick={() => setOpen(!open)}
      >
        <span className={value ? "text-black" : "text-gray-400"}>
          {options.find(opt => opt.value === value)?.label || placeholder}
        </span>
        <IoIosArrowDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                value === option.value ? "bg-blue-100" : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
