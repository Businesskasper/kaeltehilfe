import { Button, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import { ModalActions, ModalMain } from "../../../common/components/Modal/Modal";
import { Comment, useComments } from "../../../common/data";

type CommentModalContentProps = {
  existing?: Comment;
};

export const CommentModalContent = ({ existing }: CommentModalContentProps) => {
  const {
    update: { mutate: update, isPending },
  } = useComments({ from: null, to: null });

  const form = useForm({
    initialValues: { isPinned: false },
  });

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: existing?.text ?? "",
  });

  React.useEffect(() => {
    if (existing) {
      form.setValues({ isPinned: existing.isPinned });
      editor?.commands.setContent(existing.text ?? "");
    }
    form.resetDirty();
    form.resetTouched();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const closeModal = () => modals.close("CommentModal");

  const onSubmit = () => {
    if (!existing) return;
    const html = editor?.getHTML() ?? "";
    update(
      { id: existing.id, update: { text: html, isPinned: form.values.isPinned } },
      { onSuccess: closeModal },
    );
  };

  return (
    <>
      <ModalMain>
        <RichTextEditor editor={editor} mb="md">
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
          <RichTextEditor.Content />
        </RichTextEditor>
        <Switch
          mt="md"
          label="Fixiert"
          {...form.getInputProps("isPinned", { type: "checkbox" })}
        />
      </ModalMain>
      <ModalActions>
        <Button loading={isPending} fullWidth mt="xl" onClick={onSubmit}>
          Abschicken
        </Button>
      </ModalActions>
    </>
  );
};
