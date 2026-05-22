'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  icon?: ReactNode;
}

const variantCls: Record<Variant, string> = {
  primary:   'text-white hover:opacity-90',
  secondary: 'bg-[hsl(210_15%_80%)] text-[hsl(210_50%_10%)] hover:bg-[hsl(210_15%_73%)]',
  ghost:     'bg-transparent border border-[hsl(210_20%_88%)] text-[hsl(210_50%_10%)] hover:bg-[hsl(210_15%_94%)]',
  danger:    'bg-red-500 text-white hover:bg-red-600',
};

const variantStyle: Record<Variant, React.CSSProperties> = {
  primary:   { background: 'var(--gradient-hero)' },
  secondary: {},
  ghost:     {},
  danger:    {},
};

const sizeCls: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3 text-sm rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center gap-2 font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed',
        variantCls[variant],
        sizeCls[size],
        className,
      ].join(' ')}
      style={variantStyle[variant]}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
