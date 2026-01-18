import React from "react";

type PlusMarkerProps = {
  size?: number | string; // z.B. 24 | "2rem" | "100%"
  className?: string;
};

export const PlusMarker: React.FC<PlusMarkerProps> = ({
  size = 24,
  className,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -4 243 424.7"
      fill="none"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <path
        d="
      M0 121.1
      C0 54.2 54.4 0 121.5 0
      C188.6 0 243 54.2 243 121.1
      C243 188 121.5 416.7 121.5 416.7
      C121.5 416.7 0 188 0 121.1
      Z
    "
        fill="#3f93cf"
      />

      <path
        d="
      M121.5 0
      C188.6 0 243 54.2 243 121.1
      C243 188 121.5 416.7 121.5 416.7
      C121.5 416.7 0 188 0 121.1
      C0 54.2 54.4 0 121.5 0
      Z
    "
        stroke="#3882b6"
        strokeWidth="8"
        fill="none"
      />

      <circle
        cx="121.5"
        cy="132.9"
        r="70"
        stroke="#ffffff"
        strokeWidth="10"
        fill="none"
      />

      <path
        d="
      M126.5 97.4
      V128.9
      H158
      V136.9
      H126.5
      V168.4
      H118.5
      V136.9
      H87
      V128.9
      H118.5
      V97.4
      Z
    "
        fill="#ffffff"
      />
    </svg>
  );
};
