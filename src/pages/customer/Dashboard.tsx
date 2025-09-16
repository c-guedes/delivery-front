import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../contexts/ToastContext';
import { usePageTitle } from '../../hooks/useDocumentTitle';

interface Product {
  ID: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface Order {
  ID: number;
  customerId: number;
  status: string;
  total: number;
  CreatedAt: string;
  items?: any[];
}

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [orderFilterTab, setOrderFilterTab] = useState<'all' | 'active' | 'pending' | 'inProgress' | 'completed'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Título dinâmico baseado na aba ativa e contexto
  const getPageTitle = () => {
    if (showOrderDetails && selectedOrder) {
      return `Pedido #${selectedOrder.ID}`;
    }
    return activeTab === 'products' ? 'Produtos' : 'Meus Pedidos';
  };
  
  usePageTitle(getPageTitle(), 'customer');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, ordersData] = await Promise.all([
        apiService.getProducts(),
        apiService.getOrders().catch(() => []) // Orders podem falhar se não houver nenhum
      ]);
      
      setProducts(productsData);
      // Ordenar pedidos do mais recente para o mais antigo
      const sortedOrders = ordersData.sort((a: any, b: any) => 
        new Date(b.createdAt || b.CreatedAt).getTime() - new Date(a.createdAt || a.CreatedAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (err: any) {
      setError('Erro ao carregar dados. Verifique sua conexão.');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId: number) => {
    try {
      // Por enquanto, vamos usar os dados que já temos
      // Mais tarde podemos criar um endpoint específico para detalhes do pedido
      const order = orders.find(o => o.ID === orderId);
      if (order) {
        setSelectedOrder(order);
        setShowOrderDetails(true);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do pedido:', error);
    }
  };

  // Filtrar e ordenar produtos
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Filtrar pedidos baseado na aba selecionada
  const getFilteredOrders = () => {
    switch (orderFilterTab) {
      case 'active':
        return orders.filter(order => ['pending', 'preparing', 'ready', 'delivering'].includes(order.status));
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

  // Funções para contagem de pedidos
  const getActiveOrdersCount = () => {
    return orders.filter(order => ['pending', 'preparing', 'ready', 'delivering'].includes(order.status)).length;
  };

  const getPendingOrdersCount = () => {
    return orders.filter(order => order.status === 'pending').length;
  };

  const getInProgressOrdersCount = () => {
    return orders.filter(order => ['preparing', 'ready', 'delivering'].includes(order.status)).length;
  };

  const getCompletedOrdersCount = () => {
    return orders.filter(order => ['delivered', 'cancelled'].includes(order.status)).length;
  };

  // Função para verificar se um pedido é ativo
  const isOrderActive = (status: string) => {
    return ['pending', 'preparing', 'ready', 'delivering'].includes(status);
  };

  const filteredOrders = getFilteredOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'preparing': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'ready': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900';
      case 'delivering': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900';
      case 'delivered': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      case 'delivering': return 'Em entrega';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-xl">Carregando produtos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">{error}</div>
          <button 
            onClick={loadData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-dark-900 min-h-screen transition-colors">
      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'products'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm relative transition-colors ${
              activeTab === 'orders'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="flex items-center">
              Meus Pedidos
              {getActiveOrdersCount() > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-orange-500 rounded-full">
                  {getActiveOrdersCount()}
                </span>
              )}
            </span>
          </button>
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nossos Cupcakes</h1>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Buscar cupcakes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white transition-colors"
              >
                <option value="">Ordenar por</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="name">Nome</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <div key={product.ID} className="bg-white dark:bg-dark-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border dark:border-dark-600 transition-colors">
                <img 
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{product.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <button 
                    onClick={() => {
                      addToCart(product.ID);
                      showToast(`${product.name} foi adicionado ao carrinho!`);
                    }}
                    className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Pedidos</h1>
          </div>

          {/* Abas de filtro de pedidos */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setOrderFilterTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  orderFilterTab === 'all'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Todos ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilterTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                  orderFilterTab === 'active'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  Ativos ({getActiveOrdersCount()})
                  {getActiveOrdersCount() > 0 && (
                    <span className="ml-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setOrderFilterTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  orderFilterTab === 'pending'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Aguardando ({getPendingOrdersCount()})
              </button>
              <button
                onClick={() => setOrderFilterTab('inProgress')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  orderFilterTab === 'inProgress'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Em Andamento ({getInProgressOrdersCount()})
              </button>
              <button
                onClick={() => setOrderFilterTab('completed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  orderFilterTab === 'completed'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Finalizados ({getCompletedOrdersCount()})
              </button>
            </nav>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {orderFilterTab === 'active' && 'Nenhum pedido ativo'}
                  {orderFilterTab === 'pending' && 'Nenhum pedido aguardando confirmação'}
                  {orderFilterTab === 'inProgress' && 'Nenhum pedido em andamento'}
                  {orderFilterTab === 'completed' && 'Nenhum pedido finalizado'}
                  {orderFilterTab === 'all' && 'Nenhum pedido encontrado'}
                </h3>
                <p className="text-gray-500">
                  {orderFilterTab === 'active' && 'Não há pedidos ativos no momento.'}
                  {orderFilterTab === 'all' ? 'Que tal fazer seu primeiro pedido?' : (orderFilterTab !== 'active' ? 'Não há pedidos nesta categoria no momento.' : '')}
                </p>
                {orderFilterTab === 'all' && (
                  <button
                    onClick={() => setActiveTab('products')}
                    className="mt-4 bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors"
                  >
                    Ver Produtos
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
                  {filteredOrders.map(order => (
                    <tr 
                      key={order.ID}
                      className={`${isOrderActive(order.status) ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400' : ''} hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          #{order.ID}
                          {isOrderActive(order.status) && (
                            <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(order.CreatedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        R$ {order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <button
                          onClick={() => loadOrderDetails(order.ID)}
                          className="text-pink-600 hover:text-pink-800 font-medium"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Modal de Detalhes do Pedido */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border dark:border-dark-600 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detalhes do Pedido #{selectedOrder.ID}</h3>
              <button
                onClick={() => {
                  setShowOrderDetails(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Informações do Pedido */}
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Informações Gerais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Data do Pedido</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedOrder.CreatedAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <p className="font-bold text-lg text-pink-600 dark:text-pink-400">R$ {selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Itens do Pedido</h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, index: number) => {
                      const product = products.find(p => p.ID === item.productId);
                      return (
                        <div key={index} className="flex items-center justify-between border dark:border-dark-600 rounded-lg p-3 bg-white dark:bg-dark-700">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={product?.imageUrl || 'https://via.placeholder.com/60x60'}
                              alt={product?.name || 'Produto'}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{product?.name || `Produto #${item.productId}`}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Quantidade: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">R$ {(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">R$ {item.price.toFixed(2)} cada</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Detalhes dos itens não disponíveis</p>
                    <p className="text-sm">Este pedido pode ter sido feito antes da implementação do sistema de itens</p>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Acompanhamento do Pedido</h4>
                <div className="space-y-3">
                  <div className={`flex items-center space-x-3 ${selectedOrder.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : ['preparing', 'ready', 'delivering', 'delivered'].includes(selectedOrder.status) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    <div className={`w-3 h-3 rounded-full ${selectedOrder.status === 'pending' ? 'bg-yellow-500' : ['preparing', 'ready', 'delivering', 'delivered'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <p>{selectedOrder.status === 'pending' ? 'Pedido Recebido (Aguardando Confirmação)' : 'Pedido Confirmado'}</p>
                  </div>
                  <div className={`flex items-center space-x-3 ${['preparing', 'ready', 'delivering', 'delivered'].includes(selectedOrder.status) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    <div className={`w-3 h-3 rounded-full ${['preparing', 'ready', 'delivering', 'delivered'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <p>Preparando Pedido</p>
                  </div>
                  <div className={`flex items-center space-x-3 ${['ready', 'delivering', 'delivered'].includes(selectedOrder.status) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    <div className={`w-3 h-3 rounded-full ${['ready', 'delivering', 'delivered'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <p>Pronto para Entrega</p>
                  </div>
                  <div className={`flex items-center space-x-3 ${['delivering', 'delivered'].includes(selectedOrder.status) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    <div className={`w-3 h-3 rounded-full ${['delivering', 'delivered'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <p>Saiu para Entrega</p>
                  </div>
                  <div className={`flex items-center space-x-3 ${selectedOrder.status === 'delivered' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    <div className={`w-3 h-3 rounded-full ${selectedOrder.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <p>Entregue</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowOrderDetails(false);
                  setSelectedOrder(null);
                }}
                className="bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
