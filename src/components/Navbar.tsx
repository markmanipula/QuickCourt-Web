'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { LogOut, User, Menu, X, Bell, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (authLoading || !user) { setUnreadCount(0); return; }
    const q = query(collection(db, 'notifications'), where('recipientUid', '==', user.uid));
    const unsubNotif = onSnapshot(q, snap => {
      const allIds = snap.docs.map(d => d.id);
      const userRef = doc(db, 'users', user.uid);
      const unsubUser = onSnapshot(userRef, userSnap => {
        const userData = userSnap.data();
        const read = new Set([...(userData?.readNotifications ?? []), ...(userData?.dismissedNotifications ?? [])]);
        setUnreadCount(allIds.filter(id => !read.has(id)).length);
      });
      return unsubUser;
    });
    return () => unsubNotif();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navLink = (href: string, label: string) => (
    <Link href={href} className={`font-medium transition-colors ${pathname === href || pathname.startsWith(href + '/') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.png" alt="QuickCourt" className="h-9 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLink('/events', 'Events')}
          {navLink('/leagues', 'Leagues')}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/events/create"
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <Plus size={15} /> Event
              </Link>
              <Link href="/leagues/create"
                className="flex items-center gap-1.5 border border-blue-600 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                <Plus size={15} /> League
              </Link>
              <Link href="/notifications" className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                <User size={18} />
                {user.displayName?.split(' ')[0] ?? 'Profile'}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Log in</Link>
              <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/events" className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Events</Link>
          <Link href="/leagues" className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Leagues</Link>
          {user ? (
            <>
              <Link href="/events/create" className="text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>+ Create Event</Link>
              <Link href="/leagues/create" className="text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>+ Create League</Link>
              <Link href="/notifications" className="flex items-center gap-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
                Notifications {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              </Link>
              <Link href="/profile" className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="text-left text-red-500 font-medium">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link href="/signup" className="text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
