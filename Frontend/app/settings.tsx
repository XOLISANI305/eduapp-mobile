import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const [dataSaver, setDataSaver] = useState(true);

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications',
          title: 'Push Notifications',
          description: 'Receive updates and reminders',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          icon: 'dark-mode',
          title: 'Dark Mode',
          description: 'Use dark theme across the app',
          type: 'switch',
          value: darkMode,
          onValueChange: setDarkMode,
        },
        {
          icon: 'download',
          title: 'Auto-download',
          description: 'Automatically download study materials',
          type: 'switch',
          value: autoDownload,
          onValueChange: setAutoDownload,
        },
        {
          icon: 'data-saver-off',
          title: 'Data Saver',
          description: 'Reduce data usage for videos',
          type: 'switch',
          value: dataSaver,
          onValueChange: setDataSaver,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          title: 'Edit Profile',
          description: 'Update your personal information',
          type: 'navigation',
          onPress: () => router.push('/profile'),
        },
        {
          icon: 'security',
          title: 'Privacy & Security',
          description: 'Manage your privacy settings',
          type: 'navigation',
          onPress: () => router.push('/screens/privacy'),
        },
        {
          icon: 'language',
          title: 'Language',
          description: 'Change app language',
          type: 'navigation',
          onPress: () => router.push('/screens/language'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help',
          title: 'Help & Support',
          description: 'Get help with the app',
          type: 'navigation',
          onPress: () => router.push('/screens/HelpSupport'),
        },
        {
          icon: 'feedback',
          title: 'Send Feedback',
          description: 'Share your thoughts with us',
          type: 'action',
          onPress: () => Linking.openURL('mailto:support@uthando.edu'),
        },
        {
          icon: 'info',
          title: 'About',
          description: 'App version and information',
          type: 'navigation',
          onPress: () => router.push('/screens/About'),
        },
      ],
    },
  ];

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all downloaded content. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Implement cache clearing logic
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement account deletion logic
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.settingItem}
                onPress={item.type !== 'switch' ? item.onPress : undefined}
                disabled={item.type === 'switch'}
              >
                <View style={styles.settingLeft}>
                  <MaterialIcons
                    name={item.icon as any}
                    size={24}
                    color="#4E54C8"
                    style={styles.settingIcon}
                  />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDescription}>
                      {item.description}
                    </Text>
                  </View>
                </View>
                {item.type === 'switch' ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: '#f1f5f9', true: '#4E54C8' }}
                    thumbColor={item.value ? '#fff' : '#f4f3f4'}
                  />
                ) : (
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="#ccc"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.sectionContent}>
          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleClearCache}
          >
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="delete-outline"
                size={24}
                color="#FF6B6B"
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, styles.dangerText]}>
                  Clear Cache
                </Text>
                <Text style={styles.settingDescription}>
                  Remove all downloaded content
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="warning"
                size={24}
                color="#FF6B6B"
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, styles.dangerText]}>
                  Delete Account
                </Text>
                <Text style={styles.settingDescription}>
                  Permanently delete your account and data
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>uThando Lwemfundo v1.0.0</Text>
        <Text style={styles.appCopyright}>
          © 2024 uThando Lwemfundo. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B0B44',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dangerItem: {
    borderBottomColor: '#ffeaea',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  dangerText: {
    color: '#FF6B6B',
  },
  appInfo: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});