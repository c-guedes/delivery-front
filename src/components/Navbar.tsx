import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import CartDropdown from './CartDropdown';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';
import logo from '../assets/logo.png';

interface NavbarProps {
  userType: 'customer' | 'delivery' | 'admin' | null;
}

export default function Navbar({ userType }: NavbarProps) {
  const { getTotalItems } = useCart();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const totalItems = getTotalItems();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setShowCart(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-dark-800 shadow dark:shadow-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-3">
              <img 
                src={logo} 
                alt="Cupcake Delivery" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold text-pink-600 dark:text-pink-400 hidden sm:block">
                Cupcake Delivery
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {userType === 'customer' && (
              <div className="relative" ref={cartRef}>
                <button 
                  onClick={() => setShowCart(!showCart)}
                  className="relative p-2 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 transition-colors"
                >
                  <ShoppingBagIcon className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
                {showCart && (
                  <CartDropdown onClose={() => setShowCart(false)} />
                )}
              </div>
            )}
            
            {/* Notificações - visível para todos os tipos de usuário logados */}
            {userType && <NotificationDropdown />}
            
            {/* Toggle de tema */}
            <ThemeToggle />
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 transition-colors"
              >
                <UserCircleIcon className="h-6 w-6" />
                {user && (
                  <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
                    {user.name || user.email}
                  </span>
                )}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-md shadow-lg dark:shadow-gray-700 z-50 border dark:border-dark-600">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b dark:border-dark-600">
                      {user?.name || 'Usuário'}
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
