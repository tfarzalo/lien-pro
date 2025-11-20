import { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError(error.message);
        } else {
            // Check for redirect after login
            const redirectTo = sessionStorage.getItem('redirectAfterLogin');
            if (redirectTo) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(redirectTo);
            } else {
                navigate('/dashboard');
            }
        }
        setIsSubmitting(false);
    };

    const handleSignup = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            setError(error.message);
        } else {
            alert('Check your email for the confirmation link!');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            {/* Logo */}
            <div className="mb-8">
                <img src="https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lien-professor-full-logo.png" alt="Lien Professor" className="h-16 w-auto" />
            </div>
            
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome to Lien Professor</CardTitle>
                    <CardDescription>Sign in or create an account to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <Button onClick={handleLogin} disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'Signing In...' : 'Sign In'}
                            </Button>
                            <Button onClick={handleSignup} disabled={isSubmitting} variant="outline" className="w-full">
                                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthPage;
