import React, { useState, useEffect } from 'react';

interface HealthStatus {
  api: 'healthy' | 'unhealthy' | 'checking';
  database: 'healthy' | 'unhealthy' | 'checking';
  lastCheck: Date | null;
}

const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<HealthStatus>({
    api: 'checking',
    database: 'checking',
    lastCheck: null
  });

  const checkHealth = async () => {
    setStatus(prev => ({
      ...prev,
      api: 'checking',
      database: 'checking'
    }));

    try {
      // Verificar API com timeout
      const apiController = new AbortController();
      const apiTimeout = setTimeout(() => apiController.abort(), 5000);
      
      const apiResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`, {
        method: 'GET',
        signal: apiController.signal
      });
      clearTimeout(apiTimeout);
      
      const apiHealthy = apiResponse.ok;
      
      // Verificar Database (através da API) com timeout
      const dbController = new AbortController();
      const dbTimeout = setTimeout(() => dbController.abort(), 5000);
      
      const dbResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health/database`, {
        method: 'GET',
        signal: dbController.signal
      });
      clearTimeout(dbTimeout);
      
      const dbHealthy = dbResponse.ok;

      setStatus({
        api: apiHealthy ? 'healthy' : 'unhealthy',
        database: dbHealthy ? 'healthy' : 'unhealthy',
        lastCheck: new Date()
      });
    } catch (error) {
      console.error('Health check failed:', error);
      setStatus({
        api: 'unhealthy',
        database: 'unhealthy',
        lastCheck: new Date()
      });
    }
  };

  useEffect(() => {
    checkHealth();
    // Verificar a cada 30 segundos
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'unhealthy': return 'text-red-500';
      case 'checking': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'unhealthy': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'checking': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'unhealthy': return '❌';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  const getOverallStatus = () => {
    if (status.api === 'healthy' && status.database === 'healthy') {
      return { color: 'bg-green-500', text: 'All Systems Operational', textColor: 'text-green-600' };
    }
    if (status.api === 'checking' || status.database === 'checking') {
      return { color: 'bg-yellow-500', text: 'Checking Status...', textColor: 'text-yellow-600' };
    }
    return { color: 'bg-red-500', text: 'System Issues Detected', textColor: 'text-red-600' };
  };

  const overall = getOverallStatus();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      {/* Overall Status */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center px-4 py-2 rounded-full ${overall.color} text-white mb-4`}>
          <div className="w-3 h-3 bg-white rounded-full mr-3"></div>
          <span className="font-semibold">{overall.text}</span>
        </div>
        <h2 className={`text-2xl font-bold ${overall.textColor} dark:text-white`}>
          System Status
        </h2>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* API Status */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              API Server
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(status.api)}`}>
              <span className="mr-2">{getStatusIcon(status.api)}</span>
              {status.api}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Backend services and API endpoints
          </p>
        </div>

        {/* Database Status */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Database
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(status.database)}`}>
              <span className="mr-2">{getStatusIcon(status.database)}</span>
              {status.database}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            PostgreSQL database connectivity
          </p>
        </div>
      </div>

      {/* Last Check and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-600">
        <div className="mb-4 sm:mb-0">
          {status.lastCheck && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last check: {status.lastCheck.toLocaleString()}
            </div>
          )}
        </div>
        
        <button
          onClick={checkHealth}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={status.api === 'checking' || status.database === 'checking'}
        >
          {(status.api === 'checking' || status.database === 'checking') ? (
            <>
              <span className="animate-spin mr-2">🔄</span>
              Checking...
            </>
          ) : (
            'Refresh Status'
          )}
        </button>
      </div>
    </div>
  );
};

export default HealthCheck;
