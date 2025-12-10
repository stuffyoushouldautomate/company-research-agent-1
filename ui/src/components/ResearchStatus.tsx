import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { ResearchStatusProps } from '../types';
import { fadeInAnimation } from '../styles';

const ResearchStatus = ({
  status,
  error,
  isComplete,
  currentPhase,
  isResetting,
  glassStyle,
  loaderColor,
  statusRef
}: ResearchStatusProps) => {
  if (!status) return null;

  return (
    <div 
      ref={statusRef} 
      className={`${glassStyle.card} ${fadeInAnimation.fadeIn} ${isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {error ? (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          ) : status?.step === "Complete" || isComplete ? (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200">
              <Loader2 className="h-5 w-5 animate-spin loader-icon" style={{ stroke: loaderColor }} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{status.step}</p>
          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
            {error || status.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResearchStatus; 