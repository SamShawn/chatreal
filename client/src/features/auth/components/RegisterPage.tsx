import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button, Input } from '../../../components/ui';
import { MessageCircle, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export function RegisterPage({ onNavigateToLogin }: RegisterPageProps): JSX.Element {
  const { register, isLoading, error } = useAuth();

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

  const handleChange =
    (setter: (value: string) => void, errorKey: keyof typeof errors) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (errors[errorKey]) {
        setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
      }
    };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-base)' }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full blur-[120px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            animationDuration: '8s',
          }}
        />
        <div
          className="absolute -bottom-[30%] -left-[20%] w-[70%] h-[70%] rounded-full blur-[100px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            animationDuration: '10s',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute top-[60%] left-[10%] w-[40%] h-[40%] rounded-full blur-[80px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
            animationDuration: '12s',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-text-muted) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-text-muted) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Auth card */}
      <div
        className="relative w-full max-w-[420px] mx-4 animate-slide-up"
        style={{ animationDuration: 'var(--duration-slow)' }}
      >
        <div
          className="glass rounded-[var(--radius-xl)] p-8"
          style={{ borderRadius: 'var(--radius-xl)' }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-[var(--radius-lg)] flex items-center justify-center mb-5"
              style={{
                background: 'var(--color-accent-gradient)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <MessageCircle size={32} className="text-white" />
            </div>
            <h1
              className="font-bold mb-2"
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
              }}
            >
              Create Account
            </h1>
            <p
              className="text-center"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Join ChatReal for enterprise collaboration
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={handleChange(setEmail, 'email')}
                error={errors.email}
                className="pl-11"
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleChange(setUsername, 'username')}
                error={errors.username}
                className="pl-11"
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handleChange(setPassword, 'password')}
                error={errors.password}
                className="pl-11"
                autoComplete="new-password"
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={handleChange(setConfirmPassword, 'confirmPassword')}
                error={errors.confirmPassword}
                className="pl-11"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div
                className="p-3 rounded-[var(--radius-md)] text-sm"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-error)',
                }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
            >
              Create Account
            </Button>
          </form>

          {/* Login link */}
          <div
            className="mt-6 text-center text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Already have an account?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-medium transition-colors hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: 'var(--color-text-muted)' }}
        >
          By creating an account, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
