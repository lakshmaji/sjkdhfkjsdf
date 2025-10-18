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
  Share,
  Clipboard,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { wsService } from '../services/WebSocketService';
import { apiService } from '../services/ApiService';
import { Timer, Room as RoomType, TimerTemplate } from '../types';
import TimerCard from '../components/TimerCard';
import TimerSettingsModal from '../components/TimerSettingsModal';
import TimerTemplateModal from '../components/TimerTemplateModal';
import {
  DEFAULT_TIMER_DURATION,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_FONT_SIZE,
} from '../config';

export default function RoomScreen({ route, navigation }: any) {
  const { roomId } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
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

  const handleSelectTemplate = (template: TimerTemplate) => {
    const timer: Partial<Timer> = {
      name: template.name,
      duration: template.duration,
      elapsed_time: template.direction === 'backward' ? template.duration : 0,
      is_running: false,
      direction: template.direction,
      background_color: template.background_color,
      text_color: template.text_color,
      font_size: template.font_size,
    };

    wsService.send({
      type: 'create_timer',
      room_id: roomId,
      payload: JSON.stringify(timer),
    });
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

  const handleShareInviteCode = async () => {
    if (!room?.invite_code) return;

    try {
      await Share.share({
        message: `Join my timer room with invite code: ${room.invite_code}`,
      });
    } catch (error) {
      console.error('Error sharing invite code:', error);
    }
  };

  const handleCopyInviteCode = () => {
    if (!room?.invite_code) return;
    Clipboard.setString(room.invite_code);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const timers = room?.timers ? Object.values(room.timers) : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{room?.name || 'Loading...'}</Text>
          {room?.invite_code && (
            <View style={styles.inviteCodeContainer}>
              <TouchableOpacity onPress={handleCopyInviteCode}>
                <Text style={[styles.inviteCode, { color: colors.textSecondary }]}>
                  Code: {room.invite_code}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShareInviteCode} style={styles.shareButton}>
                <Text style={styles.shareIcon}>📤</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.success }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createButtonText}>+ Custom Timer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.templateButton, { backgroundColor: colors.primary }]}
          onPress={() => setTemplateModalVisible(true)}
        >
          <Text style={styles.createButtonText}>📋 Templates</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No timers yet. Create one!</Text>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Custom Timer</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Timer name"
              placeholderTextColor={colors.textSecondary}
              value={newTimerName}
              onChangeText={setNewTimerName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  setModalVisible(false);
                  setNewTimerName('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.success }]}
                onPress={handleCreateTimer}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TimerTemplateModal
        visible={templateModalVisible}
        onClose={() => setTemplateModalVisible(false)}
        onSelectTemplate={handleSelectTemplate}
      />

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  inviteCode: {
    fontSize: 12,
  },
  shareButton: {
    marginLeft: 6,
  },
  shareIcon: {
    fontSize: 14,
  },
  placeholder: {
    width: 60,
  },
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    gap: 10,
  },
  createButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  templateButton: {
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
