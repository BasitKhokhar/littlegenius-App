import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { gamesList } from '../../Data/gamesData';
import { Header } from '../../Components/UI';

const GamesScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header
        title="Brain Games"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>🧩 Pick a Game to Play</Text>

        {gamesList.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[styles.gameCard, { backgroundColor: game.gradStart }]}
            onPress={() => navigation.navigate('GamePlay', { gameId: game.id })}
            activeOpacity={0.88}
          >
            {/* Decorative overlay */}
            <View style={[styles.gameDecor, { backgroundColor: game.gradEnd + '55' }]} />

            {/* Tag */}
            <View style={styles.gameTag}>
              <Text style={styles.gameTagText}>{game.tag}</Text>
            </View>

            {/* Icon */}
            <View style={styles.gameIconBubble}>
              <Text style={styles.gameIcon}>{game.icon}</Text>
            </View>

            {/* Info */}
            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameDesc}>{game.desc}</Text>
            </View>

            {/* Arrow */}
            <View style={styles.gameArrow}>
              <Text style={styles.gameArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonEmoji}>🎮</Text>
          <Text style={styles.comingSoonText}>{gamesList.length} fun games to play!</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0FF' },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 50,
  },
  heading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E1B4B',
    marginBottom: 16,
  },
  gameCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.18)',
  },
  gameDecor: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  gameTag: {
    position: 'absolute',
    top: 14,
    right: 52,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  gameTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  gameIconBubble: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gameIcon: { fontSize: 30 },
  gameInfo: { flex: 1 },
  gameName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  gameDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  gameArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameArrowText: { fontSize: 16, color: '#FFF', fontWeight: '900' },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  comingSoonEmoji: { fontSize: 32 },
  comingSoonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },
});

export default GamesScreen;
