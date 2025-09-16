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
  const [isVisible, setIsVisible] = useState(false);

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
      return { color: 'bg-green-500', text: 'All Systems Operational' };
    }
    if (status.api === 'checking' || status.database === 'checking') {
      return { color: 'bg-yellow-500', text: 'Checking Status...' };
    }
    return { color: 'bg-red-500', text: 'System Issues Detected' };
  };

  const overall = getOverallStatus();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Status Indicator */}
      <div 
        className={`${overall.color} rounded-full p-2 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200`}
        onClick={() => setIsVisible(!isVisible)}
        title="System Health Status"
      >
        <div className="w-4 h-4 bg-white rounded-full"></div>
      </div>

      {/* Health Panel */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">System Health</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Overall Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${overall.color}`}></div>
              <span className="font-medium text-gray-900 dark:text-white">{overall.text}</span>
            </div>

            {/* API Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">API Server</span>
              <div className="flex items-center space-x-2">
                <span className={getStatusColor(status.api)}>
                  {getStatusIcon(status.api)}
                </span>
                <span className={`text-sm ${getStatusColor(status.api)}`}>
                  {status.api}
                </span>
              </div>
            </div>

            {/* Database Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Database</span>
              <div className="flex items-center space-x-2">
                <span className={getStatusColor(status.database)}>
                  {getStatusIcon(status.database)}
                </span>
                <span className={`text-sm ${getStatusColor(status.database)}`}>
                  {status.database}
                </span>
              </div>
            </div>

            {/* Last Check */}
            {status.lastCheck && (
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                Last check: {status.lastCheck.toLocaleTimeString()}
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={checkHealth}
              className="w-full mt-3 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              disabled={status.api === 'checking' || status.database === 'checking'}
            >
              {(status.api === 'checking' || status.database === 'checking') ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCheck;
