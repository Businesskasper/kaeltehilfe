import { useComputedColorScheme } from "@mantine/core";
import { Separator } from "react-resizable-panels";

import "./Group.scss";

type GroupSeparatorProps = {
  orientation: "horizontal" | "vertical";
};
export const GroupSeparator = ({ orientation }: GroupSeparatorProps) => {
  const colorScheme = useComputedColorScheme();

  return (
    <Separator className={`panel-divider ${orientation} ${colorScheme}`} />
  );
};
