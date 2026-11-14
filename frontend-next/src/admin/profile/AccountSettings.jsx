import { useState } from "react";
import { useUpdateUser } from "../../hooks/useCms";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";
import { Button, Card, Field, Input, PageHeader } from "../ui";

const AccountSettings = () => {
  const { user } = useAuth();
  const toast = useToast();
  const updateUser = useUpdateUser();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const setField = (key) => (e) => {
    const value = e.target.value;
    setPasswords((prev) => ({ ...prev, [key]: value }));
    if (errors[key] || errors.server) setErrors((prev) => ({ ...prev, [key]: undefined, server: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) return;
    if (!passwords.newPassword || passwords.newPassword.length < 8) {
      setErrors({ newPassword: "New password must be at least 8 characters." });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrors({ confirmPassword: "Confirm password must match the new password." });
      return;
    }
    setErrors({});

    try {
      await updateUser.mutateAsync({
        id: user.id,
        password: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated", "Your account password has been changed.");
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not update password.");
      setErrors({ server: message });
      toast.error("Update failed", message);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Account settings" description="Keep your admin account protected with a strong password." />

      <Card title="Change password">
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <Field
            label="Current password"
            hint="Not checked yet: the password is changed through your signed-in session."
          >
            <Input
              type="password"
              autoComplete="current-password"
              value={passwords.currentPassword}
              onChange={setField("currentPassword")}
            />
          </Field>
          <Field label="New password" hint="At least 8 characters." error={errors.newPassword} required>
            <Input
              type="password"
              autoComplete="new-password"
              value={passwords.newPassword}
              onChange={setField("newPassword")}
            />
          </Field>
          <Field label="Confirm new password" error={errors.confirmPassword} required>
            <Input
              type="password"
              autoComplete="new-password"
              value={passwords.confirmPassword}
              onChange={setField("confirmPassword")}
            />
          </Field>

          {errors.server && <p role="alert" className="text-xs font-medium text-red-700">{errors.server}</p>}

          <div>
            <Button type="submit" variant="primary" loading={updateUser.isPending}>
              Update password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AccountSettings;
