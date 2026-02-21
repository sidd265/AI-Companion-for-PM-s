import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

const ErrorState = ({ 
  title = 'Something went wrong', 
  message = 'We couldn\'t load this data. Please try again.', 
  onRetry,
  compact = false 
}: ErrorStateProps) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-destructive/20 bg-destructive/5">
        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
        <span className="text-sm text-muted-foreground flex-1">{message}</span>
        {onRetry && (
          <button onClick={onRetry} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
            <RefreshCw className="w-3 h-3" />Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-[320px]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="airbnb-btn-secondary flex items-center gap-2 py-2.5 px-5 rounded-full text-sm">
          <RefreshCw className="w-4 h-4" />Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
