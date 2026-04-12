import { ScrollArea, Text } from "@mantine/core";
import React from "react";
import { Comment, GeoLocation } from "../../../common/data";
import { CommentCard } from "./CommentCard";

type CommentsListProps = {
  comments: Array<Comment>;
  onCommentClick?: (geoLocation: GeoLocation) => void;
};

export const CommentsList = ({ comments, onCommentClick }: CommentsListProps) => {
  const sorted = React.useMemo(
    () => [...comments].sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    }),
    [comments],
  );

  if (sorted.length === 0) {
    return (
      <Text c="dimmed" ta="center" mt="xl">
        Keine Kommentare vorhanden
      </Text>
    );
  }

  return (
    <ScrollArea h="100%" type="auto">
      {sorted.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          onClick={onCommentClick}
        />
      ))}
    </ScrollArea>
  );
};
