import { apiClient } from './client'

export interface ApiUser {
  id: number
  email: string
  full_name: string
  avatar_url?: string | null
  language_code: 'en' | 'hi'
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: 'bearer'
  user: ApiUser
}

export interface SignupInput {
  email: string
  password: string
  full_name: string
}

export interface LoginInput {
  user?: string
  username?: string
  email?: string
  password: string
}

export async function login(input: LoginInput) {
  const payload = {
    user: input.user || input.username || input.email,
    email: input.email || input.user || input.username,
    password: input.password,
  }
  const response = await apiClient.post<AuthResponse>('/auth/login', payload)
  return response.data
}


export async function signup(input: SignupInput) {
  const response = await apiClient.post<AuthResponse>('/auth/signup', input)
  return response.data
}

export async function getCurrentUser() {
  const response = await apiClient.get<ApiUser>('/users/me')
  return response.data
}

export async function logout() {
  await apiClient.post('/auth/logout')
}
