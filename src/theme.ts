export const theme = {
    colors: {
        primary: '#3B82F6', // Canlı orta mavi (Faz 2)
        secondary: '#A7F3D0', // Pastel Nane Yeşili (Faz 2)
        accent: '#8B5CF6', 
        background: '#0F172A', 
        surface: 'rgba(31, 41, 55, 0.8)', // Koyu füme gri (Faz 2)
        text: '#FFFFFF', // Tam beyaz (Faz 2)
        textSecondary: '#D1D5DB', // Açık gri (Faz 2)
        border: 'rgba(255, 255, 255, 0.15)',
        error: '#EF4444', 
        success: '#10B981', 
    },
    spacing: {
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 40,
    },
    borderRadius: {
        s: 6,
        m: 12,
        l: 16,
        xl: 24,
        round: 9999, // Tam yuvarlak butonlar için (pill shape)
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: 'bold' as const,
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 24,
            fontWeight: '600' as const,
            letterSpacing: -0.5,
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as const,
            letterSpacing: 0,
        },
        caption: {
            fontSize: 14,
            fontWeight: '500' as const, // Küçük yazılarda biraz daha kalınlık (okunabilirlik)
            letterSpacing: 0,
        },
    },
    images: {
        // Kullanıcı İsteği: Daha iç açıcı, eşsiz bucaksız huzurlu ve sonsuzluk hissi veren gökyüzü
        background: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=100',
    }
};
