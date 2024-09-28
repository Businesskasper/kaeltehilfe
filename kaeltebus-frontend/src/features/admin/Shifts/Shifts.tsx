import { Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCircleCheckFilled,
  IconSteeringWheelFilled,
  IconUsersGroup,
  IconWomanFilled,
} from "@tabler/icons-react";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { Shift, useShifts } from "../../../common/app";
import { ExportConfig, Table, TransformFn } from "../../../common/components";
import { compareByDateOnly, formatDate } from "../../../common/utils";
import { ShiftModal } from "./ShiftModal";

export const Shifts = () => {
  const {
    objs: { data: shifts, isLoading },
    put: { isPending: isPutting },
    remove: { isPending: isDeleting, mutate: deleteShift },
  } = useShifts();

  const [selectedShifts, setSelectedShifts] = React.useState<Array<Shift>>([]);

  const [isModalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const countVolunteers = shifts?.reduce((sum, shift) => {
    const countVolunteers = shift.volunteers?.length || 0;
    return sum >= countVolunteers ? sum : countVolunteers;
  }, 0);

  const volunteerColumns: Array<MRT_ColumnDef<Shift>> = Array.from(
    Array(countVolunteers).keys()
  ).map((index) => ({
    id: `volunteer_${index + 1}`,
    header: `Freiwilliger ${index + 1}`,
    // accessorKey: `volunteers[${index}].fullname`,
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
      accessorFn: ({ volunteers }) => {
        const driver = volunteers?.find((v) => v.isDriver);
        const female = volunteers?.find((v) => v.gender === "FEMALE");
        const count = volunteers?.length || 0;

        return driver && female && count >= 3 ? (
          <IconCircleCheckFilled fill="green" />
        ) : (
          <>
            {!driver && (
              <Tooltip label="Kein Fahrer">
                <IconSteeringWheelFilled fill="red" />
              </Tooltip>
            )}
            {!female && (
              <Tooltip label="Keine weibliche Freiwillige">
                <IconWomanFilled fill="red" />
              </Tooltip>
            )}
            {count < 3 && (
              <Tooltip label="Mindestanzahl nicht erreicht">
                <IconUsersGroup fill="red" style={{ color: "red" }} />
              </Tooltip>
            )}
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
      `KB-Schichten-${new Date().toLocaleDateString().replace(".", "_")}.xlsx`,
    manualColumns: volunteerExportColumns,
  };

  const handleEdit = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const handleDelete = React.useCallback(
    (shifts: Array<Shift>) => {
      shifts.forEach((shift) => deleteShift(shift.id));
    },
    [deleteShift]
  );

  const handleAdd = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const isTableLoading = isLoading || isPutting || isDeleting;

  return (
    <>
      <Title size="h1" mb="lg">
        Schichten
      </Title>

      <Table
        data={shifts || []}
        isLoading={isTableLoading}
        keyGetter="id"
        columns={columns}
        // columns={isLoading ? [] : columns}
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
      <ShiftModal
        close={closeModal}
        isOpen={isModalOpened}
        existing={selectedShifts[0]}
      />
    </>
  );
};
