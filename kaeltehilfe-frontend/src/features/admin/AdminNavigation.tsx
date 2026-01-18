import {
  IconBedFlat,
  IconBus,
  IconCalendar,
  IconCubeSend,
  IconLogin,
  IconSoup,
  IconUser,
} from "@tabler/icons-react";
import { NavigationItem, NavigationSection } from "../../common/components";

export const AdminNavigation = () => (
  <>
    <NavigationSection label="Verwaltung">
      <NavigationItem label="Admins-Logins" Icon={IconLogin} target="admins" />
    </NavigationSection>
    <NavigationSection label="Schichtplanung">
      <NavigationItem label="Schichtträger" Icon={IconBus} target="busses" />
      <NavigationItem label="Freiwillige" Icon={IconUser} target="volunteers" />
      <NavigationItem label="Schichten" Icon={IconCalendar} target="shifts" />
    </NavigationSection>
    <NavigationSection label="Ausgaben">
      <NavigationItem label="Güter" target="goods" Icon={IconSoup} />
      <NavigationItem label="Klienten" target="clients" Icon={IconBedFlat} />
      <NavigationItem
        label="Ausgaben"
        target="distributions"
        Icon={IconCubeSend}
      />
    </NavigationSection>
  </>
);
