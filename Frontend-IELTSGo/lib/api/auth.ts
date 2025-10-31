import { apiClient } from "./apiClient"
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  GoogleAuthResponse,
  ErrorData
} from "@/types"

export const authApi = {
  // Login with email/password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials)
    return response.data
  },

  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data)
    return response.data
  },

  // Logout
  logout: async (): Promise<void> => {
    // Get refresh token from localStorage
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      // If no refresh token, just return (already logged out or never had one)
      return
    }
    await apiClient.post("/auth/logout", {
      refresh_token: refreshToken,
    })
  },

  // Validate token (check if user is authenticated)
  validateToken: async (): Promise<{ success: boolean; data?: { valid: boolean } }> => {
    const response = await apiClient.get("/auth/validate")
    return response.data
  },

  // Change password (requires authentication)
  changePassword: async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post("/auth/change-password", {
      old_password: oldPassword,
      new_password: newPassword,
    })
    return response.data
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    })
    return response.data
  },

  // ============= Google OAuth =============
  
  // Get Google OAuth URL (for web or mobile)
  getGoogleOAuthUrl: async (): Promise<GoogleAuthResponse> => {
    const response = await apiClient.get<GoogleAuthResponse>("/auth/google/url")
    return response.data
  },

  // Exchange Google authorization code for tokens (mobile flow)
  googleExchangeToken: async (code: string, state?: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/google/token", {
      code,
      state,
    })
    return response.data
  },

  // ============= Password Reset =============
  
  // Request password reset (sends 6-digit code to email)
  forgotPassword: async (email: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post("/auth/forgot-password", { email })
    return response.data
  },

  // Reset password using 6-digit code
  resetPasswordByCode: async (code: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post("/auth/reset-password-by-code", {
      code,
      new_password: newPassword,
    })
    return response.data
  },

  // ============= Email Verification =============
  
  // Verify email using 6-digit code
  verifyEmailByCode: async (code: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post("/auth/verify-email-by-code", { code })
    return response.data
  },

  // Resend verification email (sends new 6-digit code)
  resendVerification: async (email: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post("/auth/resend-verification", { email })
    return response.data
  },
}
