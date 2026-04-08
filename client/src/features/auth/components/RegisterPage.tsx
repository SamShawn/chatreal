import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { Button, Input } from '../../../components/ui';
import { MessageCircle, Moon, Sun, Mail, Lock, User } from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export function RegisterPage({ onNavigateToLogin }: RegisterPageProps): JSX.Element {
  const { register, isLoading, error } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    } else if (username.length > 30) {
      newErrors.username = 'Username must be at most 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await register(email, username, password);
    } catch {
      // Error is handled by auth provider
    }
  };

  const handleChange = (setter: (value: string) => void, field: keyof typeof errors) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setter(e.target.value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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
            <p className="text-secondary mt-1">Create your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={handleChange(setEmail, 'email')}
                error={errors.email}
                className="pl-10"
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleChange(setUsername, 'username')}
                error={errors.username}
                className="pl-10"
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handleChange(setPassword, 'password')}
                error={errors.password}
                className="pl-10"
                autoComplete="new-password"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={handleChange(setConfirmPassword, 'confirmPassword')}
                error={errors.confirmPassword}
                className="pl-10"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-sm text-secondary">
            Already have an account?{' '}
            <button
              onClick={onNavigateToLogin}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/50 mt-6">
          By creating an account, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
