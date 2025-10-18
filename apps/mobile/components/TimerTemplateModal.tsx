import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/ApiService';
import { TimerTemplate } from '../types';

interface TimerTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TimerTemplate) => void;
}

export default function TimerTemplateModal({
  visible,
  onClose,
  onSelectTemplate,
}: TimerTemplateModalProps) {
  const { colors } = useTheme();
  const [templates, setTemplates] = useState<TimerTemplate[]>([]);

  useEffect(() => {
    if (visible) {
      loadTemplates();
    }
  }, [visible]);

  const loadTemplates = async () => {
    try {
      const templatesData = await apiService.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSelectTemplate = (template: TimerTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins > 0) {
      return `${mins}m ${secs > 0 ? secs + 's' : ''}`;
    }
    return secs > 0 ? `${secs}s` : 'Stopwatch';
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Select Timer Template
          </Text>

          <FlatList
            data={templates}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.templateItem,
                  { backgroundColor: item.background_color, borderColor: colors.border }
                ]}
                onPress={() => handleSelectTemplate(item)}
              >
                <View style={styles.templateInfo}>
                  <Text style={[styles.templateName, { color: item.text_color }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.templateDuration, { color: item.text_color, opacity: 0.8 }]}>
                    {formatDuration(item.duration)} • {item.direction === 'forward' ? 'Count Up' : 'Countdown'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No templates available
                </Text>
              </View>
            }
          />

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.text }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  templateItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDuration: {
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
  closeButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
