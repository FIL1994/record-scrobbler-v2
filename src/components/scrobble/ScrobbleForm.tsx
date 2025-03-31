import { Button } from "~/components/starter-kit/Button";
import { TextField } from "~/components/starter-kit/TextField";
import { Form } from "react-aria-components";
import type { ChangeEvent } from "react";

export interface ScrobbleFormData {
  artist: string;
  track: string;
  album?: string;
}

export interface ScrobbleFormProps {
  formData: ScrobbleFormData;
  isSubmitting: boolean;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function ScrobbleForm({
  formData,
  isSubmitting,
  onInputChange,
  onSubmit,
}: ScrobbleFormProps) {
  return (
    <Form onSubmit={onSubmit} className="max-w-md flex-1">
      <div className="flex flex-col gap-4">
        <TextField
          label="Artist *"
          name="artist"
          value={formData.artist}
          onChange={(value) => {
            onInputChange({
              target: { name: "artist", value },
            } as ChangeEvent<HTMLInputElement>);
          }}
          isRequired
        />

        <TextField
          label="Track *"
          name="track"
          value={formData.track}
          onChange={(value) => {
            onInputChange({
              target: { name: "track", value },
            } as ChangeEvent<HTMLInputElement>);
          }}
          isRequired
        />

        <TextField
          label="Album (optional)"
          name="album"
          value={formData.album || ""}
          onChange={(value) => {
            onInputChange({
              target: { name: "album", value },
            } as ChangeEvent<HTMLInputElement>);
          }}
        />

        <Button type="submit" isDisabled={isSubmitting} className="w-full mt-2">
          {isSubmitting ? "Scrobbling..." : "Scrobble Track"}
        </Button>
      </div>
    </Form>
  );
}
