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
  			notion: {
  				bg: '#FAFBFC',
  				sidebar: '#172B4D',
  				text: '#172B4D',
  				'text-secondary': '#5E6C84',
  				'text-tertiary': '#7A869A',
  				border: '#DFE1E6',
  				blue: '#0052CC',
  				'blue-light': '#DEEBFF',
  				red: '#FF5630',
  				orange: '#FF991F',
  				yellow: '#FFAB00',
  				green: '#36B37E',
  				purple: '#6554C0',
  				pink: '#E34BA9',
  				gray: '#5E6C84',
  				brown: '#937264',
  				hover: 'rgba(0, 82, 204, 0.04)',
  				active: 'rgba(0, 82, 204, 0.08)'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif',
  				'Apple Color Emoji',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'Noto Color Emoji'
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
  			'notion-title': [
  				'40px',
  				{
  					lineHeight: '1.2',
  					fontWeight: '700'
  				}
  			],
  			'notion-h1': [
  				'30px',
  				{
  					lineHeight: '1.2',
  					fontWeight: '700'
  				}
  			],
  			'notion-h2': [
  				'24px',
  				{
  					lineHeight: '1.3',
  					fontWeight: '600'
  				}
  			],
  			'notion-h3': [
  				'18px',
  				{
  					lineHeight: '1.4',
  					fontWeight: '600'
  				}
  			],
  			'notion-body': [
  				'16px',
  				{
  					lineHeight: '1.5',
  					fontWeight: '400'
  				}
  			],
  			'notion-small': [
  				'14px',
  				{
  					lineHeight: '1.5',
  					fontWeight: '400'
  				}
  			],
  			'notion-tiny': [
  				'12px',
  				{
  					lineHeight: '1.4',
  					fontWeight: '400'
  				}
  			]
  		},
  		spacing: {
  			'notion-micro': '4px',
  			'notion-small': '8px',
  			'notion-medium': '12px',
  			'notion-default': '16px',
  			'notion-large': '24px',
  			'notion-xl': '32px',
  			'notion-xxl': '48px',
  			'notion-massive': '96px'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'notion-none': '0px',
  			'notion-tiny': '3px',
  			'notion-small': '4px',
  			'notion-medium': '6px',
  			'notion-large': '8px'
  		},
  		boxShadow: {
  			'notion-card': '0 1px 2px rgba(0, 0, 0, 0.06)',
  			'notion-modal': '0 16px 70px rgba(0, 0, 0, 0.2)',
  			'notion-dropdown': '0 5px 16px rgba(0, 0, 0, 0.08)',
  			'notion-drawer': '-2px 0 8px rgba(0, 0, 0, 0.08)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'notion-fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'notion-slide-in': {
  				from: {
  					transform: 'translateX(100%)'
  				},
  				to: {
  					transform: 'translateX(0)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'notion-fade-in': 'notion-fade-in 0.15s ease',
  			'notion-slide-in': 'notion-slide-in 0.3s ease'
  		},
  		width: {
  			'notion-sidebar': '240px',
  			'notion-chat-sidebar': '280px',
  			'notion-drawer': '480px'
  		},
  		maxWidth: {
  			'notion-chat': '900px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
