import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/ApiService';
import { TimerHistoryEntry } from '../types';

export default function UserProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { isDarkMode, soundEnabled, toggleDarkMode, toggleSound, colors } = useTheme();
  const [history, setHistory] = useState<TimerHistoryEntry[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      if (user?.sub) {
        const historyData = await apiService.getTimerHistory(user.sub);
        setHistory(historyData.sort((a, b) => b.completed_at - a.completed_at));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>User Information</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Name:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{user?.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Email:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{user?.email}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={isDarkMode ? colors.card : colors.card}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Sound Notifications</Text>
          <Switch
            value={soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={soundEnabled ? colors.card : colors.card}
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Timer History</Text>
        {history.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No completed timers yet
          </Text>
        ) : (
          history.slice(0, 10).map((entry) => (
            <View key={entry.id} style={[styles.historyItem, { borderColor: colors.border }]}>
              <Text style={[styles.historyName, { color: colors.text }]}>
                {entry.timer_name}
              </Text>
              <Text style={[styles.historyDuration, { color: colors.textSecondary }]}>
                {formatDuration(entry.duration)}
              </Text>
              <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
                {formatDate(entry.completed_at)}
              </Text>
            </View>
          ))
        )}
        {history.length > 10 && (
          <Text style={[styles.moreText, { color: colors.textSecondary }]}>
            And {history.length - 10} more...
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.danger }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  card: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    width: 80,
  },
  value: {
    fontSize: 16,
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  historyItem: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyDuration: {
    fontSize: 14,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  moreText: {
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 10,
    fontStyle: 'italic',
  },
  logoutButton: {
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
