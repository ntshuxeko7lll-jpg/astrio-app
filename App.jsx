import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { ToastProvider } from './components/Toast'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import AuthScreen from './screens/AuthScreen'
import FeedScreen from './screens/FeedScreen'
import CreateScreen from './screens/CreateScreen'
import ChatScreen from './screens/ChatScreen'
import ProfileScreen from './screens/ProfileScreen'
import DiscoverScreen from './screens/DiscoverScreen'
import NotificationsScreen from './screens/NotificationsScreen'
import { useNotifications } from './hooks/useNotifications'

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}

function AppInner() {
  const { session, profile, signUp, signIn, signOut } = useAuth()
  const [tab, setTab]       = useState('feed')
  const [overlay, setOverlay] = useState(null) // 'discover' | 'notifications' | null

  const { unreadCount } = useNotifications(session?.user?.id)

  // Auth still resolving
  if (session === undefined) return <Splash />

  // Not logged in — show auth, but still render feed overlay beneath
  if (!session) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <AuthScreen
          onAuth={async (mode, email, password, username) => {
            if (mode === 'login') await signIn(email, password)
            else await signUp(email, password, username)
          }}
        />
      </div>
    )
  }

  function handleTabChange(newTab) {
    setOverlay(null) // close overlays when switching main tabs
    setTab(newTab)
  }

  function renderScreen() {
    if (overlay === 'discover')      return <DiscoverScreen userId={session.user.id} />
    if (overlay === 'notifications') return <NotificationsScreen userId={session.user.id} />

    switch (tab) {
      case 'feed':
        return <FeedScreen userId={session.user.id} />
      case 'create':
        return <CreateScreen userId={session.user.id} onPostSuccess={() => setTab('feed')} />
      case 'chat':
        return <ChatScreen userId={session.user.id} />
      case 'profile':
        return <ProfileScreen session={session} profile={profile} onSignOut={signOut} />
      default:
        return <FeedScreen userId={session.user.id} />
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        onDiscoverClick={() => setOverlay(prev => prev === 'discover' ? null : 'discover')}
        onNotifClick={() => setOverlay(prev => prev === 'notifications' ? null : 'notifications')}
        unreadCount={unreadCount}
      />

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderScreen()}
      </div>

      <BottomNav
        tab={overlay ? null : tab}
        onChange={handleTabChange}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function Splash() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 48, fontWeight: 800,
        color: 'var(--accent)', letterSpacing: '-2px',
      }}>
        astrio
      </div>
      <div style={{
        width: 32, height: 32,
        border: '2px solid var(--bg3)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
