import type React from "react";
import { cn } from "../lib/utils";

export const LogoIcon = ({
  className,
  width = className ? undefined : 24,
  height = className ? undefined : 24,
  ...props
}: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 46 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("size-6 shrink-0", className)}
    width={width}
    height={height}
    {...props}
  >
    <g clipPath="url(#clip0_467_3401)">
      <g filter="url(#filter0_i_467_3401)">
        <path
          d="M1 9.8584C1 4.61169 5.25329 0.358398 10.5 0.358398H35.5C40.7467 0.358398 45 4.61169 45 9.8584V34.8584C45 40.1051 40.7467 44.3584 35.5 44.3584H10.5C5.25329 44.3584 1 40.1051 1 34.8584V9.8584Z"
          fill="#1F2123"
        />
        <path
          d="M1.91667 9.8584C1.91667 5.11795 5.75956 1.27507 10.5 1.27507H35.5C40.2404 1.27507 44.0833 5.11795 44.0833 9.8584V34.8584C44.0833 39.5988 40.2404 43.4417 35.5 43.4417H10.5C5.75956 43.4417 1.91667 39.5988 1.91667 34.8584V9.8584Z"
          stroke="url(#paint0_linear_467_3401)"
          strokeWidth="1.83333"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23.3064 8.3584C24.2729 8.3584 25.0564 9.1419 25.0564 10.1084V16.3326C25.093 16.342 25.1295 16.3518 25.1658 16.3618L29.1525 9.45674L30.3312 10.1373C31.1682 10.6205 31.455 11.6908 30.9717 12.5278L27.8595 17.9184C27.8864 17.9448 27.9131 17.9715 27.9395 17.9984L34.8464 14.0107L35.527 15.1895C36.0102 16.0265 35.7235 17.0968 34.8864 17.58L29.497 20.6916C29.5073 20.7287 29.5173 20.7659 29.5269 20.8032H37.5V22.1643C37.5 23.1308 36.7165 23.9143 35.75 23.9143H29.5268C29.5174 23.9511 29.5076 23.9878 29.4974 24.0244L36.402 28.0107L35.7214 29.1895C35.2382 30.0265 34.1679 30.3133 33.3309 29.8301L27.9406 26.718C27.9141 26.745 27.8873 26.7717 27.8604 26.7982L31.8476 33.7042L30.6689 34.3847C29.8319 34.868 28.7616 34.5812 28.2784 33.7442L25.167 28.3553C25.1303 28.3655 25.0934 28.3753 25.0564 28.3849V36.3584H23.6953C22.7288 36.3584 21.9453 35.5749 21.9453 34.6084V28.385C21.908 28.3754 21.8708 28.3654 21.8338 28.3552L17.8468 35.261L16.668 34.5804C15.831 34.0972 15.5442 33.0269 16.0275 32.1899L19.1406 26.7978C19.1135 26.7713 19.0867 26.7444 19.0601 26.7174L12.1532 30.7051L11.4726 29.5262C10.9894 28.6892 11.2762 27.619 12.1132 27.1357L17.5037 24.0235C17.4936 23.9873 17.4839 23.9509 17.4745 23.9143H9.5V22.5532C9.5 21.5867 10.2835 20.8032 11.25 20.8032H17.4745C17.484 20.7662 17.4939 20.7293 17.5041 20.6925L10.5977 16.705L11.2782 15.5263C11.7615 14.6893 12.8317 14.4025 13.6688 14.8857L19.0612 17.999C19.0877 17.972 19.1145 17.9453 19.1415 17.9188L15.1533 11.0111L16.3321 10.3306C17.1691 9.84732 18.2394 10.1341 18.7226 10.9711L21.835 16.362C21.8716 16.3518 21.9084 16.342 21.9453 16.3325V8.3584H23.3064ZM26.247 23.8219L26.1438 24.0005C25.8901 24.4081 25.5447 24.7528 25.1365 25.0056L24.9701 25.1017C24.5454 25.3297 24.0615 25.4619 23.5475 25.4695H23.4538C22.3343 25.453 21.3581 24.8452 20.8235 23.9445L20.7859 23.8794C20.5335 23.4298 20.3896 22.9111 20.3896 22.3587C20.3896 20.6405 21.7824 19.2476 23.5007 19.2476C24.0359 19.2476 24.5396 19.3828 24.9795 19.6209L25.1274 19.7063C25.5484 19.965 25.903 20.3211 26.16 20.7433L26.2323 20.8684C26.4645 21.2932 26.6005 21.778 26.6111 22.2937V22.4238C26.6008 22.9285 26.4702 23.4037 26.247 23.8219Z"
          fill="white"
        />
      </g>
    </g>
    <rect
      x="0.93125"
      y="0.289648"
      width="44.1375"
      height="44.1375"
      rx="9.56875"
      stroke="black"
      strokeOpacity="0.6"
      strokeWidth="0.1375"
    />
    <defs>
      <filter
        id="filter0_i_467_3401"
        x="1"
        y="-17.5166"
        width="44"
        height="61.875"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="-17.875" />
        <feGaussianBlur stdDeviation="30" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.133333 0 0 0 0 0.141176 0 0 0 0 0.14902 0 0 0 0.2 0"
        />
        <feBlend
          mode="normal"
          in2="shape"
          result="effect1_innerShadow_467_3401"
        />
      </filter>
      <linearGradient
        id="paint0_linear_467_3401"
        x1="23"
        y1="0.358398"
        x2="23"
        y2="44.3584"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#2B2D2F" />
        <stop offset="1" stopColor="#131517" />
      </linearGradient>
      <clipPath id="clip0_467_3401">
        <rect x="1" y="0.358398" width="44" height="44" rx="9.5" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export interface LogoProps extends React.ComponentProps<"div"> {
  iconClassName?: string;
  textClassName?: string;
  text?: string;
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  text = "Outbox",
  ...props
}: LogoProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2 select-none", className)}
      {...props}
    >
      <LogoIcon className={cn("size-6", iconClassName)} />
      {text && (
        <span
          className={cn(
            "text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100",
            textClassName
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
}
