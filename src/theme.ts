export const theme = {
    colors: {
        primary: '#93C5FD', // Bebek Mavisi
        secondary: '#C084FC', // Soft Lila
        accent: '#6EE7B7', // Nane Yeşili
        background: '#FAFAF9', // Kırık Beyaz / Krem
        surface: '#FFFFFF', // Beyaz (Kartlar ve Inputlar için)
        text: '#1E3A8A', // Koyu Lacivert
        textSecondary: 'rgba(30, 58, 138, 0.6)',
        border: '#93C5FD',
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
        s: 4,
        m: 8,
        l: 12,
        xl: 16,
        round: 50,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: 'bold' as const,
        },
        h2: {
            fontSize: 24,
            fontWeight: '600' as const,
        },
        body: {
            fontSize: 16,
            fontWeight: 'normal' as const,
        },
        caption: {
            fontSize: 14,
            fontWeight: '400' as const,
        },
    }
};
