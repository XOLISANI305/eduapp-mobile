import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

// Sample documents - replace with your actual data
const documents = [
  { 
    id: 1, 
    name: 'User Manual', 
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    date: '2024-01-15',
    size: '2.3 MB',
    type: 'pdf'
  },
  { 
    id: 2, 
    name: 'Tutorial Guide', 
    url: 'https://example.com/tutorial.pdf',
    date: '2024-01-10',
    size: '1.8 MB',
    type: 'pdf'
  },
  { 
    id: 3, 
    name: 'Reference Document', 
    url: 'https://example.com/reference.pdf',
    date: '2024-01-05', 
    size: '3.1 MB',
    type: 'pdf'
  },
  { 
    id: 4, 
    name: 'Quick Start Guide', 
    url: 'https://example.com/quickstart.pdf',
    date: '2024-01-20', 
    size: '1.2 MB',
    type: 'pdf'
  },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const openPDF = (pdfUrl: string, documentName: string) => {
    router.push({
      pathname: '/screens/pdf-viewer',
      params: { url: pdfUrl, title: documentName }
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'picture-as-pdf';
      case 'doc':
        return 'description';
      case 'xls':
        return 'table-chart';
      default:
        return 'insert-drive-file';
    }
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return "#EF4444";
      case 'doc':
        return "#4E54C8";
      case 'xls':
        return "#10B981";
      default:
        return "#64748B";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Documents Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <MaterialIcons name="folder" size={32} color="#4E54C8" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Documents Library</Text>
            <Text style={styles.infoText}>
              Access all your learning materials and resources in one place
            </Text>
          </View>
        </View>

        {/* Documents List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Documents</Text>
            <Text style={styles.documentsCount}>
              {documents.length} document{documents.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.documentsList}>
            {documents.map((doc) => (
              <TouchableOpacity 
                key={doc.id}
                style={styles.documentCard}
                onPress={() => openPDF(doc.url, doc.name)}
              >
                <View style={styles.documentHeader}>
                  <View style={[
                    styles.documentIcon,
                    { backgroundColor: getDocumentColor(doc.type) + '20' }
                  ]}>
                    <MaterialIcons 
                      name={getDocumentIcon(doc.type)} 
                      size={24} 
                      color={getDocumentColor(doc.type)} 
                    />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName}>{doc.name}</Text>
                    <Text style={styles.documentMeta}>
                      {new Date(doc.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })} • {doc.size}
                    </Text>
                  </View>
                  <View style={styles.documentActions}>
                    <MaterialIcons name="chevron-right" size={20} color="#64748B" />
                  </View>
                </View>
                
                <View style={styles.documentFooter}>
                  <View style={styles.documentType}>
                    <Text style={styles.documentTypeText}>
                      {doc.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.viewText}>Tap to view</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpCard}>
          <View style={styles.helpIcon}>
            <MaterialIcons name="help" size={20} color="#4E54C8" />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              Tap any document to open it in the PDF viewer. You can zoom, scroll, and download documents for offline access.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#4E54C8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  documentsCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: "#64748B",
  },
  documentActions: {
    padding: 4,
  },
  documentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  documentType: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  documentTypeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },
  viewText: {
    fontSize: 12,
    color: "#4E54C8",
    fontWeight: "600",
  },
  helpCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
});