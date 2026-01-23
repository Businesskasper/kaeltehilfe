import { Collapse, Group, NavLink, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import React from "react";
import { rem } from "../../utils";

export type NavigationSectionProps = {
  label: string;
  children: Array<React.ReactNode> | React.ReactNode;
};
export const NavigationSection = ({
  label,
  children,
}: NavigationSectionProps) => {
  const [isOpen, { toggle }] = useDisclosure(true);

  return (
    <>
      <NavLink
        onClick={() => toggle()}
        label={
          <Group justify="space-between">
            <Title order={6}>{label}</Title>
            {isOpen ? (
              <IconArrowUp size={rem(15)} />
            ) : (
              <IconArrowDown size={rem(15)} />
            )}
          </Group>
        }
      ></NavLink>
      <Collapse in={isOpen}>{children}</Collapse>
    </>
  );
};
