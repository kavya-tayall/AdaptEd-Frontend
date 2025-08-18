"use client";

interface TopicChipProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  closable?: boolean;
}

export default function TopicChip({
  label,
  selected = false,
  onClick,
  closable = false,
}: TopicChipProps) {
  const base =
    "inline-flex items-center justify-center h-9 px-4 rounded-full border text-[15px] leading-[20px] transition-colors select-none cursor-pointer " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring-accent)]";

  const styles = selected
    // Selected: white bg + purple text; keep it white on hover; subtle selected-border
    ? "bg-white text-[var(--step-accent)] border-[var(--step-selected-border)] hover:bg-white hover:text-[var(--step-accent)] hover:border-[var(--step-selected-border)]"
    // Unselected: dark-grey text; keep white bg on hover; just bump border on hover
    : "bg-white text-[var(--step-darkgrey)] border-[var(--step-border)] hover:bg-white hover:text-[var(--step-darkgrey)] hover:border-[var(--step-selected-border)]";

  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={base + " " + styles}>
      <span className="truncate">{label}</span>
      {selected && closable && <span className="ml-1.5" aria-hidden>×</span>}
    </button>
  );
}
