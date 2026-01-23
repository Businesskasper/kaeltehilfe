import { Distribution, useDistribtions } from "../../../../common/data";
import { ExistingDistributionFlag } from "./MapControls";

const colorSets = {
  RED: ["#E46450", "#A51E0F"],
  // BLUE: ["#3f93cf", "#3882b6"],
  // GREEN: ["#4CAF50", "#357a38"],
  CYAN: ["#00FFFF", "#00E0E0"],
  ORANGE: ["#F59E0B", "#D97706"],
} satisfies { [key: string]: [string, string] };

export const DistributionsLayer = () => {
  const now = new Date();
  const queryTo = new Date(now.setHours(23, 59, 59, 999));
  const yesterday = new Date(now.setDate(now.getDate() - 1));
  const queryFrom = new Date(yesterday.setHours(0, 0, 0, 0));
  const {
    query: { data: distributions },
  } = useDistribtions({ from: queryFrom, to: queryTo });

  return (
    <>
      {distributions
        ?.filter(
          (
            dist,
          ): dist is Distribution & {
            geoLocation: { lat: number; lng: number };
          } => !!dist?.geoLocation,
        )
        ?.map((dist) => (
          <ExistingDistributionFlag
            colorSet={colorSets.RED}
            lat={dist.geoLocation.lat}
            lng={dist.geoLocation.lng}
            key={dist.id}
          />
        ))}
    </>
  );
};
