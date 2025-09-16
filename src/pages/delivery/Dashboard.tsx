import { useState, useEffect } from 'react';
import api from '../../services/api';
import { usePageTitle } from '../../hooks/useDocumentTitle';

interface Order {
  id: number;
  userId: number;
  userName?: string;
  userAddress?: string;
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

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'ready' | 'delivering'>('all');
  const [loading, setLoading] = useState(false);

  // Título dinâmico baseado no filtro ativo
  const getPageTitle = () => {
    switch(filterTab) {
      case 'ready':
        return 'Prontos para Entrega';
      case 'delivering':
        return 'Em Entrega';
      default:
        return 'Entregas Disponíveis';
    }
  };
  
  usePageTitle(getPageTitle(), 'delivery');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getOrders();
      // Filtrar apenas pedidos que estão prontos para entrega ou já sendo entregues
      const deliveryOrders = response.filter((order: Order) => 
        ['ready', 'delivering'].includes(order.status)
      );
      // Ordenar pedidos do mais recente para o mais antigo
      const sortedOrders = deliveryOrders.sort((a: any, b: any) => 
        new Date(b.createdAt || b.CreatedAt).getTime() - new Date(a.createdAt || a.CreatedAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pedidos baseado na aba selecionada
  const getFilteredOrders = () => {
    switch (filterTab) {
      case 'ready':
        return orders.filter(order => order.status === 'ready');
      case 'delivering':
        return orders.filter(order => order.status === 'delivering');
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadOrders(); // Recarregar a lista após atualizar
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Painel do Entregador</h1>

      {/* Abas de filtro */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setFilterTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filterTab === 'all'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Todos os Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setFilterTab('ready')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filterTab === 'ready'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Prontos para Entrega ({orders.filter(o => o.status === 'ready').length})
          </button>
          <button
            onClick={() => setFilterTab('delivering')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filterTab === 'delivering'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Em Entrega ({orders.filter(o => o.status === 'delivering').length})
          </button>
        </nav>
      </div>

      {loading ? (
        <p>Carregando pedidos...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Pedido #{order.id}</h3>
                  <p className="text-gray-600">{order.userName || `Cliente #${order.userId}`}</p>
                  <p className="text-gray-600">{order.userAddress || 'Endereço não informado'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="font-medium text-green-600">
                    Total: R$ {order.total.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 p-2.5"
                  >
                    <option value="ready">Pronto para Entrega</option>
                    <option value="delivering">Em Entrega</option>
                    <option value="delivered">Entregue</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Itens do Pedido:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {order.items && order.items.map((item, index) => (
                    <li key={index}>
                      {item.quantity}x {item.productName} - R$ {item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(order.userAddress || 'endereço')}`, '_blank')}
                >
                  Ver no Mapa
                </button>
                {order.status === 'ready' && (
                  <button
                    className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                    onClick={() => handleStatusUpdate(order.id, 'delivering')}
                  >
                    Iniciar Entrega
                  </button>
                )}
                {order.status === 'delivering' && (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => handleStatusUpdate(order.id, 'delivered')}
                  >
                    Marcar como Entregue
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                {filterTab === 'ready' && 'Não há pedidos prontos para entrega no momento.'}
                {filterTab === 'delivering' && 'Você não tem pedidos em entrega no momento.'}
                {filterTab === 'all' && 'Não há pedidos disponíveis para entrega no momento.'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {filterTab === 'ready' && 'Pedidos aparecerão aqui quando estiverem prontos para entrega.'}
                {filterTab === 'delivering' && 'Seus pedidos em andamento aparecerão aqui.'}
                {filterTab === 'all' && 'Pedidos aparecem aqui quando estão prontos para entrega.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
