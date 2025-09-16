import { useState, useCallback } from 'react';

interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string>;
  validations?: Array<{
    field: string;
    message: string;
  }>;
}

interface UseErrorHandlerReturn {
  error: ApiError | null;
  clearError: () => void;
  handleError: (error: any) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      clearError();
    }
  }, [clearError]);

  const handleError = useCallback((err: any) => {
    setIsLoading(false);
    
    if (err?.response?.data) {
      // Erro da API com estrutura padronizada
      setError(err.response.data);
    } else if (err?.message) {
      // Erro de rede ou outro erro
      setError({
        error: 'network_error',
        message: err.message || 'Erro de conexão com o servidor',
      });
    } else {
      // Erro desconhecido
      setError({
        error: 'unknown_error',
        message: 'Ocorreu um erro inesperado',
      });
    }
  }, []);

  return {
    error,
    clearError,
    handleError,
    isLoading,
    setLoading,
  };
};

// Hook para formatação de mensagens de erro
export const useErrorMessage = () => {
  const getErrorMessage = useCallback((error: ApiError | null): string => {
    if (!error) return '';
    
    // Se tem validações, mostrar a primeira
    if (error.validations && error.validations.length > 0) {
      return error.validations[0].message;
    }
    
    // Senão, mostrar a mensagem principal
    return error.message || 'Erro desconhecido';
  }, []);

  const getValidationErrors = useCallback((error: ApiError | null): Record<string, string> => {
    if (!error?.validations) return {};
    
    const errors: Record<string, string> = {};
    error.validations.forEach(validation => {
      errors[validation.field] = validation.message;
    });
    
    return errors;
  }, []);

  return {
    getErrorMessage,
    getValidationErrors,
  };
};

// Tipos para usar nos componentes
export type { ApiError, UseErrorHandlerReturn };
