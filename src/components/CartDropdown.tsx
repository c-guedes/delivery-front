import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
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

interface CartDropdownProps {
  onClose: () => void;
}

export default function CartDropdown({ onClose }: CartDropdownProps) {
  const { cartItems, updateQuantity, removeFromCart, getTotalItems, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

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

  const handleCheckout = () => {
    console.log('Tentando navegar para /checkout...');
    console.log('Usuário autenticado:', isAuthenticated);
    console.log('Tipo de usuário:', user?.type);
    console.log('Itens no carrinho:', cartItems.length);
    
    onClose();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-800 rounded-md shadow-lg dark:shadow-gray-900/50 z-50 border dark:border-dark-600">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  const cartItemsWithDetails = getCartItemsWithDetails();

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-800 rounded-md shadow-lg dark:shadow-gray-900/50 z-50 border dark:border-dark-600 max-h-96 overflow-hidden flex flex-col transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b dark:border-dark-600 bg-gray-50 dark:bg-dark-700 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Meu Carrinho ({getTotalItems()})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {cartItemsWithDetails.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Carrinho vazio</h3>
            <p className="text-gray-500 dark:text-gray-400">Adicione alguns cupcakes deliciosos!</p>
          </div>
        ) : (
          <div className="p-2">
            {cartItemsWithDetails.map(item => (
              <div key={item.productId} className="flex items-center p-3 border-b dark:border-dark-600 last:border-b-0">
                {/* Product Image */}
                <img
                  src={item.product!.imageUrl}
                  alt={item.product!.name}
                  className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                />
                
                {/* Product Details */}
                <div className="flex-1 ml-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.product!.name}
                  </h4>
                  <p className="text-sm text-pink-600 dark:text-pink-400 font-semibold">
                    R$ {item.product!.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                  >
                    <MinusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="ml-2 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {cartItemsWithDetails.length > 0 && (
        <div className="border-t dark:border-dark-600 bg-gray-50 dark:bg-dark-700 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Total:</span>
            <span className="text-lg font-bold text-pink-600 dark:text-pink-400">
              R$ {getTotalPrice().toFixed(2)}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                clearCart();
                onClose();
              }}
              className="flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 px-3 py-2 text-sm bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
            >
              Finalizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
