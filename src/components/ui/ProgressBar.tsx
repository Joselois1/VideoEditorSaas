interface ProgressBarProps {
  value: number;
  label?: string;
  className?: string;
}

export default function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 rounded-full transition-all duration-200 shadow-[0_0_10px] shadow-fuchsia-500/40"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
