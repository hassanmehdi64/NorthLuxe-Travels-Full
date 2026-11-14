import { Card, Field, Input, Textarea } from "../ui";

const SOCIAL_PLATFORMS = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["whatsapp", "WhatsApp"],
  ["twitter", "Twitter / X"],
  ["linkedin", "LinkedIn"],
];

const SEOSettings = ({ settings, setSettings }) => (
  <div className="space-y-5">
    <Card title="Search engines" description="Default meta title and description for the site.">
      <div className="grid grid-cols-1 gap-4">
        <Field label="Meta title" hint={`Ideal length: 50–60 characters (currently ${String(settings.seoTitle || "").length}).`}>
          <Input
            type="text"
            value={settings.seoTitle || ""}
            onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
          />
        </Field>
        <Field label="Meta description">
          <Textarea
            rows={3}
            value={settings.seoDescription || ""}
            onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
          />
        </Field>
      </div>
    </Card>

    <Card title="Social links" description="Links to your social media profiles.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SOCIAL_PLATFORMS.map(([platform, label]) => (
          <Field key={platform} label={label}>
            <Input
              type="text"
              placeholder={`${label} URL`}
              value={settings.socialLinks?.[platform] || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: {
                    ...settings.socialLinks,
                    [platform]: e.target.value,
                  },
                })
              }
            />
          </Field>
        ))}
      </div>
    </Card>
  </div>
);

export default SEOSettings;
