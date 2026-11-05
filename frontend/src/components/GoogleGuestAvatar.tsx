import { useState } from "react";
import {
  guestInitials,
  proxiedGoogleProfilePhoto,
} from "@/utils/googleProfilePhoto";

type GoogleGuestAvatarProps = {
  name: string;
  photoUrl: string | null | undefined;
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
} as const;

export function GoogleGuestAvatar({
  name,
  photoUrl,
  size = "sm",
  className = "",
}: GoogleGuestAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = proxiedGoogleProfilePhoto(photoUrl);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E8E0D4] font-semibold text-[#5A6B32] ${sizeClasses[size]} ${className}`.trim()}
      aria-hidden={!showImage}
    >
      {showImage ? (
        <img
          src={src!}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{guestInitials(name)}</span>
      )}
    </span>
  );
}
