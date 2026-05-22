import type { UserProfile } from "../lib/userProfile";

export default function UserAvatar({
  profile,
  size = "lg",
  onClick,
}: {
  profile: UserProfile;
  size?: "lg" | "md";
  onClick?: () => void;
}) {
  const dim = size === "lg" ? "h-16 w-16" : "h-12 w-12";
  const initial = profile.nickname.trim().charAt(0) || "健";

  const inner = profile.avatarImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profile.avatarImage}
      alt={`${profile.nickname} 的头像`}
      className="h-full w-full object-cover"
    />
  ) : (
    <span className="text-xl font-black text-white/95">{initial}</span>
  );

  const className = `${dim} shrink-0 overflow-hidden rounded-2xl border-2 border-[#c7d2fe] bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] shadow-[0_4px_16px_rgba(99,102,241,0.35)]`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} relative transition active:scale-95`}
        aria-label="更换头像"
      >
        {inner}
        <span className="absolute inset-x-0 bottom-0 bg-black/40 py-0.5 text-[9px] font-bold text-white">
          编辑
        </span>
      </button>
    );
  }

  return <div className={className}>{inner}</div>;
}
