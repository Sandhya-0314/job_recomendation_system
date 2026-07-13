// =================== Auth ===================
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    title?: string;
    skills: string[];
    experience_years: number;
    role?: string;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
    title?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: AuthUser;
}

// =================== User ===================
export interface UserPreferences {
    desired_roles: string[];
    location_type: string;
    min_salary: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    title?: string;
    skills: string[];
    experience_years: number;
    preferences: UserPreferences;
    role?: string;
}

export interface UserUpdateData {
    name: string;
    email: string;
    title?: string;
    skills: string[];
    experience_years: number;
    preferences: UserPreferences;
}

// =================== Job ===================
export interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: number;
    description: string;
    requirements: string[];
    experience_level: number;
    posted_date?: string;
}

export interface JobCreateData {
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: number;
    description: string;
    requirements: string[];
    experience_level: number;
}

// =================== Recommendation ===================
export interface BreakdownDetail {
    score: number;
    weight: number;
    contribution: number;
}

export interface Breakdown {
    skill_match: BreakdownDetail;
    experience_match: BreakdownDetail;
    preference_match: BreakdownDetail;
}

export interface Recommendation {
    job: Job;
    match_score: number;
    matched_skills: string[];
    missing_skills: string[];
    experience_status: string;
    breakdown: Breakdown;
}

// =================== Application ===================
export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';

export interface Application {
    id: number;
    job: Job;
    status: ApplicationStatus;
    applied_date: string;
}

export interface AdminApplication {
    id: number;
    user: User;
    job: Job;
    match_score: number;
    status: ApplicationStatus;
    applied_date: string;
}

// =================== Resume ===================
export interface ParsedResume {
    name?: string;
    email?: string;
    phone?: string;
    skills: string[];
    experience_years: number;
    education?: string[];
    raw_text?: string;
}

export interface ResumeComparison {
    match_score: number;
    matched_skills: string[];
    missing_skills: string[];
    match_strength: 'Strong' | 'Medium' | 'Low';
    recommendation: string;
}

// =================== Chat ===================
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}

// =================== Pagination ===================
export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
}

// =================== Filters ===================
export interface JobFilters {
    search: string;
    type: string;
    location: string;
    minSalary: number;
    maxSalary: number;
    experienceLevel: string;
    sortBy: 'recent' | 'salary_asc' | 'salary_desc' | 'title';
}
