const API_BASE_URL = 'http://localhost:8080';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  type: 'customer' | 'delivery' | 'admin';
  vehicle?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface OrderData {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('authToken');
  }

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as any).Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Tentar extrair erro da resposta
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // Se não conseguir parsear JSON, criar erro genérico
          errorData = {
            error: 'http_error',
            message: `Erro HTTP ${response.status}: ${response.statusText}`,
          };
        }
        
        // Criar objeto de erro padronizado
        const error = new Error(errorData.message || 'Erro na requisição');
        (error as any).response = {
          status: response.status,
          data: errorData,
        };
        throw error;
      }

      // Se a resposta for vazia (204 No Content), retornar objeto vazio
      if (response.status === 204) {
        return {};
      }

      return await response.json();
    } catch (error: any) {
      // Se o erro já tem response (erro de API), repassar
      if (error.response) {
        throw error;
      }
      
      // Senão, tratar como erro de rede
      const networkError = new Error('Erro de conexão com o servidor');
      (networkError as any).response = {
        status: 0,
        data: {
          error: 'network_error',
          message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
        },
      };
      throw networkError;
    }
  }

  // Auth endpoints
  async register(userData: RegisterData) {
    return this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginCredentials) {
    const response = await this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    this.setToken(null);
  }

  // Product endpoints
  async getProducts() {
    return this.makeRequest('/products');
  }

  async getProduct(id: number) {
    return this.makeRequest(`/products/${id}`);
  }

  async createProduct(productData: ProductData) {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: ProductData) {
    return this.makeRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number) {
    return this.makeRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async createOrder(orderData: OrderData) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.makeRequest('/orders');
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.makeRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `status=${status}`,
    });
  }
}

export const apiService = new ApiService();
export default apiService;
