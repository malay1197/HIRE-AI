'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const toast = useCallback((message: string, type?: ToastType) => addToast(message, type), [addToast]);
  const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
  const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast]);
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => {
          let Icon = Info;
          if (t.type === 'success') Icon = CheckCircle;
          if (t.type === 'warning') Icon = AlertTriangle;
          if (t.type === 'error') Icon = AlertOctagon;

          return (
            <div key={t.id} className={`toast-item toast-${t.type}`}>
              <Icon size={18} className="toast-icon" />
              <p className="toast-message">{t.message}</p>
              <button className="toast-close" onClick={() => removeToast(t.id)}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 9999;
          max-width: 380px;
          width: 100%;
        }

        .toast-item {
          background: rgba(15, 14, 30, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: 16px;
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: auto;
        }

        .toast-success { border-left: 4px solid var(--success); }
        .toast-error { border-left: 4px solid var(--error); }
        .toast-warning { border-left: 4px solid var(--warning); }
        .toast-info { border-left: 4px solid var(--info); }

        .toast-icon {
          flex-shrink: 0;
        }
        .toast-success .toast-icon { color: var(--success); }
        .toast-error .toast-icon { color: var(--error); }
        .toast-warning .toast-icon { color: var(--warning); }
        .toast-info .toast-icon { color: var(--info); }

        .toast-message {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-main);
          flex: 1;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .toast-close:hover {
          background: var(--bg-glass);
          color: var(--text-main);
        }

        @keyframes slideIn {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
