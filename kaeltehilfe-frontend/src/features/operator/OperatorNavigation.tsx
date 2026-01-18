import { IconChartCohort, IconMap, IconUserSearch } from "@tabler/icons-react";
import { NavigationItem } from "../../common/components";

export const OperatorNavigation = () => (
  <>
    <NavigationItem
      label="Kachelansicht"
      Icon={IconChartCohort}
      target="/overview/tiles"
    />
    <NavigationItem
      label="Kartenansicht"
      Icon={IconMap}
      target="/overview/map"
    />
    <NavigationItem
      label="Klientensuche"
      Icon={IconUserSearch}
      target="/overview/search"
    />
  </>
);
