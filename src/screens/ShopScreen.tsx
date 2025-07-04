import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { soundService } from '../services/soundService';
import { mockShopItems, mockAbilities } from '../data/mockData';
import { ShopItem, Ability } from '../types';
import PixelBackground from '../components/PixelBackground';
import { RetroButton } from '../components/RetroButton';

type ShopCategory = 'all' | 'abilities' | 'boosts' | 'cosmetics' | 'special';

export default function ShopScreen() {
  const { theme } = useTheme();
  const { user, addCoins, updateUser } = useUser();
  const { showNotification } = useNotification();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('all');

  const categories: { key: ShopCategory; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'grid' },
    { key: 'abilities', label: 'Abilities', icon: 'flash' },
    { key: 'boosts', label: 'Boosts', icon: 'rocket' },
    { key: 'cosmetics', label: 'Cosmetics', icon: 'color-palette' },
    { key: 'special', label: 'Special', icon: 'star' },
  ];

  const getFilteredItems = (): (ShopItem | Ability)[] => {
    const allItems = [...mockShopItems, ...mockAbilities];
    
    switch (activeCategory) {
      case 'abilities':
        return allItems.filter(item => 'category' in item && item.category === 'combat');
      case 'boosts':
        return allItems.filter(item => 'type' in item && item.type === 'boost');
      case 'cosmetics':
        return allItems.filter(item => 'type' in item && item.type === 'cosmetic');
      case 'special':
        return allItems.filter(item => 'type' in item && item.type === 'special');
      default:
        return allItems;
    }
  };

  const canAfford = (item: ShopItem | Ability): boolean => {
    if ('currency' in item) {
      // ShopItem
      return item.currency === 'coins' ? user.coins >= item.cost : user.xp >= item.cost;
    } else {
      // Ability
      return user.coins >= item.cost;
    }
  };

  const getItemCost = (item: ShopItem | Ability): string => {
    if ('currency' in item) {
      // ShopItem
      return item.currency === 'coins' ? `🪙 ${item.cost}` : `⭐ ${item.cost}`;
    } else {
      // Ability
      return `🪙 ${item.cost}`;
    }
  };

  const purchaseItem = (item: ShopItem | Ability) => {
    if (!canAfford(item)) {
      soundService.playError();
      showNotification('Insufficient funds!', 'error');
      return;
    }

    soundService.playPurchaseSuccess();
    showNotification(`${item.name} purchased successfully!`, 'success');
    
    // Purchase logic here
    // Update user currency, add item to inventory, etc.
  };

  // Play background music when component mounts
  useEffect(() => {
    soundService.playBackgroundMusic('shop');
    
    // Cleanup when component unmounts
    return () => {
      soundService.stopBackgroundMusic();
    };
  }, []);

  const handleCategoryChange = (category: ShopCategory) => {
    soundService.playTabSwitch();
    setActiveCategory(category);
  };

  const renderShopItem = ({ item }: { item: ShopItem | Ability }) => (
    <View
      style={[
        styles.shopItem,
        { backgroundColor: theme.colors.surface },
        !canAfford(item) && styles.itemDisabled,
      ]}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemIcon}>
          {'icon' in item ? item.icon : '⚡'}
        </Text>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.itemType, { color: theme.colors.textSecondary }]}>
            {'type' in item ? item.type.toUpperCase() : 'ABILITY'}
          </Text>
        </View>
        <View style={styles.itemCost}>
                     <Text style={[styles.costText, { color: theme.colors.accent }]}>
             {getItemCost(item)}
           </Text>
          <RetroButton
            title="Purchase"
            onPress={() => purchaseItem(item)}
            variant="success"
            size="small"
            disabled={!canAfford(item)}
          />
        </View>
      </View>
      
      <Text style={[styles.itemDescription, { color: theme.colors.textSecondary }]}>
        {item.description}
      </Text>
      
      {!canAfford(item) && (
        <View style={styles.insufficientFunds}>
          <Text style={[styles.insufficientText, { color: theme.colors.error }]}>
            Insufficient funds
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <PixelBackground pattern="shop" animated={true}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Shop</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Purchase abilities, cosmetics, and special items with your hard-earned coins and XP
          </Text>
        </View>

        {/* Currency Display */}
        <View style={[styles.currencyContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.currencyItem}>
            <Text style={styles.currencyIcon}>🪙</Text>
            <Text style={[styles.currencyAmount, { color: theme.colors.text }]}>
              {user.coins}
            </Text>
            <Text style={[styles.currencyLabel, { color: theme.colors.textSecondary }]}>
              Coins
            </Text>
          </View>
          <View style={styles.currencyDivider} />
          <View style={styles.currencyItem}>
            <Text style={styles.currencyIcon}>⭐</Text>
            <Text style={[styles.currencyAmount, { color: theme.colors.text }]}>
              {user.xp}
            </Text>
            <Text style={[styles.currencyLabel, { color: theme.colors.textSecondary }]}>
              XP
            </Text>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {['all', 'abilities', 'boosts', 'cosmetics', 'special'].map(category => (
            <RetroButton
              key={category}
              title={category.charAt(0).toUpperCase() + category.slice(1)}
              onPress={() => handleCategoryChange(category as ShopCategory)}
              variant={activeCategory === category ? 'primary' : 'secondary'}
              size="small"
              style={styles.categoryButton}
            />
          ))}
        </ScrollView>

        {/* Shop Items */}
        <FlatList
          data={getFilteredItems()}
          renderItem={renderShopItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.shopItemsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="storefront-outline"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No items available
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Check back later for new items!
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
  header: {
    padding: 20,
    margin: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  currencyContainer: {
    flexDirection: 'row',
    margin: 15,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  currencyItem: {
    flex: 1,
    alignItems: 'center',
  },
  currencyIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  currencyAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  currencyLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  currencyDivider: {
    width: 2,
    backgroundColor: '#ffffff',
    marginHorizontal: 10,
  },
  categoryContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryContent: {
    paddingRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  categoryButton: {
    marginRight: 10,
    height: 48,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopItemsList: {
    padding: 15,
  },
  shopItem: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
    marginBottom: 15,
  },
  itemDisabled: {
    opacity: 0.6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  itemType: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  itemCost: {
    alignItems: 'flex-end',
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  insufficientFunds: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#ff4444',
  },
  insufficientText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'monospace',
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
}); 