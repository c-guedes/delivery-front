import { useEffect } from 'react';

export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | Cupcake Delivery` : 'Cupcake Delivery';
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

// Hook para títulos específicos baseados no tipo de usuário e contexto
export const usePageTitle = (basePage: string, userType?: string, extraInfo?: string) => {
  useEffect(() => {
    let title = basePage;
    
    if (userType) {
      const userTypeMap = {
        'customer': 'Cliente',
        'delivery': 'Entregador',
        'admin': 'Administrador'
      };
      title = `${basePage} - ${userTypeMap[userType as keyof typeof userTypeMap] || userType}`;
    }
    
    if (extraInfo) {
      title = `${title} - ${extraInfo}`;
    }
    
    document.title = `${title} | Cupcake Delivery`;
  }, [basePage, userType, extraInfo]);
};
