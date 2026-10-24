import React, { useState } from "react";
import {
  User,
  Mail,
  Building,
  KeyRound,
  Shield,
  CheckCircle2,
  Camera,
  Save,
  Lock,
  Clock
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card, { CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";

export function ProfilePage() {
  const { currentUser, updateProfile, currentRole } = useApp();

  const nameParts = (currentUser?.name || "Dr. Eleanor Vance").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "Eleanor");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "Vance");
  const [email, setEmail] = useState(currentUser?.email || "eleanor.vance@university.edu");
  const [department, setDepartment] = useState(
    currentUser?.studentDetails?.department ||
    currentUser?.facultyDetails?.department ||
    currentUser?.adminDetails?.department ||
    "Computer Science"
  );
  const [username, setUsername] = useState(
    currentUser?.studentDetails?.rollNo ||
    currentUser?.email?.split("@")[0] ||
    "evance_admin"
  );

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: `${firstName} ${lastName}`.trim(),
      email
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert("New passwords do not match or are empty.");
      return;
    }
    alert("Password updated successfully!");
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-8 w-full">
      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">
          User Profile
        </h1>
        <p className="mt-2 text-sm md:text-base font-medium text-slate-500">
          Manage your personal university profile, credentials, and security settings
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 font-bold">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Avatar & Quick Actions */}
        <div className="space-y-6">
          <Card className="text-center p-8 rounded-2xl">
            <div className="relative mx-auto h-32 w-32">
              <img
                src={
                  currentUser?.avatar ||
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
                }
                alt={currentUser?.name}
                className="h-full w-full rounded-full object-cover border-4 border-slate-100 shadow-md"
              />
              <button
                type="button"
                onClick={() => alert("Upload new avatar dialog")}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 transition"
                title="Change Photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              {currentUser?.name || "Dr. Eleanor Vance"}
            </h2>

            <p className="text-sm font-medium text-slate-500 mt-1">
              {currentUser?.facultyDetails?.designation ||
                currentUser?.adminDetails?.designation ||
                `${department} (${currentRole})`}
            </p>

            <div className="mt-3">
              <Badge variant="role" size="md">{currentRole}</Badge>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 border-t border-slate-100 pt-6 space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Quick Actions
              </span>
              <Button
                variant={isEditing ? "dark" : "primary"}
                size="md"
                onClick={() => setIsEditing(!isEditing)}
                className="w-full py-2.5 rounded-xl font-bold text-sm"
              >
                {isEditing ? "Exit Edit Mode" : "Edit Profile"}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full py-2.5 rounded-xl font-bold text-sm"
              >
                Change Password
              </Button>
            </div>
          </Card>

          {/* Account Security Info Card */}
          <Card className="p-6 rounded-2xl space-y-2.5 text-sm">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Authentication & Access</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Multi-Factor Authentication is active via your institutional university email.
            </p>
          </Card>
        </div>

        {/* Right Column: Account Information Form */}
        <div className="lg:col-span-2">
          <Card className="p-8 rounded-2xl">
            <CardHeader
              title="Account Information"
              subtitle="Personal details and registered university credentials"
            />

            <form onSubmit={handleSaveProfile} className="space-y-6 text-sm pt-2">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Username / Roll No
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Status and Last Login info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-6 gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 font-bold text-sm">Account Status</span>
                  <Badge variant="active" size="md">Active</Badge>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Last login: Today, 09:41 AM</span>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    icon={Save}
                    className="px-6 py-2.5 rounded-xl font-bold shadow-sm"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Account Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4 text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProfilePage;
