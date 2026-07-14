"use client";

import { useEffect, useMemo, useState } from "react";
import { UserRound } from "lucide-react";

type SafeAvatarProps = {
  src?: unknown;
  alt?: string;
  className?: string;
  iconClassName?: string;
};

function normalizeAvatarUrl(value: unknown): string {
  let raw = "";

  if (typeof value === "string") {
    raw = value;
  } else if (value && typeof value === "object") {
    const objectValue = value as any;
    raw =
      objectValue.uri ||
      objectValue.url ||
      objectValue.avatar ||
      objectValue.image ||
      objectValue.src ||
      "";
  }

  const trimmed = String(raw || "").trim();

  if (
    !trimmed ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "[object Object]" ||
    trimmed.startsWith("data:text/")
  ) {
    return "";
  }

  const cleaned = trimmed
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/^\[|\]$/g, "")
    .trim();

  if (!cleaned) return "";

  if (
    cleaned.startsWith("https://") ||
    cleaned.startsWith("http://") ||
    cleaned.startsWith("/")
  ) {
    return cleaned;
  }

  return "";
}

export default function SafeAvatar({
  src,
  alt = "프로필",
  className = "h-14 w-14 rounded-full",
  iconClassName = "h-[46%] w-[46%] text-slate-400",
}: SafeAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const normalizedSrc = useMemo(() => normalizeAvatarUrl(src), [src]);

  useEffect(() => {
    setHasError(false);
  }, [normalizedSrc]);

  const showImage = Boolean(normalizedSrc) && !hasError;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-slate-100 ${className}`}
    >
      {showImage ? (
        <img
          src={normalizedSrc}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <UserRound className={iconClassName} />
      )}
    </div>
  );
}