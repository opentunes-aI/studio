import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Loader2, Save, Pencil } from 'lucide-react';
import { useProfile } from '../utils/useProfile';
import Avatar from './Avatar';

interface ProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
    const { profile, loading, updateProfile, uploadAvatar } = useProfile();
    const [uploading, setUploading] = useState(false);

    // Local state
    const [username, setUsername] = useState(profile?.username || '');
    const [website, setWebsite] = useState(profile?.website || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Sync state
    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setWebsite(profile.website || '');
        }
    }, [profile, isOpen]);

    if (!isOpen || !mounted) return null;

    async function handleSave() {
        await updateProfile({ username, website });
        onClose();
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;
        try {
            setUploading(true);
            const file = e.target.files[0];
            const publicUrl = await uploadAvatar(file);
            if (publicUrl) {
                await updateProfile({ avatar_url: publicUrl });
            }
        } finally {
            setUploading(false);
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] font-sans text-white">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>

                    <h2 className="text-xl font-bold mb-6">Edit Profile</h2>

                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-6">
                            {/* Avatar Display */}
                            <div className="shrink-0">
                                <Avatar url={profile?.avatar_url} size={84} alt={username || "User"} />
                            </div>

                            {/* Explicit Edit Controls */}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-2">{username || "User"}</h3>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-black hover:bg-gray-200 rounded-md text-sm font-bold transition-colors mb-1"
                                >
                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
                                    {uploading ? "Uploading..." : "Edit Photo"}
                                </button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    JPG, PNG. Max 2MB.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-muted-foreground font-bold mb-1">Username</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-muted-foreground">@</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                        placeholder="username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-muted-foreground font-bold mb-1">Website</label>
                                <input
                                    type="text"
                                    value={website}
                                    onChange={e => setWebsite(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="https://"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-2">
                            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 rounded-lg text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
