import React from 'react';
import { motion } from 'framer-motion';

const Button = React.forwardRef(({
  children,
  type = "button",
  variant = "primary",
  className = "",
  loading = false,
  disabled = false,
  ...props
}, ref) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  // Remove unsupported props (like bgColor) before passing to DOM
  const safeProps = { ...props };
  delete safeProps.bgColor;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`
        px-6 py-3 rounded-lg font-medium text-sm md:text-base
        transition-all duration-200
        ${variants[variant] || variants.primary} ${className}
        ${disabled || loading ? 'opacity-70 cursor-not-allowed' : ''}
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
        relative overflow-hidden
      `}
      whileHover={!(disabled || loading) ? { scale: 1.03 } : false}
      whileTap={!(disabled || loading) ? { scale: 0.98 } : false}
      {...safeProps}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </motion.button>
  );
});

// Named exports for specific variants
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;

export default Button;
