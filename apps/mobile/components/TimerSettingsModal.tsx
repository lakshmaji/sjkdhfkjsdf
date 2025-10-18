import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Timer } from '../types';

interface TimerSettingsModalProps {
  visible: boolean;
  timer: Timer;
  onClose: () => void;
  onSave: (timer: Timer) => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
];

const TEXT_COLORS = ['#ffffff', '#000000'];

const FONT_SIZES = [24, 32, 40, 48, 56, 64];

export default function TimerSettingsModal({
  visible,
  timer,
  onClose,
  onSave,
}: TimerSettingsModalProps) {
  const [name, setName] = useState(timer.name);
  const [duration, setDuration] = useState(timer.duration.toString());
  const [direction, setDirection] = useState(timer.direction);
  const [backgroundColor, setBackgroundColor] = useState(timer.background_color);
  const [textColor, setTextColor] = useState(timer.text_color);
  const [fontSize, setFontSize] = useState(timer.font_size);

  const handleSave = () => {
    const updatedTimer: Timer = {
      ...timer,
      name,
      duration: parseInt(duration) || timer.duration,
      direction,
      background_color: backgroundColor,
      text_color: textColor,
      font_size: fontSize,
    };
    onSave(updatedTimer);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Timer Settings</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Timer name"
            />

            <Text style={styles.label}>Duration (seconds)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="Duration in seconds"
            />

            <Text style={styles.label}>Direction</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  direction === 'forward' && styles.optionButtonActive,
                ]}
                onPress={() => setDirection('forward')}
              >
                <Text
                  style={[
                    styles.optionText,
                    direction === 'forward' && styles.optionTextActive,
                  ]}
                >
                  ▶ Forward
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  direction === 'backward' && styles.optionButtonActive,
                ]}
                onPress={() => setDirection('backward')}
              >
                <Text
                  style={[
                    styles.optionText,
                    direction === 'backward' && styles.optionTextActive,
                  ]}
                >
                  ◀ Backward
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Background Color</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    backgroundColor === color && styles.colorOptionActive,
                  ]}
                  onPress={() => setBackgroundColor(color)}
                />
              ))}
            </View>

            <Text style={styles.label}>Text Color</Text>
            <View style={styles.optionsRow}>
              {TEXT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color, borderWidth: 1, borderColor: '#ddd' },
                    textColor === color && styles.colorOptionActive,
                  ]}
                  onPress={() => setTextColor(color)}
                />
              ))}
            </View>

            <Text style={styles.label}>Font Size</Text>
            <View style={styles.fontSizeGrid}>
              {FONT_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.fontSizeOption,
                    fontSize === size && styles.fontSizeOptionActive,
                  ]}
                  onPress={() => setFontSize(size)}
                >
                  <Text
                    style={[
                      styles.fontSizeText,
                      fontSize === size && styles.fontSizeTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: '#000',
  },
  fontSizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fontSizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  fontSizeOptionActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  fontSizeText: {
    fontSize: 14,
    color: '#666',
  },
  fontSizeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
