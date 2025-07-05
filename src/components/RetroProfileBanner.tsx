import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '../context/UserContext';
import UnifiedIcon from './UnifiedIcon';

const RetroProfileBanner: React.FC = () => {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          {user.avatar ? (
            <UnifiedIcon name={user.avatar} size={48} />
          ) : (
            <Text style={styles.avatarText}>{user.username.charAt(0)}</Text>
          )}
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.username}>{user.username}</Text>
        <View style={styles.levelContainer}>
          <Text style={styles.level}>Level {user.level}</Text>
          <Text style={styles.characterClass}>
            {user.characterClass === 'warrior' ? '⚔️' : 
             user.characterClass === 'mage' ? '🔮' : 
             user.characterClass === 'rogue' ? '🗡️' : 
             user.characterClass === 'archer' ? '🏹' : '⛪'} {user.characterClass.charAt(0).toUpperCase() + user.characterClass.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.coinsContainer}>
        <UnifiedIcon name="coin" size={20} color="#fff" />
        <Text style={styles.coins}>{user.coins}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderWidth: 4,
    borderColor: '#fff',
    borderRadius: 0,
    padding: 18,
    marginBottom: 10,
    marginHorizontal: 0,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  avatarContainer: {
    marginRight: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  level: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'monospace',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  characterClass: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'monospace',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 18,
  },
  coins: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
});

export default RetroProfileBanner; 