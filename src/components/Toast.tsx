import { useEffect, useState, useRef } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 4000 }: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isVisible && !isLeaving) {
      // Limpar timers anteriores
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);

      // Iniciar animação de entrada
      animationTimeoutRef.current = window.setTimeout(() => {
        setIsAnimating(true);
      }, 50);

      // Timer para auto-remover - cada toast tem seu próprio timer independente
      timeoutRef.current = window.setTimeout(() => {
        setIsLeaving(true);
        // Após animação de saída, remove o toast
        setTimeout(() => {
          onClose();
        }, 300);
      }, duration);
    }

    // Cleanup ao desmontar ou mudar dependências
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, [isVisible, onClose, duration]);

  const handleManualClose = () => {
    if (!isLeaving) {
      // Cancelar timer automático
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      setIsLeaving(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        bg-white dark:bg-dark-800 border-l-4 border-green-500 dark:border-green-400 rounded-lg shadow-lg dark:shadow-gray-900/50 p-4 w-80
        transform transition-all duration-300 ease-out
        ${isAnimating && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
            <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="ml-3 flex-1 pt-0.5">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            className="inline-flex text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200"
            onClick={handleManualClose}
          >
            <span className="sr-only">Fechar</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Barra de progresso */}
      <div className="mt-3 bg-gray-200 dark:bg-dark-600 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-green-500 dark:bg-green-400 h-full rounded-full"
          style={{
            width: isLeaving ? '0%' : (isAnimating ? '0%' : '100%'),
            transition: isLeaving 
              ? 'width 300ms ease-out' 
              : (isAnimating ? `width ${duration}ms linear` : 'none')
          }}
        />
      </div>
    </div>
  );
}
