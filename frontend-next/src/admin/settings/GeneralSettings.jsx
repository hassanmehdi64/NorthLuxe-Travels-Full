import { MapPin, RefreshCw } from "lucide-react";
import { CURRENCY_OPTIONS } from "../../utils/currency";
import { Button, Card, Field, Input, Select, Switch, Textarea } from "../ui";

const setField = (settings, setSettings, key, value) => {
  setSettings({ ...settings, [key]: value });
};

const TextField = ({ label, value, onChange, type = "text", placeholder = "", hint, labelAction }) => (
  <Field label={label} hint={hint} labelAction={labelAction}>
    <Input type={type} placeholder={placeholder} value={value || ""} onChange={(e) => onChange(e.target.value)} />
  </Field>
);

/** Small inline helper that fills a field from another value. */
const FillLink = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="text-xs font-semibold text-brand-700 hover:underline">
    {children}
  </button>
);

const GeneralSettings = ({ settings, setSettings }) => (
  <div className="space-y-5">
    <Card title="Website details" description="Name, tagline and currency used across the public site.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          label="Site title"
          value={settings.siteName}
          onChange={(value) => setField(settings, setSettings, "siteName", value)}
          placeholder="North Luxe Travels"
        />
        <TextField
          label="Site tagline"
          value={settings.siteTagline}
          onChange={(value) => setField(settings, setSettings, "siteTagline", value)}
          placeholder="Premium tours across Gilgit-Baltistan."
        />
        <TextField
          label="Home hero eyebrow"
          value={settings.heroEyebrow}
          onChange={(value) => setField(settings, setSettings, "heroEyebrow", value)}
          placeholder="Gilgit-Baltistan · Since 2015"
          hint="Leave empty to build it automatically."
        />
        <TextField
          label="Founding year"
          value={settings.foundingYear}
          onChange={(value) => setField(settings, setSettings, "foundingYear", value)}
          placeholder="e.g. 2015"
        />
        <Field label="Currency">
          <Select
            value={settings.currency || "PKR"}
            onChange={(e) => setField(settings, setSettings, "currency", e.target.value)}
          >
            {CURRENCY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Card>

    <Card title="Contact details" description="How customers reach you on the public site.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          label="Business email"
          type="email"
          value={settings.siteEmail}
          onChange={(value) => setField(settings, setSettings, "siteEmail", value)}
          placeholder="info@northluxetravels.com"
        />
        <TextField
          label="Support email"
          type="email"
          value={settings.supportEmail}
          onChange={(value) => setField(settings, setSettings, "supportEmail", value)}
          placeholder="support@northluxetravels.com"
          labelAction={
            <FillLink onClick={() => setField(settings, setSettings, "supportEmail", settings.siteEmail || "")}>
              Use business email
            </FillLink>
          }
        />
        <TextField
          label="Hotline / phone"
          value={settings.sitePhone}
          onChange={(value) => setField(settings, setSettings, "sitePhone", value)}
          placeholder="+92 300 1234567"
        />
        <TextField
          label="WhatsApp number"
          value={settings.whatsappNumber}
          onChange={(value) => setField(settings, setSettings, "whatsappNumber", value)}
          placeholder="+92 300 1234567"
          labelAction={
            <FillLink onClick={() => setField(settings, setSettings, "whatsappNumber", settings.sitePhone || "")}>
              Use phone
            </FillLink>
          }
        />
        <TextField
          label="Business hours"
          value={settings.businessHours}
          onChange={(value) => setField(settings, setSettings, "businessHours", value)}
          placeholder="Monday to Saturday, 9:00 AM to 7:00 PM"
          labelAction={
            <FillLink
              onClick={() =>
                setField(settings, setSettings, "businessHours", "Monday to Saturday, 9:00 AM to 7:00 PM")
              }
            >
              Set default hours
            </FillLink>
          }
        />
      </div>
    </Card>

    <Card
      title="Location"
      description="Office address and the embedded Google map."
      actions={
        <>
          <Button
            size="sm"
            variant="secondary"
            icon={MapPin}
            onClick={() => {
              const query = encodeURIComponent(settings.address || "Skardu, Gilgit-Baltistan");
              setField(settings, setSettings, "googleMapUrl", `https://www.google.com/maps?q=${query}&output=embed`);
            }}
          >
            Build map from address
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={RefreshCw}
            onClick={() =>
              setField(settings, setSettings, "googleMapUrl", "https://www.google.com/maps?q=Skardu&output=embed")
            }
          >
            Reset map
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Physical address">
          <Textarea
            rows={3}
            value={settings.address || ""}
            onChange={(e) => setField(settings, setSettings, "address", e.target.value)}
            placeholder="Main Chowk Danyore, Gilgit-Baltistan"
          />
        </Field>
        <TextField
          label="Google Map URL"
          value={settings.googleMapUrl}
          onChange={(value) => setField(settings, setSettings, "googleMapUrl", value)}
          placeholder="https://www.google.com/maps?q=Skardu&output=embed"
          hint="An embeddable Google Maps link (ends with output=embed)."
        />
      </div>
    </Card>

    <Card title="Site availability" description="Temporarily take the public site offline.">
      <Switch
        id="maintenance-mode"
        checked={Boolean(settings.maintenanceMode)}
        onCheckedChange={(value) => setField(settings, setSettings, "maintenanceMode", value)}
        label="Maintenance mode"
        description="When on, public visitors see the maintenance page while admins can keep working."
      />
    </Card>
  </div>
);

export default GeneralSettings;
