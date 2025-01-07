import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Trash2 } from 'lucide-react';

export const TransactionList: React.FC = () => {
  const transactions = useFinanceStore((state) => state.transactions);
  const removeTransaction = useFinanceStore((state) => state.deleteTransaction);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Transactions
      </h3>
      
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                  {transaction.is_recurring && ` • Recurring (${transaction.frequency})`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span
                className={`font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}€{transaction.amount.toFixed(2)}
              </span>
              
              <button
                onClick={() => removeTransaction(transaction.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {transactions.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No transactions yet. Add one to get started!
          </p>
        )}
      </div>
    </div>
  );
};