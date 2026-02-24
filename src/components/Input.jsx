export default function Input({ label, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-mono text-[#ad7fa8] uppercase tracking-wider">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 rounded-lg border border-[#5c3566] bg-[#2d0922] text-[#eeeeec] 
          placeholder-[#888a85] focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 focus:border-[#4285F4] 
          transition-all text-sm ${className}`}
        {...props}
      />
    </div>
  );
}
