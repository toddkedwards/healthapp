import { firebaseService } from './firebaseService';
import { Quest, ShopItem, Boss, Achievement } from '../types';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  createdAt: Date;
}

export interface ContentTemplate {
  id: string;
  type: 'quest' | 'shop_item' | 'boss' | 'achievement';
  data: Quest | ShopItem | Boss | Achievement;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

class AdminService {
  private isAdmin: boolean = false;
  private adminUser: AdminUser | null = null;

  // Check if current user is admin
  async checkAdminStatus(userId: string): Promise<boolean> {
    try {
      const adminRef = await firebaseService.getDocument('admins', userId);
      if (adminRef) {
        this.isAdmin = true;
        this.adminUser = adminRef as AdminUser;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Get admin user info
  getAdminUser(): AdminUser | null {
    return this.adminUser;
  }

  // Check if user is admin
  isUserAdmin(): boolean {
    return this.isAdmin;
  }

  // Content Management Methods

  // Quests
  async createQuestTemplate(quest: Omit<Quest, 'id'>): Promise<string> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const template: ContentTemplate = {
      id: `quest_${Date.now()}`,
      type: 'quest',
      data: quest as Quest,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.adminUser!.id,
    };

    await firebaseService.setDocument('content_templates', template.id, template);
    return template.id;
  }

  async updateQuestTemplate(templateId: string, quest: Partial<Quest>): Promise<void> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const updates = {
      data: quest,
      updatedAt: new Date(),
    };

    await firebaseService.updateDocument('content_templates', templateId, updates);
  }

  async getQuestTemplates(): Promise<ContentTemplate[]> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const templates = await firebaseService.getCollection('content_templates', [
      { field: 'type', operator: '==', value: 'quest' }
    ]);
    
    return templates as ContentTemplate[];
  }

  // Shop Items
  async createShopItemTemplate(item: Omit<ShopItem, 'id'>): Promise<string> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const template: ContentTemplate = {
      id: `shop_${Date.now()}`,
      type: 'shop_item',
      data: item as ShopItem,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.adminUser!.id,
    };

    await firebaseService.setDocument('content_templates', template.id, template);
    return template.id;
  }

  async updateShopItemTemplate(templateId: string, item: Partial<ShopItem>): Promise<void> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const updates = {
      data: item,
      updatedAt: new Date(),
    };

    await firebaseService.updateDocument('content_templates', templateId, updates);
  }

  async getShopItemTemplates(): Promise<ContentTemplate[]> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const templates = await firebaseService.getCollection('content_templates', [
      { field: 'type', operator: '==', value: 'shop_item' }
    ]);
    
    return templates as ContentTemplate[];
  }

  // Bosses
  async createBossTemplate(boss: Omit<Boss, 'id'>): Promise<string> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const template: ContentTemplate = {
      id: `boss_${Date.now()}`,
      type: 'boss',
      data: boss as Boss,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.adminUser!.id,
    };

    await firebaseService.setDocument('content_templates', template.id, template);
    return template.id;
  }

  async updateBossTemplate(templateId: string, boss: Partial<Boss>): Promise<void> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const updates = {
      data: boss,
      updatedAt: new Date(),
    };

    await firebaseService.updateDocument('content_templates', templateId, updates);
  }

  async getBossTemplates(): Promise<ContentTemplate[]> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const templates = await firebaseService.getCollection('content_templates', [
      { field: 'type', operator: '==', value: 'boss' }
    ]);
    
    return templates as ContentTemplate[];
  }

  // Achievements
  async createAchievementTemplate(achievement: Omit<Achievement, 'id'>): Promise<string> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const template: ContentTemplate = {
      id: `achievement_${Date.now()}`,
      type: 'achievement',
      data: achievement as Achievement,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.adminUser!.id,
    };

    await firebaseService.setDocument('content_templates', template.id, template);
    return template.id;
  }

  async updateAchievementTemplate(templateId: string, achievement: Partial<Achievement>): Promise<void> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const updates = {
      data: achievement,
      updatedAt: new Date(),
    };

    await firebaseService.updateDocument('content_templates', templateId, updates);
  }

  async getAchievementTemplates(): Promise<ContentTemplate[]> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const templates = await firebaseService.getCollection('content_templates', [
      { field: 'type', operator: '==', value: 'achievement' }
    ]);
    
    return templates as ContentTemplate[];
  }

  // Generic template management
  async toggleTemplateActive(templateId: string, isActive: boolean): Promise<void> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    await firebaseService.updateDocument('content_templates', templateId, {
      isActive,
      updatedAt: new Date(),
    });
  }

  async deleteTemplate(templateId: string): Promise<void> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    await firebaseService.deleteDocument('content_templates', templateId);
  }

  // Admin management (super admin only)
  async addAdmin(userId: string, email: string, role: 'admin' | 'super_admin' = 'admin'): Promise<void> {
    if (!this.isAdmin || this.adminUser?.role !== 'super_admin') {
      throw new Error('Super admin access required');
    }
    
    const adminUser: AdminUser = {
      id: userId,
      email,
      role,
      permissions: role === 'super_admin' ? ['*'] : ['content_manage', 'content_view'],
      createdAt: new Date(),
    };

    await firebaseService.setDocument('admins', userId, adminUser);
  }

  async removeAdmin(userId: string): Promise<void> {
    if (!this.isAdmin || this.adminUser?.role !== 'super_admin') {
      throw new Error('Super admin access required');
    }
    
    await firebaseService.deleteDocument('admins', userId);
  }

  async getAdmins(): Promise<AdminUser[]> {
    if (!this.isAdmin || this.adminUser?.role !== 'super_admin') {
      throw new Error('Super admin access required');
    }
    
    const admins = await firebaseService.getCollection('admins');
    return admins as AdminUser[];
  }

  // Analytics and insights
  async getContentAnalytics(): Promise<any> {
    if (!this.isAdmin) throw new Error('Admin access required');
    
    const templates = await firebaseService.getCollection('content_templates');
    const users = await firebaseService.getCollection('users');
    
    return {
      totalTemplates: templates.length,
      activeTemplates: templates.filter((t: any) => t.isActive).length,
      totalUsers: users.length,
      contentTypes: {
        quests: templates.filter((t: any) => t.type === 'quest').length,
        shopItems: templates.filter((t: any) => t.type === 'shop_item').length,
        bosses: templates.filter((t: any) => t.type === 'boss').length,
        achievements: templates.filter((t: any) => t.type === 'achievement').length,
      }
    };
  }
}

export const adminService = new AdminService(); 