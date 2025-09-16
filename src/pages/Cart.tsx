import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useCart } from '../hooks/useCart';

interface CartItem {
  productId: number;
  quantity: number;
  product?: {
    ID: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  };
}

interface Product {
  ID: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'cart' | 'address' | 'confirmation'>('cart');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const { cartItems: rawCartItems, updateQuantity: updateCartQuantity, removeFromCart, clearCart } = useCart();
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Combinar dados do carrinho com produtos
  const cartItems = rawCartItems.map(item => ({
    ...item,
    product: products.find(p => p.ID === item.productId)
  }));

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await apiService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const handleQuantityUpdate = (productId: number, delta: number) => {
    const currentItem = rawCartItems.find(item => item.productId === productId);
    if (currentItem) {
      const newQuantity = currentItem.quantity + delta;
      if (newQuantity > 0) {
        updateCartQuantity(productId, newQuantity);
      } else {
        removeFromCart(productId);
      }
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    try {
      setOrdering(true);
      
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity
        }))
      };

      await apiService.createOrder(orderData);
      
      // Limpar carrinho
      clearCart();
      
      alert('Pedido realizado com sucesso!');
      navigate('/customer');
    } catch (error: any) {
      alert('Erro ao fazer pedido: ' + (error.message || 'Tente novamente'));
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">Carregando carrinho...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Carrinho Vazio</h2>
        <p className="text-gray-600 mb-6">Adicione alguns cupcakes deliciosos ao seu carrinho!</p>
        <button
          onClick={() => navigate('/customer')}
          className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700"
        >
          Ver Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {['Carrinho', 'Endereço', 'Confirmação'].map((text, index) => (
            <div
              key={text}
              className={'flex items-center ' + (
                index === ['cart', 'address', 'confirmation'].indexOf(step)
                  ? 'text-pink-600'
                  : 'text-gray-400'
              )}
            >
              <div className="flex flex-col items-center">
                <div className={'w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 ' + (
                  index === ['cart', 'address', 'confirmation'].indexOf(step)
                    ? 'border-pink-600'
                    : 'border-gray-300'
                )}>
                  {index + 1}
                </div>
                <span className="text-sm">{text}</span>
              </div>
              {index < 2 && (
                <div className="w-full h-0.5 mx-4 mt-4 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 'cart' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Carrinho de Compras</h2>
          {cartItems.map(item => (
            <div key={item.productId} className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={item.product?.imageUrl || 'https://via.placeholder.com/100x100'}
                    alt={item.product?.name || 'Produto'}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{item.product?.name}</h3>
                    <p className="text-gray-500">R$ {(item.product?.price || 0).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityUpdate(item.productId, -1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span className="px-4">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityUpdate(item.productId, 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {step === 'address' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Endereço de Entrega</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">CEP</label>
              <input
                type="text"
                value={address.zipCode}
                onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2 border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rua</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número</label>
                <input
                  type="text"
                  value={address.number}
                  onChange={(e) => setAddress({ ...address, number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2 border"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bairro</label>
              <input
                type="text"
                value={address.neighborhood}
                onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2 border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cidade</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2 border"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {step === 'confirmation' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Confirmação do Pedido</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Itens do Pedido</h3>
              {cartItems.map(item => (
                <div key={item.productId} className="flex justify-between py-2">
                  <span>{item.product?.name} x{item.quantity}</span>
                  <span>R$ {((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
              <p>{address.street}, {address.number}</p>
              <p>{address.neighborhood}, {address.city} - {address.state}</p>
              <p>CEP: {address.zipCode}</p>
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-lg">R$ {total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => {
            if (step === 'cart') setStep('address');
            else if (step === 'address') setStep('confirmation');
            else handleCheckout();
          }}
          disabled={ordering}
          className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ordering ? 'Finalizando...' : (step === 'confirmation' ? 'Finalizar Pedido' : 'Continuar')}
        </button>
        {step !== 'cart' && (
          <button
            onClick={() => {
              if (step === 'address') setStep('cart');
              else if (step === 'confirmation') setStep('address');
            }}
            className="w-full mt-2 bg-gray-100 text-gray-600 py-2 rounded hover:bg-gray-200"
          >
            Voltar
          </button>
        )}
      </div>
    </div>
  );
}
