const fakeAgencies = [
  { name: "Northbeam", style: "italic font-serif" },
  { name: "FORGE", style: "font-bold tracking-[0.2em]" },
  { name: "Lumen", style: "font-light tracking-tight" },
  { name: "Atelier", style: "font-serif tracking-tight" },
  { name: "Pulse&Co", style: "font-medium" },
  { name: "Studio Bureau", style: "font-light italic" },
];

export function LogoCloud() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-6 items-center justify-items-center opacity-50">
      {fakeAgencies.map((a) => (
        <div
          key={a.name}
          className={`text-[var(--text-secondary)] text-[18px] ${a.style}`}
        >
          {a.name}
        </div>
      ))}
    </div>
  );
}
