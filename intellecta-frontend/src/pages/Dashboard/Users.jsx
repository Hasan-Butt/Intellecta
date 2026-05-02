import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Users as UsersIcon,
  Brain,
  Activity,
  Medal,
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import intellectaLogo from "../../assets/intellectaLogo.jpeg";
import api from "../../services/api";

const ROLES = ["STUDENT", "ADMIN"];
const STATUSES = ["Active", "Inactive"];

const emptyAddForm = { username: "", email: "", password: "", role: "STUDENT" };
const emptyEditForm = { username: "", role: "STUDENT", status: "Active" };

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState("Users");

  // Data state
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Row action dropdown
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users", {
        params: { search, page, size: 10 },
      });
      const data = res.data;
      setUsers(data.content ?? []);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch {
      showToast("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  // Add User
  const openAddModal = () => {
    setAddForm(emptyAddForm);
    setAddError("");
    setShowAddModal(true);
  };
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      await api.post("/admin/users", addForm);
      setShowAddModal(false);
      setPage(0);
      fetchUsers();
      showToast("User registered successfully.");
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setAddLoading(false);
    }
  };

  // Edit User
  const openEditModal = (user) => {
    setOpenMenuId(null);
    setEditTarget(user);
    setEditForm({ username: user.username, role: user.role ?? "STUDENT", status: user.status ?? "Active" });
    setEditError("");
    setShowEditModal(true);
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      await api.put(`/admin/users/${editTarget.id}`, editForm);
      setShowEditModal(false);
      fetchUsers();
      showToast("User updated successfully.");
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete User (soft-delete — sets status Inactive to avoid FK violations)
  const openDeleteDialog = (user) => {
    setOpenMenuId(null);
    setDeleteTarget(user);
  };
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchUsers();
      showToast(`${deleteTarget.username} has been deactivated.`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to deactivate user.", "error");
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      const res = await api.get("/admin/users/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("CSV downloaded successfully.");
    } catch {
      showToast("Failed to export CSV.", "error");
    }
  };

  // Automate Intervention
  const handleIntervention = async () => {
    try {
      const res = await api.post("/admin/interventions");
      showToast(res.data.message);
    } catch {
      showToast("Failed to trigger intervention.", "error");
    }
  };

  // Review Students — scrolls to table and filters to STUDENT role
  const tableRef = useRef(null);
  const handleReviewStudents = () => {
    setSearchInput(""); setSearch(""); setPage(0);
    tableRef.current?.scrollIntoView({ behavior: "smooth" });
    showToast("Showing all students in the table below.");
  };

  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const activeCount = users.filter((u) => u.status === "Active").length;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar intellectaLogo={intellectaLogo} />

      <div className="flex min-h-screen bg-[#F9FAFB] font-inter text-[#111827]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-10 space-y-10 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto space-y-10">

            {/* HEADER SECTION */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tight">
                  User Management
                </h2>
                <p className="text-gray-400 font-bold mt-1">
                  {loading ? "Loading..." : `Monitor and manage ${totalElements} active learner${totalElements !== 1 ? "s" : ""}.`}
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="bg-[#6C5DD3] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-[#5b4eb3] transition-all"
              >
                <Plus size={20} strokeWidth={3} /> Register Student
              </button>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                icon={<UsersIcon />}
                label="Total Users"
                value={loading ? "—" : totalElements.toLocaleString()}
                trend="+12%"
                color="text-[#6C5DD3]"
              />
              <StatCard
                icon={<Brain />}
                label="Avg. Focus Score"
                value="88.4"
                trend="+4.2%"
                color="text-purple-500"
              />
              <StatCard
                icon={<Activity />}
                label="Active Sessions"
                value={loading ? "—" : activeCount.toString()}
                trend="Stable"
                color="text-blue-500"
              />
              <div className="bg-[#6C5DD3] rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                <Medal className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 rotate-12" />
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                  Students
                </p>
                <h4 className="text-4xl font-black mt-4">
                  {loading ? "—" : studentCount}
                </h4>
              </div>
            </div>

            {/* TABLE SECTION */}
            <div ref={tableRef} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center gap-4">
                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex gap-3 flex-1">
                  <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#6C5DD3] text-white rounded-xl text-xs font-bold hover:bg-[#5b4eb3] transition-all"
                  >
                    Search
                  </button>
                  {search && (
                    <button
                      type="button"
                      onClick={() => { setSearchInput(""); setSearch(""); setPage(0); }}
                      className="px-3 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
                    >
                      Clear
                    </button>
                  )}
                </form>
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-2 text-xs font-bold text-[#6C5DD3] hover:text-[#5b4eb3] transition-colors"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50">
                    <th className="px-8 py-5">Name</th>
                    <th className="px-8 py-5">Role</th>
                    <th className="px-8 py-5">Email</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-bold text-sm">
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-bold text-sm">
                        <UsersIcon size={32} className="mx-auto mb-3 text-gray-200" />
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                              alt=""
                              className="w-10 h-10 rounded-full border border-gray-100"
                            />
                            <div>
                              <p className="text-sm font-black text-[#111827]">{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === "ADMIN" ? "bg-[#6C5DD3]/10 text-[#6C5DD3]" : "bg-gray-100 text-gray-500"}`}>
                            {u.role ?? "—"}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-gray-500">{u.email}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-400"}`}>
                            {u.status ?? "—"}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="relative inline-block" ref={openMenuId === u.id ? menuRef : null}>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                              className="text-gray-300 hover:text-gray-600 transition-colors"
                            >
                              <MoreHorizontal size={20} />
                            </button>
                            {openMenuId === u.id && (
                              <div className="absolute right-0 top-8 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-36">
                                <button
                                  onClick={() => openEditModal(u)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                  <Pencil size={14} className="text-[#6C5DD3]" /> Edit
                                </button>
                                <button
                                  onClick={() => openDeleteDialog(u)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-8 py-5 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Page {page + 1} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-[#6C5DD3] disabled:opacity-40 transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-[#6C5DD3] disabled:opacity-40 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LOWER SECTION: ALERT & SYSTEM STATUS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-gradient-to-br from-white to-indigo-50/30 rounded-[40px] p-10 border border-gray-100 flex justify-between items-center relative overflow-hidden">
                <div className="max-w-md relative z-10">
                  <h4 className="text-2xl font-black">Cognitive Health Alert</h4>
                  <p className="text-gray-400 font-bold mt-4 text-sm leading-relaxed">
                    34 students show a downward trend in focus score over the last 48 hours.
                    Suggest triggering proactive intervention modules.
                  </p>
                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={handleIntervention}
                      className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-zinc-700 transition-all"
                    >
                      Automate Intervention
                    </button>
                    <button
                      onClick={handleReviewStudents}
                      className="bg-white text-zinc-900 border border-gray-100 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all"
                    >
                      Review Students
                    </button>
                  </div>
                </div>
                <div className="opacity-10 absolute right-10 top-10 rotate-12">
                  <Brain size={120} />
                </div>
              </div>

              <div className="bg-gray-100/50 rounded-[40px] p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-black text-lg">System Status</h4>
                  <span className="bg-emerald-400 text-emerald-900 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                    Operational
                  </span>
                </div>
                <div className="space-y-4">
                  <StatusRow label="Real-time Sync" value="Active" />
                  <StatusRow label="Database Latency" value="14ms" />
                  <StatusRow label="Storage Capacity" value="42%" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-12 tracking-widest text-center">
                  Last Maintenance: Oct 24, 2023 at 04:00 AM
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <Modal title="Register Student" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <FormField label="Username">
              <input required type="text" value={addForm.username}
                onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                className={inputCls} placeholder="Enter username" />
            </FormField>
            <FormField label="Email">
              <input required type="email" value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                className={inputCls} placeholder="Enter email" />
            </FormField>
            <FormField label="Password">
              <input required type="password" value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                className={inputCls} placeholder="Enter password" />
            </FormField>
            <FormField label="Role">
              <select value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                className={inputCls}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>
            {addError && <ErrorBox message={addError} />}
            <ModalActions onCancel={() => setShowAddModal(false)} loading={addLoading} submitLabel="Register" />
          </form>
        </Modal>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && editTarget && (
        <Modal title={`Edit — ${editTarget.username}`} onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <FormField label="Username">
              <input required type="text" value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className={inputCls} />
            </FormField>
            <FormField label="Role">
              <select value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className={inputCls}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className={inputCls}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            {editError && <ErrorBox message={editError} />}
            <ModalActions onCancel={() => setShowEditModal(false)} loading={editLoading} submitLabel="Save Changes" />
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <Modal title="Deactivate User" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm font-bold text-gray-600 mb-6">
            Are you sure you want to deactivate{" "}
            <span className="text-[#111827] font-black">{deleteTarget.username}</span>?
            Their account will be set to Inactive and they will lose access.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={handleDeleteConfirm} disabled={deleteLoading}
              className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-all">
              {deleteLoading ? "Deactivating..." : "Deactivate"}
            </button>
          </div>
        </Modal>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-xl font-bold text-sm text-white z-50 ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────

const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/30";

const StatCard = ({ icon, label, value, trend, color }) => (
  <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl bg-gray-50 ${color}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
        {trend}
      </span>
    </div>
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-6">{label}</p>
    <h4 className="text-3xl font-black mt-1">{value}</h4>
  </div>
);

const StatusRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm font-bold text-gray-400">{label}</span>
    <span className="text-sm font-black text-[#111827]">{value}</span>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md mx-4 p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-[#111827]">{title}</h3>
        <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
    {children}
  </div>
);

const ErrorBox = ({ message }) => (
  <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-500">
    {message}
  </div>
);

const ModalActions = ({ onCancel, loading, submitLabel }) => (
  <div className="flex gap-3 pt-2">
    <button type="button" onClick={onCancel}
      className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
      Cancel
    </button>
    <button type="submit" disabled={loading}
      className="flex-1 py-3 rounded-2xl bg-[#6C5DD3] text-white text-sm font-bold hover:bg-[#5b4eb3] disabled:opacity-50 transition-all">
      {loading ? "Saving..." : submitLabel}
    </button>
  </div>
);

export default UsersPage;
