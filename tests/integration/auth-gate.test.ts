import { describe, it, expect, vi, beforeEach } from 'vitest';
const mockGetSession = vi.fn();

vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    api: {
      getSession: (...args: any[]) => mockGetSession(...args),
    },
  })),
}));

vi.mock('better-auth/adapters/mongodb', () => ({
  mongodbAdapter: vi.fn(),
}));

vi.mock('mongodb', () => {
  return {
    MongoClient: class {
      db() {
        return {};
      }
    },
  };
});

import { withAuth, withRole } from '@/lib/auth';

describe('Auth & Role API Route Gate (lib/auth.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests with 401 Unauthorized', async () => {
    mockGetSession.mockResolvedValue(null as any);

    const req = new Request('http://localhost:3000/api/protected');
    const handler = vi.fn();

    const response = await withAuth(req, handler);
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
    expect(handler).not.toHaveBeenCalled();
  });

  it('rejects requests from disabled accounts with 403 Forbidden', async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: 'usr_disabled',
        email: 'disabled@test.com',
        emailVerified: true,
        disabled: true,
      },
      session: { id: 'sess_1' },
    } as any);

    const req = new Request('http://localhost:3000/api/protected', {
      headers: { cookie: 'session_token=disabled_tok' },
    });
    const handler = vi.fn();

    const response = await withAuth(req, handler);
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.error.code).toBe('FORBIDDEN');
    expect(handler).not.toHaveBeenCalled();
  });

  it('allows authenticated users to execute handler', async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: 'usr_active',
        email: 'student@test.com',
        emailVerified: true,
        disabled: false,
        role: 'user',
      },
      session: { id: 'sess_2' },
    } as any);

    const req = new Request('http://localhost:3000/api/protected', {
      headers: { cookie: 'session_token=active_tok' },
    });
    const handler = vi.fn().mockResolvedValue({ success: true, data: 'hello' });

    const response = await withAuth(req, handler);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ success: true, data: 'hello' });
    expect(handler).toHaveBeenCalledWith({ userId: 'usr_active', role: 'user' });
  });

  it('enforces withRole("admin") by rejecting non-admin users with 403', async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: 'usr_regular',
        email: 'regular@test.com',
        emailVerified: true,
        role: 'user',
      },
      session: { id: 'sess_3' },
    } as any);

    const req = new Request('http://localhost:3000/api/admin/only', {
      headers: { cookie: 'session_token=regular_tok' },
    });
    const handler = vi.fn();

    const response = await withRole(req, 'admin', handler);
    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it('allows admin users through withRole("admin")', async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: 'usr_admin',
        email: 'admin@test.com',
        emailVerified: true,
        role: 'admin',
      },
      session: { id: 'sess_4' },
    } as any);

    const req = new Request('http://localhost:3000/api/admin/only', {
      headers: { cookie: 'session_token=admin_tok' },
    });
    const handler = vi.fn().mockResolvedValue({ adminSuccess: true });

    const response = await withRole(req, 'admin', handler);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.adminSuccess).toBe(true);
    expect(handler).toHaveBeenCalledWith({ userId: 'usr_admin', role: 'admin' });
  });
});
