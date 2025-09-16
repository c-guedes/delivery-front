import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import apiService from '../services/api';

interface Product {
  ID: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  // Título da página
  useDocumentTitle('Finalizar Pedido');

  useEffect(() => {
    console.log('Checkout: cartItems length:', cartItems.length);
    console.log('Checkout: cartItems:', cartItems);
    
    // Dar um pequeno delay para garantir que o carrinho carregou
    const timer = setTimeout(() => {
      if (cartItems.length === 0) {
        console.log('Carrinho vazio, redirecionando para home...');
        navigate('/');
        return;
      }
      loadProducts();
    }, 100);

    return () => clearTimeout(timer);
  }, [cartItems, navigate]);

  const loadProducts = async () => {
    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCartItemsWithDetails = () => {
    return cartItems.map(cartItem => {
      const product = products.find(p => p.ID === cartItem.productId);
      return {
        ...cartItem,
        product: product || null
      };
    }).filter(item => item.product !== null);
  };

  const getTotalPrice = () => {
    return getCartItemsWithDetails().reduce((total, item) => {
      return total + (item.product!.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim() || !phone.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity
        })),
        address: address.trim(),
        phone: phone.trim(),
        paymentMethod,
        notes: notes.trim()
      };

      await apiService.createOrder(orderData);
      
      // Limpar carrinho após sucesso
      clearCart();
      
      alert('Pedido realizado com sucesso! Acompanhe o status na aba "Meus Pedidos".');
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-dark-900 min-h-screen transition-colors">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Carrinho Vazio</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Adicione alguns produtos antes de finalizar o pedido.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors"
          >
            Ver Produtos
          </button>
        </div>
      </div>
    );
  }

  const cartItemsWithDetails = getCartItemsWithDetails();

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-dark-900 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Finalizar Pedido</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Checkout */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border dark:border-dark-600 transition-colors">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Informações de Entrega</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endereço de Entrega *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Rua, número, bairro, cidade..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefone para Contato *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="cash">Dinheiro na Entrega</option>
                  <option value="card">Cartão na Entrega</option>
                  <option value="pix">PIX</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Instruções especiais, troco, etc..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-pink-600 text-white py-3 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {submitting ? 'Processando...' : `Confirmar Pedido - R$ ${getTotalPrice().toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Resumo do Pedido */}
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border dark:border-dark-600 transition-colors">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Resumo do Pedido</h2>
            
            <div className="space-y-4">
              {cartItemsWithDetails.map(item => (
                <div key={item.productId} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <img
                    src={item.product!.imageUrl}
                    alt={item.product!.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.product!.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      R$ {item.product!.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-pink-600 dark:text-pink-400">
                      R$ {(item.product!.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t dark:border-dark-600 mt-6 pt-6">
              <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                <span>Total:</span>
                <span className="text-pink-600 dark:text-pink-400">R$ {getTotalPrice().toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Taxa de entrega: Grátis
              </p>
            </div>

            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
