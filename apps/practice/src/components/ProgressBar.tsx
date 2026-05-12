interface ProgressBarProps {
  progress: number;
  total: number;
  completed: number;
}

export function ProgressBar({ progress, total, completed }: ProgressBarProps) {
  return (
    <div className="progress-container">
      <div className="progress-info">
        <span className="progress-label">学习进度</span>
        <span className="progress-value">{completed}/{total} ({progress}%)</span>
      </div>
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
