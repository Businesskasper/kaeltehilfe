import { IconChartCohort, IconMap } from "@tabler/icons-react";
import { NavigationItem } from "../../common/components";

export const OperatorNavigation = () => (
  <>
    <NavigationItem
      label="Kachelansicht"
      Icon={IconChartCohort}
      target="/tiles"
    />
    <NavigationItem label="Kartenansicht" Icon={IconMap} target="/map" />
    {/* <NavigationItem
      label="Klientensuche"
      Icon={IconUserSearch}
      target="/search"
    /> */}
  </>
);
