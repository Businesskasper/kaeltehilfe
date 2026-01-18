// import { IconChartCohort, IconMap, IconUserSearch } from "@tabler/icons-react";
import { Outlet } from "react-router-dom";
// import { ActionGroup } from "../../../common/components";

export const DistributionOverview = () => {
  // const navigate = useNavigate();

  return (
    <div className="DistributionOverview">
      {/* <ActionGroup
        groupProps={{
          mx: 0,
          mb: "lg",
        }}
        onClick={(selectedView) => {
          navigate(`/overview/${selectedView}`);
        }}
        options={operatorViews}
      /> */}
      <Outlet />
    </div>
  );
};

// const operatorViews = [
//   {
//     id: "tiles",
//     hoverTitle: "Kacheln",
//     icon: IconChartCohort,
//   },
//   {
//     id: "map",
//     hoverTitle: "Karte",
//     icon: IconMap,
//   },
//   {
//     id: "search",
//     hoverTitle: "Personensuche",
//     icon: IconUserSearch,
//   },
// ];
