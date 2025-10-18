import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Timer } from '../types';
import { wsService } from '../services/WebSocketService';

interface TimerCardProps {
  timer: Timer;
  roomId: string;
  onSettings: () => void;
  onConfetti: () => void;
}

export default function TimerCard({ timer, roomId, onSettings, onConfetti }: TimerCardProps) {
  const [localTime, setLocalTime] = useState(timer.elapsed_time);
  const [isRunning, setIsRunning] = useState(timer.is_running);

  useEffect(() => {
    setLocalTime(timer.elapsed_time);
    setIsRunning(timer.is_running);
  }, [timer.elapsed_time, timer.is_running]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setLocalTime((prev) => {
          const newTime = timer.direction === 'forward' ? prev + 1 : prev - 1;
          
          // Send tick to server
          wsService.send({
            type: 'tick_timer',
            room_id: roomId,
            timer_id: timer.id,
            payload: JSON.stringify({ elapsed_time: newTime }),
          });

          // Check if timer finished (for backward timers)
          if (timer.direction === 'backward' && newTime <= 0) {
            handlePause();
            onConfetti();
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timer.direction]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(Math.abs(seconds) / 3600);
    const mins = Math.floor((Math.abs(seconds) % 3600) / 60);
    const secs = Math.abs(seconds) % 60;
    
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isRunning) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handlePlay = () => {
    wsService.send({
      type: 'start_timer',
      room_id: roomId,
      timer_id: timer.id,
    });
    setIsRunning(true);
  };

  const handlePause = () => {
    wsService.send({
      type: 'pause_timer',
      room_id: roomId,
      timer_id: timer.id,
    });
    setIsRunning(false);
  };

  const handleForward = () => {
    const seconds = 10;
    wsService.send({
      type: 'forward_timer',
      room_id: roomId,
      timer_id: timer.id,
      payload: JSON.stringify({ seconds }),
    });
    setLocalTime((prev) => prev + seconds);
  };

  const handleBackward = () => {
    const seconds = 10;
    wsService.send({
      type: 'backward_timer',
      room_id: roomId,
      timer_id: timer.id,
      payload: JSON.stringify({ seconds }),
    });
    setLocalTime((prev) => Math.max(0, prev - seconds));
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Timer',
      'Are you sure you want to delete this timer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            wsService.send({
              type: 'delete_timer',
              room_id: roomId,
              timer_id: timer.id,
            });
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: timer.background_color || '#3b82f6' },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: timer.text_color || '#fff' }]}>
          {timer.name}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={onSettings} style={styles.iconButton}>
            <Text style={[styles.iconText, { color: timer.text_color || '#fff' }]}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Text style={[styles.iconText, { color: timer.text_color || '#fff' }]}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={[
          styles.time,
          {
            color: timer.text_color || '#fff',
            fontSize: timer.font_size || 48,
          },
        ]}
      >
        {formatTime(localTime)}
      </Text>

      <Text style={[styles.direction, { color: timer.text_color || '#fff' }]}>
        Direction: {timer.direction === 'forward' ? '▶ Forward' : '◀ Backward'}
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleBackward}
        >
          <Text style={styles.controlButtonText}>⏪ -10s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.playButton]}
          onPress={handlePlayPause}
        >
          <Text style={styles.controlButtonText}>
            {isRunning ? '⏸ Pause' : '▶ Play'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleForward}
        >
          <Text style={styles.controlButtonText}>⏩ +10s</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 10,
    padding: 4,
  },
  iconText: {
    fontSize: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
  },
  time: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 20,
    fontFamily: 'monospace',
  },
  direction: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.9,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
