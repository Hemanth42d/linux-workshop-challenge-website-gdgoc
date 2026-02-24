const variants = {
  primary: 'bg-[#4285F4] hover:bg-[#3367d6] text-white',
  danger: 'bg-[#EA4335] hover:bg-[#d33426] text-white',
  success: 'bg-[#34A853] hover:bg-[#2d9249] text-white',
  warning: 'bg-[#FBBC05] hover:bg-[#e5ab00] text-gray-900',
  ghost: 'bg-[#2d0922] hover:bg-[#5c3566]/40 text-[#eeeeec] border border-[#5c3566]',
  terminal: 'bg-[#34A853] hover:bg-[#2d9249] text-white font-mono',
};

export default function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  return (
    <button
      className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 
        disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
        ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
