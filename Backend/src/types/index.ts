export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: string;
        username: string;
    };
}

export interface User {
    id: string;
    username: string;
    password: string;
    email?: string;
}