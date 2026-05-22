const PROFILE_KEY = "gym-agent-user-profile";
const MAX_AVATAR_BYTES = 420_000;

export type UserProfile = {
  nickname: string;
  /** base64 data URL，本地上传头像 */
  avatarImage: string | null;
};

const DEFAULT_PROFILE: UserProfile = {
  nickname: "健身达人",
  avatarImage: null,
};

export function loadUserProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile> & {
      avatarEmoji?: string;
    };
    return {
      nickname: parsed.nickname?.trim() || DEFAULT_PROFILE.nickname,
      avatarImage:
        typeof parsed.avatarImage === "string" && parsed.avatarImage.length > 0
          ? parsed.avatarImage
          : null,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({
        nickname: profile.nickname.trim() || DEFAULT_PROFILE.nickname,
        avatarImage: profile.avatarImage,
      }),
    );
  } catch {
    /* quota */
  }
}

export function updateUserProfile(
  patch: Partial<UserProfile>,
): UserProfile {
  const current = loadUserProfile();
  const next: UserProfile = {
    nickname: patch.nickname?.trim() || current.nickname,
    avatarImage:
      patch.avatarImage !== undefined ? patch.avatarImage : current.avatarImage,
  };
  saveUserProfile(next);
  return next;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): string {
  return canvas.toDataURL(type, quality);
}

/** 压缩并裁剪为正方形头像 */
export async function processAvatarFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("请选择图片文件");
  }

  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

  let quality = 0.88;
  let result = canvasToDataUrl(canvas, "image/jpeg", quality);
  while (result.length > MAX_AVATAR_BYTES && quality > 0.4) {
    quality -= 0.08;
    result = canvasToDataUrl(canvas, "image/jpeg", quality);
  }

  if (result.length > MAX_AVATAR_BYTES) {
    throw new Error("图片过大，请选择更小的照片");
  }

  return result;
}
