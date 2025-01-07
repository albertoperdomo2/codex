export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense' | 'savings';
  isRecurring: boolean;
  frequency?: 'monthly' | 'weekly' | 'yearly';
  billingDate?: number;
}

export interface User {
  email: string;
  name: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  remainingBudget: number;
}

export interface MonthlyData {
  date: string;
  income: number;
  expenses: number;
  savings: number;
}

export type TimePeriod = 'current' | 'overall' | string; // string format: 'YYYY-MM'