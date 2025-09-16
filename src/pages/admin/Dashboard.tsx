import { useState, useEffect } from 'react';
import api from '../../services/api';
import { usePageTitle } from '../../hooks/useDocumentTitle';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  available: boolean;
}

interface Order {
  id: number;
  userId: number;
  userName?: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface User {
  id: number;
  name: string;
  email: string;
  userType: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users'>('products');
  const [orderFilterTab, setOrderFilterTab] = useState<'pending' | 'inProgress' | 'completed'>('pending');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
    available: true
  });

  // Título dinâmico baseado na aba ativa e modais
  const getPageTitle = () => {
    if (showProductModal) {
      if (editingProduct) {
        return `Editar: ${editingProduct.name}`;
      }
      return 'Novo Produto';
    }
    return tabTitles[activeTab];
  };

  const tabTitles = {
    'products': 'Gerenciar Produtos',
    'orders': 'Gerenciar Pedidos',
    'users': 'Gerenciar Usuários'
  };
  
  usePageTitle(getPageTitle(), 'admin');

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      setProducts(response);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getOrders();
      // Ordenar pedidos do mais recente para o mais antigo
      const sortedOrders = response.sort((a: any, b: any) => 
        new Date(b.createdAt || b.CreatedAt).getTime() - new Date(a.createdAt || a.CreatedAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Implementar endpoint de usuários no backend se necessário
      setUsers([]); // Por enquanto vazio
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      await api.createProduct(newProduct);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        category: '',
        available: true
      });
      setShowProductModal(false);
      loadProducts();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      await api.updateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
      setShowProductModal(false);
      loadProducts();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Deseja realmente excluir este produto?')) {
      try {
        await api.deleteProduct(id);
        loadProducts();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
    }
  };

  // Filtrar pedidos baseado na aba selecionada
  const getFilteredOrders = () => {
    switch (orderFilterTab) {
      case 'pending':
        return orders.filter(order => order.status === 'pending');
      case 'inProgress':
        return orders.filter(order => ['preparing', 'ready', 'delivering'].includes(order.status));
      case 'completed':
        return orders.filter(order => ['delivered', 'cancelled'].includes(order.status));
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col">
        <div className="mb-8">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'products'
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Gerenciar Produtos
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'orders'
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Acompanhar Pedidos
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'users'
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Gerenciar Usuários
            </button>
          </nav>
        </div>

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
              >
                Adicionar Novo Produto
              </button>
            </div>
            
            {loading ? (
              <p>Carregando produtos...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">Descrição</th>
                      <th className="px-4 py-2 text-left">Preço</th>
                      <th className="px-4 py-2 text-left">Categoria</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="px-4 py-2">{product.name}</td>
                        <td className="px-4 py-2">{product.description}</td>
                        <td className="px-4 py-2">R$ {product.price.toFixed(2)}</td>
                        <td className="px-4 py-2">{product.category}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.available ? 'Disponível' : 'Indisponível'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Acompanhar Pedidos</h2>
            
            {/* Abas de filtro de pedidos */}
            <div className="mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setOrderFilterTab('pending')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    orderFilterTab === 'pending'
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Novos Pedidos ({orders.filter(o => o.status === 'pending').length})
                </button>
                <button
                  onClick={() => setOrderFilterTab('inProgress')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    orderFilterTab === 'inProgress'
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Em Andamento ({orders.filter(o => ['preparing', 'ready', 'delivering'].includes(o.status)).length})
                </button>
                <button
                  onClick={() => setOrderFilterTab('completed')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    orderFilterTab === 'completed'
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Concluídos ({orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length})
                </button>
              </nav>
            </div>
            
            {loading ? (
              <p>Carregando pedidos...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Cliente</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Data</th>
                      <th className="px-4 py-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          {orderFilterTab === 'pending' && 'Nenhum pedido novo'}
                          {orderFilterTab === 'inProgress' && 'Nenhum pedido em andamento'}
                          {orderFilterTab === 'completed' && 'Nenhum pedido concluído'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="px-4 py-2">#{order.id}</td>
                          <td className="px-4 py-2">{order.userName || `Cliente #${order.userId}`}</td>
                          <td className="px-4 py-2">
                            <select 
                              value={order.status} 
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="border rounded px-2 py-1"
                            >
                              <option value="pending">Pendente</option>
                              <option value="preparing">Preparando</option>
                              <option value="ready">Pronto</option>
                              <option value="delivering">Em entrega</option>
                              <option value="delivered">Entregue</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">R$ {order.total.toFixed(2)}</td>
                          <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2">
                            <button 
                              onClick={() => {
                                alert(`Itens do pedido:\n${order.items?.map(item => 
                                  `${item.productName} - Qtd: ${item.quantity} - R$ ${item.price}`
                                ).join('\n') || 'Sem itens'}`);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Gerenciar Usuários</h2>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
              <p>Funcionalidade em desenvolvimento. Por enquanto, os usuários podem ser visualizados através dos pedidos.</p>
            </div>
            {loading ? (
              <p>Carregando usuários...</p>
            ) : (
              <div className="text-gray-500">
                <p>Esta seção será implementada para gerenciar usuários registrados no sistema.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal de Produto */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-bold mb-4">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    value={editingProduct ? editingProduct.name : newProduct.name}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, name: e.target.value})
                      : setNewProduct({...newProduct, name: e.target.value})
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={editingProduct ? editingProduct.description : newProduct.description}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, description: e.target.value})
                      : setNewProduct({...newProduct, description: e.target.value})
                    }
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct ? editingProduct.price : newProduct.price}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})
                      : setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                  <input
                    type="text"
                    value={editingProduct ? editingProduct.imageUrl : newProduct.imageUrl}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, imageUrl: e.target.value})
                      : setNewProduct({...newProduct, imageUrl: e.target.value})
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <input
                    type="text"
                    value={editingProduct ? editingProduct.category : newProduct.category}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, category: e.target.value})
                      : setNewProduct({...newProduct, category: e.target.value})
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    checked={editingProduct ? editingProduct.available : newProduct.available}
                    onChange={(e) => editingProduct 
                      ? setEditingProduct({...editingProduct, available: e.target.checked})
                      : setNewProduct({...newProduct, available: e.target.checked})
                    }
                    className="mr-2"
                  />
                  <label htmlFor="available" className="text-sm font-medium">Disponível</label>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <button
                  onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
                >
                  {editingProduct ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
