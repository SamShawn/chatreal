import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';
import socketService from './services/socket';
import './styles/global.css';
import './styles/App.css';

/**
 * 主应用组件
 * 管理应用状态和路由
 */
function App() {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * 初始化应用
   */
  useEffect(() => {
    // 检查是否有保存的用户会话（可选）
    const savedUser = localStorage.getItem('chatRealUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('chatRealUser');
      }
    }
    setIsInitialized(true);
  }, []);

  /**
   * 处理登录
   */
  const handleLogin = async (username) => {
    // 生成用户数据
    const userData = {
      userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    };

    // 保存用户会话
    localStorage.setItem('chatRealUser', JSON.stringify(userData));
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
    localStorage.removeItem('chatRealUser');
    setUser(null);
  };

  if (!isInitialized) {
    return (
      <div className="loading-overlay">
        <div className="loading" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="app">
      {user ? <Chat user={user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
    </div>
  );
}

export default App;
