import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useQuest } from '../context/QuestContext';
import { useNotification } from '../context/NotificationContext';
import { QuestCard } from '../components/QuestCard';
import { RetroButton } from '../components/RetroButton';
import PixelBackground from '../components/PixelBackground';
import { Quest } from '../types';
import { mockQuests } from '../data/mockData';
import { soundService } from '../services/soundService';

type QuestFilter = 'all' | 'daily' | 'weekly' | 'special' | 'completed';

export default function QuestsScreen() {
  const { theme } = useTheme();
  const { quests, activeQuests, completedQuests } = useQuest();
  const { showNotification } = useNotification();
  const [activeFilter, setActiveFilter] = useState<QuestFilter>('all');

  const filters: { key: QuestFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'daily', label: 'Daily', icon: 'calendar' },
    { key: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
    { key: 'special', label: 'Special', icon: 'star' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-circle' },
  ];

  const getFilteredQuests = (): Quest[] => {
    console.log('QuestsScreen: getFilteredQuests called with activeFilter:', activeFilter);
    console.log('QuestsScreen: All quests:', quests.map(q => ({ id: q.id, title: q.title, isCompleted: q.isCompleted, type: q.type })));
    
    let filteredQuests: Quest[];
    switch (activeFilter) {
      case 'daily':
        filteredQuests = quests.filter(quest => quest.type === 'daily' && !quest.isCompleted);
        break;
      case 'weekly':
        filteredQuests = quests.filter(quest => quest.type === 'weekly' && !quest.isCompleted);
        break;
      case 'special':
        filteredQuests = quests.filter(quest => quest.type === 'special' && !quest.isCompleted);
        break;
      case 'completed':
        filteredQuests = completedQuests;
        break;
      default:
        filteredQuests = quests.filter(quest => !quest.isCompleted);
        break;
    }
    
    console.log('QuestsScreen: Filtered quests:', filteredQuests.map(q => ({ id: q.id, title: q.title, isCompleted: q.isCompleted })));
    return filteredQuests;
  };

  const handleFilterChange = (filter: QuestFilter) => {
    soundService.playTabSwitch();
    setActiveFilter(filter);
  };

  const renderQuest = ({ item }: { item: Quest }) => (
    <QuestCard
      quest={item}
      style={styles.questCard}
      onPress={() => {
        // TODO: Navigate to quest details
        console.log('Quest pressed:', item.title);
      }}
    />
  );

  return (
    <PixelBackground pattern="stars" animated={true}>
      <View style={styles.container}>
        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {['all', 'daily', 'weekly', 'special', 'completed'].map(filter => (
            <RetroButton
              key={filter}
              title={filter.charAt(0).toUpperCase() + filter.slice(1)}
              onPress={() => handleFilterChange(filter as QuestFilter)}
              variant={activeFilter === filter ? 'primary' : 'secondary'}
              size="small"
              style={styles.filterButton}
            />
          ))}
        </ScrollView>

        {/* Test Notification Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => showNotification('Test notification! This should work!', 'success')}
        >
          <Text style={styles.testButtonText}>Test Notification</Text>
        </TouchableOpacity>

        {/* Quest Stats */}
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {activeQuests.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Active
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {completedQuests.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Completed
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {Math.round((completedQuests.length / quests.length) * 100)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Success Rate
            </Text>
          </View>
        </View>

        {/* Quests List */}
        <FlatList
          data={getFilteredQuests()}
          renderItem={renderQuest}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.questsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="list-outline"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No quests found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                {activeFilter === 'completed' ? 'Complete some quests to see them here!' : 'New quests will appear here!'}
              </Text>
            </View>
          }
        />
      </View>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterContent: {
    paddingRight: 15,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  activeFilterTab: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderColor: '#4ecdc4',
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 15,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  statDivider: {
    width: 2,
    backgroundColor: '#ffffff',
    marginHorizontal: 10,
  },
  questsList: {
    padding: 15,
  },
  questCard: {
    marginBottom: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderWidth: 2,
    borderColor: '#4ecdc4',
    padding: 10,
    margin: 15,
    alignItems: 'center',
    borderRadius: 0,
  },
  testButtonText: {
    color: '#4ecdc4',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  filterButton: {
    marginRight: 10,
  },
}); 