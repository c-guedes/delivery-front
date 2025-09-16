import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/Toast';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastItem {
  id: number;
  message: string;
  createdAt: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const MAX_TOASTS = 5;
  const toastIdCounter = useRef(0);

  const showToast = useCallback((message: string) => {
    const id = Date.now() + (++toastIdCounter.current); // Garante ID único mesmo se chamado rapidamente
    const createdAt = Date.now();
    
    setToasts(prev => {
      const newToasts = [{ id, message, createdAt }, ...prev]; // Adiciona no início (LIFO)
      
      // Limita a 5 toasts, removendo os mais antigos
      if (newToasts.length > MAX_TOASTS) {
        return newToasts.slice(0, MAX_TOASTS);
      }
      
      return newToasts;
    });
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 max-w-sm pointer-events-none">
        <div className="space-y-3">
          {toasts.map((toast, index) => (
            <div
              key={toast.id}
              className={`
                transform transition-all duration-300 ease-out pointer-events-auto
                ${index > 0 ? 'opacity-95' : 'opacity-100'}
              `}
              style={{
                transform: `translateY(${index * -4}px) scale(${1 - index * 0.02})`,
                zIndex: 50 - index,
                filter: index > 0 ? `brightness(${100 - index * 5}%)` : 'brightness(100%)'
              }}
            >
              <Toast
                message={toast.message}
                isVisible={true}
                onClose={() => removeToast(toast.id)}
                duration={4000}
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
