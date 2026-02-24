export default function Input({ label, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 
          focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 focus:border-[#4285F4] 
          transition-all text-sm ${className}`}
        {...props}
      />
    </div>
  );
}
