import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import CustomerSignup from './pages/CustomerSignup';
import DeliverySignup from './pages/DeliverySignup';
import CustomerDashboard from './pages/customer/Dashboard';
import DeliveryDashboard from './pages/delivery/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Componente interno que usa o contexto
function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-900 flex items-center justify-center transition-colors">
        <div className="text-xl text-gray-900 dark:text-white">Carregando...</div>
      </div>
    );
  }

  // Função para redirecionar para o dashboard apropriado
  const getDashboardComponent = () => {
    if (!user) return <Navigate to="/login" replace />;
    
    switch (user.type) {
      case 'customer':
        return <CustomerDashboard />;
      case 'delivery':
        return <DeliveryDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-dark-900 transition-colors">
        {/* Mostrar Navbar apenas se estiver autenticado */}
        {isAuthenticated && <Navbar userType={user?.type ?? null} />}
        <main>
          <Routes>
            {/* Rota principal - redireciona para o dashboard apropriado */}
            <Route path="/" element={
              isAuthenticated ? getDashboardComponent() : <Navigate to="/login" replace />
            } />
            
            {/* Rotas específicas para cada tipo de usuário */}
            <Route path="/customer/*" element={
              isAuthenticated && user?.type === 'customer' ? <CustomerDashboard /> : <Navigate to="/login" replace />
            } />
            <Route path="/delivery/*" element={
              isAuthenticated && user?.type === 'delivery' ? <DeliveryDashboard /> : <Navigate to="/login" replace />
            } />
            <Route path="/admin/*" element={
              isAuthenticated && user?.type === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />
            } />
            
            {/* Rota do checkout - apenas para clientes */}
            <Route path="/checkout" element={
              isAuthenticated && user?.type === 'customer' ? <Checkout /> : <Navigate to="/login" replace />
            } />
            
            {/* Rotas de autenticação */}
            <Route path="/login" element={
              !isAuthenticated ? <Login /> : <Navigate to="/" replace />
            } />
            <Route path="/signup/customer" element={
              !isAuthenticated ? <CustomerSignup /> : <Navigate to="/" replace />
            } />
            <Route path="/signup/delivery" element={
              !isAuthenticated ? <DeliverySignup /> : <Navigate to="/" replace />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
