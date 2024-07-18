import { NavLink } from "@mantine/core";
import { IconProps } from "@tabler/icons-react";
import { ComponentType } from "react";
import {
  matchPath,
  useLocation,
  useNavigate,
  useResolvedPath,
} from "react-router-dom";

export type NavigationItemProps = {
  target: string;
  label: string;
  //   icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  //   icon: ReactNode;
  Icon: ComponentType<IconProps>;
};

type Props = NavigationItemProps & { onNavigate?: () => void };

export const NavigationItem = ({ target, label, Icon, onNavigate }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const resolvedpath = useResolvedPath(target);

  const isActive = !!matchPath(
    { path: resolvedpath.pathname, end: true },
    location.pathname
  );
  //   const isActive2 = useMatch({ path: resolvedpath.pathname, end: true });
  //   console.log(target, isActive1, isActive2);

  return (
    <NavLink
      key={target}
      onClick={() => {
        navigate(target);
        onNavigate && onNavigate();
      }}
      active={isActive}
      fz="h3"
      label={label}
      leftSection={<Icon size="1.5rem" stroke={1.5} />}
    />
  );
};
