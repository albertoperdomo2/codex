import React from 'react';
import { CalendarRange } from 'lucide-react';
import { TimePeriod } from '../types/finance';

interface Props {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export const TimePeriodSelector: React.FC<Props> = ({ selectedPeriod, onPeriodChange }) => {
  // const currentMonth = new Date().toISOString().slice(0, 7);
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-4">
        <CalendarRange className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Time Period</h3>
      </div>
      
      <select
        value={selectedPeriod}
        onChange={(e) => onPeriodChange(e.target.value as TimePeriod)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="current">Current Month</option>
        <option value="overall">Overall</option>
        <optgroup label="Previous Months">
          {months.map((month) => (
            <option key={month} value={month}>
              {new Date(month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};