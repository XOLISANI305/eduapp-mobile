import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://eduapp-backend-1.onrender.com/api";

export const api = axios.create({
  baseURL: API_URL,
});

// pulls token from storage on every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = async (token?: string) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    await AsyncStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("token");
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      console.log("Logging out user");
      return Promise.reject(new Error("Session expired. Please login again."));
    }
    return Promise.reject(error);
  }
);


export const getErrorMessage = (err: unknown): string => {
  if (typeof err === "object" && err !== null && "response" in err) {
    const anyErr = err as any;
    if (anyErr.response?.data?.message) return anyErr.response.data.message;
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
};

// ------------------------ TYPES ------------------------
//export type User = {
 // id: string;
//  full_name: string;
//  email: string;
  //role: string;
  //avatar?: string;
//};
export interface Topic {
  resources: never[];
  id: number;
  name: string;
  description?: string; 
  group_id?: number | null;
  subject_id?: number;
 
}

export interface TopicWithResources extends Omit<Topic, 'resources'> {
  resources: Resource[];
}
export type LoginResponse = { token: string; user: User };
export type RegisterResponse = { token: string; user: User };


export type Subject = {
  id: string;
  name: string;
  description?: string;
  grade: string;
  code?: string;
  instructor?: string;
  enrolledStudents?: number;
  schedule?: string;
  credits?: number;
  department?: string;
};


export type Group = { id: string; name: string; subject_id: string };


export type Assessment = {
  id: number;
  title: string;
  subject_id: number;
  group_id: number;
  description?: string;
  total_marks?: number;
  duration_minutes?: number;
  type?: string;
  status: string;
  approved: boolean;
  created_at: string;
  created_by?: string;
  subject_name?: string;
  submission_count?: number;
  questions?: Question[];
};

export type Submission = {
  id: number;
  student_id: string;
  assessment_id: number;
  answers: any[];
  score: number;
  submitted_at: string;
  student_name: string;
};
export type Question = { 
  id: string; 
  question_text: string; 
  options: string[]; 
  correct_option: string;
  text: string;
  title?: string;          
  author?: string;        
  body?: string;           
  unreadCount?: number;
  answersCount?: number;
};

// ------------------------ AUTH HELPERS ------------------------
export const registerUser = async (
  full_name: string,
  email: string,
  password: string,
  role = "student"
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/auth/signup", { full_name, email, password, role });
  return response.data;
};


export interface SubjectDetailsResponse {
  subject: Subject;
  topics: (Topic & { resources: Resource[] })[];
  assessments: Assessment[];
}

export const getUserRole = async (token?: string): Promise<string | null> => {
  if (!token) return null;
  try {
    const response = await api.get<User>("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    return response.data?.role || null;
  } catch (err: any) {
    console.error("Failed to fetch role:", err.message || err);
    return null;
  }
};

// ------------------------ DASHBOARD APIs ------------------------
export const fetchStats = async (role: string): Promise<any> => {
  const response = await api.get(`/${role}/stats`);
  return response.data;
};

export const fetchActivities = async (role: string): Promise<Activity[]> => {
  const response = await api.get<Activity[]>(`/${role}/activities`);
  return response.data || [];
};

// ------------------------ SUBJECTS ------------------------


export const createSubject = async (name: string, grade: string, description?: string): Promise<Subject> => {
  const res = await api.post<Subject>("/subjects", { name, grade, description });
  return res.data;
};

export const updateSubject = async (id: string, name: string, grade: string, description?: string): Promise<Subject> => {
  const res = await api.put<Subject>(`/subjects/${id}`, { 
    name, 
    grade, 
    description: description || "" 
  });
  return res.data;
};

export const deleteSubject = async (id: string): Promise<void> => {
  await api.delete(`/subjects/${id}`);
};

// ------------------------ TOPICS ------------------------
export const getTopicsBySubject = async (subject_id: string): Promise<Topic[]> => {
  const res = await api.get<Topic[]>(`/topics/subject/${subject_id}`);
  return res.data;
};

export const createTopic = async (subject_id: string, name: string): Promise<Topic> => {
  const res = await api.post<Topic>("/topics", { subject_id, name });
  return res.data;
};

export const updateTopic = async (id: string, name: string): Promise<Topic> => {
  const res = await api.put<Topic>(`/topics/${id}`, { name });
  return res.data;
};

export const deleteTopic = async (id: string): Promise<void> => {
  await api.delete(`/topics/${id}`);
};

export const createGroup = async (subject_id: string, name: string): Promise<Group> => {
  const res = await api.post<Group>("/groups", { subject_id, name }); // Remove "/" prefix
  return res.data;
};

export const updateGroup = async (id: string, name: string): Promise<Group> => {
  const res = await api.put<Group>(`/groups/${id}`, { name });
  return res.data;
};

export const deleteGroup = async (id: string): Promise<void> => {
  await api.delete(`/groups/${id}`);
};

// ------------------------ ASSESSMENTS ------------------------
export const getAssessments = async (subject_id?: string): Promise<Assessment[]> => {
  const url = subject_id ? `/assessments?subject_id=${subject_id}` : "/assessments";
  const res = await api.get<Assessment[]>(url);
  return res.data;
};

export const createAssessment = async (title: string, subject_id: string, group_id: string): Promise<Assessment> => {
  const res = await api.post<Assessment>("/assessments", { 
    title, 
    subject_id, 
    group_id  
  });
  return res.data;
};


export const deleteAssessment = async (id: string): Promise<void> => {
  await api.delete(`/assessments/${id}`);
};

export async function updateOption(
  optionId: string,
  updates: { option_text?: string; is_correct?: boolean }
) {
  const response = await fetch(`${API_URL}/options/${optionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw await response.json();
  return response.json();
}
// ------------------------ RESOURCES ------------------------
export const getResourcesByTopic = async (topicId: string) => {
  try {
    const res = await api.get(`/resources/topic/${topicId}`);
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err.message;
  }
};

export type Resource = {
  id: string;
  topic_id: string;
  title: string;
  type: "video" | "pdf" | "word" | "excel";
  url?: string;
  file_path?: string;
  created_at?: string;
};

export const createResource = async (formData: FormData, config?: any): Promise<Resource> => {
  const res = await api.post<Resource>('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  });
  return res.data;
};

export const deleteResource = async (resourceId: string) => {
  try {
    const res = await api.delete(`/resources/${resourceId}`);
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err.message;
  }
};

export const updateAssessment = async (id: string, title: string) => {
  const response = await fetch(`${API_URL}/assessments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error("Failed to update assessment");
  return response.json();
};

// ------------------------ STUDENT DASHBOARD ------------------------
export const getStudentStats = async (): Promise<any> => {
  const res = await api.get("/student/stats");
  return res.data;
};

export const getStudentActivities = async (): Promise<Activity[]> => {
  const res = await api.get<Activity[]>("/student/activities");
  return res.data || [];
};

// ------------------------ STUDENT GROUPS ------------------------
export const joinGroup = async (group_id: string): Promise<any> => {
  const res = await api.post(`/student/groups/join`, { group_id });
  return res.data;
};

export const getMyGroups = async (): Promise<Group[]> => {
  const res = await api.get<Group[]>(`/student/groups`);
  return res.data;
};

// ------------------------ STUDENT ASSESSMENTS ------------------------
export const startAssessment = async (assessment_id: string): Promise<any> => {
  const res = await api.post(`/student/assessments/${assessment_id}/start`, {});
  return res.data;
};

export const getAssessmentResults = async (assessment_id: string): Promise<any> => {
  const res = await api.get(`/student/assessments/${assessment_id}/results`);
  return res.data;
};

// ------------------------ STUDENT SUBJECTS ------------------------


export const fetchSubjectAssessments = async (subjectId: string) => {
  
  const subjectIdNum = parseInt(subjectId);
  
 
  if (isNaN(subjectIdNum)) {
    console.error('Invalid subject ID:', subjectId);
    return [];
  }
  
  const res = await getAssessmentsBySubject(subjectIdNum);
  return res;
};


// ------------------------ SUBJECTS ------------------------
export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const res = await api.get<any>("/subjects"); 
    console.log("Raw subjects response:", res.data);
    
  
    if (Array.isArray(res.data)) {
      return res.data;
    } else if (Array.isArray(res.data.subjects)) {
      return res.data.subjects;
    } else if (Array.isArray(res.data.data)) {
      return res.data.data;
    } else {
      console.warn("Unexpected subjects response structure:", res.data);
      return [];
    }
  } catch (error: any) {
    console.error("Error fetching subjects:", getErrorMessage(error));
    throw error;
  }
};


// ------------------------ STUDENT ENROLLMENT ------------------------




export const getSubjectWithTopics = async (subjectId: string): Promise<{ subject: Subject; topics: Topic[] }> => {
  const [subjectRes, topicsRes] = await Promise.all([
    api.get<Subject>(`/subjects/${subjectId}`),
    api.get<Topic[]>(`/topics/subject/${subjectId}`)
  ]);
  return { subject: subjectRes.data, topics: topicsRes.data };
};

export const getSubjectResources = async (subjectId: string): Promise<Resource[]> => {
  try {
    const res = await api.get<Resource[]>(`/resources/subject/${subjectId}`);
    return res.data;
  } catch (error) {
    console.log("Resources endpoint not available");
    return [];
  }
};

export const getSubjectAssessments = async (subjectId: string): Promise<Assessment[]> => {
  try {
    const res = await api.get<Assessment[]>(`/assessments?subject_id=${subjectId}`);
    return res.data;
  } catch (error) {
    console.log("Assessments endpoint not available");
    return [];
  }
};

// ------------------------ STUDENT SUBJECTS ------------------------
export const fetchUserSubjects = async (userId: string): Promise<Subject[]> => {
  try {
 
    const enrollments = await getEnrolledSubjects();
    return enrollments.map(enrollment => enrollment.subject!).filter(Boolean);
  } catch (error) {
    console.log("Enrollments endpoint not available, using all subjects");
    return await getSubjects();
  }
};




// ------------------------ STUDENT ENROLLMENT ------------------------
export type Enrollment = {
  id: string;
  student_id: string;
  subject_id: string;
  enrolled_at: string;
  subject?: Subject;
};

export const getAvailableSubjects = async (): Promise<Subject[]> => {
  const res = await api.get<Subject[]>("/subjects/available");
  return res.data;
};


export const getEnrolledSubjects = async (): Promise<Enrollment[]> => {
  try {
    console.log('📋 Fetching enrolled subjects...');
    const res = await api.get<Enrollment[]>("/subjects/enrolled");
    console.log('✅ Raw API response:', res.data);
    
   
    if (res.data && Array.isArray(res.data)) {
      console.log('📊 Enrollment objects:', res.data.map(e => ({
        id: e.id,
        subject_id: e.subject_id,
        has_subject: !!e.subject,
        subject: e.subject ? {
          id: e.subject.id,
          name: e.subject.name
        } : null
      })));
    }
    
    return res.data;
  } catch (error: any) {
    console.error('❌ Error fetching enrolled subjects:', error);
    return [];
  }
};

// Enroll in a subject
export const enrollInSubject = async (subjectId: string): Promise<Enrollment> => {
  const res = await api.post<Enrollment>("/subjects/enroll", { subject_id: subjectId });
  return res.data;
};

// Unenroll from a subject
export const unenrollFromSubject = async (subjectId: string): Promise<void> => {
  await api.delete(`/subjects/enroll/${subjectId}`);
};

// Get subject details with all content


export const getSubjectDetails = async (subjectId: string): Promise<{
  questions: never[];
  subject: Subject;
  topics: (Topic & { resources: Resource[] })[];
  assessments: Assessment[];
}> => {
  try {
    console.log("Fetching subject details for ID:", subjectId);
    
    const response = await api.get<{
      subject: Subject;
      topics: (Topic & { resources: Resource[] })[];
      assessments: Assessment[];
    }>(`/subjects/${subjectId}/details`);
    
    console.log("API response received:", response.data);
    
    const { subject, topics = [], assessments = [] } = response.data;

    console.log("Subject details fetched successfully");
    console.log("Subject:", subject);
    console.log("Topics count:", topics.length);
    console.log("Assessments count:", assessments.length);

    return {
      questions: [], // Add this
      subject,
      topics: topics || [],
      assessments: assessments.filter(a => a.approved) || []
    };

  } catch (error: any) {
    console.error("Error fetching subject details:", error);
    
    if (error.response) {
      console.error("Error response status:", error.response.status);
      console.error("Error response data:", error.response.data);
    }
    
    return {
      questions: [],
      subject: {
        id: parseInt(subjectId),
        name: 'Subject',
        grade: 'Not specified',
        description: 'Could not load subject details'
      } as unknown as Subject,
      topics: [],
      assessments: []
    };
  }
};



export const getAssessmentsBySubject = async (subjectId: string | number): Promise<Assessment[]> => {
  try {
    // Convert to number if it's a string
    const subjectIdNum = typeof subjectId === 'string' ? parseInt(subjectId) : subjectId;
    
    if (isNaN(subjectIdNum)) {
      console.error('Invalid subject ID:', subjectId);
      return [];
    }

    const res = await api.get<Assessment[]>("/assessments");
    return res.data.filter(a => a.subject_id === subjectIdNum);
  } catch (error) {
    console.error('Error fetching assessments by subject:', error);
    return [];
  }
};


// Teacher's Assessments
export const getTeacherAssessments = async (): Promise<Assessment[]> => {
  const res = await api.get<Assessment[]>("/teacher/assessments");
  return res.data;
};

// Create Assessment
export const createTeacherAssessment = async (assessmentData: {
  title: string;
  subject_id: number;
  group_id: number;
  description?: string;
  total_marks?: number;
  duration_minutes?: number;
  type?: string;
}): Promise<Assessment> => {
  const res = await api.post<Assessment>("/teacher/assessments", assessmentData);
  return res.data;
};

// Get Assessment Submissions
export const getTeacherStats = async () => {
  const res = await api.get("/teacher/stats");
  return res.data;
};


// ------------------------ TYPES ------------------------
export interface User {
  name: any;
  avatar: string;
  class_name: string;
  grade_level: any;
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: string;
  is_verified?: boolean;
  created_at?: string;
}

export interface Child {
  id: string;
  full_name: string;
  email: string;
  grade_level: number;
  class_name: string;
  overall_average: number;
  attendance_rate: number;
}

export interface ParentStats {
  total_children: number;
  average_grade: number;
  average_attendance: number;
}

export interface Activity {
  type: string;
  score?: number;
  title: string;
  assessment_type?: string;
  date: string;
  student_name: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
interface AttendanceData {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendanceRate: number;
  dailyAttendance: Array<{
    date: string;
    status: 'present' | 'absent' | 'late';
  }>;

}
// ------------------------ HELPER FUNCTIONS ------------------------

// Get current user ID from storage
const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// ------------------------ PARENT API FUNCTIONS (REAL APIs ONLY) ------------------------

export const fetchChildrenByParentId = async (parentId: string): Promise<Child[]> => {
  try {
    console.log(`Fetching children for parent: ${parentId}`);
    const response = await api.get<Child[]>(`/parents/${parentId}/children`);
    console.log('Children data received:', response.data);
    
    if (!Array.isArray(response.data)) {
      return [];
    }
    
    // Ensure numeric fields are properly converted
    const children = response.data.map(child => ({
      ...child,
      overall_average: Number(child.overall_average) || 0,
      attendance_rate: Number(child.attendance_rate) || 0,
      grade_level: Number(child.grade_level) || 1
    }));
    
    return children;
  } catch (error: any) {
    console.error('Error fetching children:', error);
    
    if (error.response) {
      if (error.response.status === 404) {
        // Return empty array for parents with no children
        return [];
      }
      if (error.response.status === 400) {
        throw new Error('Invalid parent ID format');
      }
      if (error.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      throw new Error(error.response.data?.error || 'Failed to fetch children data');
    }
    
    throw new Error('Failed to fetch children data');
  }
};

// Get parent dashboard stats by parent ID (backward compatibility)
export const fetchParentStats = async (parentId: string): Promise<ParentStats> => {
  try {
    console.log(`Fetching stats for parent: ${parentId}`);
    const response = await api.get<ParentStats>(`/parents/${parentId}/stats`);
    console.log('Stats data received:', response.data);
    
    // Ensure numeric fields are properly converted
    const stats = {
      total_children: Number(response.data.total_children) || 0,
      average_grade: Number(response.data.average_grade) || 0,
      average_attendance: Number(response.data.average_attendance) || 0
    };
    
    return stats;
  } catch (error: any) {
    console.error('Error fetching parent stats:', error);
    
    if (error.response?.status === 404) {
      return { total_children: 0, average_grade: 0, average_attendance: 0 };
    }
    
    throw new Error('Failed to fetch statistics');
  }
};

// Get recent activities by parent ID (backward compatibility)  
export const fetchParentActivities = async (parentId: string): Promise<Activity[]> => {
  try {
    console.log(`Fetching activities for parent: ${parentId}`);
    const response = await api.get<Activity[]>(`/parents/${parentId}/activities`);
    console.log('Activities data received:', response.data);
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    
    // Return empty array instead of throwing error for activities
    return [];
  }
};

// ------------------------ AUTH API FUNCTIONS ------------------------

// Login user
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting login with:', email);

    // Basic validation
    if (!email || !email.trim()) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    // API request
    const response = await api.post<AuthResponse>('/auth/login', {
      email: email.toLowerCase().trim(),
      password
    });

    const { user, token } = response.data;

    // Validate server response
    if (!user || !token || !user.id) throw new Error('Invalid server response');

    // Set token and store user info
    setAuthToken(token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('authToken', token);

    return { user, token };

  } catch (error: any) {
    console.error('Login error:', error);

    // Clear stored auth data on failure
    setAuthToken();
    AsyncStorage.removeItem('user');
    AsyncStorage.removeItem('authToken');

    // Axios error handling
    if (error.response) {
      const status = error.response.status;
      const backendMessage = error.response.data?.message || error.response.data?.error;

      switch (status) {
        case 400:
        case 401:
          // Friendly message for wrong credentials
          throw new Error(
            backendMessage?.toLowerCase().includes("invalid") || backendMessage?.toLowerCase().includes("credentials")
              ? "Incorrect email or password"
              : backendMessage || "Incorrect email or password"
          );
        case 422:
          throw new Error(backendMessage || "Please check your email format");
        case 429:
          throw new Error(backendMessage || "Too many login attempts. Please try again later.");
        default:
          throw new Error(backendMessage || `Error ${status}`);
      }
    }

    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      throw new Error('Network error. Please check your internet connection.');
    }

    // Fallback error
    throw new Error(error.message || 'Something went wrong. Please try again.');
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    console.log('Logging out user');
    
    // Remove token from axios headers
    setAuthToken();
    
    // Clear stored data
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    
    console.log('Logout completed successfully');
  } catch (error: any) {
    console.error('Logout error:', error);
    // Don't throw error during logout - just ensure cleanup
  }
};
export const getCurrentUser = async (): Promise<User> => {
  try {
    console.log('Getting current user');
    
    // First try to get from AsyncStorage
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      console.log('User found in storage');
      const user = JSON.parse(userJson) as User;
      
      // Validate stored user data
      if (user.id && user.email && user.role) {
        return user;
      }
    }
    
    // If not in storage or invalid, try API
    console.log('Fetching user from API');
    const response = await api.get<User>('/auth/me');
    const user = response.data;
    
    // Validate API response
    if (!user.id || !user.email || !user.role) {
      throw new Error('Invalid user data received from server');
    }
    
    // Store for future use
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error: any) {
    console.error('Get current user error:', error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid - clear everything and logout
      console.log('Session expired, logging out...');
      await logoutUser();
      throw new Error('Session expired. Please login again.');
    }
    
    // For other errors, still throw but don't logout
    throw new Error(error.response?.data?.error || error.message || 'Failed to get user profile');
  }
};

