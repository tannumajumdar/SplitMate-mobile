import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../../src/context/AppContext';
import { useAuth } from '../../src/context/AuthContext';
import { roomApi } from '../../src/services/api';
import type { RoomMemberData } from '../../src/types';
import AppHeader from '../../src/components/AppHeader';

function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={onClose} />
      <View className="bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-5 pb-8" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-base font-bold text-slate-900 dark:text-white">{title}</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color="#94a3b8" /></TouchableOpacity>
        </View>
        {children}
      </View>
    </Modal>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View className="gap-1.5 mb-3">
      <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</Text>
      <TextInput
        className="bg-slate-100 dark:bg-slate-800 rounded-xl px-3 h-12 text-slate-900 dark:text-white text-sm"
        placeholderTextColor="#94a3b8"
        {...props}
      />
    </View>
  );
}

export default function RoomScreen() {
  const { user } = useAuth();
  const {
    apiRooms, apiRoomsLoading, loadRooms, setApiRooms,
    activeRoomId, setActiveRoomId,
    activeRoomMembers, membersLoading, reloadMembers, setActiveRoomMembers,
  } = useApp();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeRoom = apiRooms.find((r) => r.id === activeRoomId);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) { setError('Enter a room name'); return; }
    setError(''); setLoading(true);
    try {
      const room = await roomApi.create(roomName.trim(), roomDesc.trim() || undefined);
      setApiRooms((p) => [room, ...p]);
      await setActiveRoomId(room.id);
      setCreateOpen(false);
      setRoomName(''); setRoomDesc('');
      await reloadMembers();
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to create room');
    } finally { setLoading(false); }
  };

  const handleJoinRoom = async () => {
    if (!inviteCodeInput.trim()) { setError('Enter an invite code'); return; }
    setError(''); setLoading(true);
    try {
      const { room } = await roomApi.joinRoom(inviteCodeInput.trim());
      setApiRooms((p) => {
        if (p.some((r) => r.id === room.id)) return p;
        return [room, ...p];
      });
      await setActiveRoomId(room.id);
      setJoinOpen(false);
      setInviteCodeInput('');
      await reloadMembers();
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Invalid invite code');
    } finally { setLoading(false); }
  };

  const handleAddMember = async () => {
    if (!memberName.trim()) { setError('Name is required'); return; }
    if (!memberEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)) {
      setError('Enter a valid email'); return;
    }
    if (activeRoomMembers.some((m) => m.email?.toLowerCase() === memberEmail.trim().toLowerCase())) {
      setError('Member with this email already exists'); return;
    }
    if (!activeRoomId) { setError('Select a room first'); return; }
    setError(''); setLoading(true);
    try {
      const m = await roomApi.addMember(activeRoomId, memberName.trim(), memberEmail.trim(), memberPhone.trim() || undefined);
      setActiveRoomMembers((p) => [...p, m]);
      setAddMemberOpen(false);
      setMemberName(''); setMemberEmail(''); setMemberPhone('');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to add member');
    } finally { setLoading(false); }
  };

  const handleDeleteMember = (member: RoomMemberData) => {
    Alert.alert('Remove Member', `Remove ${member.name} from this room?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await roomApi.deleteMember(activeRoomId, member.id);
            setActiveRoomMembers((p) => p.filter((m) => m.id !== member.id));
          } catch (e: unknown) {
            Alert.alert('Error', (e as Error).message);
          }
        },
      },
    ]);
  };

  const handleDeleteRoom = (roomId: string, roomName: string) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${roomName}"? This will remove all members and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await roomApi.deleteRoom(roomId);
              setApiRooms((p) => p.filter((r) => r.id !== roomId));
              if (activeRoomId === roomId) {
                const remaining = apiRooms.filter((r) => r.id !== roomId);
                await setActiveRoomId(remaining[0]?.id ?? '');
                setActiveRoomMembers([]);
              }
              Alert.alert('Deleted', 'Room deleted successfully.');
            } catch (e: unknown) {
              Alert.alert('Error', (e as Error).message ?? 'Failed to delete room');
            }
          },
        },
      ]
    );
  };

  const handleCopyInviteCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied!', `Invite code ${code} copied to clipboard.`);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <AppHeader
        title="My Rooms"
        rightSlot={
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <TouchableOpacity onPress={loadRooms}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center">
              <Ionicons name="refresh-outline" size={18} color="#7C5CFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setInviteCodeInput(''); setError(''); setJoinOpen(true); }}
              className="h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex-row items-center gap-1">
              <Ionicons name="enter-outline" size={16} color="#7C5CFF" />
              <Text className="text-primary-500 font-semibold text-sm" style={{ color: '#7C5CFF' }}>Join</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setRoomName(''); setRoomDesc(''); setError(''); setCreateOpen(true); }}
              className="bg-primary-500 h-9 px-3 rounded-xl flex-row items-center gap-1"
              style={{ backgroundColor: '#7C5CFF' }}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text className="text-white font-semibold text-sm">Create</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
        {/* Room List */}
        {apiRoomsLoading ? (
          <Text className="text-slate-400 text-sm text-center py-8">Loading rooms…</Text>
        ) : apiRooms.length === 0 ? (
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-8 items-center gap-3">
            <Ionicons name="home-outline" size={40} color="#94a3b8" />
            <Text className="text-slate-900 dark:text-white font-semibold">No rooms yet</Text>
            <Text className="text-slate-400 text-sm text-center">Create a room or join one with an invite code</Text>
            <View className="flex-row gap-3 mt-1">
              <TouchableOpacity onPress={() => setJoinOpen(true)}
                className="border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-xl">
                <Text className="text-slate-600 dark:text-slate-300 font-medium text-sm">Join Room</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCreateOpen(true)}
                className="px-4 py-2.5 rounded-xl" style={{ backgroundColor: '#7C5CFF' }}>
                <Text className="text-white font-semibold text-sm">Create Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          apiRooms.map((room) => (
            <TouchableOpacity key={room.id} onPress={() => setActiveRoomId(room.id)}
              activeOpacity={0.8}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-4 ${room.id === activeRoomId ? 'border-2' : 'border border-slate-100 dark:border-slate-700'}`}
              style={room.id === activeRoomId ? { borderColor: '#7C5CFF' } : {}}>
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: '#7C5CFF' }}>
                  <Ionicons name="home-outline" size={20} color="#fff" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-semibold text-slate-900 dark:text-white">{room.name}</Text>
                    {room.id === activeRoomId && (
                      <View className="bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-semibold text-emerald-600">Active</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleCopyInviteCode(room.inviteCode)} className="flex-row items-center gap-1 mt-0.5">
                    <Text className="text-xs text-slate-400 font-mono">{room.inviteCode}</Text>
                    <Ionicons name="copy-outline" size={11} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteRoom(room.id, room.name)}
                  className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/20 items-center justify-center">
                  <Ionicons name="trash-outline" size={15} color="#f43f5e" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Active Room Members */}
        {activeRoom && (
          <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden" style={{ marginTop: 4 }}>
            {/* Members header */}
            <View className="px-4 py-3 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700">
              <View>
                <Text className="text-sm font-semibold text-slate-900 dark:text-white">Members</Text>
                <Text className="text-xs text-slate-400">{activeRoom.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => { setMemberName(''); setMemberEmail(''); setMemberPhone(''); setError(''); setAddMemberOpen(true); }}
                className="h-8 px-3 rounded-xl flex-row items-center gap-1"
                style={{ backgroundColor: '#7C5CFF' }}>
                <Ionicons name="person-add-outline" size={14} color="#fff" />
                <Text className="text-white text-xs font-semibold">Add Member</Text>
              </TouchableOpacity>
            </View>

            {membersLoading ? (
              <Text className="text-slate-400 text-sm text-center py-6">Loading…</Text>
            ) : activeRoomMembers.length === 0 ? (
              <Text className="text-slate-400 text-sm text-center py-6">No members yet</Text>
            ) : (
              activeRoomMembers.map((member, idx) => (
                <View key={member.id} className="flex-row items-center gap-3 px-4 py-3 border-b border-slate-50 dark:border-slate-700/50">
                  <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: '#7C5CFF' }}>
                    <Text className="text-white font-bold text-sm">{member.name[0].toUpperCase()}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-slate-900 dark:text-white">
                      {member.name}{member.email === user?.email ? '  (you)' : ''}
                    </Text>
                    {member.email ? <Text className="text-xs text-slate-400">{member.email}</Text> : null}
                  </View>
                  {member.email !== user?.email && idx !== 0 && (
                    <TouchableOpacity onPress={() => handleDeleteMember(member)} className="p-1.5">
                      <Ionicons name="trash-outline" size={15} color="#f43f5e" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}

            {/* Stats row */}
            <View className="flex-row border-t border-slate-100 dark:border-slate-700">
              <View className="flex-1 items-center py-3">
                <Text className="text-base font-bold text-slate-900 dark:text-white">{activeRoomMembers.length}</Text>
                <Text className="text-xs text-slate-400">Members</Text>
              </View>
              <View className="w-px bg-slate-100 dark:bg-slate-700" />
              <TouchableOpacity className="flex-1 items-center py-3" onPress={() => handleCopyInviteCode(activeRoom.inviteCode)}>
                <Text className="text-base font-bold font-mono" style={{ color: '#7C5CFF' }}>{activeRoom.inviteCode}</Text>
                <Text className="text-xs text-slate-400">Invite Code (tap to copy)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Room Sheet */}
      <Sheet visible={createOpen} onClose={() => setCreateOpen(false)} title="Create New Room">
        <Field label="Room Name" placeholder="e.g. Flat 302, Bandra" value={roomName} onChangeText={setRoomName} />
        <Field label="Description (optional)" placeholder="e.g. 4th floor near metro" value={roomDesc} onChangeText={setRoomDesc} />
        {error ? <Text className="text-rose-500 text-xs mb-2">{error}</Text> : null}
        <TouchableOpacity onPress={handleCreateRoom} disabled={loading}
          className="h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: '#7C5CFF', opacity: loading ? 0.6 : 1 }}>
          <Text className="text-white font-semibold text-base">{loading ? 'Creating…' : 'Create Room'}</Text>
        </TouchableOpacity>
      </Sheet>

      {/* Join Room Sheet */}
      <Sheet visible={joinOpen} onClose={() => setJoinOpen(false)} title="Join a Room">
        <Text className="text-sm text-slate-400 mb-4">Enter the invite code shared by your roommate to join their room.</Text>
        <Field
          label="Invite Code"
          placeholder="e.g. T8RY9R"
          value={inviteCodeInput}
          onChangeText={(t) => setInviteCodeInput(t.toUpperCase())}
          autoCapitalize="characters"
          maxLength={10}
        />
        {error ? <Text className="text-rose-500 text-xs mb-2">{error}</Text> : null}
        <TouchableOpacity onPress={handleJoinRoom} disabled={loading}
          className="h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: '#7C5CFF', opacity: loading ? 0.6 : 1 }}>
          <Text className="text-white font-semibold text-base">{loading ? 'Joining…' : 'Join Room'}</Text>
        </TouchableOpacity>
      </Sheet>

      {/* Add Member Sheet */}
      <Sheet visible={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Add Member">
        <Field label="Full Name" placeholder="Rahul Sharma" value={memberName} onChangeText={setMemberName} autoCapitalize="words" />
        <Field label="Email Address" placeholder="rahul@example.com" value={memberEmail} onChangeText={setMemberEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Mobile (Optional)" placeholder="9876543210" value={memberPhone} onChangeText={setMemberPhone} keyboardType="number-pad" />
        {error ? <Text className="text-rose-500 text-xs mb-2">{error}</Text> : null}
        <TouchableOpacity onPress={handleAddMember} disabled={loading}
          className="h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: '#7C5CFF', opacity: loading ? 0.6 : 1 }}>
          <Text className="text-white font-semibold text-base">{loading ? 'Adding…' : 'Add Member'}</Text>
        </TouchableOpacity>
      </Sheet>
    </View>
  );
}
