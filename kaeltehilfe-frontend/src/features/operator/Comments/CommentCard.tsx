import { Badge, Card, Group, Text } from "@mantine/core";
import { IconMapPin, IconPin } from "@tabler/icons-react";
import { Comment, GeoLocation } from "../../../common/data";
import { formatDateTime } from "../../../common/utils";

type CommentCardProps = {
  comment: Comment;
  onClick?: (geoLocation: GeoLocation) => void;
};

export const CommentCard = ({ comment, onClick }: CommentCardProps) => {
  const hasLocation =
    comment.geoLocation !== null && comment.geoLocation !== undefined;

  const handleClick = () => {
    if (hasLocation && onClick) {
      onClick(comment.geoLocation!);
    }
  };

  return (
    <Card
      withBorder
      mb="sm"
      onClick={handleClick}
      style={{ cursor: hasLocation && onClick ? "pointer" : "default" }}
    >
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          {comment.isPinned && (
            <Badge
              color="yellow"
              variant="filled"
              size="sm"
              leftSection={<IconPin size={10} />}
            >
              Fixiert
            </Badge>
          )}
          <Text size="xs" c="dimmed">
            {comment.displayName}
          </Text>
        </Group>

        <Group gap="xs" wrap="nowrap">
          {hasLocation && (
            <IconMapPin size={14} style={{ color: "var(--mantine-color-cyan-6)" }} />
          )}
          {comment.locationName && (
            <Text size="xs" c="dimmed" >
              {comment.locationName}
            </Text>
          )}
        </Group>

      </Group>
      <Text size="xs" c="dimmed">
        {formatDateTime(comment.addOn)}
      </Text>
      <div
        // Comment text is HTML produced by the Tiptap rich text editor
        dangerouslySetInnerHTML={{ __html: comment.text }}
        style={{ fontSize: "0.9rem" }}
      />
    </Card>
  );
};
