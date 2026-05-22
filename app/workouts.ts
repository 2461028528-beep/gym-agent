export type TrainingDay = {
  id: string;
  label: string;
  exercises: string[];
};

export const REST_DAY = {
  id: "rest",
  label: "休息日",
} as const;

/** 训练循环顺序：胸 → 背 → 肩臂 → 腿 → 核心 → 休息 → 胸 … */
export const SCHEDULE_ORDER = [
  "chest",
  "back",
  "shoulder-arms",
  "legs",
  "core",
  "rest",
] as const;

export type ScheduleDayId = (typeof SCHEDULE_ORDER)[number];

export const TRAINING_DAYS: TrainingDay[] = [
  {
    id: "chest",
    label: "胸日",
    exercises: [
      "卧推",
      "高位蝴蝶机夹胸",
      "哑铃推胸",
      "悍马推胸",
      "下胸训练",
      "双杠臂屈伸",
      "核心",
    ],
  },
  {
    id: "back",
    label: "背日",
    exercises: [
      "高位下拉",
      "T字拉背",
      "拉背",
      "反手下拉",
      "窄距划船",
      "辅助引体",
      "核心",
    ],
  },
  {
    id: "shoulder-arms",
    label: "肩+手臂日",
    exercises: [
      "站姿哑铃侧平举",
      "反向蝴蝶机",
      "推肩",
      "龙门下压",
      "三头弯举",
      "双杠臂屈伸",
      "二头杠铃弯举",
      "二头绳索弯举",
      "二头哑铃弯举",
      "核心",
    ],
  },
  {
    id: "legs",
    label: "腿日",
    exercises: [
      "外展",
      "坐姿腿屈伸",
      "腿内收",
      "深蹲哈克",
      "倒蹬",
      "保加利亚蹲",
      "核心",
    ],
  },
  {
    id: "core",
    label: "核心日",
    exercises: [
      "俄罗斯转体",
      "反向山羊挺身",
      "山羊挺身",
      "上斜卷腹",
      "龙门架",
      "悬垂举腿",
      "器械组",
    ],
  },
];

export const ALL_DAY_TABS = [
  ...TRAINING_DAYS.map((d) => ({ id: d.id, label: d.label })),
  { id: REST_DAY.id, label: REST_DAY.label },
];

export function getNextScheduleDay(currentId: string): ScheduleDayId {
  const index = SCHEDULE_ORDER.indexOf(currentId as ScheduleDayId);
  const safeIndex = index >= 0 ? index : 0;
  return SCHEDULE_ORDER[(safeIndex + 1) % SCHEDULE_ORDER.length];
}

export function getTrainingDayById(id: string): TrainingDay | undefined {
  return TRAINING_DAYS.find((day) => day.id === id);
}

export function getDayLabel(id: string): string {
  if (id === REST_DAY.id) return REST_DAY.label;
  return getTrainingDayById(id)?.label ?? "训练日";
}
