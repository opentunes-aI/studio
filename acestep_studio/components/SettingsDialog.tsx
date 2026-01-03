import { useState } from 'react';
import { X, Sliders, Eye, Volume2, Save, Monitor } from 'lucide-react';
import { useStore } from '../utils/store';

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
    const { settings, updateSettings } = useStore();
    const [activeTab, setActiveTab] = useState<"general" | "appearance">("general");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row h-[500px]">

                {/* Close Button Mobile */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden z-10">
                    <X size={20} />
                </button>

                {/* Sidebar */}
                <div className="w-full md:w-64 bg-secondary/30 border-b md:border-b-0 md:border-r border-white/10 p-4 flex flex-row md:flex-col gap-2 shrink-0">
                    <h2 className="text-xl font-bold mb-4 hidden md:block px-2">Settings</h2>

                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-primary/20 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Sliders size={18} />
                        General
                    </button>

                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'appearance' ? 'bg-primary/20 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Eye size={18} />
                        Appearance
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-card">
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-lg font-bold mb-1">Studio Defaults</h3>
                                <p className="text-sm text-muted-foreground mb-4">Set your preferred generation parameters.</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-secondary/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded bg-blue-500/20 text-blue-400"><Volume2 size={16} /></div>
                                            <div>
                                                <p className="text-sm font-medium">Default Format</p>
                                            </div>
                                        </div>
                                        <div className="flex bg-black/40 rounded-lg p-1">
                                            <button
                                                onClick={() => updateSettings({ defaultFormat: 'mp3' })}
                                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${settings.defaultFormat === 'mp3' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                MP3
                                            </button>
                                            <button
                                                onClick={() => updateSettings({ defaultFormat: 'wav' })}
                                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${settings.defaultFormat === 'wav' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                WAV
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-secondary/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded bg-green-500/20 text-green-400"><Monitor size={16} /></div>
                                            <div>
                                                <p className="text-sm font-medium">Console Visibility</p>
                                                <p className="text-xs text-muted-foreground">Detailed generation logs</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={true} disabled />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 opacity-50 cursor-not-allowed"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-secondary/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded bg-purple-500/20 text-purple-400"><Save size={16} /></div>
                                            <div>
                                                <p className="text-sm font-medium">Auto-Save Projects</p>
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
                                <p className="text-sm text-muted-foreground mb-4">Customize the look and feel of the studio.</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-secondary/20">
                                        <div>
                                            <p className="text-sm font-medium">Reduced Motion</p>
                                            <p className="text-xs text-muted-foreground">Disable shimmer effects and heavy animations</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={settings.reducedMotion}
                                                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-0 right-0 p-6 md:p-8 pointer-events-none">
                    <button onClick={onClose} className="pointer-events-auto px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors shadow-lg">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
