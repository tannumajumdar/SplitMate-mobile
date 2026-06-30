import * as SecureStore from 'expo-secure-store';
import type { AuthUser, RoomData, RoomMemberData, Expense, Split } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:5000/api/v1';
const TOKEN_KEY = 'sm_access_token';

// ─── Token store ─────────────────────────────────────────────────────────────
export const tokenStore = {
  get: (): string | null => {
    // SecureStore is async; we cache in memory after first load
    return _memToken;
  },
  set: (t: string) => {
    _memToken = t;
    SecureStore.setItemAsync(TOKEN_KEY, t).catch(() => {});
  },
  clear: () => {
    _memToken = null;
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  },
  load: async (): Promise<string | null> => {
    const t = await SecureStore.getItemAsync(TOKEN_KEY);
    _memToken = t;
    return t;
  },
};
let _memToken: string | null = null;

// ─── Base request ─────────────────────────────────────────────────────────────
interface ApiOk<T> { success: true; data: T; message?: string }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message ?? `Request failed: ${res.status}`);
  }
  return json as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
function mapUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: (raw._id ?? raw.id) as string,
    name: raw.name as string,
    email: raw.email as string,
    avatar: raw.avatar as string | undefined,
  };
}

export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const res = await request<ApiOk<{ user: Record<string, unknown>; accessToken: string }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return { user: mapUser(res.data.user), accessToken: res.data.accessToken };
  },

  login: async (email: string, password: string) => {
    const res = await request<ApiOk<{ user: Record<string, unknown>; accessToken: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { user: mapUser(res.data.user), accessToken: res.data.accessToken };
  },

  googleAuth: async (idToken: string) => {
    const res = await request<ApiOk<{ user: Record<string, unknown>; accessToken: string }>>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    return { user: mapUser(res.data.user), accessToken: res.data.accessToken };
  },

  forgotPassword: async (email: string) => {
    await request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  },

  me: async () => {
    const res = await request<ApiOk<{ user: Record<string, unknown> }>>('/auth/me');
    return mapUser(res.data.user);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ─── Room API ─────────────────────────────────────────────────────────────────
function mapRoom(raw: Record<string, unknown>): RoomData {
  return {
    id: (raw._id ?? raw.id) as string,
    name: raw.name as string,
    description: raw.description as string | undefined,
    createdBy: raw.createdBy as string,
    inviteCode: raw.inviteCode as string,
    createdAt: raw.createdAt as string,
  };
}

function mapMember(raw: Record<string, unknown>): RoomMemberData {
  return {
    id: (raw._id ?? raw.id) as string,
    roomId: raw.roomId as string,
    name: raw.name as string,
    email: (raw.email as string) ?? '',
    phone: (raw.phone as string) ?? '',
    addedBy: raw.addedBy as string,
    joinedAt: (raw.joinedAt ?? raw.createdAt) as string,
  };
}

export const roomApi = {
  create: async (name: string, description?: string): Promise<RoomData> => {
    const res = await request<ApiOk<{ room: Record<string, unknown> }>>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    return mapRoom(res.data.room);
  },

  getAll: async (): Promise<RoomData[]> => {
    const res = await request<ApiOk<{ rooms: Record<string, unknown>[] }>>('/rooms');
    return res.data.rooms.map(mapRoom);
  },

  getMembers: async (roomId: string): Promise<RoomMemberData[]> => {
    const res = await request<ApiOk<{ members: Record<string, unknown>[] }>>(`/rooms/${roomId}/members`);
    return res.data.members.map(mapMember);
  },

  addMember: async (roomId: string, name: string, email: string, phone?: string): Promise<RoomMemberData> => {
    const res = await request<ApiOk<{ member: Record<string, unknown> }>>(`/rooms/${roomId}/members`, {
      method: 'POST',
      body: JSON.stringify({ name, email, phone }),
    });
    return mapMember(res.data.member);
  },

  updateMember: async (roomId: string, memberId: string, data: { name?: string; email?: string; phone?: string }): Promise<RoomMemberData> => {
    const res = await request<ApiOk<{ member: Record<string, unknown> }>>(`/rooms/${roomId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return mapMember(res.data.member);
  },

  deleteMember: async (roomId: string, memberId: string): Promise<void> => {
    await request(`/rooms/${roomId}/members/${memberId}`, { method: 'DELETE' });
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    await request(`/rooms/${roomId}`, { method: 'DELETE' });
  },

  joinRoom: async (inviteCode: string): Promise<{ room: RoomData; member: RoomMemberData }> => {
    const res = await request<ApiOk<{ room: Record<string, unknown>; member: Record<string, unknown> }>>('/rooms/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
    });
    return { room: mapRoom(res.data.room), member: mapMember(res.data.member) };
  },
};

// ─── Expense API ─────────────────────────────────────────────────────────────
function mapExpense(raw: Record<string, unknown>): Expense {
  const splits = ((raw.splits as Record<string, unknown>[]) ?? []).map((s): Split => ({
    userId: (s.memberId ?? s.userId) as string,
    memberName: s.memberName as string | undefined,
    amount: s.amount as number,
    percentage: s.percentage as number | undefined,
    isPaid: (s.isPaid as boolean) ?? false,
  }));
  const rawDate = (raw.date as string) ?? (raw.createdAt as string) ?? '';
  const date = rawDate.length > 10 ? rawDate.slice(0, 10) : rawDate;
  return {
    id: (raw._id ?? raw.id) as string,
    title: raw.title as string,
    amount: raw.amount as number,
    category: (raw.category as Expense['category']) ?? 'other',
    paidBy: raw.paidBy as string,
    paidByName: raw.paidByName as string | undefined,
    splitMethod: (raw.splitMethod as Expense['splitMethod']) ?? 'equal',
    splits,
    date,
    notes: raw.notes as string | undefined,
    roomId: raw.roomId as string,
    createdAt: raw.createdAt as string,
  };
}

export const expenseApi = {
  getByRoom: async (roomId: string): Promise<Expense[]> => {
    const res = await request<ApiOk<{ expenses: Record<string, unknown>[] }>>(`/rooms/${roomId}/expenses`);
    return res.data.expenses.map(mapExpense);
  },

  create: async (roomId: string, data: Omit<Expense, 'id' | 'roomId' | 'createdAt'>): Promise<Expense> => {
    const res = await request<ApiOk<{ expense: Record<string, unknown> }>>(`/rooms/${roomId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapExpense(res.data.expense);
  },

  update: async (roomId: string, expenseId: string, data: Partial<Expense>): Promise<Expense> => {
    const res = await request<ApiOk<{ expense: Record<string, unknown> }>>(`/rooms/${roomId}/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return mapExpense(res.data.expense);
  },

  delete: async (roomId: string, expenseId: string): Promise<void> => {
    await request(`/rooms/${roomId}/expenses/${expenseId}`, { method: 'DELETE' });
  },
};

// ─── Rating API ───────────────────────────────────────────────────────────────
export const ratingApi = {
  submit: async (rating: number, review?: string) => {
    await request('/ratings', { method: 'POST', body: JSON.stringify({ rating, review }) });
  },
};
