// app/screens/_layout.tsx
import { Stack } from 'expo-router';


export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4E54C8',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Assessment Screens */}
      <Stack.Screen 
        name="CreateAssessmentScreen" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AssessmentDetailsScreen" 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AssessmentSubmissionsScreen" 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AssessmentBuilder" 
        options={{ 
          title: 'Build Assessment',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="StudentSubmissionDetail" 
        options={{ 
          title: 'Submission Details',
          headerShown: false
        }} 
        
      />
      
      {/* Document Screens */}
      <Stack.Screen 
        name="documents" 
        options={{ title: 'Documents' }} 
      />
      <Stack.Screen 
        name="pdf-viewer" 
        options={{ 
          title: 'Document Viewer',
          headerStyle: {
            backgroundColor: '#4E54C8',
          },
          headerTintColor: '#fff',
        }} 
      />

      {/* Parent Tracking Screens */}
      <Stack.Screen 
        name="LinkChildScreen" 
        options={{ 
          title: 'Link Child Account',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="ChildPerformanceScreen" 
        options={{ 
          title: 'Performance',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="ChildAttendanceScreen" 
        options={{ 
          title: 'Attendance',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="ChildActivitiesScreen" 
        options={{ 
          title: 'Activities',
          headerShown: false
        }} 
      />

      {/* Q&A Screens */}
      <Stack.Screen 
        name="QnADiscussion" 
        options={{ 
          title: 'Q&A Discussion',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="QuestionDetail" 
        options={{ 
          title: 'Question Details',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="AskQuestion" 
        options={{ 
          title: 'Ask a Question',
          headerShown: false
        }} 
      />
    </Stack>
  );
}
