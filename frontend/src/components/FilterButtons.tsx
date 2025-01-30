import type React from "react"
import type { FilterButton } from "../types/admin"

interface FilterButtonsProps {
  filters: FilterButton[]
  onFilterClick: (filterId: string) => void
}

export const FilterButtons: React.FC<FilterButtonsProps> = ({ filters, onFilterClick }) => {
  return (
    <div className="flex gap-3 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterClick(filter.id)}
          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50"
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

