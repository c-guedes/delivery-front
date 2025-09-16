export interface Notification {
  id: number;
  user_id: number;
  order_id?: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTestNotificationRequest {
  title: string;
  message: string;
  type?: string;
}

class NotificationService {
  private baseURL = 'http://localhost:8080';

  private getAuthHeader() {
    const token = localStorage.getItem('token');
    if (!token) {
      return null; // Retorna null ao invés de lançar erro
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getNotifications(limit?: number): Promise<{ notifications: Notification[]; count: number }> {
    try {
      const headers = this.getAuthHeader();
      if (!headers) {
        throw new Error('Token não encontrado');
      }

      const url = limit ? `${this.baseURL}/notifications?limit=${limit}` : `${this.baseURL}/notifications`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erro no notificationService.getNotifications:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<{ unread_count: number }> {
    try {
      const headers = this.getAuthHeader();
      if (!headers) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`${this.baseURL}/notifications/unread-count`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erro no notificationService.getUnreadCount:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: number): Promise<{ message: string }> {
    const headers = this.getAuthHeader();
    if (!headers) {
      throw new Error('Token não encontrado');
    }

    const response = await fetch(`${this.baseURL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers,
    });

    if (!response.ok) {
      throw new Error('Erro ao marcar como lida');
    }

    return response.json();
  }

  async markAllAsRead(): Promise<{ message: string }> {
    const headers = this.getAuthHeader();
    if (!headers) {
      throw new Error('Token não encontrado');
    }

    const response = await fetch(`${this.baseURL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers,
    });

    if (!response.ok) {
      throw new Error('Erro ao marcar todas como lidas');
    }

    return response.json();
  }

  async createTestNotification(data: CreateTestNotificationRequest): Promise<{ message: string; notification: Notification }> {
    const headers = this.getAuthHeader();
    if (!headers) {
      throw new Error('Token não encontrado');
    }

    const response = await fetch(`${this.baseURL}/notifications/test`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar notificação de teste');
    }

    return response.json();
  }
}

export const notificationService = new NotificationService();
