"use client";

import { useState } from "react";
import BottomNav, { type AppTab } from "./BottomNav";
import ProfileHome from "./ProfileHome";
import WorkoutHome from "./WorkoutHome";

export default function AppShell() {
  const [tab, setTab] = useState<AppTab>("train");

  return (
    <>
      {tab === "train" ? <WorkoutHome /> : <ProfileHome />}
      <BottomNav active={tab} onChange={setTab} />
    </>
  );
}
