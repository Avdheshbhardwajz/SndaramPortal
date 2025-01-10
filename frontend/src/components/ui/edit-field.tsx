import React from "react";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { EditFieldProps, EditType } from "@/types/grid";

export const EditField: React.FC<EditFieldProps> = ({
  field,
  value,
  config,
  validation,
  onChange,
}) => {
  const handleChange = (newValue: string | number | boolean | null) => {
    onChange(field, newValue);
  };

  if (config.editType === EditType.SELECT && config.dropdownOptions) {
    return (
      <div>
        <Select
          value={String(value || "")}
          onValueChange={(newValue) => handleChange(newValue)}
          disabled={config.readOnly}
        >
          <SelectTrigger
            className={validation?.hasError ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {config.dropdownOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validation?.hasError && (
          <span className="text-red-500 text-sm">{validation.message}</span>
        )}
      </div>
    );
  }

  // Default to text input
  return (
    <div>
      <Input
        type={config.editType === EditType.NUMBER ? "number" : "text"}
        value={String(value || "")}
        onChange={(e) =>
          handleChange(
            config.editType === EditType.NUMBER
              ? Number(e.target.value)
              : e.target.value
          )
        }
        className={validation?.hasError ? "border-red-500" : ""}
        disabled={config.readOnly}
      />
      {validation?.hasError && (
        <span className="text-red-500 text-sm">{validation.message}</span>
      )}
    </div>
  );
};
