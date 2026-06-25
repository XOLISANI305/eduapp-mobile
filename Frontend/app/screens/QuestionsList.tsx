import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getQuestionsBySubject } from '../services/api';
import QuestionCard from '../(tabs)/components/QuestionCard';
import SearchBar from '../(tabs)/components/SearchBar';

interface Question {
  id: number;
  title: string;
  author: string;
  body?: string;
  subject_id?: number;
  created_at?: string;
}

export default function QuestionsList({ route }: any) {
  const { subjectId } = route.params;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(''); // must be string
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredQuestions(questions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = questions.filter(q =>
        q.title.toLowerCase().includes(query) ||
        (q.body && q.body.toLowerCase().includes(query)) ||
        q.author.toLowerCase().includes(query)
      );
      setFilteredQuestions(filtered);
    }
  }, [searchQuery, questions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestionsBySubject(subjectId) as Question[];
      const validQuestions = (data || []).filter(q => q && q.id && q.title && q.author);
      setQuestions(validQuestions);
      setFilteredQuestions(validQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
      setFilteredQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button
        title="Add Question"
        color="#CC5500"
        onPress={() => navigation.navigate('AddQuestion', { subjectId })}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleClearSearch}
        placeholder="Search questions..."
      />

      {searchQuery.trim() !== '' && (
        <Text style={styles.resultsText}>
          {filteredQuestions.length} {filteredQuestions.length === 1 ? 'result' : 'results'} found
        </Text>
      )}

      <FlatList
        data={filteredQuestions}
        renderItem={({ item }) => (
          <QuestionCard
            question={item}
            onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() !== '' 
                ? 'No questions match your search' 
                : 'No questions yet. Be the first to ask!'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultsText: { fontSize: 13, color: '#666', marginVertical: 5 },
  listContent: { paddingTop: 10 },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#666' },
});