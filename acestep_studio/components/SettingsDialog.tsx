import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sliders, Eye, Volume2, Save, Monitor } from 'lucide-react';
import { useStore } from '../utils/store';

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
    const { settings, updateSettings } = useStore();
    const [activeTab, setActiveTab] = useState<"general" | "appearance">("general");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto font-sans text-white">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Scrollable Container */}
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Modal */}
                <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[80vh] md:max-h-[600px]">

                    {/* Close Button Mobile */}
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden z-10">
                        <X size={20} />
                    </button>

                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-black/40 border-b md:border-b-0 md:border-r border-white/10 p-4 flex flex-row md:flex-col gap-2 shrink-0">
                        <h2 className="text-xl font-bold mb-4 hidden md:block px-2 text-white">Settings</h2>

                        <button
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <Sliders size={18} />
                            General
                        </button>

                        <button
                            onClick={() => setActiveTab('appearance')}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'appearance' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <Eye size={18} />
                            Appearance
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-zinc-900 text-white">
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-lg font-bold mb-1">Studio Defaults</h3>
                                    <p className="text-sm text-gray-400 mb-6">Set your preferred generation parameters.</p>

                                    <div className="space-y-4">
                                        {/* Default Format */}
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded bg-blue-500/20 text-blue-400"><Volume2 size={20} /></div>
                                                <div>
                                                    <p className="text-sm font-bold">Default Format</p>
                                                    <p className="text-xs text-gray-400">Audio file type for downloads</p>
                                                </div>
                                            </div>
                                            <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                                                <button
                                                    onClick={() => updateSettings({ defaultFormat: 'mp3' })}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${settings.defaultFormat === 'mp3' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    MP3
                                                </button>
                                                <button
                                                    onClick={() => updateSettings({ defaultFormat: 'wav' })}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${settings.defaultFormat === 'wav' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    WAV
                                                </button>
                                            </div>
                                        </div>

                                        {/* Console Visibility */}
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded bg-green-500/20 text-green-400"><Monitor size={20} /></div>
                                                <div>
                                                    <p className="text-sm font-bold">Console Visibility</p>
                                                    <p className="text-xs text-gray-400">Show detailed logs always</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked disabled />
                                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-green-600 opacity-50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                            </label>
                                        </div>

                                        {/* Auto-Save */}
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded bg-purple-500/20 text-purple-400"><Save size={20} /></div>
                                                <div>
                                                    <p className="text-sm font-bold">Auto-Save Projects</p>
                                                    <p className="text-xs text-gray-400">Save prompt history automatically</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={settings.autoSave}
                                                    onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-lg font-bold mb-1">Interface</h3>
                                    <p className="text-sm text-gray-400 mb-6">Customize the look and feel of the studio.</p>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5">
                                            <div>
                                                <p className="text-sm font-bold">Reduced Motion</p>
                                                <p className="text-xs text-gray-400">Disable heavy animations</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={settings.reducedMotion}
                                                    onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
