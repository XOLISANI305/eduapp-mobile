import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const router = useRouter();
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [shareData, setShareData] = useState(false);
  const [activityStatus, setActivityStatus] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const privacySections = [
    {
      title: 'Privacy',
      items: [
        {
          icon: 'visibility',
          title: 'Profile Visibility',
          description: 'Allow others to see your profile',
          type: 'switch',
          value: profileVisibility,
          onValueChange: setProfileVisibility,
        },
        {
          icon: 'trending-up',
          title: 'Show Progress',
          description: 'Display your study progress to teachers',
          type: 'switch',
          value: showProgress,
          onValueChange: setShowProgress,
        },
        {
          icon: 'online-prediction',
          title: 'Activity Status',
          description: 'Show when you are online',
          type: 'switch',
          value: activityStatus,
          onValueChange: setActivityStatus,
        },
        {
          icon: 'share',
          title: 'Share Usage Data',
          description: 'Help improve the app with anonymous data',
          type: 'switch',
          value: shareData,
          onValueChange: setShareData,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: 'fingerprint',
          title: 'Biometric Authentication',
          description: 'Use fingerprint or face ID to unlock',
          type: 'switch',
          value: biometricAuth,
          onValueChange: (value: boolean) => {
            if (value) {
              Alert.alert(
                'Enable Biometric Auth',
                'This will require your fingerprint or face to access the app',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Enable', onPress: () => setBiometricAuth(true) },
                ]
              );
            } else {
              setBiometricAuth(false);
            }
          },
        },
        {
          icon: 'security',
          title: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          type: 'switch',
          value: twoFactorAuth,
          onValueChange: setTwoFactorAuth,
        },
        {
          icon: 'lock',
          title: 'Change Password',
          description: 'Update your account password',
          type: 'navigation',
          onPress: () => {
            Alert.alert(
              'Change Password',
              'You will be redirected to change your password',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Continue', onPress: () => {
                  // Navigate to password change screen
                  router.push('./screens/change-password');
                }},
              ]
            );
          },
        },
        {
          icon: 'phonelink-lock',
          title: 'Trusted Devices',
          description: 'Manage devices with access to your account',
          type: 'navigation',
          onPress: () => router.push('./screens/trusted-devices'),
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          icon: 'download',
          title: 'Download My Data',
          description: 'Get a copy of your personal data',
          type: 'navigation',
          onPress: () => {
            Alert.alert(
              'Download Data',
              'We will prepare your data and send it to your email within 48 hours.',
              [{ text: 'OK' }]
            );
          },
        },
        {
          icon: 'block',
          title: 'Blocked Users',
          description: 'Manage your blocked users list',
          type: 'navigation',
          onPress: () => router.push('./screens/blocked-users'),
        },
        {
          icon: 'history',
          title: 'Login History',
          description: 'View your recent login activity',
          type: 'navigation',
          onPress: () => router.push('./screens/login-history'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0B0B44" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialIcons name="info-outline" size={20} color="#4E54C8" />
          <Text style={styles.infoText}>
            Your privacy is important. Control who sees your information and how
            your data is used.
          </Text>
        </View>

        {privacySections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 &&
                      styles.lastSettingItem,
                  ]}
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

        {/* Privacy Policy Link */}
        <TouchableOpacity
          style={styles.policyLink}
          onPress={() => router.push('./screens/privacy-policy')}
        >
          <MaterialIcons name="description" size={20} color="#4E54C8" />
          <Text style={styles.policyText}>Read our Privacy Policy</Text>
          <MaterialIcons name="chevron-right" size={20} color="#4E54C8" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B0B44',
  },
  scrollView: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4E54C8',
    lineHeight: 20,
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
  lastSettingItem: {
    borderBottomWidth: 0,
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
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  policyText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#4E54C8',
  },
});