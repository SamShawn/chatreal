import React, { useState } from 'react';
import { MessageCircle, User as UserIcon } from 'lucide-react';
import '../styles/App.css';

/**
 * 登录组件
 * 允许用户输入用户名加入聊天室
 */
function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 处理登录提交
   */
  const handleSubmit = async (e) => {
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
    } catch (err) {
      setError('登录失败，请重试');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理输入变化
   */
  const handleChange = (e) => {
    setUsername(e.target.value);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <MessageCircle
            size={48}
            className="login-icon"
            style={{
              color: 'var(--primary-color)',
              marginBottom: 'var(--spacing-md)'
            }}
          />
          <h1 className="login-title">ChatReal</h1>
          <p className="login-subtitle">实时协作聊天室</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" style={{ display: 'none' }}>
              用户名
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon
                size={20}
                style={{
                  position: 'absolute',
                  left: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                id="username"
                type="text"
                className="login-input"
                placeholder="请输入用户名"
                value={username}
                onChange={handleChange}
                disabled={isLoading}
                style={{ paddingLeft: '48px' }}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="error-message" style={{ textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary login-btn"
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
