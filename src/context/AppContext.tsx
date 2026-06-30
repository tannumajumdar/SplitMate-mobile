import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { roomApi, expenseApi, tokenStore } from '../services/api';
import type { Expense, RoomData, RoomMemberData } from '../types';

interface AppContextType {
  expenses: Expense[];
  expensesLoading: boolean;
  loadExpenses: (roomId: string) => Promise<void>;
  addExpense: (e: Expense) => void;
  updateExpenseInList: (e: Expense) => void;
  deleteExpense: (id: string) => void;
  apiRooms: RoomData[];
  apiRoomsLoading: boolean;
  loadRooms: () => Promise<void>;
  setApiRooms: React.Dispatch<React.SetStateAction<RoomData[]>>;
  activeRoomId: string;
  setActiveRoomId: (id: string) => void;
  activeRoomMembers: RoomMemberData[];
  membersLoading: boolean;
  reloadMembers: () => Promise<void>;
  setActiveRoomMembers: React.Dispatch<React.SetStateAction<RoomMemberData[]>>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [apiRooms, setApiRooms] = useState<RoomData[]>([]);
  const [apiRoomsLoading, setApiRoomsLoading] = useState(false);
  const [activeRoomId, setActiveRoomIdState] = useState('');
  const [activeRoomMembers, setActiveRoomMembers] = useState<RoomMemberData[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const setActiveRoomId = useCallback(async (id: string) => {
    setActiveRoomIdState(id);
    await AsyncStorage.setItem('sm_active_room', id);
  }, []);

  const loadRooms = useCallback(async () => {
    if (!tokenStore.get()) return;
    setApiRoomsLoading(true);
    try {
      const data = await roomApi.getAll();
      setApiRooms(data);
      const saved = await AsyncStorage.getItem('sm_active_room');
      if (!saved && data.length > 0) setActiveRoomId(data[0].id);
    } catch {
      // silent
    } finally {
      setApiRoomsLoading(false);
    }
  }, [setActiveRoomId]);

  const reloadMembers = useCallback(async () => {
    if (!activeRoomId) return;
    setMembersLoading(true);
    try {
      const members = await roomApi.getMembers(activeRoomId);
      setActiveRoomMembers(members);
    } catch {
      setActiveRoomMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [activeRoomId]);

  const loadExpenses = useCallback(async (roomId: string) => {
    if (!roomId || !tokenStore.get()) return;
    setExpensesLoading(true);
    try {
      const data = await expenseApi.getByRoom(roomId);
      setExpenses(data);
    } catch {
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('sm_active_room');
      if (saved) setActiveRoomIdState(saved);
      loadRooms();
    })();
  }, [loadRooms]);

  useEffect(() => {
    if (activeRoomId) {
      reloadMembers();
      loadExpenses(activeRoomId);
    } else {
      setActiveRoomMembers([]);
      setExpenses([]);
    }
  }, [activeRoomId, reloadMembers, loadExpenses]);

  const addExpense = useCallback((e: Expense) => setExpenses((p) => [e, ...p]), []);
  const updateExpenseInList = useCallback((e: Expense) => setExpenses((p) => p.map((x) => (x.id === e.id ? e : x))), []);
  const deleteExpense = useCallback((id: string) => setExpenses((p) => p.filter((e) => e.id !== id)), []);

  return (
    <AppContext.Provider value={{
      expenses, expensesLoading, loadExpenses, addExpense, updateExpenseInList, deleteExpense,
      apiRooms, apiRoomsLoading, loadRooms, setApiRooms,
      activeRoomId, setActiveRoomId,
      activeRoomMembers, membersLoading, reloadMembers, setActiveRoomMembers,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
