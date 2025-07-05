import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { adminService, AdminUser, ContentTemplate } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { Quest, ShopItem, Boss, Achievement } from '../types';

export default function AdminScreen() {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'quests' | 'shop' | 'bosses' | 'achievements'>('overview');
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const adminStatus = await adminService.checkAdminStatus(user.id);
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        setAdminUser(adminService.getAdminUser());
        await loadAnalytics();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      showNotification('Error checking admin status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await adminService.getContentAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadTemplates = async (type: string) => {
    try {
      setLoading(true);
      let templates: ContentTemplate[] = [];
      
      switch (type) {
        case 'quests':
          templates = await adminService.getQuestTemplates();
          break;
        case 'shop':
          templates = await adminService.getShopItemTemplates();
          break;
        case 'bosses':
          templates = await adminService.getBossTemplates();
          break;
        case 'achievements':
          templates = await adminService.getAchievementTemplates();
          break;
      }
      
      setTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
      showNotification('Error loading templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab !== 'overview') {
      loadTemplates(tab);
    }
  };

  const toggleTemplateActive = async (templateId: string, isActive: boolean) => {
    try {
      await adminService.toggleTemplateActive(templateId, isActive);
      showNotification(`Template ${isActive ? 'activated' : 'deactivated'}`, 'success');
      if (activeTab !== 'overview') {
        loadTemplates(activeTab);
      }
    } catch (error) {
      console.error('Error toggling template:', error);
      showNotification('Error updating template', 'error');
    }
  };

  const deleteTemplate = async (templateId: string, templateName: string) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${templateName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteTemplate(templateId);
              showNotification('Template deleted', 'success');
              if (activeTab !== 'overview') {
                loadTemplates(activeTab);
              }
            } catch (error) {
              console.error('Error deleting template:', error);
              showNotification('Error deleting template', 'error');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading admin panel...
        </Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Access Denied
        </Text>
        <Text style={[styles.errorSubtext, { color: theme.colors.textSecondary }]}>
          You don't have admin privileges.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          🛠️ Admin Panel
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Welcome, {adminUser?.email} ({adminUser?.role})
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}>
        {(['overview', 'quests', 'shop', 'bosses', 'achievements'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => handleTabPress(tab)}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === tab ? '#fff' : theme.colors.text }
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View style={styles.overviewContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              📊 Analytics Overview
            </Text>
            
            {analytics && (
              <View style={styles.analyticsGrid}>
                <View style={[styles.analyticsCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.analyticsNumber, { color: theme.colors.primary }]}>
                    {analytics.totalUsers}
                  </Text>
                  <Text style={[styles.analyticsLabel, { color: theme.colors.textSecondary }]}>
                    Total Users
                  </Text>
                </View>
                
                <View style={[styles.analyticsCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.analyticsNumber, { color: theme.colors.primary }]}>
                    {analytics.totalTemplates}
                  </Text>
                  <Text style={[styles.analyticsLabel, { color: theme.colors.textSecondary }]}>
                    Total Templates
                  </Text>
                </View>
                
                <View style={[styles.analyticsCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.analyticsNumber, { color: theme.colors.primary }]}>
                    {analytics.activeTemplates}
                  </Text>
                  <Text style={[styles.analyticsLabel, { color: theme.colors.textSecondary }]}>
                    Active Templates
                  </Text>
                </View>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              📋 Content Breakdown
            </Text>
            
            {analytics && (
              <View style={styles.contentBreakdown}>
                <View style={[styles.breakdownItem, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.breakdownLabel, { color: theme.colors.text }]}>
                    Quests
                  </Text>
                  <Text style={[styles.breakdownNumber, { color: theme.colors.primary }]}>
                    {analytics.contentTypes.quests}
                  </Text>
                </View>
                
                <View style={[styles.breakdownItem, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.breakdownLabel, { color: theme.colors.text }]}>
                    Shop Items
                  </Text>
                  <Text style={[styles.breakdownNumber, { color: theme.colors.primary }]}>
                    {analytics.contentTypes.shopItems}
                  </Text>
                </View>
                
                <View style={[styles.breakdownItem, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.breakdownLabel, { color: theme.colors.text }]}>
                    Bosses
                  </Text>
                  <Text style={[styles.breakdownNumber, { color: theme.colors.primary }]}>
                    {analytics.contentTypes.bosses}
                  </Text>
                </View>
                
                <View style={[styles.breakdownItem, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.breakdownLabel, { color: theme.colors.text }]}>
                    Achievements
                  </Text>
                  <Text style={[styles.breakdownNumber, { color: theme.colors.primary }]}>
                    {analytics.contentTypes.achievements}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab !== 'overview' && (
          <View style={styles.templatesContainer}>
            <View style={styles.templatesHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Templates
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => showNotification('Add template feature coming soon!', 'info')}
              >
                <Text style={styles.addButtonText}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {templates.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No {activeTab} templates found.
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                  Create your first template to get started!
                </Text>
              </View>
            ) : (
              templates.map((template) => (
                <View key={template.id} style={[styles.templateCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.templateHeader}>
                    <Text style={[styles.templateTitle, { color: theme.colors.text }]}>
                      {(template.data as any).title || (template.data as any).name}
                    </Text>
                    <View style={styles.templateActions}>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          { backgroundColor: template.isActive ? theme.colors.success : theme.colors.warning }
                        ]}
                        onPress={() => toggleTemplateActive(template.id, !template.isActive)}
                      >
                        <Text style={styles.toggleButtonText}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: theme.colors.warning }]}
                        onPress={() => deleteTemplate(template.id, (template.data as any).title || (template.data as any).name)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <Text style={[styles.templateDescription, { color: theme.colors.textSecondary }]}>
                    {(template.data as any).description}
                  </Text>
                  
                  <Text style={[styles.templateMeta, { color: theme.colors.textSecondary }]}>
                    Created: {template.createdAt.toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  overviewContainer: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  analyticsCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  analyticsLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  contentBreakdown: {
    gap: 10,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
  },
  breakdownLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  breakdownNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  templatesContainer: {
    gap: 20,
  },
  templatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
  },
  templateCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: 10,
  },
  templateMeta: {
    fontSize: 12,
  },
}); 