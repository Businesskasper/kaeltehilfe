import { Checkbox, Title } from "@mantine/core";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { openAppModal } from "../../../common/components";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import { GenderTranslation } from "../../../common/data/gender";
import { Volunteer, useVolunteers } from "../../../common/data/volunteer";
import { VolunteerModalContent } from "./VolunteersModalContent";

export const Volunteers = () => {
  const {
    objs: { data: volunteers, isLoading },
    put: { isPending: isPutting },
    remove: { isPending: isDeleting, mutate: deleteVolunteer },
  } = useVolunteers();

  const [selectedVolunteers, setSelectedVolunteers] = React.useState<
    Array<Volunteer>
  >([]);

  const openModal = React.useCallback(
    () =>
      openAppModal({
        title: selectedVolunteers[0] ? "Bearbeiten" : "Hinzufügen",
        modalId: "VolunteersModal",
        children: <VolunteerModalContent existing={selectedVolunteers[0]} />,
      }),
    [selectedVolunteers]
  );

  const columns: Array<MRT_ColumnDef<Volunteer>> = [
    {
      accessorKey: "fullname",
      header: "Name",
    },
    {
      accessorFn: ({ gender }) => {
        if (!gender) return "";

        const { label } = GenderTranslation[gender];
        return label ?? gender;
      },
      header: "Geschlecht",
    },
    {
      header: "Fahrer",
      accessorKey: "isDriver",
      Cell: ({
        row: {
          original: { isDriver },
        },
      }) => (
        <Checkbox
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.bubbles = false;
          }}
          onChange={(e) => {
            e.preventDefault();
            e.bubbles = false;
          }}
          checked={isDriver}
        />
      ),
    },
    {
      accessorKey: "remarks",
      header: "Notizen",
    },
  ];

  const exportConfig: ExportConfig<Volunteer> = {
    fileName: () =>
      `KB-Freiwillige-${new Date()
        .toLocaleDateString()
        .replace(".", "_")}.xlsx`,
    transformators: {
      gender: {
        columnName: "Geschlecht",
        transformFn: ({ gender }) =>
          gender ? GenderTranslation[gender]?.label : "",
      },
    },
  };

  const handleEdit = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const handleDelete = React.useCallback(
    (volunteers: Array<Volunteer>) => {
      volunteers.forEach((volunteer) => deleteVolunteer(volunteer.id));
    },
    [deleteVolunteer]
  );

  const handleAdd = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const isTableLoading = isLoading || isPutting || isDeleting;

  return (
    <>
      <Title size="h1" mb="lg">
        Freiwillige
      </Title>

      <Table
        data={volunteers || []}
        isLoading={isTableLoading}
        keyGetter="id"
        columns={columns}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        exportConfig={exportConfig}
        fillScreen
        tableKey="volunteers-overview"
        setSelected={setSelectedVolunteers}
        enableGrouping
      />
    </>
  );
};
