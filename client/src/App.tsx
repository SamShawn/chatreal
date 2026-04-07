import { useState, useEffect } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';
import socketService from './services/socket';
import { useAuthStore } from './store/authStore';
import type { User } from './types';

/**
 * 主应用组件
 * 管理应用状态和路由
 */
function App() {
  const { user, setUser, logout } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * 初始化应用
   */
  useEffect(() => {
    // 检查是否有保存的用户会话（可选）- 使用 Zustand persist
    const savedUser = localStorage.getItem('chatreal-auth');
    if (!savedUser) {
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
  }, []);

  /**
   * 处理登录
   */
  const handleLogin = async (username: string): Promise<User> => {
    // 生成稳定的用户 ID
    const stableUserId = `user_${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

    // 生成用户数据
    const userData: User = {
      id: stableUserId,
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
    };

    // 保存用户会话 (Zustand persist 会自动处理)
    setUser(userData);

    return userData;
  };

  /**
   * 处理登出
   */
  const handleLogout = () => {
    // 断开 socket 连接
    socketService.disconnect();

    // 清除用户会话
    logout();
  };

  if (!isInitialized) {
    return (
      <div className="loading-overlay">
        <div className="loading w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="app">
      {user ? (
        <Chat user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;