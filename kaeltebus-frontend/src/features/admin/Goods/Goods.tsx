import { Box, Pill, PillGroup, Title } from "@mantine/core";
import { MRT_ColumnDef } from "mantine-react-table";
import React from "react";
import { openAppModal } from "../../../common/components";
import { ExportConfig, Table } from "../../../common/components/Table/Table";
import { Good, GoodTypeTranslation, useGoods } from "../../../common/data/good";
import { GoodModalContent } from "./GoodsModalContent";

export const Goods = () => {
  const {
    objs: { data: goods, isLoading },
    put: { isPending: isPutting },
    remove: { isPending: isDeleting, mutate: deleteGood },
  } = useGoods();

  const [selectedGoods, setSelectedGoods] = React.useState<Array<Good>>([]);

  const openModal = React.useCallback(
    () =>
      openAppModal({
        title: selectedGoods[0] ? "Bearbeiten" : "Hinzufügen",
        modalId: "GoodsModal",
        children: <GoodModalContent existing={selectedGoods[0]} />,
      }),
    [selectedGoods]
  );

  const columns: Array<MRT_ColumnDef<Good>> = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Beschreibung",
    },
    {
      accessorFn: ({ goodType }) => {
        if (!goodType) return "";

        const { label } = GoodTypeTranslation[goodType];
        return label ?? goodType;
      },
      header: "Typ",
      Cell: ({
        row: {
          original: { goodType },
        },
      }) => {
        if (!goodType) return <span></span>;
        const { icon: Icon, label } = GoodTypeTranslation[goodType];
        return (
          <Box style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <span>{label}</span>
            <Icon />
          </Box>
        );
      },
    },
    {
      header: "Zwei-Wochen-Warnung",
      accessorKey: "twoWeekThreshold",
    },
    {
      header: "Tags",
      accessorFn: ({ tags }) => tags?.join(", "),
      Cell: ({
        row: {
          original: { tags },
        },
      }) => {
        if (!tags || tags.length === 0) return <span></span>;
        return (
          <PillGroup size="md">
            {tags.map((tag, index) => (
              <Pill size="sm" key={index}>
                {tag}
              </Pill>
            ))}
          </PillGroup>
        );
      },
    },
  ];

  const exportConfig: ExportConfig<Good> = {
    fileName: () =>
      `KB-Gueter-${new Date().toLocaleDateString().replace(".", "_")}.xlsx`,
    transformators: {
      goodType: {
        columnName: "Typ",
        transformFn: ({ goodType }) =>
          goodType ? GoodTypeTranslation[goodType]?.label : "",
      },
    },
  };

  const handleEdit = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const handleDelete = React.useCallback(
    (goods: Array<Good>) => {
      goods.forEach((good) => deleteGood(good.id));
    },
    [deleteGood]
  );

  const handleAdd = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const isTableLoading = isLoading || isPutting || isDeleting;

  return (
    <>
      <Title size="h1" mb="lg">
        Güter
      </Title>

      <Table
        data={goods || []}
        isLoading={isTableLoading}
        keyGetter="id"
        columns={columns}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        exportConfig={exportConfig}
        fillScreen
        tableKey="goods-overview"
        setSelected={setSelectedGoods}
        enableGrouping
      />
    </>
  );
};
