import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PixelIcon from './PixelIcon';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  size?: 'small' | 'medium' | 'large';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  size = 'medium',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: '48%' as const, padding: 10 };
      case 'large':
        return { width: '100%' as const, padding: 15 };
      default:
        return { width: '48%' as const, padding: 12 };
    }
  };

  return (
    <View style={[styles.container, getSizeStyles()]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <PixelIcon name={icon} size={20} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
}); 