import { useEffect, useRef, useState } from "react";
import { Camera, Save } from "lucide-react";
import { Button, Card, DetailList, Field, Input, PageHeader, StatusBadge } from "../ui";
import { useUpdateUser } from "../../hooks/useCms";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";
import { validateImageFile } from "../utils/fileValidation";
import { buildDefaultAvatar, getUserAvatar } from "../utils/userAvatar";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });

const MyProfile = () => {
  const { user, setUserData } = useAuth();
  const toast = useToast();
  const updateUser = useUpdateUser();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
    });
  }, [user?.name, user?.email, user?.avatar]);

  const formatDate = (value) => {
    if (!value) return "Not available";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Not available";
    return parsed.toLocaleString();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationMessage = validateImageFile(file);
    if (validationMessage) {
      toast.error("Upload failed", validationMessage);
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((prev) => ({ ...prev, avatar: dataUrl }));
    } catch {
      toast.error("Upload failed", "Profile picture could not be loaded.");
    } finally {
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userId = user?.id || user?._id;
    if (!userId) return;

    try {
      const updatedUser = await updateUser.mutateAsync({
        id: userId,
        name: form.name.trim(),
        email: form.email.trim(),
        avatar: form.avatar || buildDefaultAvatar(form.name.trim() || user.name || "North Luxe"),
      });
      setUserData({ ...user, ...updatedUser, id: updatedUser?.id || userId });
      setForm({
        name: updatedUser?.name || form.name.trim(),
        email: updatedUser?.email || form.email.trim(),
        avatar: updatedUser?.avatar || form.avatar || "",
      });
      toast.success("Profile updated", "Your admin profile has been saved.");
    } catch (error) {
      toast.error("Save failed", getApiErrorMessage(error, "Could not update your profile."));
    }
  };

  const saveError = updateUser.isError ? getApiErrorMessage(updateUser.error, "Could not update your profile.") : "";

  return (
    <div className="max-w-3xl">
      <PageHeader title="My profile" description="Your name, email and photo as shown in the admin." />

      <div className="space-y-5">
        <Card title="Profile details">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex shrink-0 flex-row items-center gap-4 sm:flex-col sm:items-start">
              <img
                src={form.avatar || getUserAvatar({ name: form.name || user?.name, avatar: form.avatar })}
                alt={form.name || user?.name || "Profile"}
                className="h-20 w-20 rounded-full object-cover ring-1 ring-line sm:h-24 sm:w-24"
              />
              <div className="flex flex-wrap gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <Button size="sm" icon={Camera} onClick={() => fileInputRef.current?.click()}>Upload photo</Button>
                {form.avatar && (
                  <Button size="sm" variant="ghost" onClick={() => setForm((prev) => ({ ...prev, avatar: "" }))}>
                    Remove
                  </Button>
                )}
              </div>
            </div>

            <div className="grid min-w-0 flex-1 gap-4">
              <Field label="Full name">
                <Input
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </Field>
              <Field label="Email address">
                <Input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </Field>
              {saveError && <p role="alert" className="text-xs font-medium text-red-700">{saveError}</p>}
              <div>
                <Button type="submit" variant="primary" icon={Save} loading={updateUser.isPending}>
                  Save profile
                </Button>
              </div>
            </div>
          </form>
        </Card>

        <Card title="Account">
          <DetailList
            items={[
              ["Role", user?.role || "Admin"],
              ["Status", <StatusBadge key="status" status={user?.status || "Active"} />],
              ["Last login", formatDate(user?.lastLoginAt)],
              ["Member since", formatDate(user?.joined || user?.createdAt)],
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
