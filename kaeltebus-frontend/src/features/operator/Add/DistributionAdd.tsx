import { Grid, LoadingOverlay, Stepper } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { useClients } from "../../../common/app";
import { FormClients } from "./FormClients";
import { FormGoods } from "./FormGoods";
import { FormLocation } from "./FormLocation";

import "./DistributionAdd.scss";

export const DistributionAdd = () => {
  const {
    objs: { isLoading: isClientsLoading },
  } = useClients();

  const isLoading = isClientsLoading;

  enum FormStep {
    LOCATION,
    CLIENTS,
    GOODS,
  }
  const [active, setActive] = useState<FormStep>(FormStep.LOCATION);
  // const nextStep = () =>
  //   setActive((current) => (current < 3 ? current + 1 : current));
  // const prevStep = () =>
  //   setActive((current) => (current > 0 ? current - 1 : current));

  const isDesktop = useMediaQuery("(min-width: 62em)");

  return (
    <div className="DistributionAdd">
      <Grid
        gutter={20}
        columns={12}
        justify={isDesktop ? "flex-start" : "center"}
      >
        {isLoading && <LoadingOverlay visible />}
        <Grid.Col
          span={{
            base: 9,
            md: 3,
            lg: 3,
            xl: 3,
          }}
        >
          <Stepper
            active={active}
            onStepClick={setActive}
            orientation={isDesktop ? "vertical" : "horizontal"}
            classNames={{ root: "DistributionStepperRoot" }}
          >
            <Stepper.Step orientation="vertical" label="Ort" />
            <Stepper.Step orientation="vertical" label="Klienten" />
            <Stepper.Step orientation="vertical" label="Güter" />
            {/* <Stepper.Step orientation="vertical" label="Senden" /> */}
            {/* <Stepper.Completed>
                  Completed, click back button to get to previous step
                </Stepper.Completed> */}
          </Stepper>
        </Grid.Col>

        <Grid.Col span={{ base: 8, md: 6, lg: 6, xl: 6 }}>
          {active === FormStep.LOCATION && (
            <FormLocation toNext={() => setActive(FormStep.CLIENTS)} />
          )}
          {active === FormStep.CLIENTS && <FormClients />}
          {active === FormStep.GOODS && <FormGoods />}
        </Grid.Col>
      </Grid>
    </div>
  );
};
