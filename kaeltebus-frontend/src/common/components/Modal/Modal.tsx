import { Modal, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";
import { classes } from "../../utils";

import "./Modal.scss";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  title: string;
  children?: Array<
    React.ReactElement<ModalMainProps> | React.ReactElement<ModalActionProps>
  >;
};

export const AppModal = ({ isOpen, close, title, children }: ModalProps) => {
  const isMobile = useMediaQuery("(max-width: 50em)");

  return (
    <Modal.Root
      className={classes({
        modal: true,
        "full-width": !!isMobile,
      })}
      opened={isOpen}
      onClose={close}
      centered
      size="lg"
      fullScreen={isMobile}
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            <Title order={3}>{title}</Title>
          </Modal.Title>
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
