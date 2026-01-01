export function getSongGradient(id: string) {
    if (!id) return { backgroundImage: 'linear-gradient(to bottom right, #374151, #111827)' };

    // Simple hash to generate consistent colors
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use HSL for vibrant colors
    const h1 = Math.abs(hash % 360);
    const h2 = Math.abs((hash >> 8) % 360);

    const c1 = `hsl(${h1}, 70%, 40%)`;
    const c2 = `hsl(${h2}, 80%, 15%)`;

    return { backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})` };
}

export function getGenreIcon(prompt: string) {
    const p = (prompt || "").toLowerCase();
    if (p.includes("rock") || p.includes("metal")) return "🎸";
    if (p.includes("piano") || p.includes("classical")) return "🎹";
    if (p.includes("techno") || p.includes("electronic") || p.includes("synth")) return "🎛️";
    if (p.includes("jazz") || p.includes("blues")) return "🎷";
    if (p.includes("hip hop") || p.includes("rap")) return "🎤";
    if (p.includes("acoustic") || p.includes("folk")) return "🪵";
    if (p.includes("lofi") || p.includes("chill")) return "☕";
    return "🎵";
}
