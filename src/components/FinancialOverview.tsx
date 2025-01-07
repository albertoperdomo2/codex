import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export const FinancialOverview: React.FC = () => {
  const monthlyData = useFinanceStore((state) => state.getMonthlyData());
  const selectedPeriod = useFinanceStore((state) => state.selectedPeriod);
  const summary = useFinanceStore((state) => state.getFinancialSummary());

  const periodLabel = selectedPeriod === 'current' 
    ? 'This Month'
    : selectedPeriod === 'overall'
      ? 'Overall'
      : new Date(selectedPeriod).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Current month data for bar chart
  const currentMonthData = [
    { name: 'Income', amount: summary.totalIncome },
    { name: 'Expenses', amount: summary.totalExpenses },
    { name: 'Savings', amount: summary.totalSavings },
    { name: 'Remaining', amount: summary.balance }, // XXX check
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Financial Overview - {periodLabel}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Income</p>
              <p className="text-2xl font-semibold text-green-600">
                €{summary.totalIncome.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expenses</p>
              <p className="text-2xl font-semibold text-red-600">
                €{summary.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Savings</p>
              <p className="text-2xl font-semibold text-indigo-600">
                €{summary.totalSavings.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Wallet className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Balance</p>
              <p className="text-2xl font-semibold text-gray-900">
                €{summary.balance.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <DollarSign className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="h-64">
          {selectedPeriod === 'overall' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `€${Number(value).toFixed(2)}`}
                  labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                />
                <Line type="monotone" dataKey="income" stroke="#22c55e" name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" />
                <Line type="monotone" dataKey="savings" stroke="#4f46e5" name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentMonthData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
  <Bar 
    dataKey="amount" 
    radius={[4, 4, 0, 0]}
    fill="#4f46e5"
    name="Amount"
  >
    {currentMonthData.map((entry, index) => {
      let color;
      switch (entry.name) {
        case 'Income':
          color = '#22c55e';  // green-600
          break;
        case 'Expenses':
          color = '#ef4444';  // red-600
          break;
        case 'Savings':
          color = '#4f46e5';  // indigo-600
          break;
        case 'Remaining':
          color = '#64748b';  // slate-500
          break;
        default:
          color = '#94a3b8';  // slate-400
      }
      return <Cell key={`cell-${index}`} fill={color} />;
    })}
  </Bar>
</BarChart>

              {/* <BarChart data={currentMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart> */}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};