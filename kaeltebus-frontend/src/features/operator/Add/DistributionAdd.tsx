import {
  Button,
  Grid,
  Group,
  LoadingOverlay,
  Stepper,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gender,
  useClients,
  useGoods,
  usePostBatchDistribution,
} from "../../../common/app";
import {
  requiredValidator,
  validators,
} from "../../../common/utils/validators";
import {
  DistributionForm,
  DistributionFormProvider,
  useDistributionForm,
} from "./DistributionFormContext";
import { FormClients } from "./FormClients";
import { FormGoods } from "./FormGoods";
import { FormLocation } from "./FormLocation";

import { IconLayoutSidebarRightExpand } from "@tabler/icons-react";
import { useBreakpoint } from "../../../common/utils";
import "./DistributionAdd.scss";

export const DistributionAdd = () => {
  const navigate = useNavigate();

  const {
    objs: { isLoading: isClientsLoading },
  } = useClients();
  const {
    objs: { isLoading: isGoodsLoading },
  } = useGoods();

  const {
    isPending: isBatchDistributionPosting,
    mutateAsync: postBatchDistribution,
  } = usePostBatchDistribution();

  const form = useDistributionForm({
    mode: "controlled",
    initialValues: {
      locationName: "",
      clients: [
        {
          id: undefined as unknown as number,
          name: "",
          approxAge: undefined as unknown as number,
          gender: undefined as unknown as Gender,
        },
      ],
      goods: [],
    },
    validate: {
      locationName: (value) => validators(value, requiredValidator()),
      clients: {
        name: (value, values) => {
          if (!value) return "Bitte wählen oder neu eingeben";

          const allClientsByName = values.clients?.filter(
            (c) => c.name?.trim() === value?.toString()?.trim()
          );
          if (allClientsByName.length > 1) {
            return "Clienten können nicht mehrfach gewählt werden";
          }
        },
        approxAge: (value) => validators(value, requiredValidator()),
      },
      goods: (value) =>
        validators(
          value,
          requiredValidator("Array", "Mindestens ein Gut muss gewählt werden")
        ),
    },
  });

  const onSubmit = (formModel: DistributionForm) => {
    console.log("formModel", formModel);
    postBatchDistribution(formModel).then(() => navigate(`/operator`));
  };

  const isLoading =
    isClientsLoading || isGoodsLoading || isBatchDistributionPosting;

  enum FormStep {
    LOCATION,
    CLIENTS,
    GOODS,
  }
  const countSteps = Object.keys(FormStep).length / 2;

  const [activeStep, setActiveStep] = useState<FormStep>(FormStep.LOCATION);
  const lastActiveStep = React.useRef(activeStep);
  React.useEffect(() => {
    lastActiveStep.current = activeStep;
  }, [activeStep]);
  const updateActiveStep = (newStep: FormStep) => {
    let hasError = false;

    if (newStep > activeStep) {
      const fieldsToValidate: Array<string> =
        lastActiveStep.current === FormStep.LOCATION
          ? ["locationName"]
          : lastActiveStep.current === FormStep.CLIENTS
          ? [
              // "clients",
              ...form.values.clients.map((_, index) => `clients.${index}.name`),
              ...form.values.clients.map(
                (_, index) => `clients.${index}.approxAge`
              ),
            ]
          : lastActiveStep.current === FormStep.GOODS
          ? ["goods"]
          : [];

      hasError = fieldsToValidate.reduce((hasError, field) => {
        return hasError || form.validateField(field).hasError;
      }, false);
    }

    if (!hasError) setActiveStep(newStep);
  };

  const [isDrawerOpen, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(true);

  const breakpoint = useBreakpoint();
  const isDesktop =
    breakpoint === "SM" ||
    breakpoint === "MD" ||
    breakpoint === "LG" ||
    breakpoint === "XL";

  return (
    <div className="DistributionAdd">
      <DistributionFormProvider form={form}>
        <Grid
          gutter={20}
          columns={12}
          mb="64px"
          justify={isDesktop ? "flex-start" : "center"}
        >
          {isLoading && <LoadingOverlay visible />}
          <form
            style={{ display: "contents" }}
            onSubmit={form.onSubmit(onSubmit)}
            onKeyDown={(event) => {
              if (event.code === "Enter") {
                event.preventDefault();
                event.bubbles = false;
              }
            }}
          >
            <Grid.Col
              span={{
                base: 11,
                xs: 9,
                sm: 7,
                md: 7,
                lg: 7,
                xl: 7,
              }}
              offset={{
                // base: 1,
                // xs: 1,
                sm: 4,
                md: 4,
                lg: 3,
                xl: 3,
              }}
            >
              <Group justify="space-between" align="baseline">
                <Title mb="md" order={3}>
                  Ausgabe
                  {/* {breakpoint !== "BASE"
                    ? "Ausgabe"
                    : activeStep === FormStep.LOCATION
                    ? "Ort"
                    : activeStep === FormStep.CLIENTS
                    ? "Klienten"
                    : "Güter"} */}
                </Title>
                {activeStep === FormStep.GOODS && (
                  // <ActionIcon
                  //   onClick={openDrawer}
                  //   variant="transparent"
                  //   color="gray"
                  // >
                  //   <IconLayoutSidebarRightExpand />
                  // </ActionIcon>
                  <Button
                    onClick={openDrawer}
                    variant="transparent"
                    color="gray"
                  >
                    <Group gap="sm">
                      <span>Güter wählen</span> <IconLayoutSidebarRightExpand />
                    </Group>
                  </Button>
                )}
              </Group>
            </Grid.Col>
            <Grid.Col
              span={{
                base: 12,
                xs: 9,
                sm: 3,
                md: 3,
                lg: 2,
                xl: 2,
              }}
              offset={isDesktop ? 1 : undefined}
              display={breakpoint === "BASE" ? "none" : undefined}
            >
              <Stepper
                active={activeStep}
                onStepClick={updateActiveStep}
                orientation={isDesktop ? "vertical" : "horizontal"}
                classNames={{ root: "DistributionStepperRoot" }}
              >
                <Stepper.Step
                  orientation="vertical"
                  label="Ort"
                  description={
                    <div
                      style={{ marginBottom: "12px", wordBreak: "break-word" }}
                    >
                      {activeStep !== FormStep.LOCATION
                        ? form.values.locationName
                        : undefined}
                    </div>
                  }
                />
                <Stepper.Step
                  orientation="vertical"
                  label="Klienten"
                  description={
                    <div
                      style={{ marginBottom: "12px", wordBreak: "break-word" }}
                    >
                      {activeStep !== FormStep.CLIENTS
                        ? form.values.clients.map((c, index) => (
                            <Text key={index} size="sm">
                              {c.name || ""}
                            </Text>
                          ))
                        : undefined}
                    </div>
                  }
                />
                <Stepper.Step orientation="vertical" label="Güter" />
                {/* <Stepper.Step orientation="vertical" label="Senden" /> */}
              </Stepper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 10, sm: 7, md: 7, lg: 7, xl: 7 }}>
              {activeStep === FormStep.LOCATION && <FormLocation />}
              {activeStep === FormStep.CLIENTS && <FormClients />}
              {activeStep === FormStep.GOODS && (
                <FormGoods
                  isDrawerOpen={isDrawerOpen}
                  closeDrawer={closeDrawer}
                />
              )}
              <Group justify="space-between" mt="xl">
                <Button onClick={() => navigate("/operator")} variant="default">
                  Abbrechen
                </Button>

                <Group>
                  <Button
                    onClick={() => {
                      updateActiveStep(
                        activeStep > 0 ? activeStep - 1 : activeStep
                      );
                    }}
                    disabled={activeStep === FormStep.LOCATION}
                    variant="outline"
                  >
                    Zurück
                  </Button>
                  {activeStep === FormStep.GOODS ? (
                    <Button
                      disabled={
                        !form.isTouched() ||
                        !form.isDirty() ||
                        !form.values.goods ||
                        form.values.goods.length === 0
                      }
                      onClick={() => form.onSubmit(onSubmit)()}
                    >
                      Absenden
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        updateActiveStep(
                          activeStep < countSteps - 1
                            ? activeStep + 1
                            : activeStep
                        );
                      }}
                      disabled={
                        activeStep === FormStep.LOCATION
                          ? !form.values.locationName
                          : activeStep === FormStep.CLIENTS
                          ? !form.values.clients ||
                            form.values.clients.length === 0
                          : false
                      }
                    >
                      Weiter
                    </Button>
                  )}
                </Group>
              </Group>
            </Grid.Col>
          </form>
        </Grid>
      </DistributionFormProvider>
    </div>
  );
};
