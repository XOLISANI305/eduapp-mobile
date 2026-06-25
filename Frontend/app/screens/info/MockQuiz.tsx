//MockQuiz.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: 'What is 5 + 7?',
    options: ['10', '11', '12', '13'],
    answer: '12'
  },
  {
    id: 2,
    question: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    answer: 'Mars'
  },
  {
    id: 3,
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Shakespeare', 'Tolstoy', 'Hemingway', 'Dickens'],
    answer: 'Shakespeare'
  },
  {
    id: 4,
    question: 'What is H2O commonly known as?',
    options: ['Oxygen', 'Water', 'Hydrogen', 'Salt'],
    answer: 'Water'
  },
  {
    id: 5,
    question: 'What is the capital of South Africa?',
    options: ['Cape Town', 'Pretoria', 'Johannesburg', 'Durban'],
    answer: 'Pretoria'
  },
  {
    id: 6,
    question: '2 × 6 = ?',
    options: ['8', '12', '14', '16'],
    answer: '12'
  },
  {
    id: 7,
    question: 'Which gas do plants use for photosynthesis?',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
    answer: 'Carbon Dioxide'
  },
  {
    id: 8,
    question: 'What is 15 ÷ 3?',
    options: ['3', '5', '6', '9'],
    answer: '5'
  },
  {
    id: 9,
    question: 'Who painted the Mona Lisa?',
    options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Van Gogh'],
    answer: 'Leonardo da Vinci'
  },
  {
    id: 10,
    question: 'Which is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answer: 'Pacific'
  }
];

export default function MockQuiz() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleNext = () => {
    if (!selectedOption) {
      Alert.alert('Please select an answer');
      return;
    }

    if (selectedOption === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    setSelectedOption(null);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quiz Finished!</Text>
        <Text style={styles.score}>Your Score: {score} / {questions.length}</Text>
        <TouchableOpacity style={styles.button} onPress={handleRestart}>
          <Text style={styles.buttonText}>Restart Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.dashboardButton]} onPress={() => router.push('/Dashboards/StudentDashboard')}>
          <Text style={styles.buttonText}>Go to Student Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questions[currentQuestion];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Quick Assessment</Text>
      <Text style={styles.description}>
        This is a mixed 10-question quiz to test your knowledge across different subjects. 
        Complete it to see your score and check your progress!
      </Text>

      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>Question {currentQuestion + 1} of {questions.length}</Text>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {question.options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.optionButton,
            selectedOption === option && styles.selectedOption
          ]}
          onPress={() => setSelectedOption(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>{currentQuestion + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4E54C8',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 14,
    color: '#4E54C8',
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4E54C8',
  },
  optionText: {
    fontSize: 14,
    color: '#4E54C8',
  },
  nextButton: {
    backgroundColor: '#4E54C8',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4E54C8',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  dashboardButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4E54C8',
    textAlign: 'center',
    marginVertical: 10,
  },
});
