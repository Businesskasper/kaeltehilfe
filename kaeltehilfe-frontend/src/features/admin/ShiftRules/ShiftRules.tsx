import {
  Divider,
  Group,
  NumberInput,
  Paper,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { openAppModal } from "../../../common/components";
import { Table } from "../../../common/components/Table/Table";
import {
  GLOBAL_CRITERION_ORDER,
  ShiftRule,
  VolunteerCriterion,
  VolunteerCriterionLabel,
  useShiftRules,
} from "../../../common/data/shiftRule";
import { ShiftRuleModalContent } from "./ShiftRuleModalContent";

type GlobalRuleRowProps = {
  rule: ShiftRule;
  onToggle: (rule: ShiftRule) => void;
  onThresholdChange: (rule: ShiftRule, threshold: number) => void;
};

const GlobalRuleRow = ({
  rule,
  onToggle,
  onThresholdChange,
}: GlobalRuleRowProps) => {
  const [localThreshold, setLocalThreshold] = React.useState(rule.threshold);

  React.useEffect(() => {
    setLocalThreshold(rule.threshold);
  }, [rule.threshold]);

  return (
    <Group justify="space-between" align="center" wrap="nowrap">
      <Switch
        checked={rule.isActive}
        onChange={() => onToggle(rule)}
        label={
          <Text fw={rule.isActive ? 500 : 400} c={rule.isActive ? undefined : "dimmed"}>
            {VolunteerCriterionLabel[rule.criterion]}
          </Text>
        }
      />
      <NumberInput
        value={localThreshold}
        onChange={(v) => setLocalThreshold(Number(v) || 1)}
        onBlur={() => {
          if (localThreshold !== rule.threshold && localThreshold >= 1) {
            onThresholdChange(rule, localThreshold);
          }
        }}
        min={1}
        disabled={!rule.isActive}
        w={90}
        size="xs"
        rightSection={<Text size="xs" c="dimmed" pr={4}>Min.</Text>}
        rightSectionWidth={40}
      />
    </Group>
  );
};

export const ShiftRules = () => {
  const {
    objs: { data: rules, isLoading },
    put: { mutate: put, isPending: isPutting },
    post: { isPending: isPosting },
    remove: { isPending: isDeleting, mutate: deleteRule },
  } = useShiftRules();

  const globalRules = React.useMemo(() => {
    const ruleMap = new Map(
      (rules ?? [])
        .filter((r) => r.busId == null)
        .map((r) => [r.criterion, r]),
    );
    return GLOBAL_CRITERION_ORDER.map((c) => ruleMap.get(c)).filter(
      Boolean,
    ) as ShiftRule[];
  }, [rules]);

  const busRules = React.useMemo(
    () => (rules ?? []).filter((r) => r.busId != null),
    [rules],
  );

  const [selectedBusRules, setSelectedBusRules] = React.useState<ShiftRule[]>([]);

  const handleToggle = React.useCallback(
    (rule: ShiftRule) => {
      put({
        id: rule.id,
        update: {
          criterion: rule.criterion,
          threshold: rule.threshold,
          isActive: !rule.isActive,
          busId: rule.busId,
        },
      });
    },
    [put],
  );

  const handleThresholdChange = React.useCallback(
    (rule: ShiftRule, threshold: number) => {
      put({
        id: rule.id,
        update: {
          criterion: rule.criterion,
          threshold,
          isActive: rule.isActive,
          busId: rule.busId,
        },
      });
    },
    [put],
  );

  const openBusRuleModal = React.useCallback(
    (existing?: ShiftRule) =>
      openAppModal({
        title: existing ? "Regel bearbeiten" : "Regel hinzufügen",
        modalId: "ShiftRuleModal",
        children: <ShiftRuleModalContent existing={existing} />,
      }),
    [],
  );

  const handleAdd = React.useCallback(
    () => openBusRuleModal(),
    [openBusRuleModal],
  );

  const handleEdit = React.useCallback(
    () => openBusRuleModal(selectedBusRules[0]),
    [openBusRuleModal, selectedBusRules],
  );

  const handleDelete = React.useCallback(
    (rulesToDelete: ShiftRule[]) => {
      rulesToDelete.forEach((r) => deleteRule(r.id));
    },
    [deleteRule],
  );

  const busRuleColumns: MRT_ColumnDef<ShiftRule>[] = [
    {
      accessorKey: "busRegistrationNumber",
      header: "Schichtträger",
    },
    {
      accessorFn: ({ criterion }) =>
        VolunteerCriterionLabel[criterion as VolunteerCriterion] ?? criterion,
      header: "Kriterium",
    },
    {
      accessorKey: "threshold",
      header: "Mindestanzahl",
    },
  ];

  const isTableLoading = isLoading || isPutting || isPosting || isDeleting;

  return (
    <>
      <Title size="h2" mb="lg">
        Schichtregeln
      </Title>

      <Title size="h4" mb="sm">
        Globale Regeln
      </Title>
      <Paper withBorder p="md" mb="xl" maw={480}>
        <Stack gap="sm">
          {globalRules.map((rule, index) => (
            <React.Fragment key={rule.id}>
              {index > 0 && <Divider />}
              <GlobalRuleRow
                rule={rule}
                onToggle={handleToggle}
                onThresholdChange={handleThresholdChange}
              />
            </React.Fragment>
          ))}
        </Stack>
      </Paper>

      <Title size="h4" mb="sm">
        Schichtträger-spezifische Regeln
      </Title>
      <Table
        data={busRules}
        isLoading={isTableLoading}
        keyGetter="id"
        columns={busRuleColumns}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        tableKey="shift-rules-bus"
        setSelected={setSelectedBusRules}
        fillScreen
      />
    </>
  );
};
