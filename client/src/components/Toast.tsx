import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  const bgColor = type === 'success' ? 'bg-emerald-50 border-emerald-200' : type === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
  const iconColor = type === 'success' ? 'text-emerald-500' : type === 'error' ? 'text-red-500' : 'text-blue-500';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`flex items-center p-4 mb-4 border rounded shadow-sm ${bgColor}`}>
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="ml-3 text-sm font-normal text-gray-700">{message}</div>
      {onClose && (
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
