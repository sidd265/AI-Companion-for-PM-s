import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        // Airbnb specific colors
        airbnb: {
          coral: 'hsl(var(--airbnb-coral))',
          'coral-dark': 'hsl(var(--airbnb-coral-dark))',
          'coral-light': 'hsl(var(--airbnb-coral-light))',
          black: 'hsl(var(--airbnb-black))',
          'gray-dark': 'hsl(var(--airbnb-gray-dark))',
          gray: 'hsl(var(--airbnb-gray))',
          'gray-light': 'hsl(var(--airbnb-gray-light))',
          'gray-lighter': 'hsl(var(--airbnb-gray-lighter))',
          background: 'hsl(var(--airbnb-background))',
          'background-alt': 'hsl(var(--airbnb-background-alt))',
          success: 'hsl(var(--airbnb-success))',
          warning: 'hsl(var(--airbnb-warning))'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif'
        ],
        mono: [
          'Space Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace'
        ],
        serif: [
          'Lora',
          'ui-serif',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'Times',
          'serif'
        ]
      },
      fontSize: {
        'airbnb-title': ['32px', { lineHeight: '1.2', fontWeight: '800' }],
        'airbnb-h1': ['26px', { lineHeight: '1.2', fontWeight: '700' }],
        'airbnb-h2': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'airbnb-h3': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'airbnb-body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'airbnb-small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'airbnb-caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }]
      },
      spacing: {
        'airbnb-xs': '4px',
        'airbnb-sm': '8px',
        'airbnb-md': '12px',
        'airbnb-default': '16px',
        'airbnb-lg': '24px',
        'airbnb-xl': '32px',
        'airbnb-2xl': '48px',
        'airbnb-3xl': '64px',
        'airbnb-4xl': '96px'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'airbnb-sm': '8px',
        'airbnb-md': '12px',
        'airbnb-lg': '16px',
        'airbnb-xl': '24px',
        'airbnb-pill': '50px'
      },
      boxShadow: {
        'airbnb-sm': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'airbnb-md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'airbnb-lg': '0 6px 16px rgba(0, 0, 0, 0.12)',
        'airbnb-xl': '0 8px 28px rgba(0, 0, 0, 0.15)',
        'airbnb-2xl': '0 16px 70px rgba(0, 0, 0, 0.2)',
        '2xs': 'var(--shadow-2xs)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' }
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0px 0px hsl(350 100% 61% / 0)' },
          '50%': { boxShadow: '0 0 20px 4px hsl(350 100% 61% / 0.15)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease',
        'slide-in-right': 'slide-in-right 0.3s ease',
        'scale-in': 'scale-in 0.2s ease',
        marquee: 'marquee 30s linear infinite'
      },
      width: {
        'sidebar': '260px',
        'sidebar-collapsed': '72px',
        'chat-sidebar': '280px',
        'drawer': '480px'
      },
      maxWidth: {
        'chat': '800px'
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
