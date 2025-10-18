import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/ApiService';
import { Room } from '../types';

export default function RoomListScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const roomList = await apiService.listRooms();
      setRooms(roomList || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      Alert.alert('Error', 'Failed to load rooms');
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    setLoading(true);
    try {
      const room = await apiService.createRoom(
        newRoomName,
        user.sub,
        user.email,
        user.name
      );
      setModalVisible(false);
      setNewRoomName('');
      navigation.navigate('Room', { roomId: room.id });
    } catch (error) {
      console.error('Error creating room:', error);
      Alert.alert('Error', 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      await apiService.joinRoom(roomId, user.sub, user.email, user.name);
      navigation.navigate('Room', { roomId });
    } catch (error) {
      console.error('Error joining room:', error);
      Alert.alert('Error', 'Failed to join room');
    }
  };

  const handleJoinByInvite = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    setLoading(true);
    try {
      const room = await apiService.joinRoomByInvite(
        inviteCode.toUpperCase(),
        user.sub,
        user.email,
        user.name
      );
      setInviteModalVisible(false);
      setInviteCode('');
      navigation.navigate('Room', { roomId: room.id });
    } catch (error) {
      console.error('Error joining room by invite:', error);
      Alert.alert('Error', 'Invalid invite code or failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Rooms</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={styles.profileButton}>
            <Text style={[styles.profileText, { color: colors.primary }]}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createButtonText}>+ Create Room</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.inviteButton, { backgroundColor: colors.success }]}
          onPress={() => setInviteModalVisible(true)}
        >
          <Text style={styles.createButtonText}>Join by Code</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.roomCard, { backgroundColor: colors.card }]}
            onPress={() => handleJoinRoom(item.id)}
          >
            <Text style={[styles.roomName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.roomInfo, { color: colors.textSecondary }]}>
              {Object.keys(item.users || {}).length} users • {Object.keys(item.timers || {}).length} timers
            </Text>
          </TouchableOpacity>
        )}
        refreshing={loading}
        onRefresh={loadRooms}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No rooms yet. Create one!</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create New Room</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Room name"
              placeholderTextColor={colors.textSecondary}
              value={newRoomName}
              onChangeText={setNewRoomName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  setModalVisible(false);
                  setNewRoomName('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateRoom}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Join Room by Invite Code</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Enter invite code (e.g., ABC123)"
              placeholderTextColor={colors.textSecondary}
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoFocus
              maxLength={6}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  setInviteModalVisible(false);
                  setInviteCode('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.success }]}
                onPress={handleJoinByInvite}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? 'Joining...' : 'Join'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  profileButton: {
    padding: 8,
  },
  profileText: {
    fontSize: 16,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  createButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  inviteButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  roomCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    marginTop: 16,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  roomInfo: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
