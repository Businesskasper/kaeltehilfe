import { NavLink } from "@mantine/core";
import { IconProps } from "@tabler/icons-react";
import { ComponentType } from "react";
import {
  matchPath,
  useLocation,
  useNavigate,
  useResolvedPath,
} from "react-router-dom";
import { rem } from "../../utils";

export type NavigationItemProps = {
  target: string;
  label: string;
  Icon: ComponentType<IconProps>;
};

type Props = NavigationItemProps & { onNavigate?: () => void };

export const NavigationItem = ({ target, label, Icon, onNavigate }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const resolvedpath = useResolvedPath(target);

  const isActive = !!matchPath(
    { path: resolvedpath.pathname, end: true },
    location.pathname,
  );

  return (
    <>
      <NavLink
        key={target}
        onClick={() => {
          navigate(target);
          onNavigate && onNavigate();
        }}
        active={isActive}
        fz="h3"
        label={label}
        leftSection={<Icon size={rem(24)} stroke={1.5} />}
      />
    </>
  );
};
