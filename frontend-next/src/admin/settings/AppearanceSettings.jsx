import React from "react";
import { Upload, X } from "lucide-react";
import { Button, Card, Field, IconButton, Input, Textarea } from "../ui";
import { parseMediaList } from "../../lib/mediaList.mjs";

const setField = (settings, setSettings, key, value) => {
  setSettings({ ...settings, [key]: value });
};

const setGroupField = (settings, setSettings, group, key, value) => {
  setSettings({
    ...settings,
    [group]: {
      ...(settings[group] || {}),
      [key]: value,
    },
  });
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });

const splitLines = (value) => parseMediaList(value);

const appendUnique = (items, nextItems) => Array.from(new Set([...items, ...nextItems].filter(Boolean)));

const UploadButton = ({ multiple = false, onFiles, children }) => {
  const inputRef = React.useRef(null);
  return (
    <>
      <Button size="sm" variant="secondary" icon={Upload} onClick={() => inputRef.current?.click()}>
        {children}
      </Button>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={onFiles} />
    </>
  );
};

const ImagePreview = ({ src, label, onRemove }) => {
  if (!src) return null;

  return (
    <div className="relative overflow-hidden rounded-control border border-line bg-canvas">
      <img src={src} alt={label} className="h-28 w-full object-cover" />
      <IconButton
        label={`Remove ${label}`}
        icon={X}
        variant="secondary"
        size="sm"
        iconSize={15}
        onClick={onRemove}
        className="absolute right-2 top-2"
      />
    </div>
  );
};

const SingleImageField = ({ label, value, onChange, placeholder }) => {
  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const uploaded = await readFileAsDataUrl(file);
    onChange(uploaded);
    event.target.value = "";
  };

  return (
    <div className="space-y-2.5">
      <Field label={label}>
        <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      </Field>
      <UploadButton onFiles={handleFile}>Upload image</UploadButton>
      <ImagePreview src={value} label={label} onRemove={() => onChange("")} />
    </div>
  );
};

const ImageListField = ({ label, value, onChange, placeholder }) => {
  const images = Array.isArray(value) ? value.filter(Boolean) : splitLines(value);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const uploaded = await Promise.all(files.map(readFileAsDataUrl));
    onChange(appendUnique(images, uploaded));
    event.target.value = "";
  };

  const removeImage = (target) => {
    onChange(images.filter((item) => item !== target));
  };

  return (
    <div className="space-y-2.5">
      <Field label={label} hint="Use image URLs (one per line) or upload files from your device.">
        <Textarea
          rows={5}
          value={images.join("\n")}
          onChange={(e) => onChange(splitLines(e.target.value))}
          placeholder={placeholder}
        />
      </Field>
      <UploadButton multiple onFiles={handleFiles}>Upload images</UploadButton>
      {images.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {images.map((image, index) => (
            <ImagePreview
              key={`${image.slice(0, 30)}-${index}`}
              src={image}
              label={`${label} ${index + 1}`}
              onRemove={() => removeImage(image)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const AppearanceSettings = ({ settings, setSettings }) => (
  <div className="space-y-5">
    <Card title="Logo and favicon" description="Shown in the site header and the browser tab.">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <SingleImageField
          label="Logo"
          value={settings.logoUrl || ""}
          onChange={(value) => setField(settings, setSettings, "logoUrl", value)}
          placeholder="https://example.com/logo.png or /logo.png"
        />
        <SingleImageField
          label="Favicon"
          value={settings.faviconUrl || ""}
          onChange={(value) => setField(settings, setSettings, "faviconUrl", value)}
          placeholder="https://example.com/favicon.png or /favicon.png"
        />
      </div>
    </Card>

    <Card title="Home hero slider" description="Images that rotate in the home page hero.">
      <ImageListField
        label="Slider images"
        value={settings.homeHeroImages || []}
        onChange={(value) => setField(settings, setSettings, "homeHeroImages", value)}
        placeholder="One image URL per line"
      />
    </Card>

    <Card title="Page hero images" description="Banner image at the top of each main page.">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {[
          ["tours", "Tours hero image"],
          ["about", "About hero image"],
          ["blog", "Blog hero image"],
          ["contact", "Contact hero image"],
        ].map(([key, label]) => (
          <SingleImageField
            key={key}
            label={label}
            value={settings.pageHeroImages?.[key] || ""}
            onChange={(value) => setGroupField(settings, setSettings, "pageHeroImages", key, value)}
            placeholder="https://example.com/hero.jpg or /hero.jpg"
          />
        ))}
      </div>
    </Card>
  </div>
);

export default AppearanceSettings;
