import React, { useEffect, useState } from "react";
import { Camera, Edit3, Search, ShieldOff, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { useSearchParams } from "@/lib/router";
import UserCard, { RoleBadge, UserAvatar, formatLastLogin } from "./UserCard";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "../../hooks/useCms";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/apiError";
import { validateImageFile } from "../utils/fileValidation";
import { buildDefaultAvatar } from "../utils/userAvatar";
import {
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  Input,
  PageHeader,
  RowActions,
  Select,
  SkeletonRows,
  StatusBadge,
  useConfirm,
} from "../ui";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });

const EMPTY_FORM = {
  name: "",
  email: "",
  role: "Editor",
  status: "Active",
  password: "",
  confirmPassword: "",
  avatar: "",
};

const FORM_ID = "team-member-form";

const UserList = () => {
  const { user: me } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: users = [], isLoading, isError, refetch } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const next = searchParams.get("search") || "";
    setSearchQuery((current) => (current === next ? current : next));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    else params.delete("search");
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [searchQuery, searchParams, setSearchParams]);

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || "Active",
      password: "",
      confirmPassword: "",
      avatar: user.avatar || "",
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setErrors({});
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
      setFormData((prev) => ({ ...prev, avatar: dataUrl }));
    } catch {
      toast.error("Upload failed", "Avatar could not be loaded.");
    } finally {
      event.target.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Name is required.";
    if (!formData.email.trim()) nextErrors.email = "Email is required.";
    if (!editingUser && formData.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (formData.password && formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      if (editingUser) {
        const payload = {
          id: editingUser.id,
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status,
          avatar: formData.avatar || buildDefaultAvatar(formData.name.trim()),
        };

        if (formData.password) payload.password = formData.password;

        await updateUser.mutateAsync(payload);
        toast.success("Member updated", "Credentials and permissions saved.");
      } else {
        await createUser.mutateAsync({
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status,
          password: formData.password,
          avatar: formData.avatar || buildDefaultAvatar(formData.name.trim()),
        });
        toast.success("Member added", "New team account created.");
      }

      closeForm();
    } catch (error) {
      toast.error("Save failed", getApiErrorMessage(error, "Could not save member."));
    }
  };

  const toggleStatus = (id) => {
    if (String(me?.id) === String(id)) {
      toast.info("Action blocked", "You cannot suspend your own account.");
      return;
    }
    const user = users.find((u) => u.id === id);
    if (!user) return;
    updateUser.mutate(
      {
        id,
        status: user.status === "Active" ? "Suspended" : "Active",
      },
      {
        onError: (error) =>
          toast.error("Status update failed", getApiErrorMessage(error, "Please try again.")),
      },
    );
  };

  const deleteUser = async (id) => {
    if (String(me?.id) === String(id)) {
      toast.info("Action blocked", "You cannot delete your own account.");
      return;
    }
    const ok = await confirm({
      title: "Delete user?",
      description: "This will permanently remove this team account.",
      confirmLabel: "Delete user",
      cancelLabel: "Keep user",
    });
    if (!ok) return;
    deleteUserMutation.mutate(id, {
      onSuccess: () => toast.success("Deleted", "User has been deleted."),
      onError: (error) =>
        toast.error("Delete failed", getApiErrorMessage(error, "Please try again.")),
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      [u.name, u.email, u.role, u.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const userActions = (user) => {
    const isSelf = String(me?.id) === String(user.id);
    const isActive = user.status === "Active";
    return [
      { label: "Edit user", icon: Edit3, onClick: () => openEditForm(user) },
      {
        label: isActive ? "Suspend user" : "Activate user",
        icon: isActive ? ShieldOff : ShieldCheck,
        disabled: isSelf,
        onClick: () => toggleStatus(user.id),
      },
      { label: "Delete user", icon: Trash2, danger: true, disabled: isSelf, onClick: () => deleteUser(user.id) },
    ];
  };

  const isSaving = createUser.isPending || updateUser.isPending;
  const isEditingSelf = editingUser && String(me?.id) === String(editingUser.id);

  const renderBody = () => {
    if (isLoading) return <SkeletonRows rows={5} />;
    if (isError) return <ErrorState description="Team members could not be loaded." onRetry={() => refetch()} />;
    if (!filteredUsers.length) {
      return searchQuery.trim() ? (
        <EmptyState icon={Search} title="No members match your search" description="Try a different name, email, role or status." />
      ) : (
        <EmptyState
          icon={Users}
          title="No team members yet"
          action={<Button variant="primary" icon={UserPlus} onClick={openCreateForm}>Add member</Button>}
        />
      );
    }

    return (
      <>
        <ul className="divide-y divide-line md:hidden">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} actions={userActions(user)} />
          ))}
        </ul>

        <div className="admin-table-wrap hidden md:block">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Last login</th>
                <th scope="col" className="w-32"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar user={user} />
                      <div className="min-w-0">
                        <p className="cell-primary truncate">
                          {user.name}
                          {String(me?.id) === String(user.id) && <span className="ml-1.5 text-xs font-medium text-subtle">(you)</span>}
                        </p>
                        <p className="truncate text-xs text-subtle">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge role={user.role} /></td>
                  <td><StatusBadge status={user.status} /></td>
                  <td className="whitespace-nowrap text-[13px]">{formatLastLogin(user.lastLoginAt)}</td>
                  <td><RowActions actions={userActions(user)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage team accounts, roles and access."
        actions={<Button variant="primary" icon={UserPlus} onClick={openCreateForm}>Add member</Button>}
      />

      <Card flush>
        <div className="border-b border-line p-3">
          <div className="relative">
            <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <Input
              type="search"
              aria-label="Search team members"
              placeholder="Search by name, email, role or status"
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {renderBody()}
      </Card>

      <Drawer
        open={isFormOpen}
        onOpenChange={(open) => { if (!open) closeForm(); }}
        title={editingUser ? "Edit member" : "Add member"}
        description={editingUser ? editingUser.email : "Create a new team account."}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            <Button variant="primary" type="submit" form={FORM_ID} loading={isSaving}>
              {editingUser ? "Save changes" : "Create account"}
            </Button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={handleSave} noValidate className="space-y-5">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formData.avatar || buildDefaultAvatar(formData.name || "North Luxe")}
              alt={formData.name ? `${formData.name} profile picture` : "Profile preview"}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <label className="relative inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-control border border-line-strong bg-surface px-3 text-[13px] font-semibold text-navy-900 hover:bg-canvas focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand">
                  <Camera size={15} aria-hidden="true" />
                  Upload picture
                  <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                </label>
                {formData.avatar && (
                  <Button size="sm" variant="ghost" onClick={() => setFormData((prev) => ({ ...prev, avatar: "" }))}>
                    Remove
                  </Button>
                )}
              </div>
              <p className="mt-1.5 text-xs text-subtle">Square images work best.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors.name}>
              <Input value={formData.name} autoComplete="name" onChange={(e) => setField("name", e.target.value)} />
            </Field>
            <Field label="Email" required error={errors.email}>
              <Input type="email" autoComplete="email" value={formData.email} onChange={(e) => setField("email", e.target.value)} />
            </Field>
            <Field label="Role">
              <Select value={formData.role} onChange={(e) => setField("role", e.target.value)}>
                <option value="Editor">Editor</option>
                <option value="Admin">Admin</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={formData.status} onChange={(e) => setField("status", e.target.value)}>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </Select>
            </Field>
            <Field
              label={editingUser ? "New password" : "Password"}
              required={!editingUser}
              error={errors.password}
              hint={editingUser ? "Leave empty to keep the current password." : "At least 8 characters."}
            >
              <Input type="password" autoComplete="new-password" value={formData.password} onChange={(e) => setField("password", e.target.value)} />
            </Field>
            <Field label="Confirm password" error={errors.confirmPassword}>
              <Input type="password" autoComplete="new-password" value={formData.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} />
            </Field>
          </div>

          {isEditingSelf ? (
            <p className="rounded-control bg-canvas px-3 py-2 text-xs leading-relaxed text-subtle">
              You can update your name, email, picture and password. Role and status changes for your own account are restricted.
            </p>
          ) : null}
        </form>
      </Drawer>
    </div>
  );
};

export default UserList;
