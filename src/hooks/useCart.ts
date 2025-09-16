import { useState, useEffect } from 'react';

interface CartItem {
  productId: number;
  quantity: number;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        setCartItems([]);
      }
    };

    loadCart();

    // Escutar mudanças no localStorage
    const handleStorageChange = () => {
      loadCart();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Escutar evento customizado para mudanças no carrinho
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const addToCart = (productId: number, quantity: number = 1) => {
    const existingItem = cartItems.find(item => item.productId === productId);
    let newItems;

    if (existingItem) {
      newItems = cartItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...cartItems, { productId, quantity }];
    }

    setCartItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    
    // Disparar evento customizado para notificar outros componentes
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (productId: number) => {
    const newItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newItems = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    setCartItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return {
    cartItems,
    getTotalItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
};
