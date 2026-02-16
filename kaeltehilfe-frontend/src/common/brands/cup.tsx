import { useMantineColorScheme } from "@mantine/core";

import "./cup.scss";

const cupDark = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="M17 11.6V15a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3.4a.6.6 0 0 1 .6-.6h12.8a.6.6 0 0 1 .6.6M12 9c0-1 .714-2 2.143-2v0A2.857 2.857 0 0 0 17 4.143V3.5M8 9v-.5a3 3 0 0 1 3-3v0a2 2 0 0 0 2-2V3" />
        <path d="M16 11h2.5a2.5 2.5 0 0 1 0 5H17" />
      </g>
    </svg>
  );
};
const cupLight = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="M17 11.6V15a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3.4a.6.6 0 0 1 .6-.6h12.8a.6.6 0 0 1 .6.6M12 9c0-1 .714-2 2.143-2v0A2.857 2.857 0 0 0 17 4.143V3.5M8 9v-.5a3 3 0 0 1 3-3v0a2 2 0 0 0 2-2V3" />
        <path d="M16 11h2.5a2.5 2.5 0 0 1 0 5H17" />
      </g>
    </svg>
  );
};

export const Cup = ({ className }: { className?: string }) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <div className={className}>
      {colorScheme === "dark" ? cupLight() : cupDark()}
      <span className="company">kältehilfe</span>
    </div>
  );
};
