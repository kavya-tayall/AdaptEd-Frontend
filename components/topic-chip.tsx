"use client"

interface TopicChipProps {
  label: string
  selected?: boolean
  onClick: () => void
}

export default function TopicChip({ label, selected = false, onClick }: TopicChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm
        ${selected ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
        transition-colors
      `}
    >
      {label}
    </button>
  )
}
