import { NextRequest } from 'next/server';
import { GET } from './app/api/problems/route';
import { Session } from 'better-auth/types';

// Mock the API request
async function test() {
  const req = new NextRequest('http://localhost:3000/api/problems?kind=pattern&pattern=Sliding%20Window', {
    headers: {
      'cookie': 'better-auth.session_token=dummy'
    }
  });
  
  // We need to bypass auth or mock it. The easiest way is to mock withAuth in lib/auth.ts
}
