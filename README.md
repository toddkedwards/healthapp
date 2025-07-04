<<<<<<< HEAD
# 🎮 GeekFit - Gamified Fitness App for Geeks/Nerds

A React Native mobile app that transforms fitness into an epic RPG adventure! Earn XP, complete quests, battle bosses, and unlock abilities while staying active and healthy.

## 🌟 Features

### 🎯 Core Gamification System
- **XP & Leveling**: Earn experience points from real-world activities
- **Quest System**: Daily, weekly, and special event quests
- **Achievement Badges**: Unlock achievements for milestones and streaks
- **Ability Tree**: Unlock and upgrade abilities using XP and coins
- **Boss Battles**: Turn-based combat against fitness-themed bosses

### 📱 App Screens
- **Dashboard**: Overview of stats, XP progress, daily quests, and recent achievements
- **Quests**: Browse and filter all available quests with progress tracking
- **Boss Battles**: Epic turn-based combat with unique boss encounters
- **Shop**: Purchase abilities, boosts, and special items
- **Profile**: Detailed stats, achievements, and app settings

### 🏃‍♂️ Fitness Integration
- **Apple HealthKit**: Sync steps, workouts, and health data (iOS)
- **Google Fit**: Sync fitness data (Android)
- **Manual Logging**: Log workouts manually (coming soon)
- **Real-time Tracking**: Automatic XP rewards for activities

### 🎨 Design & UX
- **Dark Theme**: Geek-friendly dark interface with neon accents
- **Responsive Design**: Optimized for all mobile screen sizes
- **Smooth Animations**: Engaging visual feedback and transitions
- **Accessibility**: Support for different accessibility needs

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GeekFit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase** (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update the configuration in `src/config/firebase.ts`

4. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web (development)
   npm run web
   ```

### Environment Setup

Create a `.env` file in the root directory:
```env
# Firebase Configuration (for future backend integration)
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## 🏗️ Project Structure

```
GeekFit/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ProgressBar.tsx
│   │   ├── QuestCard.tsx
│   │   └── StatCard.tsx
│   ├── context/            # React Context providers
│   │   ├── ThemeContext.tsx
│   │   ├── UserContext.tsx
│   │   └── QuestContext.tsx
│   ├── screens/            # Main app screens
│   │   ├── DashboardScreen.tsx
│   │   ├── QuestsScreen.tsx
│   │   ├── BossBattlesScreen.tsx
│   │   ├── ShopScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── data/               # Mock data and constants
│   │   └── mockData.ts
│   ├── services/           # API and external service integrations
│   └── utils/              # Utility functions
├── App.tsx                 # Main app component
├── package.json
└── README.md
```

## 🎮 Game Mechanics

### XP System
- **Steps**: 1 XP per 100 steps
- **Workouts**: 10-50 XP based on duration and intensity
- **Quests**: 25-300 XP upon completion
- **Boss Battles**: 150-250 XP for victory

### Leveling
- XP required for next level: `current_level * 100`
- Level up rewards: +10 max health, +5 max energy
- Full health and energy restoration on level up

### Quest Types
- **Daily**: Reset every 24 hours
- **Weekly**: Reset every Sunday
- **Special**: Event-based or achievement-linked
- **Achievement**: Milestone-based quests

### Boss Battles
- Turn-based combat system
- Energy-based ability usage
- Boss abilities with cooldowns
- Rewards: XP, coins, and special abilities

## 🔧 Technical Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **UI Components**: Custom components with Expo Vector Icons
- **Styling**: StyleSheet with dynamic theming
- **Backend**: Firebase (Authentication, Firestore Database)
- **Health Integration**: Expo Health (planned)

## 🚀 Future Enhancements

### Social Features
- **Guilds/Clans**: Join fitness communities
- **Friend System**: Add friends and compare progress
- **Leaderboards**: Global and friend-based rankings
- **Challenges**: Create and participate in fitness challenges
- **Social Sharing**: Share achievements and milestones

### Advanced Gameplay
- **PvP Battles**: Challenge other players
- **Raid Bosses**: Multi-player boss encounters
- **Seasonal Events**: Limited-time quests and rewards
- **Pet System**: Collect and train fitness companions
- **Crafting**: Create custom abilities and items

### Enhanced Fitness Features
- **Workout Plans**: AI-generated personalized routines
- **Nutrition Tracking**: Food logging with gamification
- **Sleep Tracking**: Sleep quality integration
- **Heart Rate Monitoring**: Real-time health metrics
- **GPS Tracking**: Route mapping for outdoor activities

### Technical Improvements
- **Offline Support**: Core functionality without internet
- **Push Notifications**: Quest reminders and achievements
- **Data Sync**: Cross-device progress synchronization
- **Analytics**: Detailed fitness and gaming analytics
- **Accessibility**: Enhanced screen reader support

## 🎯 Game Loop Expansion Ideas

### Daily Engagement
1. **Morning Check-in**: Daily quest refresh and energy restoration
2. **Activity Tracking**: Real-time XP gains from fitness activities
3. **Quest Completion**: Strategic quest selection and completion
4. **Boss Battles**: Energy management and tactical combat
5. **Evening Review**: Progress tracking and achievement unlocks

### Weekly Progression
1. **Weekly Quests**: Longer-term goals and challenges
2. **Boss Rotation**: New bosses available each week
3. **Shop Updates**: New items and abilities in rotation
4. **Community Events**: Guild challenges and global events

### Long-term Goals
1. **Season Passes**: 3-month progression systems
2. **Achievement Mastery**: Mastery levels for achievements
3. **Collection Completion**: Unlock all abilities and items
4. **Legendary Status**: Special titles and rewards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team**: For the amazing React Native development platform
- **React Navigation**: For seamless navigation between screens
- **Ionicons**: For the beautiful icon set
- **Fitness Community**: For inspiration and feedback

## 📞 Support

For support, email support@geekfit.app or join our Discord community.

---

**Made with ❤️ for geeks, nerds, and fitness enthusiasts everywhere!**

*Level up your fitness game! 🎮💪* 
=======
# healthapp
>>>>>>> 5455d0eb53bd8b69d7ed91c57e1addba693efae1
