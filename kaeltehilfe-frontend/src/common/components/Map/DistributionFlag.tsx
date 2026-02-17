import { Group, List, ListItem, Title } from "@mantine/core";
import { IconLocation } from "@tabler/icons-react";
import React from "react";
import { Popup } from "react-leaflet";
import { Flag, NumberedDistributionMarker } from ".";
import { Distribution } from "../../data";

import "./Map.scss";

type DistributionFlagProps = {
  colorSet: [string, string];
  distributions: Array<Distribution>;
  count: number;
};
export const DistributionFlag = React.forwardRef<
  L.Marker,
  DistributionFlagProps
>(({ distributions, colorSet, count }, ref) => {
  const { geoLocation } = distributions.find((d) => !!d.geoLocation) || {};

  return !geoLocation ? (
    <></>
  ) : (
    <Flag
      lat={geoLocation.lat}
      lng={geoLocation.lng}
      height={60}
      width={35}
      className="numbered-distribution-marker"
      ref={ref}
      popup={<DistributionFlagPopup distributions={distributions} />}
      marker={
        <NumberedDistributionMarker
          count={count}
          colorSet={colorSet}
          height={60}
        />
      }
    />
  );
});

const DistributionFlagPopup = ({
  distributions,
}: {
  distributions: Array<Distribution>;
}) => {
  const locationName =
    distributions?.find((d) => !!d.locationName)?.locationName ||
    "Unbekannter Ort";

  const clientNames = Array.from(
    new Set(distributions.map((d) => d.client.name)),
  );

  return (
    <Popup
      autoPan={false}
      keepInView={false}
      closeButton
      autoPanPaddingBottomRight={[100, 100]}
      offset={[0, -55]}
      maxWidth={400}
    >
      <Group mb="md" wrap="nowrap" w="100%">
        <IconLocation />
        <Title order={6}>{locationName}</Title>
      </Group>
      <List listStyleType="disclosure-closed">
        {clientNames.map((clientName) => (
          <ListItem key={clientName}>{clientName}</ListItem>
        ))}
      </List>
    </Popup>
  );
};
