import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const tailwindConfig = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
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
				// Planora custom colors
				planora: {
					purple: {
						dark: '#1A1F2C',
						DEFAULT: '#7E69AB',
						light: '#9b87f5',
					},
					accent: {
						blue: '#1EAEDB',
						purple: '#8B5CF6',
						pink: '#D946EF',
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'float-reverse': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(10px)' },
				},
				'pulse-light': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				'spin-slow-reverse': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(-360deg)' },
				},
				'spin-very-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				'orbit': {
					'0%': { 
						transform: 'rotate(0deg) translateX(120px) rotate(0deg)',
					},
					'100%': { 
						transform: 'rotate(360deg) translateX(120px) rotate(-360deg)',
					},
				},
				'orbit-wide': {
					'0%': { 
						transform: 'rotate(0deg) translateX(180px) rotate(0deg)',
					},
					'100%': { 
						transform: 'rotate(360deg) translateX(180px) rotate(-360deg)',
					},
				},
				'orbit-wide-reverse': {
					'0%': { 
						transform: 'rotate(0deg) translateX(150px) rotate(0deg)',
					},
					'100%': { 
						transform: 'rotate(-360deg) translateX(150px) rotate(360deg)',
					},
				},
				'twinkle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.3' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'float-reverse': 'float-reverse 7s ease-in-out infinite',
				'pulse-light': 'pulse-light 4s ease-in-out infinite',
				'spin-slow': 'spin-slow 15s linear infinite',
				'spin-slow-reverse': 'spin-slow-reverse 18s linear infinite',
				'spin-very-slow': 'spin-very-slow 25s linear infinite',
				'orbit': 'orbit 20s linear infinite',
				'orbit-wide': 'orbit-wide 20s linear infinite',
				'orbit-wide-reverse': 'orbit-wide-reverse 30s linear infinite',
				'twinkle': 'twinkle 3s ease-in-out infinite',
			},
			fontFamily: {
				'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			},
			transitionDelay: {
				'400': '400ms',
				'500': '500ms',
				'600': '600ms', 
				'800': '800ms',
				'900': '900ms',
			}
		}
	},
	plugins: [tailwindcssAnimate]
} satisfies Config;

// Export both named and default for compatibility
export { tailwindConfig };
export default tailwindConfig;
