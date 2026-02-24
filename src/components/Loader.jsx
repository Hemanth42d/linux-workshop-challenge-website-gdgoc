export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-10 h-10 border-3 border-gray-200 border-t-[#4285F4] rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
