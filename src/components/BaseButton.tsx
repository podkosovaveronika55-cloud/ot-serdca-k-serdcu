import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'

type Variant = 'gold' | 'ghost' | 'ice' | 'berry'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
}

const VARIANTS: Record<Variant, string> = {
  gold: 'bg-gradient-to-br from-gold-light via-gold to-gold-deep text-night-900 shadow-[0_12px_34px_-10px_rgba(255,200,87,.75)] hover:shadow-[0_18px_44px_-10px_rgba(255,200,87,.9)]',
  ice: 'bg-gradient-to-br from-ice-soft to-ice text-night-900 shadow-[0_12px_30px_-12px_rgba(152,208,255,.8)]',
  berry: 'bg-gradient-to-br from-berry to-berry-deep text-white shadow-[0_12px_30px_-12px_rgba(226,79,123,.8)]',
  ghost: 'border border-white/20 bg-white/[0.06] text-ice-light backdrop-blur hover:border-gold/50 hover:bg-white/[0.12] hover:text-white',
}

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-[15px]',
  lg: 'px-8 py-4 text-base',
}

export default function BaseButton({ children, variant = 'gold', size = 'md', glow = false, className = '', ...rest }: Props) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={`relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTS[variant]} ${SIZES[size]} ${glow ? 'animate-pulseGlow' : ''} ${className}`}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  )
}
