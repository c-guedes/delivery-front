import React from 'react';
import HealthCheck from '../components/HealthCheck';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const HealthStatusPage: React.FC = () => {
  useDocumentTitle('System Health Status - Cupcake Delivery');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            System Health Status
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Monitor the real-time status of our services
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                API Server
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Backend services and API endpoints
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Database
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                PostgreSQL database connectivity
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Live Status Monitor
            </h2>
            {/* O componente HealthCheck renderiza o monitor aqui */}
            <HealthCheck />
          </div>

          <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About This Page
            </h3>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>
                • <strong>API Server:</strong> Checks if our backend services are responding correctly
              </p>
              <p>
                • <strong>Database:</strong> Verifies connection to our PostgreSQL database
              </p>
              <p>
                • <strong>Auto-refresh:</strong> Status updates every 30 seconds automatically
              </p>
              <p>
                • <strong>Real-time:</strong> All checks are performed in real-time when you visit this page
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatusPage;
