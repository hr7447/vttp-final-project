export interface LoginRequest {
    username: string;
    password: string;
}

export interface JwtResponse {
    token: string;
    type: string;
    id: number;
    username: string;
    email: string;
} 