import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ApiError } from '../hooks/useErrorHandler';

interface ErrorDisplayProps {
  error: ApiError | null;
  onClose?: () => void;
  className?: string;
}

export default function ErrorDisplay({ error, onClose, className = '' }: ErrorDisplayProps) {
  if (!error) return null;

  const getErrorTypeColor = (errorType: string) => {
    switch (errorType) {
      case 'validation_error':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
      case 'authentication_error':
      case 'authorization_error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
      case 'not_found':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
      case 'conflict':
        return 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300';
      default:
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
    }
  };

  const getErrorIcon = (errorType: string) => {
    return <ExclamationTriangleIcon className="h-5 w-5" />;
  };

  return (
    <div className={`rounded-md border p-4 ${getErrorTypeColor(error.error)} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getErrorIcon(error.error)}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{error.message}</h3>
          
          {/* Mostrar erros de validação */}
          {error.validations && error.validations.length > 0 && (
            <div className="mt-2">
              <ul className="text-sm space-y-1">
                {error.validations.map((validation, index) => (
                  <li key={index} className="flex">
                    <span className="font-medium">{validation.field}:</span>
                    <span className="ml-1">{validation.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Mostrar detalhes adicionais */}
          {error.details && Object.keys(error.details).length > 0 && (
            <div className="mt-2">
              <details className="text-sm">
                <summary className="cursor-pointer font-medium">Detalhes</summary>
                <ul className="mt-1 space-y-1">
                  {Object.entries(error.details).map(([key, value]) => (
                    <li key={key} className="flex">
                      <span className="font-medium">{key}:</span>
                      <span className="ml-1">{value}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </div>
        
        {/* Botão para fechar */}
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex rounded-md p-1.5 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <span className="sr-only">Fechar</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
