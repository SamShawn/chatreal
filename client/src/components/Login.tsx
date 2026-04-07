import { useState, type FormEvent, type ChangeEvent } from 'react';
import { User as UserIcon } from 'lucide-react';
import type { LoginProps } from '../types';

/**
 * 登录组件 - 粗野主义风格
 * 裸露结构 + 硬朗线条 + 高对比度
 */
function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 处理登录提交
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证用户名
    if (!username.trim()) {
      setError('REQUIRED');
      return;
    }

    if (username.length < 2) {
      setError('MIN 2 CHARS');
      return;
    }

    if (username.length > 20) {
      setError('MAX 20 CHARS');
      return;
    }

    setIsLoading(true);

    try {
      await onLogin(username.trim());
    } catch {
      setError('ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理输入变化
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="text-center mb-8">
          {/* 粗野主义：使用纯文本标题替代图标 */}
          <h1 className="login-title">CHAT_REAL</h1>
          <p className="login-subtitle">[ REAL_TIME_CHAT ]</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="sr-only">
              USERNAME
            </label>
            <div className="relative">
              <UserIcon
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="username"
                type="text"
                className="input pl-12"
                placeholder="ENTER USERNAME"
                value={username}
                onChange={handleChange}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {/* 错误提示 - 粗野主义大写风格 */}
          {error && (
            <p className="error-message text-center mt-3">
              [!] {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'CONNECTING...' : 'JOIN CHAT'}
          </button>
        </form>

        {/* 底部装饰线条 */}
        <div className="mt-8 pt-4 border-t-2 border-solid" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-xs text-center font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>
            STATUS: ONLINE
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;