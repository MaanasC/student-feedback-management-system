import React, { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Filter,
  X,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";

export function UserManagementPage() {
  const { users, addUser, updateUser, deleteUser } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Student",
    department: "Computer Science",
    status: "Active"
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "All Roles" || u.role === roleFilter;

    const matchesStatus =
      statusFilter === "All Statuses" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormData({
      name: "",
      email: "",
      role: "Student",
      department: "Computer Science",
      status: "Active"
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    setEditingUserId(u.userId);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.studentDetails?.department || u.facultyDetails?.department || u.adminDetails?.department || "Computer Science",
      status: u.status
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Please provide valid name and email.");
      return;
    }

    if (editingUserId) {
      updateUser(editingUserId, formData);
    } else {
      addUser(formData);
    }
    setIsModalOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("All Roles");
    setStatusFilter("All Statuses");
  };

  return (
    <div className="space-y-8 w-full">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">
            User Management
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-slate-500">
            Manage administrative, faculty, and student user accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="lg"
            icon={Download}
            onClick={() => alert("Exporting user directory to CSV...")}
            className="rounded-xl font-bold py-2.5 px-5 shadow-xs"
          >
            Export
          </Button>

          <Button
            variant="primary"
            size="lg"
            icon={Plus}
            onClick={handleOpenAddModal}
            className="rounded-xl font-bold py-2.5 px-5 shadow-sm"
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-5 md:p-6 rounded-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3.5">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>All Roles</option>
              <option>Student</option>
              <option>Faculty</option>
              <option>Administrator</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>All Statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
            </select>
          </div>

          {(searchTerm || roleFilter !== "All Roles" || statusFilter !== "All Statuses") && (
            <button
              onClick={handleClearFilters}
              className="text-xs sm:text-sm font-bold text-blue-600 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-0 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const dept =
                    u.studentDetails?.department ||
                    u.facultyDetails?.department ||
                    u.adminDetails?.department ||
                    "General";
                  return (
                    <tr key={u.userId} className="hover:bg-slate-50/80 transition">
                      {/* User Cell */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-xs"
                          />
                          <div>
                            <span className="block font-bold text-slate-800 text-sm">
                              {u.name}
                            </span>
                            <span className="block text-xs text-slate-400">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Cell */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                            u.role === "Administrator"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : u.role === "Faculty"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Department Cell */}
                      <td className="py-4 px-6 text-slate-600 font-semibold">
                        {dept}
                      </td>

                      {/* Status Cell */}
                      <td className="py-4 px-6">
                        <Badge variant={u.status.toLowerCase()} size="md">{u.status}</Badge>
                      </td>

                      {/* Actions Cell */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                            title="Edit User"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to deactivate or remove user "${u.name}"?`)) {
                                deleteUser(u.userId);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 text-xs sm:text-sm text-slate-500 gap-3">
          <span>Showing 1 to {filteredUsers.length} of 128 users</span>

          <div className="flex items-center gap-1.5">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold">
              2
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold">
              3
            </button>
            <span className="px-1.5 text-slate-400">...</span>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold">
              13
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUserId ? "Edit Account" : "Add New User Account"}
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Jane Doe"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jane.doe@university.edu"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>Student</option>
                <option>Faculty</option>
                <option>Administrator</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>Active</option>
                <option>Pending</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Computer Science, Engineering, etc."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              {editingUserId ? "Update User" : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UserManagementPage;
