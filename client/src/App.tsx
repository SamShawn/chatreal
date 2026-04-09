import { ThemeProvider } from './app/providers/ThemeProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { SocketProvider } from './app/providers/SocketProvider';
import { useAuth } from './app/providers/AuthProvider';
import { LoginPage } from './features/auth/components/LoginPage';
import { RegisterPage } from './features/auth/components/RegisterPage';
import { ChatLayout } from './features/chat/components/ChatLayout';
import { useState } from 'react';

type Page = 'login' | 'register' | 'chat';

function AppContent(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(isAuthenticated ? 'chat' : 'login');

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-10 h-10" />
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {currentPage === 'login' && (
          <LoginPage onNavigateToRegister={() => setCurrentPage('register')} />
        )}
        {currentPage === 'register' && (
          <RegisterPage onNavigateToLogin={() => setCurrentPage('login')} />
        )}
      </>
    );
  }

  return <ChatLayout />;
}

function App(): JSX.Element {
  return <AppContent />
  // return (
  //   <ThemeProvider>
  //     <AuthProvider>
  //       <SocketProvider>
  //         <AppContent />
  //       </SocketProvider>
  //     </AuthProvider>
  //   </ThemeProvider>
  // );
}

export default App;
