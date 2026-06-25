import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Languages relevant for South African matric students
  const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
    { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦' },
    { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
    { code: 'st', name: 'Sotho', nativeName: 'Sesotho', flag: '🇿🇦' },
    { code: 'tn', name: 'Tswana', nativeName: 'Setswana', flag: '🇿🇦' },
    { code: 'ss', name: 'Swati', nativeName: 'siSwati', flag: '🇿🇦' },
    { code: 've', name: 'Venda', nativeName: 'Tshivenḓa', flag: '🇿🇦' },
    { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga', flag: '🇿🇦' },
    { code: 'nr', name: 'Ndebele', nativeName: 'isiNdebele', flag: '🇿🇦' },
    { code: 'nso', name: 'Northern Sotho', nativeName: 'Sepedi', flag: '🇿🇦' },
  ];

  const handleLanguageSelect = (languageCode: string) => {
    Alert.alert(
      'Change Language',
      'Are you sure you want to change the app language? The app will restart.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: () => {
            setSelectedLanguage(languageCode);
            // Here you would implement the actual language change logic
            // For example, using i18n or AsyncStorage to persist the selection
            Alert.alert(
              'Success',
              'Language changed successfully. Some features may require app restart.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialIcons name="translate" size={20} color="#4E54C8" />
          <Text style={styles.infoText}>
            Select your preferred language for the app interface and study
            materials.
          </Text>
        </View>

        {/* Language List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Languages</Text>
          <View style={styles.languageList}>
            {languages.map((language, index) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  index === languages.length - 1 && styles.lastLanguageItem,
                  selectedLanguage === language.code &&
                    styles.selectedLanguageItem,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <View style={styles.languageLeft}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageTextContainer}>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.languageNativeName}>
                      {language.nativeName}
                    </Text>
                  </View>
                </View>
                {selectedLanguage === language.code ? (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#4E54C8"
                  />
                ) : (
                  <View style={styles.radioButton}>
                    <View style={styles.radioButtonInner} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.noteSection}>
          <MaterialIcons name="info-outline" size={20} color="#64748B" />
          <View style={styles.noteTextContainer}>
            <Text style={styles.noteTitle}>About Language Support</Text>
            <Text style={styles.noteText}>
              • All 11 official South African languages are supported{'\n'}
              • Study materials may vary by language availability{'\n'}
              • Some content may remain in English for technical subjects{'\n'}
              • Translation quality is continuously being improved
            </Text>
          </View>
        </View>

        {/* Download Language Pack */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => {
            Alert.alert(
              'Download Language Pack',
              'Download offline language resources for better performance?',
              [
                { text: 'Not Now', style: 'cancel' },
                {
                  text: 'Download',
                  onPress: () => {
                    Alert.alert(
                      'Download Started',
                      'Language pack is being downloaded in the background.'
                    );
                  },
                },
              ]
            );
          }}
        >
          <MaterialIcons name="download" size={20} color="#4E54C8" />
          <Text style={styles.downloadButtonText}>
            Download Language Pack
          </Text>
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
  languageList: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastLanguageItem: {
    borderBottomWidth: 0,
  },
  selectedLanguageItem: {
    backgroundColor: '#F0F4FF',
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  languageNativeName: {
    fontSize: 14,
    color: '#64748B',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  noteSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTextContainer: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  downloadButton: {
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
  downloadButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#4E54C8',
  },
});