import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  DollarSign,
  User,
  TrendingUp,
  Bookmark,
  Search,
  Plus,
  X,
  CheckCircle,
  Sliders,
  Compass,
  ShieldCheck,
  ArrowRight,
  Calendar,
  Layers,
  MessageSquare,
  Upload
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [token, setToken] = useState(window.localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  });
  const USER_ID = user ? user.id : null;

  // Authentication Fields Session
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [resumeFile, setResumeFile] = useState(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [comparisonList, setComparisonList] = useState([]);
  const [comparingResume, setComparingResume] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileExp, setProfileExp] = useState(0);
  const [skillsList, setSkillsList] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [desiredRoles, setDesiredRoles] = useState([]);
  const [newRoleInput, setNewRoleInput] = useState('');
  const [prefLocation, setPrefLocation] = useState('No Preference');
  const [prefMinSalary, setPrefMinSalary] = useState(0);

  // Admin New Job Form States
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobLoc, setNewJobLoc] = useState('');
  const [newJobType, setNewJobType] = useState('Remote');
  const [newJobSalary, setNewJobSalary] = useState('');
  const [newJobExp, setNewJobExp] = useState(0);
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobReqs, setNewJobReqs] = useState('');

  // Search and Filters (Browse Jobs Tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterExp, setFilterExp] = useState('All');

  // Interactive UI toast state
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  // AI Chatbot States
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am your Careers AI Assistant. I can help search our database, check your application status, or give top job recommendations! What can I help you with today?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast({ show: false, message: '', isError: false });
    }, 4000);
  };

  const fetchData = async () => {
    if (!token || !USER_ID) {
      setLoading(false);
      return;
    }
    try {
      // 1. Fetch User Profile
      const uRes = await fetch(`${API_BASE}/users/${USER_ID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (uRes.status === 401) {
        handleLogout();
        showToast("Session expired or user deleted. Please log in again.", true);
        return;
      }
      if (!uRes.ok) throw new Error("Failed to load user profile");
      const userData = await uRes.json();
      setUser(userData);

      // Load user details into state
      setProfileName(userData.name);
      setProfileEmail(userData.email);
      setProfileTitle(userData.title || '');
      setProfileExp(userData.experience_years);
      setSkillsList(userData.skills || []);
      setDesiredRoles(userData.preferences?.desired_roles || []);
      setPrefLocation(userData.preferences?.location_type || 'No Preference');
      setPrefMinSalary(userData.preferences?.min_salary || 0);

      // 2. Fetch recommendations
      const recRes = await fetch(`${API_BASE}/users/${USER_ID}/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData);
      }

      // 3. Fetch All Jobs
      const jobsRes = await fetch(`${API_BASE}/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setAllJobs(jobsData);
      }

      // 4. Fetch Bookmarks
      const bookRes = await fetch(`${API_BASE}/users/${USER_ID}/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setBookmarks(bookData);
      }

      // 5. Fetch Applications
      const appRes = await fetch(`${API_BASE}/users/${USER_ID}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData);
      }

      // 6. Fetch All Applications (for Admin Dashboard)
      // Only admin user can fetch this
      if (user && user.role === 'admin') {
        const allAppRes = await fetch(`${API_BASE}/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (allAppRes.ok) {
          const allAppData = await allAppRes.json();
          setAllApplications(allAppData);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      showToast("Could not connect to FastAPI server. Ensure the backend is running.", true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: profileName,
        email: profileEmail,
        title: profileTitle,
        skills: skillsList,
        experience_years: profileExp,
        preferences: {
          desired_roles: desiredRoles,
          location_type: prefLocation,
          min_salary: Number(prefMinSalary)
        }
      };

      const res = await fetch(`${API_BASE}/users/${USER_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("Profile updated! Calculating new match scores...");
        fetchData();
      } else {
        showToast("Error updating profile", true);
      }
    } catch (err) {
      showToast("Network error updating profile", true);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = newSkillInput.trim();
    if (clean && !skillsList.includes(clean)) {
      setSkillsList([...skillsList, clean]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkillsList(skillsList.filter(s => s !== skill));
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    const clean = newRoleInput.trim();
    if (clean && !desiredRoles.includes(clean)) {
      setDesiredRoles([...desiredRoles, clean]);
      setNewRoleInput('');
    }
  };

  const handleRemoveRole = (role) => {
    setDesiredRoles(desiredRoles.filter(r => r !== role));
  };

  const handleToggleBookmark = async (e, jobId) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message);
        fetchData();
      }
    } catch (err) {
      showToast("Network error bookmarking job", true);
    }
  };

  const handleApplyJob = async (e, jobId) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message);
        fetchData();
      }
    } catch (err) {
      showToast("Network error applying for job", true);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!newJobTitle || !newJobCompany || !newJobLoc || !newJobDesc) {
      showToast("Please fill in all required fields", true);
      return;
    }

    try {
      // Parse requirements separated by commas
      const requirementsArray = newJobReqs
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      const payload = {
        title: newJobTitle,
        company: newJobCompany,
        location: newJobLoc,
        type: newJobType,
        salary: newJobSalary ? Number(newJobSalary) : null,
        description: newJobDesc,
        requirements: requirementsArray,
        experience_level: Number(newJobExp)
      };

      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("New job posted successfully!");
        setNewJobTitle('');
        setNewJobCompany('');
        setNewJobLoc('');
        setNewJobSalary('');
        setNewJobExp(0);
        setNewJobDesc('');
        setNewJobReqs('');
        fetchData();
      } else {
        showToast("Error creating job", true);
      }
    } catch (err) {
      showToast("Network error creating job", true);
    }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message);
        fetchData();
      } else {
        const errData = await res.json();
        showToast(errData.detail || "Error updating application status", true);
      }
    } catch (err) {
      showToast("Network error updating status", true);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      showToast("Please select a resume file first.", true);
      return;
    }
    setParsingResume(true);
    setParsedData(null);
    setComparisonList([]);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const res = await fetch(`${API_BASE}/resume/parse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setParsedData(data);
        showToast("Resume parsed successfully!");
        if (allJobs.length === 0) {
          await fetchData();
        }
        // Use dynamically fetched data if allJobs is still local
        const jobsToCompare = allJobs.length > 0 ? allJobs : [];
        if (jobsToCompare.length === 0) {
          // fetch again
          const jobsRes = await fetch(`${API_BASE}/jobs`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (jobsRes.ok) {
            const jobsData = await jobsRes.json();
            setAllJobs(jobsData);
            await runComparisons(data.skills, data.experience_years, jobsData);
          }
        } else {
          await runComparisons(data.skills, data.experience_years, jobsToCompare);
        }
      } else {
        const err = await res.json();
        showToast(err.detail || "Error parsing resume", true);
      }
    } catch (err) {
      showToast("Network error uploading resume", true);
    } finally {
      setParsingResume(false);
    }
  };

  const runComparisons = async (skills, expYears, jobsList = allJobs) => {
    setComparingResume(true);
    const results = [];
    try {
      for (const job of jobsList) {
        try {
          const res = await fetch(`${API_BASE}/resume/compare/${job.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              skills: skills,
              experience_years: expYears
            })
          });
          if (res.ok) {
            const data = await res.json();
            results.push({
              job,
              match_score: data.match_score,
              matched_skills: data.matched_skills,
              missing_skills: data.missing_skills,
              experience_status: data.experience_status,
              suggestions: data.suggestions
            });
          }
        } catch (e) {
          console.error("Comparison failed for job " + job.id, e);
        }
      }
      results.sort((a, b) => b.match_score - a.match_score);
      setComparisonList(results);
    } catch (err) {
      showToast("Error executing comparisons", true);
    } finally {
      setComparingResume(false);
    }
  };

  const handleSyncResumeToProfile = () => {
    if (!parsedData) return;
    setProfileName(parsedData.name || "");
    setProfileEmail(parsedData.email || "");
    setProfileTitle(parsedData.title || "");
    setProfileExp(parsedData.experience_years || 0);
    setSkillsList(parsedData.skills || []);
    showToast("Resume synced to profile! Save modifications in the 'My Profile' tab.");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      if (res.ok) {
        const logData = await res.json();
        setToken(logData.access_token);
        setUser(logData.user);
        window.localStorage.setItem("token", logData.access_token);
        window.localStorage.setItem("user", JSON.stringify(logData.user));
        showToast("Logged in successfully!");
        setAuthEmail("");
        setAuthPassword("");
      } else {
        const err = await res.json();
        showToast(err.detail || "Invalid login credentials", true);
      }
    } catch (err) {
      showToast("Network error logging in", true);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword
        })
      });
      if (res.ok) {
        showToast("Registered successfully! Please log in.");
        setIsRegistering(false);
        setAuthName("");
      } else {
        const err = await res.json();
        showToast(err.detail || "Registration error", true);
      }
    } catch (err) {
      showToast("Network error registering", true);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    setRecommendations([]);
    setAllJobs([]);
    setBookmarks([]);
    setApplications([]);
    setAllApplications([]);
    showToast("Logged out successfully");
  };

  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: chatInput
    };

    setChatMessages(prev => [...prev, userMsg]);
    const messageToSend = chatInput;
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageToSend })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.response
        }]);
      } else {
        const err = await res.json();
        setChatMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Error: ${err.detail || "Unable to get response from AI Chatbot."}`
        }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: "Network error trying to connect to AI Chatbot. Please verify connection."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Helper selectors
  const isBookmarked = (jobId) => bookmarks.some(b => b.id === jobId);
  const getApplicationStatus = (jobId) => {
    const app = applications.find(a => a.job.id === jobId);
    return app ? app.status : null;
  };

  // Filter logic for Browse Jobs Tab
  const filteredJobs = allJobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'All' || job.type.toLowerCase() === filterType.toLowerCase() ||
      (filterType === 'Remote' && job.type.toLowerCase() === 'remote');

    let matchesExp = true;
    if (filterExp !== 'All') {
      if (filterExp === 'Entry') matchesExp = job.experience_level <= 1;
      else if (filterExp === 'Mid') matchesExp = job.experience_level > 1 && job.experience_level <= 3;
      else if (filterExp === 'Senior') matchesExp = job.experience_level > 3;
    }

    return matchesSearch && matchesType && matchesExp;
  });

  const getScoreColorClass = (score) => {
    if (score >= 70) return 'high-match';
    if (score >= 40) return 'mid-match';
    return 'low-match';
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981'; // Green
    if (score >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getScoreRatingText = (score) => {
    if (score >= 70) return 'Strong';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  // Calculate dashboard metric stats
  const avgMatchScore = recommendations.length > 0
    ? Math.round(recommendations.reduce((sum, item) => sum + item.match_score, 0) / recommendations.length)
    : 0;

  // Trigger fetch when token changes
  useEffect(() => {
    fetchData();
  }, [token]);

  if (!token || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0a0f1d', fontFamily: 'Outfit, sans-serif', padding: '1rem' }}>
        {toast.show && (
          <div className={`toast-banner ${toast.isError ? 'error' : ''}`}>
            {toast.isError ? <X size={20} /> : <CheckCircle size={20} />}
            <span>{toast.message}</span>
          </div>
        )}

        <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', textAlign: 'center', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-secondary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1.5rem' }}>
            <TrendingUp size={30} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            {isRegistering ? 'Sign up to explore personalized recommendations' : 'Log in to access your CareerMatch dashboard'}
          </p>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
            {isRegistering && (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700, marginTop: '0.5rem' }}>
              {isRegistering ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthEmail("");
                setAuthPassword("");
                setAuthName("");
              }}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              {isRegistering ? 'Log In' : 'Sign Up'}
            </button>
          </div>

          {!isRegistering && (
            <div style={{ marginTop: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'left' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Demo Admin Credentials:</span><br />
              Email: <code style={{ color: 'var(--accent-secondary)' }}>chaithanya@example.com</code><br />
              Password: <code style={{ color: 'var(--accent-secondary)' }}>password123</code>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Alert */}
      {toast.show && (
        <div className={`toast-banner ${toast.isError ? 'error' : ''}`}>
          {toast.isError ? <X size={20} /> : <CheckCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo">J</div>
          <span className="brand-name">CareerMatch</span>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-links">
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('dashboard')}>
                <TrendingUp size={18} />
                <span>Recommendations</span>
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'browse' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('browse')}>
                <Compass size={18} />
                <span>Explore Jobs</span>
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('profile')}>
                <User size={18} />
                <span>My Profile</span>
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'resume' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('resume')}>
                <Upload size={18} />
                <span>Upload Resume</span>
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'ai-chat' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('ai-chat')}>
                <MessageSquare size={18} />
                <span>AI Careers Chat</span>
              </button>
            </li>
            {user && user.role === 'admin' && (
              <li className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}>
                <button onClick={() => setActiveTab('admin')}>
                  <Sliders size={18} />
                  <span>Admin Panel</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        {user && (
          <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div className="profile-summary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="profile-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                {user.name.charAt(0)}
              </div>
              <div className="profile-info" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="profile-name" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>{user.name}</span>
                <span className="profile-title" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn"
              style={{
                width: '100%',
                padding: '0.4rem',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main content viewport */}
      <main className="main-wrapper">

        {/* DASHBOARD TAB VIEW */}
        {activeTab === 'dashboard' && (
          <>
            <header className="header-section">
              <div className="header-title-group">
                <h1>Hello, {user?.name}</h1>
                <p>We found {recommendations.filter(item => item.match_score >= 50).length} strong career matches matching your skillset.</p>
              </div>
            </header>

            {/* Metric widgets row */}
            <section className="metrics-row">
              <div className="glass-card metric-card">
                <div className="metric-icon-box green">
                  <Briefcase size={22} />
                </div>
                <div className="metric-info">
                  <span className="metric-value">{allJobs.length}</span>
                  <span className="metric-label">Total Jobs Active</span>
                </div>
              </div>

              <div className="glass-card metric-card">
                <div className="metric-icon-box blue">
                  <TrendingUp size={22} />
                </div>
                <div className="metric-info">
                  <span className="metric-value">{avgMatchScore}%</span>
                  <span className="metric-label">Avg Match Score</span>
                </div>
              </div>

              <div className="glass-card metric-card">
                <div className="metric-icon-box yellow">
                  <CheckCircle size={22} />
                </div>
                <div className="metric-info">
                  <span className="metric-value">{applications.length}</span>
                  <span className="metric-label">Jobs Applied</span>
                </div>
              </div>
            </section>

            {/* Job matches container */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 className="section-headline">
                <Compass size={20} style={{ color: 'var(--accent-primary)' }} />
                Your Tailored Recommendations
              </h2>

              <div className="rec-list">
                {recommendations.map((item) => {
                  const job = item.job;
                  const isSaved = isBookmarked(job.id);
                  const isApplied = getApplicationStatus(job.id);

                  return (
                    <div
                      key={job.id}
                      className="glass-card rec-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedJob(item)}
                    >
                      <div className="card-header-main">
                        <div className="job-branding">
                          <h3 className="job-title" onClick={(e) => { e.stopPropagation(); setSelectedJob(item); }}>
                            {job.title}
                          </h3>
                          <div className="company-meta">
                            <span>{job.company}</span>
                            <div className="dot-separator"></div>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <MapPin size={13} /> {job.location} ({job.type})
                            </span>
                            {job.salary && (
                              <>
                                <div className="dot-separator"></div>
                                <span style={{ color: '#ffffff', fontWeight: 650 }}>
                                  ${job.salary.toLocaleString()}/yr
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Circular Score Match Gauge */}
                        <div className={`score-badge-circle ${getScoreColorClass(item.match_score)}`}>
                          {Math.round(item.match_score)}%
                          <span className="score-label-small">{getScoreRatingText(item.match_score)}</span>
                        </div>
                      </div>

                      {/* Display overlapping skills and missing skills gaps */}
                      <div className="skills-overlap-container">
                        <div className="overlap-info-block">
                          {item.matched_skills.length > 0 && (
                            <div className="overlap-subrow">
                              <span style={{ color: 'var(--accent-primary)', fontWeight: 600, minWidth: '95px' }}>Matched Skills:</span>
                              <div className="chip-list">
                                {item.matched_skills.map(s => (
                                  <span key={s} className="skill-chip match">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.missing_skills.length > 0 && (
                            <div className="overlap-subrow">
                              <span style={{ color: 'var(--accent-warn)', fontWeight: 600, minWidth: '95px' }}>Missing Gaps:</span>
                              <div className="chip-list">
                                {item.missing_skills.map(s => (
                                  <span key={s} className="skill-chip gap">+{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rec-card-footer">
                        <div className="footer-meta">
                          <span>
                            <ShieldCheck size={14} style={{ color: 'var(--accent-primary)' }} />
                            Exp level: {job.experience_level} {job.experience_level === 1 ? 'Year' : 'Years'} ({item.experience_status})
                          </span>
                        </div>

                        <div className="footer-actions">
                          <button
                            className={`btn-icon-only ${isSaved ? 'active' : ''}`}
                            onClick={(e) => handleToggleBookmark(e, job.id)}
                            title={isSaved ? "Remove Bookmark" : "Save Job"}
                          >
                            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                          </button>

                          <button
                            className="btn btn-primary"
                            disabled={isApplied}
                            onClick={(e) => handleApplyJob(e, job.id)}
                          >
                            {isApplied ? (
                              <>
                                <CheckCircle size={15} /> Applied
                              </>
                            ) : (
                              <>
                                Apply Now <ArrowRight size={15} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* EXPLORE JOBS TAB VIEW */}
        {activeTab === 'browse' && (
          <>
            <header className="header-section">
              <div className="header-title-group">
                <h1>Explore Careers</h1>
                <p>View and search all active database vacancies.</p>
              </div>
            </header>

            {/* Filter and search utilities */}
            <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
              <div className="filters-section">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search titles, companies, or skills (e.g. FastAPI, Python)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="select-filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>

                <select
                  className="select-filter"
                  value={filterExp}
                  onChange={(e) => setFilterExp(e.target.value)}
                >
                  <option value="All">All Experience levels</option>
                  <option value="Entry">Entry (0-1 yr)</option>
                  <option value="Mid">Mid level (2-3 yrs)</option>
                  <option value="Senior">Senior (4+ yrs)</option>
                </select>
              </div>
            </div>

            <div className="rec-list">
              {filteredJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <Briefcase size={40} style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--text-muted)' }} />
                  <p>No job vacancies match your filter parameters.</p>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isSaved = isBookmarked(job.id);
                  const isApplied = getApplicationStatus(job.id);

                  // Compute match details on the frontend side for explorer view
                  const mockRecommendationDetails = recommendations.find(r => r.job.id === job.id) || {
                    match_score: 0,
                    matched_skills: [],
                    missing_skills: job.requirements || [],
                    experience_status: "Pending Evaluation",
                    breakdown: { skills: 0, experience: 0, title: 0, preferences: 0 }
                  };

                  return (
                    <div
                      key={job.id}
                      className="glass-card rec-card"
                      onClick={() => setSelectedJob(mockRecommendationDetails)}
                    >
                      <div className="card-header-main">
                        <div className="job-branding">
                          <h3 className="job-title" onClick={(e) => { e.stopPropagation(); setSelectedJob(mockRecommendationDetails); }}>
                            {job.title}
                          </h3>
                          <div className="company-meta">
                            <span>{job.company}</span>
                            <div className="dot-separator"></div>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <MapPin size={13} /> {job.location} ({job.type})
                            </span>
                            {job.salary && (
                              <>
                                <div className="dot-separator"></div>
                                <span style={{ color: '#ffffff', fontWeight: 650 }}>
                                  ${job.salary.toLocaleString()}/yr
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className={`score-badge-circle ${getScoreColorClass(mockRecommendationDetails.match_score)}`}>
                          {Math.round(mockRecommendationDetails.match_score)}%
                          <span className="score-label-small">Match</span>
                        </div>
                      </div>

                      <div className="badge-cloud">
                        {job.requirements.map(req => (
                          <span key={req} className="editable-tag">{req}</span>
                        ))}
                      </div>

                      <div className="rec-card-footer">
                        <div className="footer-meta">
                          <span>
                            <ShieldCheck size={14} style={{ color: 'var(--accent-secondary)' }} />
                            Req level: {job.experience_level} {job.experience_level === 1 ? 'Year' : 'Years'}
                          </span>
                        </div>

                        <div className="footer-actions">
                          <button
                            className={`btn-icon-only ${isSaved ? 'active' : ''}`}
                            onClick={(e) => handleToggleBookmark(e, job.id)}
                          >
                            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                          </button>

                          <button
                            className="btn btn-secondary"
                            disabled={isApplied}
                            onClick={(e) => handleApplyJob(e, job.id)}
                          >
                            {isApplied ? "Applied" : "Apply"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* PROFILE MANAGEMENT TAB VIEW */}
        {activeTab === 'profile' && (
          <>
            <header className="header-section">
              <div className="header-title-group">
                <h1>Candidate Profile</h1>
                <p>Modify credentials, select work preferences, and view saved opportunities.</p>
              </div>
            </header>

            <div className="profile-grid">
              {/* Left Profile card */}
              <div className="glass-card profile-avatar-card">
                <div className="profile-avatar-large">
                  {user?.name.charAt(0)}
                </div>
                <h2>{user?.name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{user?.title || 'Job Seeker'}</p>
                <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Bookmarked Opportunities ({bookmarks.length})</h3>
                  {bookmarks.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No saved jobs list yet.</span>
                  ) : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {bookmarks.map((job) => {
                        const recItem = recommendations.find(r => r.job.id === job.id) || { match_score: 0 };
                        return (
                          <li key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.12)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{job.company}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', paddingLeft: '0.5rem' }}>{Math.round(recItem.match_score)}%</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-warn)', textTransform: 'uppercase', marginBottom: '1rem' }}>Applied History ({applications.length})</h3>
                  {applications.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No applications submitted yet.</span>
                  ) : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {applications.map((app) => {
                        const getStatusBadgeStyle = (status) => {
                          if (status === 'Interviewing') return { backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-secondary)' };
                          if (status === 'Offered') return { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)' };
                          if (status === 'Rejected') return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)' };
                          return { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' };
                        };

                        return (
                          <li key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.12)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.job.title}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{app.job.company}</span>
                            </div>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '10px',
                              ...getStatusBadgeStyle(app.status)
                            }}>{app.status}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right Forms sheet */}
              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Edit Personal Data</h2>
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-cols-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-cols-2">
                    <div className="form-group">
                      <label className="form-label">Job Title / Role</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Full Stack Developer"
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Work Location Preference</label>
                      <select
                        className="select-filter"
                        style={{ width: '100%' }}
                        value={prefLocation}
                        onChange={(e) => setPrefLocation(e.target.value)}
                      >
                        <option value="No Preference">No Preference</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Onsite">Onsite</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Years of Practical Experience</label>
                    <div className="range-slider-wrapper">
                      <input
                        type="range"
                        className="range-slider"
                        min="0"
                        max="15"
                        value={profileExp}
                        onChange={(e) => setProfileExp(Number(e.target.value))}
                      />
                      <span className="slider-val">{profileExp} {profileExp === 1 ? 'Year' : 'Years'}</span>
                    </div>
                  </div>

                  <div className="form-cols-2">
                    <div className="form-group">
                      <label className="form-label">Target Salary Expectations</label>
                      <div className="range-slider-wrapper">
                        <input
                          type="range"
                          className="range-slider"
                          min="0"
                          max="200000"
                          step="5000"
                          value={prefMinSalary}
                          onChange={(e) => setPrefMinSalary(Number(e.target.value))}
                        />
                        <span className="slider-val" style={{ minWidth: '90px' }}>${prefMinSalary.toLocaleString()}/yr</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Editor */}
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Target Skill Tags (Press Enter / Add to list)</label>
                    <div className="tag-input-box" style={{ display: 'inline-flex', width: '100%' }}>
                      {skillsList.map((skill) => (
                        <div key={skill} className="editable-tag">
                          {skill}
                          <button
                            type="button"
                            className="editable-tag-remove"
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        placeholder="Add new skill..."
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddSkill(e);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', padding: '0 0.5rem' }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Desired Roles */}
                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="form-label">Target Roles / Keywords (Press Enter to add)</label>
                    <div className="tag-input-box" style={{ display: 'inline-flex', width: '100%' }}>
                      {desiredRoles.map((role) => (
                        <div key={role} className="editable-tag">
                          {role}
                          <button
                            type="button"
                            className="editable-tag-remove"
                            onClick={() => handleRemoveRole(role)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        placeholder="Add desired title..."
                        value={newRoleInput}
                        onChange={(e) => setNewRoleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddRole(e);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddRole}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', padding: '0 0.5rem' }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Save Profiles
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        {/* RESUME PARSER & COMPARATOR VIEW */}
        {activeTab === 'resume' && (
          <>
            <header className="header-section">
              <div className="header-title-group">
                <h1>Resume Upload</h1>
                <p>Upload a resume in PDF or plain text format to parse key candidate metadata and see customized suggestions.</p>
              </div>
            </header>

            <div className="profile-grid" style={{ marginBottom: '2.5rem' }}>
              {/* Left card: upload widget */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Select Resume</h2>

                <div className="form-group">
                  <input
                    type="file"
                    id="resume-file-input"
                    accept=".pdf,.txt"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setResumeFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label
                    htmlFor="resume-file-input"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justify: 'center',
                      padding: '2.5rem 1.5rem',
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Upload size={32} style={{ color: 'var(--accent-secondary)', marginBottom: '0.75rem' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                      {resumeFile ? resumeFile.name : "Choose File"}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      PDF or Plain Text (.txt) formats accepted
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleResumeUpload}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.65rem', fontWeight: 700, justifyContent: 'center' }}
                  disabled={parsingResume || !resumeFile}
                >
                  {parsingResume ? "Parsing resume with AI..." : "Upload & Parse"}
                </button>
              </div>

              {/* Right card: parsed results metadata */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Parsed Resume Elements</h2>

                {!parsedData ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Upload and parse a resume file to display candidate properties.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{parsedData.name}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{parsedData.email || 'N/A'}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Professional Title</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 650, color: '#ffffff' }}>{parsedData.title || 'N/A'}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Experience Years</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 650, color: '#ffffff' }}>{parsedData.experience_years} {parsedData.experience_years === 1 ? 'Year' : 'Years'}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Skills Extracted</span>
                      <div className="badge-cloud" style={{ marginTop: '0.25rem' }}>
                        {parsedData.skills && parsedData.skills.length > 0 ? (
                          parsedData.skills.map((skill) => (
                            <span key={skill} className="editable-tag" style={{ border: '1px solid rgba(99, 102, 241, 0.4)', backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No skills found.</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleSyncResumeToProfile}
                      className="btn btn-secondary"
                      style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
                    >
                      Sync to My Profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Match output comparisons */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
              <h2 className="section-headline">
                <Compass size={20} style={{ color: 'var(--accent-primary)' }} />
                Matching Vacancies Based on Resume
              </h2>

              {comparingResume && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Evaluating resume details against active job requirements...
                </div>
              )}

              {!comparingResume && parsedData && comparisonList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No active jobs found for comparison.
                </div>
              )}

              {!comparingResume && !parsedData && (
                <>
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    💡 Currently showing job matches based on your profile preferences. Upload a resume above to calculate specific match optimization suggestions.
                  </div>
                  {recommendations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      No profile recommendations found. Add some skills in your profile first!
                    </div>
                  ) : (
                    <div className="rec-list">
                      {recommendations.map((item) => {
                        const job = item.job;
                        const isSaved = isBookmarked(job.id);
                        const isApplied = getApplicationStatus(job.id);

                        return (
                          <div
                            key={job.id}
                            className="glass-card rec-card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedJob(item)}
                          >
                            <div className="card-header-main">
                              <div className="job-branding">
                                <h3 className="job-title" onClick={(e) => { e.stopPropagation(); setSelectedJob(item); }}>
                                  {job.title}
                                </h3>
                                <div className="company-meta">
                                  <span>{job.company}</span>
                                  <div className="dot-separator"></div>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <MapPin size={13} /> {job.location} ({job.type})
                                  </span>
                                  {job.salary && (
                                    <>
                                      <div className="dot-separator"></div>
                                      <span style={{ color: '#ffffff', fontWeight: 650 }}>
                                        ${job.salary.toLocaleString()}/yr
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className={`score-badge-circle ${getScoreColorClass(item.match_score)}`}>
                                {Math.round(item.match_score)}%
                                <span className="score-label-small">Match</span>
                              </div>
                            </div>

                            <div className="skills-overlap-container">
                              <div className="overlap-info-block">
                                {item.matched_skills.length > 0 && (
                                  <div className="overlap-subrow">
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600, minWidth: '95px' }}>Matched Skills:</span>
                                    <div className="chip-list">
                                      {item.matched_skills.map(s => (
                                        <span key={s} className="skill-chip match">{s}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {item.missing_skills.length > 0 && (
                                  <div className="overlap-subrow">
                                    <span style={{ color: 'var(--accent-warn)', fontWeight: 600, minWidth: '95px' }}>Missing Gaps:</span>
                                    <div className="chip-list">
                                      {item.missing_skills.map(s => (
                                        <span key={s} className="skill-chip gap">+{s}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="rec-card-footer">
                              <div className="footer-meta">
                                <span>
                                  <ShieldCheck size={14} style={{ color: 'var(--accent-primary)' }} />
                                  Exp required: {job.experience_level} {job.experience_level === 1 ? 'Year' : 'Years'} ({item.experience_status})
                                </span>
                              </div>

                              <div className="footer-actions">
                                <button
                                  className={`btn-icon-only ${isSaved ? 'active' : ''}`}
                                  onClick={(e) => handleToggleBookmark(e, job.id)}
                                >
                                  <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                                </button>

                                <button
                                  className="btn btn-secondary"
                                  disabled={isApplied}
                                  onClick={(e) => handleApplyJob(e, job.id)}
                                >
                                  {isApplied ? "Applied" : "Apply"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {!comparingResume && comparisonList.length > 0 && (
                <div className="rec-list">
                  {comparisonList.map((item) => {
                    const job = item.job;
                    const isSaved = isBookmarked(job.id);
                    const isApplied = getApplicationStatus(job.id);

                    // Map comparison structure to selectedJob format for modal view compatibility
                    const detailForModal = {
                      job,
                      match_score: item.match_score,
                      matched_skills: item.matched_skills,
                      missing_skills: item.missing_skills,
                      experience_status: item.experience_status,
                      breakdown: {
                        skills: item.matched_skills.length / (job.requirements.length || 1) * 100,
                        experience: parsedData.experience_years >= job.experience_level ? 100 : (parsedData.experience_years / (job.experience_level || 1)) * 100,
                        title: 50,
                        preferences: 75
                      }
                    };

                    return (
                      <div
                        key={job.id}
                        className="glass-card rec-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedJob(detailForModal)}
                      >
                        <div className="card-header-main">
                          <div className="job-branding">
                            <h3 className="job-title" onClick={(e) => { e.stopPropagation(); setSelectedJob(detailForModal); }}>
                              {job.title}
                            </h3>
                            <div className="company-meta">
                              <span>{job.company}</span>
                              <div className="dot-separator"></div>
                              <span style={{ color: getScoreColor(item.match_score), fontWeight: 700 }}>
                                {getScoreRatingText(item.match_score)} Match
                              </span>
                              <div className="dot-separator"></div>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <MapPin size={13} /> {job.location} ({job.type})
                              </span>
                              {job.salary && (
                                <>
                                  <div className="dot-separator"></div>
                                  <span style={{ color: '#ffffff', fontWeight: 650 }}>
                                    ${job.salary.toLocaleString()}/yr
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className={`score-badge-circle ${getScoreColorClass(item.match_score)}`}>
                            {Math.round(item.match_score)}%
                            <span className="score-label-small">{getScoreRatingText(item.match_score)}</span>
                          </div>
                        </div>

                        {/* Resume suggestions output display */}
                        <div style={{ margin: '1rem 0', padding: '0.85rem', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-secondary)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase' }}>Optimizations & Suggestions:</span>
                          <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {item.suggestions.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="skills-overlap-container">
                          <div className="overlap-info-block">
                            {item.matched_skills.length > 0 && (
                              <div className="overlap-subrow">
                                <span style={{ color: 'var(--accent-primary)', fontWeight: 600, minWidth: '95px' }}>Matched Skills:</span>
                                <div className="chip-list">
                                  {item.matched_skills.map(s => (
                                    <span key={s} className="skill-chip match">{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.missing_skills.length > 0 && (
                              <div className="overlap-subrow">
                                <span style={{ color: 'var(--accent-warn)', fontWeight: 600, minWidth: '95px' }}>Missing Gaps:</span>
                                <div className="chip-list">
                                  {item.missing_skills.map(s => (
                                    <span key={s} className="skill-chip gap">+{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rec-card-footer">
                          <div className="footer-meta">
                            <span>
                              <ShieldCheck size={14} style={{ color: 'var(--accent-primary)' }} />
                              Exp required: {job.experience_level} {job.experience_level === 1 ? 'Year' : 'Years'} ({item.experience_status})
                            </span>
                          </div>

                          <div className="footer-actions">
                            <button
                              className={`btn-icon-only ${isSaved ? 'active' : ''}`}
                              onClick={(e) => handleToggleBookmark(e, job.id)}
                            >
                              <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                            </button>

                            <button
                              className="btn btn-secondary"
                              disabled={isApplied}
                              onClick={(e) => handleApplyJob(e, job.id)}
                            >
                              {isApplied ? "Applied" : "Apply"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
              }
            </section>
          </>
        )}

        {/* ADMIN TAB VIEW - POST A NEW JOB */}
        {activeTab === 'admin' && (
          <>
            <header className="header-section">
              <div className="header-title-group">
                <h1>Admin Control Center</h1>
                <p>Create vacancies to instantaneously measure recommendation alignments.</p>
              </div>
            </header>

            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Create vacancy details</h2>
              <form onSubmit={handlePostJob}>
                <div className="form-cols-2">
                  <div className="form-group">
                    <label className="form-label">Job Title*</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Full Stack Developer"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Name*</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Acme Labs"
                      value={newJobCompany}
                      onChange={(e) => setNewJobCompany(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-cols-2">
                  <div className="form-group">
                    <label className="form-label">Location (City, State / Remote)*</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Remote or Austin, TX"
                      value={newJobLoc}
                      onChange={(e) => setNewJobLoc(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Work Type*</label>
                    <select
                      className="select-filter"
                      style={{ width: '100%' }}
                      value={newJobType}
                      onChange={(e) => setNewJobType(e.target.value)}
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </div>
                </div>

                <div className="form-cols-2">
                  <div className="form-group">
                    <label className="form-label">Annual Salary (USD/yr)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 95000"
                      value={newJobSalary}
                      onChange={(e) => setNewJobSalary(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Minimum Experience Required (Years)</label>
                    <div className="range-slider-wrapper">
                      <input
                        type="range"
                        className="range-slider"
                        min="0"
                        max="10"
                        value={newJobExp}
                        onChange={(e) => setNewJobExp(Number(e.target.value))}
                      />
                      <span className="slider-val" style={{ minWidth: '40px' }}>{newJobExp} {newJobExp === 1 ? 'Year' : 'Years'}</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills (Comma separated list)*</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Python, SQL, Docker, React"
                    value={newJobReqs}
                    onChange={(e) => setNewJobReqs(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enter skills and technologies, separated by commas.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Job Description*</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    placeholder="Provide details about role responsibilities, team structures, and growth factors..."
                    value={newJobDesc}
                    onChange={(e) => setNewJobDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                    Post Job Vacancy
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-card" style={{ maxWidth: '800px', margin: '2rem auto 0', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Manage Candidate Applications</h2>
              {allApplications.length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No candidate applications registered in system.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Candidate</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Job Posting</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Match Score</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Applied Date</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Work Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allApplications.map((app) => (
                        <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div style={{ fontWeight: 600 }}>{app.user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.user.email}</div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div style={{ fontWeight: 600 }}>{app.job.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.job.company}</div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                            {Math.round(app.match_score)}%
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                            {new Date(app.applied_date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <select
                              className="select-filter"
                              style={{ padding: '0.35rem 1.5rem 0.35rem 0.5rem', fontSize: '0.8rem', backgroundPosition: 'right 0.4rem center' }}
                              value={app.status}
                              onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                            >
                              <option value="Applied">Applied</option>
                              <option value="Interviewing">Interviewing</option>
                              <option value="Offered">Offered</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* AI CAREERS CHAT TAB VIEW */}
        {activeTab === 'ai-chat' && (
          <>
            <header className="header-section">
              <div className="header-title-group">
                <h1>AI Careers Chat</h1>
                <p>Discuss your career path, matches, bookmark lists or applications status with our RAG agent.</p>
              </div>
            </header>

            <div className="glass-card" style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '620px', padding: 0, justifyContent: 'space-between', overflow: 'hidden' }}>

              {/* Chat Messages */}
              <div style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--text-muted)', textAlign: msg.sender === 'user' ? 'right' : 'left', fontWeight: 600 }}>
                      {msg.sender === 'user' ? 'You' : 'AI Careers Assistant'}
                    </span>
                    <div
                      style={{
                        padding: '0.85rem 1.15rem',
                        borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                        backgroundColor: msg.sender === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                        border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI Careers Assistant</span>
                    <div style={{ padding: '0.85rem 1.15rem', borderRadius: '18px 18px 18px 2px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block' }}></span>
                      <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animationDelay: '0.2s' }}></span>
                      <span className="dot-typing" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={handleSendChatMessage}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '1.25rem',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }}
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ask me: 'Show me my application status' or 'Recommend top jobs'..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  style={{ flexGrow: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={chatLoading || !chatInput.trim()}
                  style={{ padding: '0 1.5rem' }}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}

      </main>

      {/* JOBS DETAILED SLIDE-PANEL MODAL OVERLAY */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="slide-panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>{selectedJob.job.title}</h2>
                <div className="company-meta">
                  <span style={{ fontWeight: 650, color: 'var(--accent-secondary)' }}>{selectedJob.job.company}</span>
                  <div className="dot-separator"></div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MapPin size={13} /> {selectedJob.job.location} ({selectedJob.job.type})
                  </span>
                </div>
              </div>
              <button className="panel-close" onClick={() => setSelectedJob(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="panel-body">
              {/* Score breakdown metrics gauge */}
              <div>
                <h3 className="panel-section-title">Recommendation Analysis</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'rgba(0, 0, 0, 0.15)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                  <div className={`score-badge-circle ${getScoreColorClass(selectedJob.match_score)}`} style={{ width: '70px', height: '70px', fontSize: '1.2rem' }}>
                    {Math.round(selectedJob.match_score)}%
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, color: '#ffffff' }}>{getScoreRatingText(selectedJob.match_score)} Match Score</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Calculated against your skill sets and career preferences.</p>
                  </div>
                </div>

                <div className="breakdown-row">
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <span>Skills Match</span>
                      <span style={{ fontWeight: 700 }}>{selectedJob.breakdown.skills}%</span>
                    </div>
                    <div className="breakdown-bar-bg">
                      <div className="breakdown-bar-fg" style={{ width: `${selectedJob.breakdown.skills}%` }} />
                    </div>
                  </div>

                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <span>Experience Fit</span>
                      <span style={{ fontWeight: 700 }}>{selectedJob.breakdown.experience}%</span>
                    </div>
                    <div className="breakdown-bar-bg">
                      <div className="breakdown-bar-fg" style={{ width: `${selectedJob.breakdown.experience}%` }} />
                    </div>
                  </div>

                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <span>Role Alignment</span>
                      <span style={{ fontWeight: 700 }}>{selectedJob.breakdown.title}%</span>
                    </div>
                    <div className="breakdown-bar-bg">
                      <div className="breakdown-bar-fg" style={{ width: `${selectedJob.breakdown.title}%` }} />
                    </div>
                  </div>

                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <span>Expectations Match</span>
                      <span style={{ fontWeight: 700 }}>{selectedJob.breakdown.preferences}%</span>
                    </div>
                    <div className="breakdown-bar-bg">
                      <div className="breakdown-bar-fg" style={{ width: `${selectedJob.breakdown.preferences}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div>
                <h3 className="panel-section-title">Skills Overview</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Skills you match ({selectedJob.matched_skills.length})</span>
                    {selectedJob.matched_skills.length === 0 ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None matched.</span>
                    ) : (
                      <div className="badge-cloud">
                        {selectedJob.matched_skills.map(s => (
                          <span key={s} className="skill-chip match">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Missing skill gaps ({selectedJob.missing_skills.length})</span>
                    {selectedJob.missing_skills.length === 0 ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>You've got all the required skills for this job!</span>
                    ) : (
                      <div className="badge-cloud">
                        {selectedJob.missing_skills.map(s => (
                          <span key={s} className="skill-chip gap">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Details description */}
              <div>
                <h3 className="panel-section-title">Job Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.90rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Experience Requirement:</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{selectedJob.job.experience_level} {selectedJob.job.experience_level === 1 ? 'Year' : 'Years'} ({selectedJob.experience_status})</span>
                  </div>
                  {selectedJob.job.salary && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Salary Estimate:</span>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>${selectedJob.job.salary.toLocaleString()}/yr</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Job Classification:</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{selectedJob.job.type}</span>
                  </div>
                </div>
                <h3 className="panel-section-title" style={{ marginTop: '1.5rem' }}>Job Description</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                  {selectedJob.job.description}
                </p>
              </div>

              {/* Modal footer CTA */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <button
                  className={`btn btn-secondary ${isBookmarked(selectedJob.job.id) ? 'active' : ''}`}
                  onClick={(e) => handleToggleBookmark(e, selectedJob.job.id)}
                  style={{ flexGrow: 1, justifyContent: 'center' }}
                >
                  <Bookmark size={15} /> {isBookmarked(selectedJob.job.id) ? "Saved" : "Save Opportunities"}
                </button>
                <button
                  className="btn btn-primary"
                  disabled={getApplicationStatus(selectedJob.job.id)}
                  onClick={(e) => handleApplyJob(e, selectedJob.job.id)}
                  style={{ flexGrow: 2, justifyContent: 'center', padding: '0.85rem' }}
                >
                  {getApplicationStatus(selectedJob.job.id) ? "Applied" : "Apply for Job"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
