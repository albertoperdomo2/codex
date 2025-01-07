import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Save } from 'lucide-react';

export const SavingsGoalForm: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const monthlySavingsGoal = useFinanceStore((state) => state.monthlySavingsGoal);
  const setMonthlySavingsGoal = useFinanceStore((state) => state.setMonthlySavingsGoal);
  const [newGoal, setNewGoal] = useState(monthlySavingsGoal.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMonthlySavingsGoal(parseFloat(newGoal));
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Savings Goal</h3>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="number"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter savings goal"
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Goal
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-2xl font-semibold text-indigo-600">€{monthlySavingsGoal.toFixed(2)}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Edit Goal
          </button>
        </div>
      )}
    </div>
  );
};