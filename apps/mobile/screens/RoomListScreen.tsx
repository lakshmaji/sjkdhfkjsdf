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
import { apiService } from '../services/ApiService';
import { Room } from '../types';

export default function RoomListScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
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

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rooms</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.createButtonText}>+ Create Room</Text>
      </TouchableOpacity>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomCard}
            onPress={() => handleJoinRoom(item.id)}
          >
            <Text style={styles.roomName}>{item.name}</Text>
            <Text style={styles.roomInfo}>
              {Object.keys(item.users || {}).length} users • {Object.keys(item.timers || {}).length} timers
            </Text>
          </TouchableOpacity>
        )}
        refreshing={loading}
        onRefresh={loadRooms}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rooms yet. Create one!</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Room</Text>
            <TextInput
              style={styles.input}
              placeholder="Room name"
              value={newRoomName}
              onChangeText={setNewRoomName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewRoomName('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    margin: 20,
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
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 8,
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
    color: '#333',
    marginBottom: 8,
  },
  roomInfo: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
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
