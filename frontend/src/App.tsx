import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Public pages
import LandingPage from '@/pages/LandingPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Seeker pages
import JobSeekerDashboard from '@/pages/dashboard/JobSeekerDashboard';
import JobsPage from '@/pages/jobs/JobsPage';
import JobDetailPage from '@/pages/jobs/JobDetailPage';
import RecommendationsPage from '@/pages/recommendations/RecommendationsPage';
import ApplicationsPage from '@/pages/applications/ApplicationsPage';
import SavedJobsPage from '@/pages/saved/SavedJobsPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import ResumePage from '@/pages/resume/ResumePage';
import ChatPage from '@/pages/chat/ChatPage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminJobsPage from '@/pages/admin/AdminJobsPage';
import AdminApplicationsPage from '@/pages/admin/AdminApplicationsPage';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1f2937',
                            color: '#f9fafb',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                        },
                        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                    }}
                />
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Dashboard – redirect based on role handled inside */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <JobSeekerDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Job Seeker routes */}
                    <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
                    <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailPage /></ProtectedRoute>} />
                    <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
                    <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
                    <Route path="/saved" element={<ProtectedRoute><SavedJobsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/resume" element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

                    {/* Admin-only routes */}
                    <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute>} />
                    <Route path="/admin/jobs" element={<ProtectedRoute requireAdmin><AdminJobsPage /></ProtectedRoute>} />
                    <Route path="/admin/applications" element={<ProtectedRoute requireAdmin><AdminApplicationsPage /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
