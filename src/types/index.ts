export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface RoomData {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  inviteCode: string;
  createdAt: string;
}

export interface RoomMemberData {
  id: string;
  roomId: string;
  name: string;
  email: string;
  phone: string;
  addedBy: string;
  joinedAt: string;
}

export type ExpenseCategory =
  | 'food' | 'rent' | 'utilities' | 'groceries' | 'transport'
  | 'entertainment' | 'health' | 'shopping' | 'travel' | 'other';

export type SplitMethod = 'equal' | 'percentage' | 'custom';

export interface Split {
  userId: string;
  memberName?: string;
  amount: number;
  percentage?: number;
  isPaid: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string;
  paidByName?: string;
  splitMethod: SplitMethod;
  splits: Split[];
  date: string;
  notes?: string;
  roomId: string;
  createdAt: string;
}
