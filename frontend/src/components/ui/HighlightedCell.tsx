import React from "react";

interface HighlightedCellProps {
  value: string;
  isHighlighted?: boolean;
}

const HighlightedCell: React.FC<HighlightedCellProps> = ({
  value,
  isHighlighted = false,
}) => {
  return (
    <div
      className={`
        ${
          isHighlighted
            ? "bg-yellow-100 border border-yellow-200 rounded px-2"
            : ""
        }
      `}
    >
      {value}
    </div>
  );
};

export default HighlightedCell;
