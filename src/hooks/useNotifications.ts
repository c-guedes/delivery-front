import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchNotifications = useCallback(async (limit?: number) => {
    if (!isAuthenticated || authLoading) return;
    
    // Verificar se tem token antes de tentar
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(limit);
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      // Só mostrar toast de erro se o usuário estiver autenticado e não for erro de token
      if (isAuthenticated && !(error instanceof Error && error.message.includes('Token não encontrado'))) {
        showToast('Não foi possível carregar as notificações');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast, isAuthenticated, authLoading]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    
    // Verificar se tem token antes de tentar
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Erro ao buscar contagem de não lidas:', error);
      // Não mostrar toast para erro de contagem, é menos crítico
    }
  }, [isAuthenticated, authLoading]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Atualizar localmente
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true }
          : notif
      ));
      
      // Atualizar contagem
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      showToast('Não foi possível marcar a notificação como lida');
    }
  }, [showToast]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Atualizar localmente
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
      
      showToast('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      showToast('Não foi possível marcar todas as notificações como lidas');
    }
  }, [showToast]);

  const createTestNotification = useCallback(async (title: string, message: string, type?: string) => {
    try {
      await notificationService.createTestNotification({ title, message, type });
      
      showToast('Notificação de teste criada');
      
      // Recarregar notificações
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Erro ao criar notificação de teste:', error);
      showToast('Não foi possível criar notificação de teste');
    }
  }, [showToast, fetchNotifications, fetchUnreadCount]);

  // Carregar notificações e contagem apenas quando usuário estiver logado e autenticação não estiver carregando
  useEffect(() => {
    // Só executa se o loading da auth terminou
    if (authLoading) return;
    
    if (isAuthenticated) {
      // Verifica se tem token antes de fazer as chamadas
      const token = localStorage.getItem('token');
      if (token) {
        fetchNotifications();
        fetchUnreadCount();
      }
    } else {
      // Limpar dados quando deslogar
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, authLoading]); // Removido fetchNotifications e fetchUnreadCount das dependências para evitar loops

  // Poll para buscar novas notificações a cada 30 segundos (só se logado e não carregando)
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, isAuthenticated, authLoading]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    createTestNotification,
  };
}
