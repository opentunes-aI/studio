import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Opentunes Studio',
        short_name: 'Opentunes',
        description: 'Pro-grade AI Music Workstation',
        start_url: '/studio',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#9333ea',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
