export interface User {
    username: string;
    email: string;
    phone?: string;
    subject: string;
    roles: string;
    authenticated: boolean;
}
