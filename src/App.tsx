import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { Header } from './components/Header';
import { Explore } from './components/Explore';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'feed' | 'profile' | 'search'>('feed');
  const [viewingUsername, setViewingUsername] = useState<string | undefined>();

  const handleViewProfile = (username: string) => {
    setViewingUsername(username);
    setCurrentView('profile');
  };

  const handleNavigate = (view: 'feed' | 'profile' | 'search') => {
    setCurrentView(view);
    if (view === 'profile') {
      setViewingUsername(undefined);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        {currentView === 'feed' && <Feed />}
        {currentView === 'profile' && <Profile username={viewingUsername} />}
        {currentView === 'search' && <Explore onViewProfile={handleViewProfile} />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
