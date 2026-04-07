import { useState, type FormEvent, type ChangeEvent } from 'react';
import { MessageCircle, User as UserIcon } from 'lucide-react';
import type { LoginProps } from '../types';

/**
 * 登录组件
 * 允许用户输入用户名加入聊天室
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
      setError('请输入用户名');
      return;
    }

    if (username.length < 2) {
      setError('用户名至少需要2个字符');
      return;
    }

    if (username.length > 20) {
      setError('用户名不能超过20个字符');
      return;
    }

    setIsLoading(true);

    try {
      // 调用父组件的登录回调
      await onLogin(username.trim());
    } catch {
      setError('登录失败，请重试');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <MessageCircle
            size={48}
            className="mx-auto mb-4 text-primary"
          />
          <h1 className="text-2xl font-bold text-gray-800">ChatReal</h1>
          <p className="text-gray-500 mt-1">实时协作聊天室</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="sr-only">
              用户名
            </label>
            <div className="relative">
              <UserIcon
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                id="username"
                type="text"
                className="input w-full pl-12"
                placeholder="请输入用户名"
                value={username}
                onChange={handleChange}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? '加入中...' : '加入聊天'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;