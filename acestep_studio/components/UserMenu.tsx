import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useStore } from '../utils/store';
import { supabase } from '../utils/supabase';
import { useProfile } from '../utils/useProfile';
import Avatar from './Avatar';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';

export default function UserMenu() {
    const { session } = useStore();
    const { profile } = useProfile();
    const [isOpen, setIsOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await supabase!.auth.signOut();
        // window.location.reload(); // handled by onAuthStateChange usually
    };

    if (!session) return null;

    const displayName = profile?.username || profile?.full_name || session.user.email?.split('@')[0] || "User";

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
            >
                <Avatar url={profile?.avatar_url} alt={displayName} size={32} />
                <span className="text-sm font-medium max-w-[100px] truncate hidden md:block group-hover:text-white transition-colors">
                    {displayName}
                </span>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-xs text-muted-foreground">Signed in as</p>
                        <p className="text-sm font-bold truncate text-white">{session.user.email}</p>
                    </div>

                    <button
                        onClick={() => { setShowProfile(true); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                        <User size={16} className="text-purple-400" />
                        Edit Profile
                    </button>

                    <button
                        onClick={() => { setShowSettings(true); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                        <Settings size={16} className="text-gray-400" />
                        Settings
                    </button>

                    <div className="h-px bg-white/5 my-1" />

                    <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-500/10 text-red-400 flex items-center gap-2 transition-colors"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            )}

            <ProfileDialog isOpen={showProfile} onClose={() => setShowProfile(false)} />
            <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    );
}
