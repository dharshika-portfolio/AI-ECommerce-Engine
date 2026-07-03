import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ className }: { className?: string }) => {
  return (
    <div className={`flex justify-center items-center p-8 ${className || ''}`}>
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );
};