// ------------------------ UTILITY FUNCTIONS ------------------------



// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const user = await AsyncStorage.getItem('user');
    return !!(token && user);
  } catch (error) {
    return false;
  }
};

// Get stored auth token
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    return null;
  }
};

// ------------------------ ERROR HANDLING ------------------------
export const handleApiError = (error: any): string => {
  console.error('API Error:', error);
  
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;
    
    if (status === 401) {
      return 'Session expired. Please login again.';
    }
    if (status === 400) {
      return message || 'Invalid request format.';
    }
    if (status === 403) {
      return 'Access denied. You do not have permission to perform this action.';
    }
    if (status === 404) {
      return 'The requested resource was not found.';
    }
    if (status === 422) {
      return message || 'Invalid data provided.';
    }
    if (status === 429) {
      return 'Too many requests. Please try again later.';
    }
    if (status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    return message || `Server error: ${status}`;
  } else if (error.request) {
    return 'No response from server. Please check your internet connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};


// Enhanced parent tracking functions
// ------------------------ PARENT TRACKING API ------------------------
interface PerformanceData {
  overall: {
    average: number;
    total_assessments: number;
    latest_assessment: string;
  };
  by_subject: Array<{
    subject: string;
    average_score: number;
    assessment_count: number;
    best_score: number;
    worst_score: number;
  }>;
  recent_assessments: Array<{
    title: string;
    subject: string;
    type: string;
    score: number;
    date: string;
  }>;
}

// Used by: ParentDashboard.tsx
export const fetchMyChildren = async (): Promise<Child[]> => {
  try {
    const parentId = await getCurrentUserId();
    const response = await api.get<Child[]>(`/parents/${parentId}/children`);
    
    if (!Array.isArray(response.data)) return [];
    
    return response.data.map(child => ({
      ...child,
      overall_average: Number(child.overall_average) || 0,
      attendance_rate: Number(child.attendance_rate) || 0,
      grade_level: Number(child.grade_level) || 1
    }));
  } catch (error: any) {
    if (error.response?.status === 401) {
      await logoutUser();
      throw new Error('Session expired. Please login again.');
    }
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch children');
  }
};

// Used by: ParentDashboard.tsx
export const fetchMyStats = async (): Promise<ParentStats> => {
  try {
    const parentId = await getCurrentUserId();
    const response = await api.get<ParentStats>(`/parents/${parentId}/stats`);
    
    return {
      total_children: Number(response.data.total_children) || 0,
      average_grade: Number(response.data.average_grade) || 0,
      average_attendance: Number(response.data.average_attendance) || 0
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      await logoutUser();
      throw new Error('Session expired');
    }
    if (error.response?.status === 404) {
      return { total_children: 0, average_grade: 0, average_attendance: 0 };
    }
    throw new Error('Failed to fetch statistics');
  }
};

// Used by: ParentDashboard.tsx
export const fetchMyActivities = async (): Promise<Activity[]> => {
  try {
    const parentId = await getCurrentUserId();
    const response = await api.get<Activity[]>(`/parents/${parentId}/activities`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    if (error.response?.status === 401) {
      await logoutUser();
      throw new Error('Session expired');
    }
    return [];
  }
};

// ------------------------ PARENT TRACKING FUNCTIONS ------------------------

export const parentTrackingApi = {
 
  async searchStudents(email: string): Promise<User[]> {
    try {
      console.log('🔍 Searching students with query:', email);
      const response = await api.get('/parent-children/search-students', {
        params: { query: email }
      });
      console.log('✅ Search response:', response.data);
      return response.data as User[];
    } catch (error: any) {
      console.error('❌ Search error:', error.response?.data || error.message);
      throw error;
    }
  },

  
  async linkChild(childEmail: string) {
    const parentId = await getCurrentUserId();
    const response = await api.post('/parent-children/link', {
      parent_id: parentId,
      student_email: childEmail
    });
    return response.data;
  },


  async unlinkChild(childId: string): Promise<void> {
    const parentId = await getCurrentUserId();
    await api.delete(`/parent-children/unlink/${parentId}/${childId}`);
  },


  async getChildPerformance(childId: string): Promise<PerformanceData> {
    const parentId = await getCurrentUserId();
    const response = await api.get(`/parents/${parentId}/children/${childId}/performance`);
    return response.data as PerformanceData;
  },


  async getChildAttendance(childId: string, startDate?: string, endDate?: string): Promise<AttendanceData> {
    const parentId = await getCurrentUserId();
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get(`/parents/${parentId}/children/${childId}/attendance`, { params });
    return response.data as AttendanceData;
  },

  // Used by: ChildActivitiesScreen.tsx
  // Backend: GET /parents/:parentId/children/:childId/activities
  async getChildActivities(childId: string): Promise<Activity[]> {
    const parentId = await getCurrentUserId();
    const response = await api.get(`/parents/${parentId}/children/${childId}/activities`);
    return response.data as Activity[];
  }
};

// ------------------------ UTILITY FUNCTIONS ------------------------

export const formatAverage = (average: any): string => {
  const num = Number(average);
  return isNaN(num) ? '0.0' : num.toFixed(1);
};

export const formatAttendance = (attendance: any): string => {
  const num = Number(attendance);
  return isNaN(num) ? '0.0' : num.toFixed(1);
};

export default api;

// ------------------------ QUESTIONS ------------------------

// ---------------- TYPES ----------------
export interface Comment {
  id: number;
  body: string;
  author: string;
  created_at: string;
}

export interface Answer {
  id: number;
  question_id: number;
  selected_option_id: number;
  body: string;
  author: string;
  votes: number;
  is_accepted?: boolean;
  comments?: Comment[];
}


// Get all questions for a subject
export const getQuestionsBySubject = async (subjectId: number) => {
  const res = await api.get(`/qna/questions`, {
    params: { subject_id: subjectId },
  });
  return res.data;
};

// Get question details with answers
export const getQuestionDetail = async (questionId: number) => {
  const res = await api.get(`/qna/questions/${questionId}`);
  return res.data;
};

// Create a new question
export const createQuestion = async (title: string, body: string, authorId: string, subjectId: number, p0: number | undefined) => {
  const res = await api.post(`/qna/questions`, {
    title,
    body,
    author_id: authorId,
    subject_id: subjectId,
  });
  return res.data;
};

// ------------------------ ANSWERS ------------------------

// Add an answer
export const addAnswer = async (questionId: number, body: string, authorId: string) => {
  const res = await api.post(`/qna/answers`, {
    question_id: questionId,
    body,
    author_id: authorId,
  });
  return res.data;
};

// Accept an answer
export const acceptAnswer = async (answerId: number) => {
  const res = await api.put(`/qna/answers/${answerId}/accept`);
  return res.data;
};

// Vote on an answer (vote = 1 for upvote, -1 for downvote)
export const voteAnswer = async (answerId: number, vote: number) => {
  const res = await api.put(`/qna/answers/${answerId}/vote`, { vote });
  return res.data;
};

// Comment functions
export const getCommentsByAnswer = async (answerId: number) => {
  const response = await fetch(`${API_URL}/qna/answers/${answerId}/comments`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
};

export const addComment = async (answerId: number, body: string, userId: string) => {
  const response = await fetch(`${API_URL}/qna/answers/${answerId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, user_id: userId }),
  });
  if (!response.ok) throw new Error('Failed to add comment');
  return response.json();
};

// Vote on questions
export const voteQuestion = async (questionId: number, vote: number) => {
  const response = await fetch(`${API_URL}/questions/${questionId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vote }),
  });
  if (!response.ok) throw new Error('Failed to vote on question');
  return response.json();
};

// Reputation/Points
export const getUserReputation = async (userId: string) => {
  const response = await fetch(`${API_URL}/users/${userId}/reputation`);
  if (!response.ok) throw new Error('Failed to fetch reputation');
  return response.json();
};

// Search
export const searchQuestions = async (query: string, subjectId?: number) => {
  const params = new URLSearchParams({ query });
  if (subjectId) params.append('subject_id', subjectId.toString());
  
  const response = await fetch(`${API_URL}/questions/search?${params}`);
  if (!response.ok) throw new Error('Failed to search questions');
  return response.json();
};

// Get unread count for a subject
export const getUnreadCount = async (subjectId: number, userId: string) => {
  try {
    const res = await api.get(`/qna/subjects/${subjectId}/unread-count`, {
      params: { user_id: userId },
    });
    return (res.data as { unread_count: number }).unread_count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};
// Mark question as viewed
export const markQuestionAsRead = async (questionId: number, userId: string) => {
  try {
    await api.post(`/qna/questions/${questionId}/mark-read`, { user_id: userId });
  } catch (error) {
    console.error('Error marking question as read:', error);
    throw error;
  }
};


// Approve assessment
export const approveAssessment = async (id: string): Promise<Assessment> => {
  const res = await api.put<Assessment>(`/assessments/${id}/approve`, {});
  return res.data;
};

// Get assessment with questions
export const getAssessment = async (id: string): Promise<any> => {
  const res = await api.get(`/assessments/${id}`);
  return res.data;
};

// Add question
export const addQuestion = async (
  assessmentId: string,
  question_text: string,
  question_type: string = 'multiple_choice',
  marks: number = 1
): Promise<any> => {
  const res = await api.post(`/assessments/${assessmentId}/questions`, {
    question_text,
    question_type,
    marks
  });
  return res.data;
};

// Add option
export const addOption = async (
  assessmentId: string,
  questionId: string,
  option_text: string,
  is_correct: boolean = false
): Promise<any> => {
  const res = await api.post(
    `/assessments/${assessmentId}/questions/${questionId}/options`,
    { option_text, is_correct }
  );
  return res.data;
};

// Delete question
export const deleteQuestion = async (questionId: string): Promise<void> => {
  await api.delete(`/assessments/questions/${questionId}`);
};

// Delete option
export const deleteOption = async (optionId: string): Promise<void> => {
  await api.delete(`/assessments/options/${optionId}`);
};

// Submit assessment


// Get submission result
export const getSubmissionResult = async (assessmentId: string) => {
  const res = await api.get(`/assessments/${assessmentId}/result`);
  return res.data;
};

// Define the type once
export interface AssessmentResponse {
  score: number;
  totalMarks: number;
  percentage: number;
}



// ------------------------ TEACHER MCQ ASSESSMENT CREATION ------------------------


export const getTeacherSubjects = async (): Promise<Subject[]> => {
  try {
    const res = await api.get<Subject[]>("/teacher/subjects");
    return res.data;
  } catch (error) {
    console.log("Teacher subjects endpoint not available, using all subjects");
    // Fallback to general subjects endpoint
    return await getSubjects();
  }
};


// Get groups by subject for the teacher
export const getTeacherGroupsBySubject = async (subjectId: string): Promise<Group[]> => {
  try {
    const res = await api.get<Group[]>(`/teacher/subjects/${subjectId}/groups`);
    return res.data;
  } catch (error) {
    console.error("Error fetching teacher groups by subject:", error);
    // Fallback to all groups for the subject
    return await getGroupsBySubject(subjectId);
  }
};

// Update your services/api.ts with these corrected functions:

// Get all groups (without subject filter)
export const getAllGroups = async (): Promise<Group[]> => {
  try {
    console.log('🔍 Fetching all groups...');
    const res = await api.get<Group[]>("/groups");
    console.log('✅ All groups response:', res.data);
    
    if (!Array.isArray(res.data)) {
      console.warn('⚠️ Groups response is not an array:', res.data);
      return [];
    }
    
    return res.data;
  } catch (error: any) {
    console.error('❌ Error fetching all groups:', error);
    return [];
  }
};

// Get groups by subject (with proper integer parameter)
export const getGroupsBySubject = async (subjectId: string): Promise<Group[]> => {
  try {
    // Validate that subjectId is a valid number
    const subjectIdNum = parseInt(subjectId);
    if (isNaN(subjectIdNum)) {
      console.error('❌ Invalid subject ID:', subjectId);
      return [];
    }

    console.log(`🔍 Fetching groups for subject ${subjectId}...`);
    const res = await api.get<Group[]>(`/groups/subject/${subjectId}`);
    console.log(`✅ Groups for subject ${subjectId}:`, res.data);
    
    return Array.isArray(res.data) ? res.data : [];
  } catch (error: any) {
    console.error(`❌ Error fetching groups for subject ${subjectId}:`, error);
    return [];
  }
};

// Get teacher's groups with proper fallbacks
export const getTeacherGroups = async (): Promise<Group[]> => {
  try {
    console.log('🔍 Fetching teacher groups...');
    const res = await api.get<Group[]>("/teacher/groups");
    console.log('✅ Teacher groups response:', res.data);
    
    if (!Array.isArray(res.data)) {
      console.warn('⚠️ Teacher groups response is not an array:', res.data);
      return await getAllGroups(); // Fallback to all groups
    }
    
    return res.data.length > 0 ? res.data : await getAllGroups(); // Fallback if empty
  } catch (error: any) {
    console.error('❌ Error fetching teacher groups:', error);
    return await getAllGroups(); // Fallback to all groups
  }
};
export interface AssessmentAnswer {
  question_id: number;
  selected_option_id: number;
}

export interface SubmissionData {
  answers: AssessmentAnswer[];
}

export const submitAssessment = async (
  assessmentId: string,
  data: SubmissionData
): Promise<AssessmentResponse> => {
  const res = await api.post(`/assessments/${assessmentId}/submit`, data);
  return res.data as AssessmentResponse;
};

// app/services/api.ts
// Add these fixes to your existing api.ts file

export interface StudentSubmission {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  assessment_id: number;
  score: number;
  submitted_at: string;
  answers?: any[];
}

export interface AssessmentStats {
  total_submissions: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
}

// FIXED: getAssessmentSubmissions
export async function getAssessmentSubmissions(assessmentId: string): Promise<StudentSubmission[]> {
  try {
    const response = await fetch(`${API_URL}/teacher/assessments/${assessmentId}/submissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getStoredToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch submissions: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 Raw API response:', data);
    
    // FIX: Handle both response formats
    // If API returns {submissions: [...]}
    if (data && data.submissions && Array.isArray(data.submissions)) {
      console.log('✅ Extracted submissions array:', data.submissions);
      return data.submissions;
    }
    
    // If API returns array directly
    if (Array.isArray(data)) {
      console.log('✅ Direct submissions array:', data);
      return data;
    }
    
    // Fallback: empty array
    console.log('⚠️ No submissions found, returning empty array');
    return [];
  } catch (error) {
    console.error('❌ Error fetching submissions:', error);
    throw error;
  }
}

// FIXED: getAssessmentStats
export async function getAssessmentStats(assessmentId: string): Promise<AssessmentStats> {
  try {
    const response = await fetch(`${API_URL}/teacher/assessments/${assessmentId}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getStoredToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If stats endpoint doesn't exist, calculate from submissions
      console.log('⚠️ Stats endpoint not available, will calculate from submissions');
      const submissions = await getAssessmentSubmissions(assessmentId);
      return calculateStatsFromSubmissions(submissions);
    }

    const data = await response.json();
    console.log('📊 Stats API response:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    // Fallback: try to calculate from submissions
    try {
      const submissions = await getAssessmentSubmissions(assessmentId);
      return calculateStatsFromSubmissions(submissions);
    } catch (fallbackError) {
      // Return empty stats if everything fails
      return {
        total_submissions: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
      };
    }
  }
}

// HELPER: Calculate stats from submissions array
function calculateStatsFromSubmissions(submissions: StudentSubmission[]): AssessmentStats {
  if (!submissions || submissions.length === 0) {
    return {
      total_submissions: 0,
      average_score: 0,
      highest_score: 0,
      lowest_score: 0,
    };
  }

  const scores = submissions.map(s => s.score || 0);
  const total = scores.reduce((sum, score) => sum + score, 0);
  
  return {
    total_submissions: submissions.length,
    average_score: Math.round(total / scores.length),
    highest_score: Math.max(...scores),
    lowest_score: Math.min(...scores),
  };
}

// HELPER: Analyze individual submission
export function analyzeSubmission(submission: StudentSubmission) {
  const totalQuestions = submission.answers?.length || 10; // Fallback to 10 if not available
  const correctCount = submission.score || 0;
  const incorrectCount = totalQuestions - correctCount;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return {
    totalQuestions,
    correctCount,
    incorrectCount,
    percentage,
  };
}

export const getAssessmentsForEnrolledSubjects = async (): Promise<Assessment[]> => {
  try {
    console.log('📋 Fetching assessments for enrolled subjects...');
    
    // First get enrolled subjects
    const enrollments = await getEnrolledSubjects();
    const subjectIds = enrollments.map(enrollment => enrollment.subject_id);

    if (subjectIds.length === 0) {
      console.log('ℹ️ No enrolled subjects, returning empty assessments');
      return [];
    }

    console.log('🎯 Enrolled subject IDs:', subjectIds);

    // Get all assessments and filter by enrolled subjects
    const allAssessments = await getAssessments();
    
    // Filter assessments by enrolled subjects and approved status
    const enrolledAssessments = allAssessments.filter(assessment => 
      subjectIds.includes(assessment.subject_id.toString()) && 
      assessment.approved
    );

    console.log('✅ Available assessments for enrolled subjects:', enrolledAssessments.length);
    return enrolledAssessments;
  } catch (error) {
    console.error('❌ Error fetching assessments for enrolled subjects:', error);
    throw error;
  }
}

// Google OAuth login
// ------------------------------
export const loginWithGoogle = async (redirectUri: string) => {
  // Start the Google OAuth flow
  const authUrl = `${API_URL}/auth/google?redirect=${encodeURIComponent(redirectUri)}`;

  return authUrl; // your frontend LoginScreen will open this URL via AuthSession
};

// ------------------------------
//fetch user after Google login
// ------------------------------
export const fetchGoogleUser = async (token: string) => {
  setAuthToken(token);
  const response = await axios.get(`${API_URL}/me`);
  return response.data; // returns user object
};

export const updateProfile = async (data: any) => {
  try {
    // Make sure we send full_name instead of name
    const payload = {
      ...data,
      full_name: data.full_name || data.name, // fallback
    };

    const response = await api.put("/users/me", payload);
    return response.data;
  } catch (error: any) {
    console.log("Update profile error:", error.response?.data || error.message);
    throw error;
  }
};