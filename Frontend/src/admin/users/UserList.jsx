import React, { useState } from "react";
import { UserPlus, Search, UserX, X, SlidersHorizontal } from "lucide-react";
import UserCard from "./UserCard";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "../../hooks/useCms";

const UserList = () => {
  const { data: users = [] } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New State for handling which user is being edited
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Editor",
  });

  // --- HANDLERS ---

  const openInviteModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "Editor" });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUser.mutate({ id: editingUser.id, ...formData });
    } else {
      createUser.mutate({
        ...formData,
        avatar: `https://ui-avatars.com/api/?name=${formData.name.replace(/\s+/g, "+")}&background=random&color=fff`,
      });
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    updateUser.mutate({
      id,
      status: user.status === "Active" ? "Suspended" : "Active",
    });
  };

  const deleteUser = (id) => {
    if (window.confirm("Remove this team member?"))
      deleteUserMutation.mutate(id);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className=" text-xl xl:3xl font-black text-slate-900 tracking-tighter uppercase">
        
            Team Management
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage permissions and team access.
          </p>
        </div>
        <button
          onClick={openInviteModal}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all w-full sm:w-auto"
        >
          <UserPlus size={18} /> Invite Member
        </button>
      </div>

      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search team..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-50 transition-all font-medium text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onToggleStatus={toggleStatus}
            onDelete={deleteUser}
            onEdit={() => openEditModal(user)} // Pass the edit function
          />
        ))}
      </div>

      {/* Shared Modal for Invite & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">
                {editingUser ? "Edit Member" : "Invite Member"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block px-1">
                  Full Name
                </label>
                <input
                  required
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block px-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block px-1">
                  Role
                </label>
                <select
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="Editor">Editor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">
                {editingUser ? "Save Changes" : "Send Invitation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
