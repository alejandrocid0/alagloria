
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  asChild?: boolean;
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      asChild = false,
      href,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "rounded-md font-medium transition-all duration-200 transform focus:outline-none inline-flex items-center justify-center";
    
    const variants = {
      primary: 'bg-gloria-purple text-white hover:bg-gloria-purple/90 focus:ring-2 focus:ring-gloria-purple/50',
      secondary: 'bg-gloria-gold text-white hover:bg-gloria-gold/90 focus:ring-2 focus:ring-gloria-gold/50',
      outline: 'border border-gloria-purple text-gloria-purple hover:bg-gloria-purple/5 focus:ring-2 focus:ring-gloria-purple/50',
      ghost: 'text-gloria-purple hover:bg-gloria-purple/5 focus:ring-2 focus:ring-gloria-purple/50',
      link: 'text-gloria-purple underline-offset-4 hover:underline'
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    
    const loadingStyles = isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]';
    const disabledStyles = disabled ? 'opacity-60 cursor-not-allowed' : '';
    
    const buttonClassName = cn(
      baseStyles,
      variants[variant],
      sizes[size],
      loadingStyles,
      disabledStyles,
      className
    );
    
    if (href) {
      return (
        <Link
          to={href}
          className={buttonClassName}
          {...(props as any)}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {children}
        </Link>
      );
    }
    
    return (
      <button
        ref={ref}
        className={buttonClassName}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
