import { MantineSize, Modal, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import React from "react";
import { classes, useBreakpoint } from "../../utils";

import "./Modal.scss";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  title: string;
  size?: number | MantineSize;
  children?:
    | Array<
        | React.ReactElement<ModalMainProps>
        | React.ReactElement<ModalActionProps>
      >
    | React.ReactElement<ModalMainProps>
    | React.ReactElement<ModalActionProps>;
};

type OpenAppModalProps = {
  modalId?: string;
  title: string;
  size?: number | MantineSize;
  children:
    | Array<
        | React.ReactElement<ModalMainProps>
        | React.ReactElement<ModalActionProps>
      >
    | React.ReactElement<ModalMainProps>
    | React.ReactElement<ModalActionProps>;
};
export const openAppModal = (props: OpenAppModalProps) => {
  modals.open({
    modalId: props.modalId,
    withCloseButton: false,
    size: props.size || "lg",
    children: (
      <>
        <Modal.Header>
          <Title order={3}>{props.title}</Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>{props.children}</Modal.Body>
      </>
    ),
  });
};

/**
 * @deprecated Use {@link openAppModal} instead!
 * @param param0
 * @returns
 */
export const AppModal = ({
  isOpen,
  close,
  title,
  children,
  size,
}: ModalProps) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "BASE" || breakpoint === "XS";

  return (
    <Modal.Root
      className={classes({
        modal: true,
        "full-width": !!isMobile,
      })}
      opened={isOpen}
      onClose={close}
      centered
      size={size || "lg"}
      fullScreen={isMobile}
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          {/* <Modal.Title> */}
          <Title order={3}>{title}</Title>
          {/* </Modal.Title> */}
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

type ModalMainProps = React.PropsWithChildren;
export const ModalMain = ({ children }: ModalMainProps) => {
  return <div className="modal-main">{children}</div>;
};

type ModalActionProps = React.PropsWithChildren;
export const ModalActions = ({ children }: ModalActionProps) => {
  return <div className="modal-actions">{children}</div>;
};
