import { Title, Tooltip } from "@mantine/core";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import {
  ExportConfig,
  Table,
  TransformFn,
  openAppModal,
} from "../../../common/components";
import { Shift, useShifts } from "../../../common/data";
import {
  VolunteerCriterionLabel,
  useShiftRules,
} from "../../../common/data/shiftRule";
import { compareByDateOnly, formatDate } from "../../../common/utils";
import { ShiftModalContent } from "./ShiftModalContent";
import { CRITERION_ICONS, getFailingRules } from "./shiftRuleUtils";

export const Shifts = () => {
  const {
    objs: { data: shifts, isLoading },
    put: { isPending: isPutting },
    remove: { isPending: isDeleting, mutate: deleteShift },
  } = useShifts();

  const { objs: { data: rules } } = useShiftRules();

  const [selectedShifts, setSelectedShifts] = React.useState<Array<Shift>>([]);

  const openModal = React.useCallback(
    () =>
      openAppModal({
        title: selectedShifts[0] ? "Bearbeiten" : "Hinzufügen",
        modalId: "ShiftsModal",
        children: <ShiftModalContent existing={selectedShifts[0]} />,
      }),
    [selectedShifts],
  );

  const countVolunteers = shifts?.reduce((sum, shift) => {
    const countVolunteers = shift.volunteers?.length || 0;
    return sum >= countVolunteers ? sum : countVolunteers;
  }, 0);

  const volunteerColumns: Array<MRT_ColumnDef<Shift>> = Array.from(
    Array(countVolunteers).keys(),
  ).map((index) => ({
    id: `volunteer_${index + 1}`,
    header: `Freiwilliger ${index + 1}`,
    accessorFn: ({ volunteers }) => volunteers?.[index]?.fullname,
  }));

  const columns: Array<MRT_ColumnDef<Shift>> = [
    {
      id: "date",
      accessorFn: ({ date }) => formatDate(date),
      header: "Datum",
      sortingFn: (a, b) => {
        return compareByDateOnly(a.original.date, b.original.date);
      },
    },
    {
      id: "registrationNumber",
      accessorKey: "registrationNumber",
      header: "Fahrzeug",
    },
    {
      id: "planning_state",
      header: "Planungsstatus",
      accessorFn: (shift) => {
        const failingRules = getFailingRules(rules ?? [], shift);

        return failingRules.length === 0 ? (
          <IconCircleCheckFilled fill="green" />
        ) : (
          <>
            {failingRules.map((r) => (
              <Tooltip
                key={r.id}
                events={{ hover: true, touch: true, focus: true }}
                label={`${VolunteerCriterionLabel[r.criterion]}: mind. ${r.threshold}`}
              >
                <span>{CRITERION_ICONS[r.criterion]}</span>
              </Tooltip>
            ))}
          </>
        );
      },
    },
    ...volunteerColumns,
  ];

  const volunteerExportColumns: Array<{
    key: string;
    transformFn: TransformFn<Shift>;
  }> = Array.from(Array(countVolunteers).keys()).map((index) => ({
    key: `Freiwilliger ${index + 1}`,
    transformFn: (shift) => shift.volunteers?.[index]?.fullname || "",
  }));

  const exportConfig: ExportConfig<Shift> = {
    fileName: () =>
      `KH-Schichten-${new Date().toLocaleDateString().replace(".", "_")}.xlsx`,
    manualColumns: volunteerExportColumns,
  };

  const handleEdit = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const handleDelete = React.useCallback(
    (shifts: Array<Shift>) => {
      shifts.forEach((shift) => deleteShift(shift.id));
    },
    [deleteShift],
  );

  const handleAdd = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const isTableLoading = isLoading || isPutting || isDeleting;

  return (
    <>
      <Title size="h2" mb="lg">
        Schichten
      </Title>

      <Table
        data={shifts || []}
        isLoading={isTableLoading}
        keyGetter="id"
        columns={columns}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        exportConfig={exportConfig}
        fillScreen
        tableKey="shifts-overview"
        setSelected={setSelectedShifts}
        defaultSorting={[{ id: "date", desc: true }]}
        enableGrouping
      />
    </>
  );
};
