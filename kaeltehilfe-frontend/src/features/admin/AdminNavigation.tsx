import {
  IconBedFlat,
  IconBus,
  IconCalendar,
  IconCubeSend,
  IconLogin,
  IconMessage,
  IconRulerMeasure,
  IconSoup,
  IconUser,
} from "@tabler/icons-react";
import React from "react";
import { NavigationItem, NavigationSection } from "../../common/components";
import { useComments } from "../../common/data";

export const AdminNavigation = () => {
  const {
    objs: { data: comments },
  } = useComments({ from: null, to: null });

  const unreadCount = React.useMemo(() => {
    const lastSeenStr = localStorage.getItem("ADMIN_COMMENTS_LAST_SEEN");
    if (!lastSeenStr || !comments) return 0;
    const lastSeen = new Date(lastSeenStr);
    return comments.filter((c) => new Date(c.addOn) > lastSeen).length;
  }, [comments]);

  return (
    <>
      <NavigationSection label="Verwaltung">
        <NavigationItem label="Admins-Logins" Icon={IconLogin} target="admins" />
      </NavigationSection>
      <NavigationSection label="Schichtplanung">
        <NavigationItem label="Freiwillige" Icon={IconUser} target="volunteers" />
        <NavigationItem label="Schichtträger" Icon={IconBus} target="busses" />
        <NavigationItem label="Schichtregeln" Icon={IconRulerMeasure} target="shift-rules" />
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
        <NavigationItem
          label="Kommentare"
          target="comments"
          Icon={IconMessage}
          badge={unreadCount > 0 ? unreadCount : undefined}
        />
      </NavigationSection>
    </>
  );
};
