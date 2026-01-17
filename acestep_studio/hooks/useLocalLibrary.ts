import { useState, useEffect, useCallback } from "react";
import { getHistory, deleteLocalFile, renameLocalFile, getTrackMetadata, starTrack } from "@/utils/api";
import { useStudioStore } from "@/utils/store";

export function useLocalLibrary() {
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // We listen to global refresh triggers if any (optional)

    const loadFiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getHistory();
            setFiles(Array.isArray(res?.files) ? res.files : []);
        } catch (e) {
            console.error(e);
            setError("Failed to load local files");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const deleteFile = async (filename: string) => {
        try {
            await deleteLocalFile(filename);
            setFiles(prev => prev.filter(f => f !== filename));
        } catch (e: any) {
            throw new Error(e.message || "Delete failed");
        }
    };

    const renameFile = async (filename: string, newName: string) => {
        try {
            await renameLocalFile(filename, newName);
            await loadFiles(); // Reload to get correct sort order if changed
        } catch (e: any) {
            throw new Error(e.message || "Rename failed");
        }
    };

    const starFile = async (filename: string) => {
        try {
            // Updated to use dynamic API
            await starTrack(filename);
        } catch (e: any) {
            throw new Error(e.message || "Star failed");
        }
    };

    return {
        files,
        loading,
        error,
        refresh: loadFiles,
        deleteFile,
        renameFile,
        starFile
    };
}
