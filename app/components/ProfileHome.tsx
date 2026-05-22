"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getProfileStats,
  loadWorkoutCheckIns,
  type WorkoutCheckIn,
} from "../lib/trainingStatus";
import { getDayTrainingSessions } from "../lib/workoutSessions";
import {
  loadUserProfile,
  updateUserProfile,
  type UserProfile,
} from "../lib/userProfile";
import AvatarEditSheet from "./AvatarEditSheet";
import DayDetailSheet from "./DayDetailSheet";
import NicknameEditSheet from "./NicknameEditSheet";
import TrainingCalendar from "./TrainingCalendar";
import UserAvatar from "./UserAvatar";

export default function ProfileHome() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [checkIns, setCheckIns] = useState<WorkoutCheckIn[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    nickname: "健身达人",
    avatarImage: null,
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const [nicknameSheetOpen, setNicknameSheetOpen] = useState(false);

  const refreshData = useCallback(() => {
    setCheckIns(loadWorkoutCheckIns());
    setProfile(loadUserProfile());
  }, []);

  useEffect(() => {
    refreshData();
    const onFocus = () => refreshData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshData]);

  const stats = useMemo(() => getProfileStats(checkIns), [checkIns]);

  const selectedSessions = useMemo(() => {
    if (!selectedDateKey) return [];
    return getDayTrainingSessions(selectedDateKey);
  }, [selectedDateKey, checkIns]);

  function handleSaveAvatar(avatarImage: string | null) {
    const next = updateUserProfile({ avatarImage });
    setProfile(next);
  }

  function handleSaveNickname(nickname: string) {
    const next = updateUserProfile({ nickname });
    setProfile(next);
  }

  function handlePrevMonth() {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
      return;
    }
    setViewMonth((m) => m - 1);
  }

  function handleNextMonth() {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
      return;
    }
    setViewMonth((m) => m + 1);
  }

  function handleSelectDay(dateKey: string) {
    setSelectedDateKey(dateKey);
    setDetailOpen(true);
  }

  return (
    <div className="relative mx-auto min-h-dvh max-w-lg overflow-hidden bg-[#f5f6f8] pb-24 text-[#111111]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#eef2ff] via-[#f5f3ff] to-transparent"
      />

      <header className="relative z-10 px-6 pb-4 pt-14">
        <p className="text-xs font-bold tracking-widest text-[#6366f1]">我的</p>
        <h1 className="mt-1 text-2xl font-bold text-[#312e81]">个人主页</h1>
      </header>

      <main className="relative z-10 space-y-5 px-6">
        <section className="rounded-2xl border border-[#c7d2fe]/50 bg-gradient-to-br from-white to-[#f5f3ff] p-5 shadow-[0_4px_24px_rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-4">
            <UserAvatar
              profile={profile}
              size="lg"
              onClick={() => setAvatarSheetOpen(true)}
            />
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setNicknameSheetOpen(true)}
                className="group flex w-full items-center gap-2 text-left"
              >
                <h2 className="truncate text-xl font-black text-[#312e81] group-active:opacity-70">
                  {profile.nickname}
                </h2>
                <span className="shrink-0 rounded-lg bg-[#eef2ff] px-2 py-0.5 text-[10px] font-bold text-[#6366f1]">
                  编辑
                </span>
              </button>
              <p className="mt-0.5 text-sm text-[#6366f1]">健身智能体用户</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#e0e7ff] bg-white/80 px-4 py-3 text-center">
              <p className="text-2xl font-black text-[#4f46e5]">
                {stats.totalTrainingDays}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#6b7280]">
                累计训练天数
              </p>
            </div>
            <div className="rounded-xl border border-[#e0e7ff] bg-white/80 px-4 py-3 text-center">
              <p className="text-2xl font-black text-[#4f46e5]">
                {stats.weekTrainingCount}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#6b7280]">
                本周训练次数
              </p>
            </div>
          </div>
        </section>

        <TrainingCalendar
          viewYear={viewYear}
          viewMonth={viewMonth}
          checkIns={checkIns}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectDay={handleSelectDay}
          selectedDateKey={selectedDateKey}
        />
      </main>

      <DayDetailSheet
        open={detailOpen}
        dateKey={selectedDateKey}
        sessions={selectedSessions}
        onClose={() => setDetailOpen(false)}
      />

      <AvatarEditSheet
        open={avatarSheetOpen}
        profile={profile}
        onSave={handleSaveAvatar}
        onClose={() => setAvatarSheetOpen(false)}
      />

      <NicknameEditSheet
        open={nicknameSheetOpen}
        initialNickname={profile.nickname}
        onSave={handleSaveNickname}
        onClose={() => setNicknameSheetOpen(false)}
      />
    </div>
  );
}
