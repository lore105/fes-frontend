export interface User {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    employee_id?: string;
    student_id?: string;
    roles: string[];
    permissions: string[];
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface College {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
}

export interface Department {
    id: number;
    college_id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    college?: College;
}

export interface EvaluationPeriod {
    id: number;
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    allow_student_evaluation: boolean;
    allow_peer_evaluation: boolean;
    allow_supervisor_evaluation: boolean;
}

export interface EvaluationResult {
    id: number;
    final_score: string;
    performance_rating: string;
    total_evaluators: number;
    student_eval_score?: string;
    peer_eval_score?: string;
    supervisor_eval_score?: string;
    is_published: boolean;
}