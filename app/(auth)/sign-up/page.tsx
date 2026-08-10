'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Code2, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (signUpError) {
      setError(signUpError.message || 'An error occurred during registration.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background blobs for visual flair matching the stunning theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[100px] pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
            <Code2 className="h-7 w-7" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Join PlacementDeck to supercharge your prep.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold pl-1">Name</label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="h-12 bg-background/50 border-muted focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold pl-1">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                className="h-12 bg-background/50 border-muted focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold pl-1">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 bg-background/50 border-muted focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {loading ? 'Creating account...' : 'Sign Up'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
