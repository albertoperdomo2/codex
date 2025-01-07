import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Transaction } from '../types/supabase';
import type { TimePeriod } from '../types/finance';

interface FinanceState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  selectedPeriod: TimePeriod; 
  setSelectedPeriod: (period: TimePeriod) => void;
  // CRUD operations
  fetchTransactions: () => Promise<void>;
  // addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  checkAndCreateRecurringTransactions: () => Promise<void>;
  addTransaction: (transaction: TransactionInput) => Promise<void>;
  // Stats and filters
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  calculateTotals: () => void;
  getFinancialSummary: () => {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    balance: number;
  };
  getMonthlyData: () => Array<{
    date: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
}

interface TransactionInput {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense' | 'savings';
  date: string;
  is_recurring: boolean;
  frequency: 'monthly' | 'weekly' | 'yearly' | null;
  billing_date: number | null;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  selectedPeriod: 'current',
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) throw new Error('No user logged in');
  
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('date', { ascending: false });
  
      if (error) throw error;
  
      set({ transactions: data || [] });
      get().calculateTotals();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch transactions' });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (transactionInput: TransactionInput) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionInput,
          user_id: session.session.user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set((state) => ({
          transactions: [data, ...state.transactions]
        }));
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add transaction');
    }
  },

  // addTransaction: (transaction) => {
  //   set((state) => ({
  //     transactions: [transaction, ...state.transactions]
  //   }));
  //   get().calculateTotals();
  // },

  updateTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          type: transaction.type,
          date: transaction.date,
          is_recurring: transaction.is_recurring,
          frequency: transaction.frequency,
          billing_date: transaction.billing_date,
        })
        .eq('id', transaction.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === transaction.id ? data : t
          )
        }));
        get().calculateTotals();
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update transaction' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id)
      }));
      get().calculateTotals();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete transaction' });
    } finally {
      set({ isLoading: false });
    }
  },

  totalIncome: 0,
  totalExpenses: 0,
  totalSavings: 0,

  calculateTotals: () => {
    const transactions = get().transactions;
    
    const totals = transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount);
      switch (transaction.type) {
        case 'income':
          acc.income += amount;
          break;
        case 'expense':
          acc.expenses += amount;
          break;
        case 'savings':
          acc.savings += amount;
          break;
      }
      return acc;
    }, { income: 0, expenses: 0, savings: 0 });

    set({
      totalIncome: totals.income,
      totalExpenses: totals.expenses,
      totalSavings: totals.savings,
    });
  },

  getFinancialSummary: () => {
    const { transactions, selectedPeriod } = get();
    
    let filteredTransactions = transactions;
    if (selectedPeriod === 'current') {
      const currentMonth = new Date().toISOString().slice(0, 7);
      filteredTransactions = transactions.filter(t => 
        t.date.startsWith(currentMonth)
      );
    } else if (selectedPeriod !== 'overall') {
      // For specific month selection
      filteredTransactions = transactions.filter(t => 
        t.date.startsWith(selectedPeriod)
      );
    }

    const summary = filteredTransactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount);
      switch (transaction.type) {
        case 'income':
          acc.totalIncome += amount;
          break;
        case 'expense':
          acc.totalExpenses += amount;
          break;
        case 'savings':
          acc.totalSavings += amount;
          break;
      }
      return acc;
    }, {
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
      balance: 0
    });

    summary.balance = summary.totalIncome - summary.totalExpenses - summary.totalSavings;
    return summary;
  },

  getMonthlyData: () => {
    const { transactions } = get();
    
    // Group transactions by month
    const monthlyGroups = transactions.reduce((acc, transaction) => {
      const month = transaction.date.slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          date: month,
          income: 0,
          expenses: 0,
          savings: 0
        };
      }

      const amount = Number(transaction.amount);
      switch (transaction.type) {
        case 'income':
          acc[month].income += amount;
          break;
        case 'expense':
          acc[month].expenses += amount;
          break;
        case 'savings':
          acc[month].savings += amount;
          break;
      }
      return acc;
    }, {} as Record<string, {
      date: string;
      income: number;
      expenses: number;
      savings: number;
    }>);

    const monthlyData = Object.values(monthlyGroups)
    .sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
    .slice(-12);

    return monthlyData;
  },

  checkAndCreateRecurringTransactions: async () => {
    const { transactions } = get();
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) return;

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
    const currentDay = today.getDate();

    // Filter recurring transactions
    const recurringTransactions = transactions.filter(t => t.is_recurring);

    for (const transaction of recurringTransactions) {
      if (!transaction.billing_date) continue;

      const lastTransactionDate = new Date(transaction.date);
      const shouldCreateNew = (() => {
        switch (transaction.frequency) {
          case 'monthly':
            // Check if we need to create a transaction for this month
            return transaction.billing_date === currentDay &&
                   lastTransactionDate.toISOString().slice(0, 7) !== currentMonth;
          
          case 'weekly':
            // Create new if it's been more than 7 days
            const daysSinceLastTransaction = Math.floor(
              (today.getTime() - lastTransactionDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysSinceLastTransaction >= 7;
          
          case 'yearly':
            // Check if it's the anniversary date
            return transaction.billing_date === currentDay &&
                   lastTransactionDate.getMonth() === today.getMonth() &&
                   lastTransactionDate.getFullYear() < today.getFullYear();
          
          default:
            return false;
        }
      })();

      if (shouldCreateNew) {
        const newTransaction = {
          user_id: session.session.user.id,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          type: transaction.type,
          date: new Date().toISOString(),
          is_recurring: true,
          frequency: transaction.frequency,
          billing_date: transaction.billing_date
        };

        // Insert new transaction
        const { error } = await supabase
          .from('transactions')
          .insert([newTransaction]);

        if (!error) {
          // Fetch updated transactions
          get().fetchTransactions();
        }
      }
    }
  },
}));