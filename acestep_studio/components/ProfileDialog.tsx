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

    // Local state for inputs to allow editing
    const [username, setUsername] = useState(profile?.username || '');
    const [website, setWebsite] = useState(profile?.website || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Sync state when profile loads
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
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Centered Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>

                    <h2 className="text-xl font-bold mb-6">Edit Profile</h2>

                    <div className="flex flex-col gap-6">
                        {/* Avatar Section - Using explicit Z-index and Colors for Pencil Visibility */}
                        <div className="flex items-center gap-6">
                            <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                                <Avatar url={profile?.avatar_url} size={80} alt={username || "User"} />

                                {/* Pencil Button: Z-50, Blue, Absolute positioning */}
                                <div className="absolute -bottom-1 -right-1 z-50">
                                    <button
                                        type="button"
                                        className="p-2 bg-blue-600 text-white rounded-full shadow-xl border-2 border-black hover:bg-blue-500 transition-transform hover:scale-110 flex items-center justify-center"
                                        title="Change Photo"
                                    >
                                        <Pencil size={14} className="stroke-2" />
                                    </button>
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-40">
                                    <Upload size={20} className="text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{username || "User"}</h3>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2"
                                >
                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : "Change profile photo"}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Recommended: Square JPG, PNG. Max 2MB.
                                </p>
                            </div>
                        </div>

                        {/* Fields */}
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
                                    placeholder="https://opentunes.ai"
                                />
                            </div>
                        </div>

                        {/* Actions */}
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
