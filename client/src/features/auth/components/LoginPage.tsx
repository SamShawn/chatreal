import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { Button, Input } from '../../../components/ui';
import { MessageCircle, Moon, Sun, Mail, Lock } from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister: () => void;
}

export function LoginPage({ onNavigateToRegister }: LoginPageProps): JSX.Element {
  const { login, isLoading, error } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await login(email, password);
    } catch {
      // Error is handled by auth provider
    }
  };

  const handleChange = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    // Clear error when user types
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-0 right-0 p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={20} className="text-white/70" />
          ) : (
            <Moon size={20} className="text-white/70" />
          )}
        </button>

        <div className="card p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center mb-4 shadow-lg">
              <MessageCircle size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary">ChatReal</h1>
            <p className="text-secondary mt-1">Enterprise Real-time Collaboration</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={handleChange(setEmail)}
                error={errors.email}
                className="pl-10"
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handleChange(setPassword)}
                error={errors.password}
                className="pl-10"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center text-sm text-secondary">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToRegister}
              className="text-primary font-medium hover:underline"
            >
              Create one
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/50 mt-6">
          Secure enterprise communication platform
        </p>
      </div>
    </div>
  );
}
