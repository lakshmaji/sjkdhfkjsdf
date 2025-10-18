import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAuth } from '../contexts/AuthContext';
import { wsService } from '../services/WebSocketService';
import { apiService } from '../services/ApiService';
import { Timer, Room as RoomType } from '../types';
import TimerCard from '../components/TimerCard';
import TimerSettingsModal from '../components/TimerSettingsModal';
import {
  DEFAULT_TIMER_DURATION,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_FONT_SIZE,
} from '../config';

export default function RoomScreen({ route, navigation }: any) {
  const { roomId } = route.params;
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<Timer | null>(null);
  const [newTimerName, setNewTimerName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    loadRoom();
    wsService.connect();
    
    wsService.send({
      type: 'join_room',
      room_id: roomId,
      payload: JSON.stringify({ room_id: roomId, user_id: user.sub }),
    });

    // Listen for WebSocket events
    wsService.on('timer_created', handleTimerUpdate);
    wsService.on('timer_updated', handleTimerUpdate);
    wsService.on('timer_started', handleTimerUpdate);
    wsService.on('timer_paused', handleTimerUpdate);
    wsService.on('timer_tick', handleTimerUpdate);
    wsService.on('timer_forwarded', handleTimerUpdate);
    wsService.on('timer_backwarded', handleTimerUpdate);
    wsService.on('timer_deleted', handleTimerDeleted);

    return () => {
      wsService.off('timer_created', handleTimerUpdate);
      wsService.off('timer_updated', handleTimerUpdate);
      wsService.off('timer_started', handleTimerUpdate);
      wsService.off('timer_paused', handleTimerUpdate);
      wsService.off('timer_tick', handleTimerUpdate);
      wsService.off('timer_forwarded', handleTimerUpdate);
      wsService.off('timer_backwarded', handleTimerUpdate);
      wsService.off('timer_deleted', handleTimerDeleted);
    };
  }, [roomId]);

  const loadRoom = async () => {
    try {
      const roomData = await apiService.getRoom(roomId);
      setRoom(roomData);
    } catch (error) {
      console.error('Error loading room:', error);
      Alert.alert('Error', 'Failed to load room');
    }
  };

  const handleTimerUpdate = (message: any) => {
    if (message.room_id === roomId) {
      loadRoom();
      
      // Check if timer finished for confetti
      if (message.type === 'timer_tick' && message.payload) {
        const payload = JSON.parse(message.payload);
        const timer = room?.timers[message.timer_id];
        if (timer && timer.direction === 'backward' && payload.elapsed_time <= 0) {
          triggerConfetti();
        }
      }
    }
  };

  const handleTimerDeleted = (message: any) => {
    if (message.room_id === roomId) {
      loadRoom();
    }
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleCreateTimer = () => {
    if (!newTimerName.trim()) {
      Alert.alert('Error', 'Please enter a timer name');
      return;
    }

    const timer: Partial<Timer> = {
      name: newTimerName,
      duration: DEFAULT_TIMER_DURATION,
      elapsed_time: 0,
      is_running: false,
      direction: 'forward',
      background_color: DEFAULT_BACKGROUND_COLOR,
      text_color: DEFAULT_TEXT_COLOR,
      font_size: DEFAULT_FONT_SIZE,
    };

    wsService.send({
      type: 'create_timer',
      room_id: roomId,
      payload: JSON.stringify(timer),
    });

    setModalVisible(false);
    setNewTimerName('');
  };

  const handleTimerSettings = (timer: Timer) => {
    setSelectedTimer(timer);
    setSettingsModalVisible(true);
  };

  const handleUpdateTimer = (updatedTimer: Timer) => {
    wsService.send({
      type: 'update_timer',
      room_id: roomId,
      timer_id: updatedTimer.id,
      payload: JSON.stringify(updatedTimer),
    });
    setSettingsModalVisible(false);
  };

  const timers = room?.timers ? Object.values(room.timers) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{room?.name || 'Loading...'}</Text>
        <View style={styles.placeholder} />
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.createButtonText}>+ Add Timer</Text>
      </TouchableOpacity>

      <FlatList
        data={timers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TimerCard
            timer={item}
            roomId={roomId}
            onSettings={() => handleTimerSettings(item)}
            onConfetti={triggerConfetti}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No timers yet. Create one!</Text>
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
            <Text style={styles.modalTitle}>Create Timer</Text>
            <TextInput
              style={styles.input}
              placeholder="Timer name"
              value={newTimerName}
              onChangeText={setNewTimerName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewTimerName('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateTimer}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {selectedTimer && (
        <TimerSettingsModal
          visible={settingsModalVisible}
          timer={selectedTimer}
          onClose={() => setSettingsModalVisible(false)}
          onSave={handleUpdateTimer}
        />
      )}

      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          ref={confettiRef}
          fadeOut={true}
        />
      )}
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  createButton: {
    backgroundColor: '#10b981',
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
