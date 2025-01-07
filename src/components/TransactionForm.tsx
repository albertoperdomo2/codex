import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { PlusCircle } from 'lucide-react';

export const TransactionForm: React.FC = () => {
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'savings'>('expense');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [billingDate, setBillingDate] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const transaction = {
        amount: parseFloat(amount),
        description,
        category,
        type,
        date: new Date(date).toISOString(),
        is_recurring: isRecurring,
        frequency: isRecurring ? frequency : null,
        billing_date: isRecurring ? parseInt(billingDate) : null,
      };

      await addTransaction(transaction);
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      setType('expense');
      setIsRecurring(false);
      setFrequency('monthly');
      setBillingDate('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Add New Transaction
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (€)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter amount"
              required
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              max={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter description"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g., Groceries"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="expense"
              checked={type === 'expense'}
              onChange={() => setType('expense')}
              className="text-indigo-600 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <label htmlFor="expense" className="text-sm text-gray-700">
              Expense
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="income"
              checked={type === 'income'}
              onChange={() => setType('income')}
              className="text-indigo-600 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <label htmlFor="income" className="text-sm text-gray-700">
              Income
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="savings"
              checked={type === 'savings'}
              onChange={() => setType('savings')}
              className="text-indigo-600 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <label htmlFor="savings" className="text-sm text-gray-700">
              Savings
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="text-indigo-600 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <label htmlFor="recurring" className="text-sm text-gray-700">
              Recurring
            </label>
          </div>
          
          {isRecurring && (
            <>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'monthly' | 'weekly' | 'yearly')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>

              <input
                type="number"
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Day"
                min="1"
                max="31"
                required={isRecurring}
                disabled={isSubmitting}
              />
            </>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Transaction
            </>
          )}
        </button>
      </form>
    </div>
  );
};