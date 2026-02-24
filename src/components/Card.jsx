export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#3c1130] border border-[#5c3566] rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}
