import React from 'react';
import { Input } from './ui/Input';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select time",
  className = ""
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
};