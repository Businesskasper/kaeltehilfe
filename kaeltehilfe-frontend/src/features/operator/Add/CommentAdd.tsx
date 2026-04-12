import { Button, Group, Switch, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link, RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import { PlusMarker } from "../../../common/components/Map";
import { Flag } from "../../../common/components/Map/Flag";
import { useAddressLookup, useComments } from "../../../common/data";
import { useSelectedBus } from "../../../common/utils";
import { useProfile } from "../../../common/utils/useProfile";
import { requiredValidator, validators } from "../../../common/utils/validators";

import "./CommentAdd.scss";

const ZOOM = 18;

type CommentForm = {
  locationName: string;
  includeLocation: boolean;
  isAdminComment: boolean;
  isPinned: boolean;
};

export const CommentAdd = () => {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const profile = useProfile();

  const lat = locationState?.lat as number | undefined;
  const lng = locationState?.lng as number | undefined;
  const hasLocation = lat !== undefined && lng !== undefined;

  const { selectedRegistrationNumber, isOperator } = useSelectedBus();

  const {
    post: { mutate: postComment, isPending },
  } = useComments({ from: null, to: null });

  const {
    query: { data: resolvedAddress },
  } = useAddressLookup({ lat, lng });

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: "",
  });

  const form = useForm<CommentForm>({
    mode: "controlled",
    initialValues: {
      locationName: "",
      includeLocation: hasLocation,
      isAdminComment: false,
      isPinned: false,
    },
    validate: {
      locationName: (value, values) =>
        values.includeLocation ? validators(value, requiredValidator()) : null,
    },
  });

  // Pre-fill locationName from address lookup
  React.useEffect(() => {
    if (!resolvedAddress) return;
    let locationName = `${resolvedAddress.street ?? ""}${resolvedAddress.housenumber ? ` ${resolvedAddress.housenumber}` : ""}`;
    if (resolvedAddress.postcode || resolvedAddress.city) {
      locationName += `,${resolvedAddress.postcode ? ` ${resolvedAddress.postcode}` : ""}${resolvedAddress.city ? ` ${resolvedAddress.city}` : ""}`;
    }
    form.setFieldValue("locationName", locationName.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedAddress]);

  const resolveDisplayName = (values: CommentForm) => {
    if (!isOperator && values.isAdminComment) {
      return profile?.name ?? profile?.username ?? "Admin";
    }
    return selectedRegistrationNumber;
  };

  const onSubmit = (values: CommentForm) => {
    const html = editor?.getHTML() ?? "";
    const plainText = editor?.getText()?.trim() ?? "";

    if (!plainText) {
      form.setFieldError("text", "Bitte einen Kommentar eingeben");
      return;
    }

    postComment(
      {
        text: html,
        geoLocation: values.includeLocation && hasLocation ? { lat: lat!, lng: lng! } : null,
        locationName: values.includeLocation ? values.locationName || null : null,
        displayName: resolveDisplayName(values),
        isPinned: values.isPinned,
      },
      { onSettled: () => navigate(-1) },
    );
  };

  return (
    <div className="comment-add" style={{ maxWidth: 600, margin: "0 auto", padding: "1rem" }}>
      <Title mb="md" order={3}>
        Kommentar
      </Title>

      {hasLocation && (
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <MapContainer
            center={{ lat: lat!, lng: lng! }}
            zoom={ZOOM}
            minZoom={ZOOM}
            maxZoom={ZOOM}
            zoomControl={false}
            attributionControl={true}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            dragging={false}
            className="map-container"
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={ZOOM}
              minZoom={ZOOM}
              maxNativeZoom={ZOOM}
            />
            <Flag
              lat={lat!}
              lng={lng!}
              height={60}
              width={35}
              className="pointer-normal"
              marker={<PlusMarker height={60} />}
            />
          </MapContainer>
          {!form.values.includeLocation && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundColor: "var(--mantine-color-body)",
              opacity: 0.6,
              zIndex: 500,
              borderRadius: 5,
              pointerEvents: "none",
            }} />
          )}
        </div>
      )}

      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          {...form.getInputProps("locationName")}
          key={form.key("locationName")}
          label="Ort"
          placeholder="Ort"
          withAsterisk={form.values.includeLocation}
          disabled={!form.values.includeLocation}
          mb="md"
        />

        <Switch
          {...form.getInputProps("includeLocation", { type: "checkbox" })}
          key={form.key("includeLocation")}
          mb="md"
          label="Aktuellen Standort hinzufügen"
          disabled={!hasLocation}
        />

        {!isOperator && (
          <>
            <Switch
              {...form.getInputProps("isAdminComment", { type: "checkbox" })}
              key={form.key("isAdminComment")}
              mb="md"
              label="Admin Kommentar (nicht als Schichtträger)"
            />
            <Switch
              {...form.getInputProps("isPinned", { type: "checkbox" })}
              key={form.key("isPinned")}
              mb="md"
              label="Fixiert"
            />
          </>
        )}

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

        {form.errors.text && (
          <div style={{ color: "var(--mantine-color-red-6)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            {form.errors.text}
          </div>
        )}

        <Group justify="space-between">
          <Button onClick={() => navigate(-1)} variant="default" type="button">
            Abbrechen
          </Button>
          <Button loading={isPending} type="submit">
            Abschicken
          </Button>
        </Group>
      </form>
    </div>
  );
};
