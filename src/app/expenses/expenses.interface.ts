export interface ExpenseItem {
  id: number;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  notes: string | null;
}

export interface ResponseExpenseList {
  data: ExpenseItem[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ExpenseFormData {
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  notes: string;
}

export type CreateExpense = ExpenseFormData;
export type UpdateExpense = ExpenseFormData;
