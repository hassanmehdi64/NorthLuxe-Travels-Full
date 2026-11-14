import React, { useState } from "react";
import { Save, Globe, Palette, Eye, Shield, CreditCard, Mail } from "lucide-react";
import GeneralSettings from "./GeneralSettings";
import AppearanceSettings from "./AppearanceSettings";
import SEOSettings from "./SEOSettings";
import SecuritySettings from "./SecuritySettings";
import BookingPricingSettings from "./BookingPricingSettings";
import EmailSettings from "./EmailSettings";
import { useSettings, useUpdateSettings } from "../../hooks/useCms";
import { Button, Card, PageHeader, Skeleton, TabPanel, Tabs } from "../ui";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";

const pick = (source, keys) =>
  keys.reduce((payload, key) => {
    payload[key] = source?.[key];
    return payload;
  }, {});

const toAbsoluteAssetUrl = (value) => {
  const item = String(value || "").trim();
  if (!item) return "";
  if (/^(https?:|data:)/i.test(item)) return item;

  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "";

  if (!origin) return item;
  if (item.startsWith("/")) return `${origin}${item}`;
  if (item.startsWith("./")) return `${origin}/${item.slice(2)}`;
  return `${origin}/${item.replace(/^\/+/, "")}`;
};

const normalizeImageSettingsPayload = (payload) => ({
  ...payload,
  logoUrl: toAbsoluteAssetUrl(payload.logoUrl),
  faviconUrl: toAbsoluteAssetUrl(payload.faviconUrl),
  homeHeroImages: Array.isArray(payload.homeHeroImages)
    ? payload.homeHeroImages.map(toAbsoluteAssetUrl).filter(Boolean)
    : [],
  pageHeroImages: Object.fromEntries(
    Object.entries(payload.pageHeroImages || {}).map(([key, value]) => [key, toAbsoluteAssetUrl(value)]),
  ),
});

const buildSettingsPayload = (settings, activeTab) => {
  if (activeTab === "General") {
    return pick(settings, [
      "siteName",
      "siteTagline",
      "heroEyebrow",
      "foundingYear",
      "siteEmail",
      "supportEmail",
      "sitePhone",
      "whatsappNumber",
      "address",
      "businessHours",
      "googleMapUrl",
      "currency",
      "maintenanceMode",
    ]);
  }

  if (activeTab === "Appearance") {
    return normalizeImageSettingsPayload(pick(settings, [
      "logoUrl",
      "faviconUrl",
      "homeHeroImages",
      "pageHeroImages",
    ]));
  }

  if (activeTab === "Pricing") {
    return pick(settings, ["bookingPricing", "paymentConfig"]);
  }

  if (activeTab === "SEO") {
    return pick(settings, ["seoTitle", "seoDescription", "socialLinks"]);
  }

  return settings;
};

// Tabs whose fields are included in buildSettingsPayload (Email/Security have nothing to save).
const SAVABLE_TABS = ["General", "Appearance", "Pricing", "SEO"];

const mergeSettingsAfterSave = (previous, savedSettings, payload) => ({
  ...(previous || {}),
  ...(savedSettings || {}),
  ...(payload || {}),
  pageHeroImages: {
    ...(previous?.pageHeroImages || {}),
    ...(savedSettings?.pageHeroImages || {}),
    ...(payload?.pageHeroImages || {}),
  },
});

const SiteSettings = () => {
  const [activeTab, setActiveTab] = useState("General");
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const { data, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const toast = useToast();
  const [settings, setSettings] = useState(null);

  React.useEffect(() => {
    if (data && !hasLocalChanges && !isSaving) setSettings(data);
  }, [data, hasLocalChanges, isSaving]);

  const updateDraft = (nextSettingsOrUpdater) => {
    setHasLocalChanges(true);
    setSettings((current) =>
      typeof nextSettingsOrUpdater === "function" ? nextSettingsOrUpdater(current) : nextSettingsOrUpdater,
    );
  };

  const handleSave = () => {
    const payload = buildSettingsPayload(settings, activeTab);

    setIsSaving(true);
    updateSettings.mutate(payload, {
      onSuccess: (savedSettings) => {
        setSettings((previous) => mergeSettingsAfterSave(previous, savedSettings, payload));
        setHasLocalChanges(false);
        toast.success("Settings updated", `${activeTab} settings have been saved.`);
      },
      onError: (error) => {
        toast.error("Save failed", getApiErrorMessage(error, "Could not update settings."));
      },
      onSettled: () => {
        setIsSaving(false);
      },
    });
  };

  const tabs = [
    { value: "General", icon: Globe, label: "General" },
    { value: "Appearance", icon: Palette, label: "Branding" },
    { value: "Pricing", icon: CreditCard, label: "Payments & pricing" },
    { value: "Email", icon: Mail, label: "Email" },
    { value: "SEO", icon: Eye, label: "SEO & social" },
    { value: "Security", icon: Shield, label: "Security" },
  ];

  const pending = isSaving || updateSettings.isPending;
  const canSave = SAVABLE_TABS.includes(activeTab);

  const header = (
    <PageHeader
      title="Settings"
      description="Manage branding, booking pricing, and customer payment setup."
      actions={
        canSave && settings ? (
          <Button variant="primary" icon={Save} loading={pending} onClick={handleSave}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        ) : null
      }
    />
  );

  if (isLoading || !settings) {
    return (
      <div className="max-w-5xl pb-10">
        {header}
        <Card>
          <div aria-busy="true" aria-label="Loading settings" className="space-y-4">
            <Skeleton className="h-9 w-2/3" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-9" />)}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl pb-10">
      {header}
      <Tabs value={activeTab} onValueChange={setActiveTab} items={tabs} ariaLabel="Settings sections">
        <TabPanel value="General">
          <GeneralSettings settings={settings} setSettings={updateDraft} />
        </TabPanel>
        <TabPanel value="Appearance">
          <AppearanceSettings settings={settings} setSettings={updateDraft} />
        </TabPanel>
        <TabPanel value="Pricing">
          <BookingPricingSettings settings={settings} setSettings={updateDraft} />
        </TabPanel>
        <TabPanel value="Email">
          <EmailSettings />
        </TabPanel>
        <TabPanel value="SEO">
          <SEOSettings settings={settings} setSettings={updateDraft} />
        </TabPanel>
        <TabPanel value="Security">
          <SecuritySettings />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default SiteSettings;
