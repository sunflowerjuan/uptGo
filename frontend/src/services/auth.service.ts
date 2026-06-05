import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { apiFetch, backendUrl } from './api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  program: string | null;
  semester: string | null;
  initials: string | null;
  provider: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  program?: string;
  semester?: string;
}

interface ChallengeResponse {
  challengeToken: string;
  options: Record<string, unknown>;
}

export const authService = {
  login(email: string, password: string): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(data: RegisterData): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe(): Promise<UserProfile> {
    return apiFetch<UserProfile>('/auth/me');
  },

  loginWithGoogle(): void {
    window.location.href = `${backendUrl}/api/auth/google`;
  },

  async loginWithWebAuthn(email: string): Promise<AuthResponse> {
    const { challengeToken, options } = await apiFetch<ChallengeResponse>(
      '/auth/webauthn/login/begin',
      { method: 'POST', body: JSON.stringify({ email }) },
    );

    const credential = await startAuthentication({
      optionsJSON: options as unknown as Parameters<typeof startAuthentication>[0]['optionsJSON'],
    });

    return apiFetch<AuthResponse>('/auth/webauthn/login/complete', {
      method: 'POST',
      body: JSON.stringify({ email, challengeToken, credential }),
    });
  },

  async registerWebAuthn(): Promise<void> {
    const { challengeToken, options } = await apiFetch<ChallengeResponse>(
      '/auth/webauthn/register/begin',
      { method: 'POST' },
    );

    const credential = await startRegistration({
      optionsJSON: options as unknown as Parameters<typeof startRegistration>[0]['optionsJSON'],
    });

    await apiFetch<void>('/auth/webauthn/register/complete', {
      method: 'POST',
      body: JSON.stringify({ challengeToken, credential }),
    });
  },

  updateProfile(data: { name?: string; program?: string; semester?: string }): Promise<UserProfile> {
    return apiFetch<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
