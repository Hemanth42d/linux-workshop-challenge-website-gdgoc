export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-10 h-10 border-3 border-[#5c3566] border-t-[#34e534] rounded-full animate-spin mb-4" />
      <p className="text-sm text-[#ad7fa8] font-mono">{text}</p>
    </div>
  );
}
