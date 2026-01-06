import { ImageResponse } from 'next/og';
import { supabase } from '@/utils/supabase';

export const runtime = 'edge';

export const alt = 'Opentunes Song Cover';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
    let title = "Opentunes Track";
    let prompt = "AI Generated Music";

    if (supabase) {
        try {
            const { data } = await supabase.from('songs').select('title, prompt').eq('id', params.id).single();
            if (data) {
                title = data.title || "Untitled";
                prompt = data.prompt || "AI Generated Music";
            }
        } catch (e) {
            console.error(e);
        }
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(to bottom right, #09090b, #1e1b4b)', // zinc-950 to indigo-950
                    color: 'white',
                }}
            >
                {/* Background Elements */}
                <div style={{
                    position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%',
                    background: '#7c3aed', opacity: 0.2, filter: 'blur(100px)', borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%',
                    background: '#06b6d4', opacity: 0.2, filter: 'blur(100px)', borderRadius: '50%'
                }} />

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, zIndex: 10 }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                    </svg>
                    <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>Opentunes</span>
                </div>

                {/* Title */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '85%', zIndex: 10 }}>
                    <h1 style={{
                        fontSize: 80,
                        fontWeight: 800,
                        margin: 0,
                        lineHeight: 1.1,
                        fontFamily: 'sans-serif',
                        textShadow: '0 0 40px rgba(255,255,255,0.2)'
                    }}>
                        {title}
                    </h1>
                    <p style={{
                        fontSize: 32,
                        color: '#e4e4e7', // zinc-200
                        marginTop: 24,
                        opacity: 0.8,
                        fontFamily: 'sans-serif',
                        maxWidth: 900,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {prompt}
                    </p>
                </div>

                {/* Badge */}
                <div style={{
                    position: 'absolute',
                    bottom: 50,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 32px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 100,
                    border: '1px solid rgba(255,255,255,0.15)',
                    zIndex: 10
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" color="white">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    <span style={{ fontSize: 24, fontWeight: 600, fontFamily: 'sans-serif' }}>Play now</span>
                </div>
            </div>
        ),
        { ...size }
    );
}
