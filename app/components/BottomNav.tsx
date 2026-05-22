"use client";

export type AppTab = "train" | "profile";

export default function BottomNav({
  active,
  onChange,
}: {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}) {
  const items: { id: AppTab; label: string; icon: string }[] = [
    { id: "train", label: "训练", icon: "🏋️" },
    { id: "profile", label: "我的", icon: "👤" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg border-t border-[#e0e7ff] bg-white/95 px-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_24px_rgba(99,102,241,0.12)] backdrop-blur-xl">
      <ul className="flex items-center justify-around gap-2">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(item.id)}
                className={`flex w-full flex-col items-center gap-0.5 rounded-2xl py-2 transition ${
                  isActive
                    ? "bg-gradient-to-r from-[#eef2ff] to-[#f3e8ff] text-[#4f46e5]"
                    : "text-[#6b7280] hover:text-[#4f46e5]"
                }`}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {item.icon}
                </span>
                <span className="text-[11px] font-bold">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
