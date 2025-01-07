import React, { useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { FinancialOverview } from './FinancialOverview';
import { TimePeriodSelector } from './TimePeriodSelector';
import { DollarSign, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Dashboard: React.FC = () => {
  const fetchTransactions = useFinanceStore((state) => state.fetchTransactions);
  const checkRecurring = useFinanceStore((state) => state.checkAndCreateRecurringTransactions);
  const isLoading = useFinanceStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const selectedPeriod = useFinanceStore((state) => state.selectedPeriod);
  const setSelectedPeriod = useFinanceStore((state) => state.setSelectedPeriod);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchTransactions();
      await checkRecurring();
    };

    init();

    const interval = setInterval(checkRecurring, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, [fetchTransactions, checkRecurring]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Codex
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, <span className="sm:hidden">{user?.email?.split('@')[0].slice(0, 5)}...</span>
                <span className="hidden sm:inline">{user?.email}</span>
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TimePeriodSelector - First on mobile */}
          <div className="order-first lg:order-last lg:col-span-1">
            <TimePeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>
          
          {/* Main content - Second on mobile */}
          <div className="order-last lg:order-first lg:col-span-2 space-y-8">
            <FinancialOverview />
            <TransactionForm />
            <TransactionList />
          </div>
        </div>
      </main>
    </div>
  );
};