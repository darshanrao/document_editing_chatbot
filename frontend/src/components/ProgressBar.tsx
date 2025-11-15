interface ProgressBarProps {
  completed: number;
  total: number;
  percentage: number;
}

export default function ProgressBar({ completed, total, percentage }: ProgressBarProps) {
  return (
    <div className="bg-dark-panel border-2 border-dark-border rounded-lg p-5">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-200">
          {completed} of {total} fields completed
        </span>
        <span className="text-gray-400">{percentage}% complete</span>
      </div>
      <div className="h-2 bg-dark-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
