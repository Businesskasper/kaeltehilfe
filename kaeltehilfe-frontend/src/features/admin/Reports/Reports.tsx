import { Card, LoadingOverlay, SimpleGrid, Text, Title } from "@mantine/core";
import React from "react";
import {
  useBusses,
  useClients,
  useDistributions,
  useGoods,
  useShifts,
  useVolunteers,
} from "../../../common/data";
import { toNormalizedDate } from "../../../common/utils";
import { ActivityPerBusChart } from "./charts/ActivityPerBusChart";
import { ClientDemographicsChart } from "./charts/ClientDemographicsChart";
import { ClientRetentionChart } from "./charts/ClientRetentionChart";
import { DistributionMapChart } from "./charts/DistributionMapChart";
import { DistributionsOverTimeChart } from "./charts/DistributionsOverTimeChart";
import { GoodsBreakdownChart } from "./charts/GoodsBreakdownChart";
import { ThresholdTable } from "./charts/ThresholdTable";
import { VolunteerParticipationChart } from "./charts/VolunteerParticipationChart";
import { ReportsFilterBar } from "./ReportsFilterBar";
import { filterDistributions, getDatePreset, ReportFilters } from "./reportUtils";

const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <Card withBorder padding="md" radius="md">
    <Title order={5} mb={subtitle ? 2 : "sm"}>
      {title}
    </Title>
    {subtitle && (
      <Text size="xs" c="dimmed" mb="sm">
        {subtitle}
      </Text>
    )}
    {children}
  </Card>
);

export const Reports = () => {
  const [filters, setFilters] = React.useState<ReportFilters>(() => {
    const { from, to } = getDatePreset("30d");
    return { from, to, busIds: [], goodTypes: [] };
  });

  const fromNormalized = toNormalizedDate(filters.from) ?? filters.from;
  const toNormalized =
    toNormalizedDate(new Date(filters.to).setDate(filters.to.getDate() + 1)) ?? filters.to;

  const { objs: { data: distributions = [], isLoading: loadingDist } } = useDistributions({
    from: fromNormalized,
    to: toNormalized,
  });

  const { objs: { data: goods = [], isLoading: loadingGoods } } = useGoods();
  const { objs: { data: clients = [], isLoading: loadingClients } } = useClients();
  const { objs: { data: shifts = [], isLoading: loadingShifts } } = useShifts();
  const { objs: { data: volunteers = [], isLoading: loadingVolunteers } } = useVolunteers();
  const { objs: { data: busses = [] } } = useBusses();

  const isLoading = loadingDist || loadingGoods || loadingClients || loadingShifts || loadingVolunteers;

  const filtered = React.useMemo(
    () => filterDistributions(distributions, goods, filters),
    [distributions, goods, filters],
  );

  return (
    <>
      <Title size="h2" mb="lg">
        Berichte
      </Title>

      <ReportsFilterBar filters={filters} setFilters={setFilters} busses={busses} />

      <div style={{ position: "relative" }}>
        <LoadingOverlay visible={isLoading} zIndex={10} overlayProps={{ blur: 2 }} />

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
          <ChartCard title="Ausgaben im Zeitverlauf">
            <DistributionsOverTimeChart distributions={filtered} />
          </ChartCard>

          <ChartCard title="Güterverteilung">
            <GoodsBreakdownChart distributions={filtered} goods={goods} />
          </ChartCard>

          <ChartCard title="Aktivität pro Schichtträger">
            <ActivityPerBusChart distributions={filtered} />
          </ChartCard>

          <ChartCard
            title="Neue vs. wiederkehrende Klienten"
            subtitle="Pro Woche im gewählten Zeitraum"
          >
            <ClientRetentionChart distributions={filtered} />
          </ChartCard>

          <ChartCard title="Klienten-Demografie">
            <ClientDemographicsChart distributions={filtered} clients={clients} />
          </ChartCard>

          <ChartCard title="Freiwilligen-Beteiligung" subtitle="Alle Schichten (zeitraumunabhängig)">
            <VolunteerParticipationChart shifts={shifts} volunteers={volunteers} />
          </ChartCard>
        </SimpleGrid>

        <Card withBorder padding="md" radius="md" mb="md">
          <Title order={5} mb="sm">
            Ausgaben-Karte
          </Title>
          <DistributionMapChart distributions={filtered} />
        </Card>

        <Card withBorder padding="md" radius="md" mb="md">
          <Title order={5} mb={4}>
            Güter-Schwellenwerte
          </Title>
          <Text size="xs" c="dimmed" mb="sm">
            Zeitraum in 14-Tage-Fenster aufgeteilt — ein Eintrag pro Klient, Gut und Fenster
          </Text>
          <ThresholdTable distributions={filtered} goods={goods} from={filters.from} to={filters.to} />
        </Card>
      </div>
    </>
  );
};
