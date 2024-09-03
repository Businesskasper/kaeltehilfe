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
import { ExportConfig, Table } from "../../../common/components";
import { formatDate } from "../../../common/utils";
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

  const columns: Array<MRT_ColumnDef<Shift>> = [
    {
      accessorFn: ({ date }) => formatDate(date),
      header: "Datum",
    },
    {
      header: "Freiwillige",
      accessorFn: ({ volunteers }) =>
        volunteers?.map((v) => v.fullname).join(", "),
    },
    {
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
  ];

  const exportConfig: ExportConfig<Shift> = {
    fileName: () =>
      `KB-Schichten-${new Date().toLocaleDateString().replace(".", "_")}.xlsx`,
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
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        exportConfig={exportConfig}
        fillScreen
        tableKey="shifts-overview"
        setSelected={setSelectedShifts}
      />
      <ShiftModal
        close={closeModal}
        isOpen={isModalOpened}
        existing={selectedShifts[0]}
      />
    </>
  );
};
