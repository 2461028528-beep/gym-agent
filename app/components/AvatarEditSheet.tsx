"use client";

import { useEffect, useRef, useState } from "react";
import { processAvatarFile } from "../lib/userProfile";
import UserAvatar from "./UserAvatar";
import type { UserProfile } from "../lib/userProfile";

export default function AvatarEditSheet({
  open,
  profile,
  onSave,
  onClose,
}: {
  open: boolean;
  profile: UserProfile;
  onSave: (avatarImage: string | null) => void;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(profile.avatarImage);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPreview(profile.avatarImage);
      setError("");
      setLoading(false);
    }
  }, [open, profile.avatarImage]);

  if (!open) return null;

  const previewProfile: UserProfile = {
    ...profile,
    avatarImage: preview,
  };

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const dataUrl = await processAvatarFile(file);
      setPreview(dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "图片处理失败");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    onSave(preview);
    onClose();
  }

  function handleRemove() {
    setPreview(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-sheet-up relative z-10 w-full max-w-lg rounded-t-[1.35rem] border border-[#c7d2fe]/60 bg-gradient-to-b from-white to-[#f5f3ff] px-5 pb-10 pt-3 shadow-[0_-8px_40px_rgba(99,102,241,0.25)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#c7d2fe]" />
        <h2 className="text-center text-lg font-bold text-[#312e81]">
          更换头像
        </h2>
        <p className="mt-1 text-center text-sm text-[#6366f1]">
          支持本地上传，自动预览
        </p>

        <div className="mt-6 flex justify-center">
          <UserAvatar profile={previewProfile} size="lg" />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />

        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="mt-6 w-full rounded-2xl border border-[#c7d2fe] bg-gradient-to-r from-[#eef2ff] to-[#f3e8ff] py-3.5 text-sm font-bold text-[#4f46e5] transition hover:border-[#a5b4fc] disabled:opacity-60"
        >
          {loading ? "处理中…" : "从相册选择图片"}
        </button>

        {error && (
          <p className="mt-2 text-center text-xs font-medium text-[#dc2626]">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleRemove}
          className="mt-3 w-full py-2 text-sm font-semibold text-[#6366f1]"
        >
          恢复默认头像
        </button>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[#e0e7ff] py-3.5 text-sm font-bold text-[#6b7280]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
