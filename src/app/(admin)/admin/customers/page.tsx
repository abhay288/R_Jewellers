"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Mail, 
  Phone, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Filter,
  UserCheck,
  UserX
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  image?: string | null;
  providers: string[];
  failedLoginAttempts: number;
  isLocked: boolean;
  lockUntil?: string | null;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  googleUsers: number;
  credentialsUsers: number;
  lockedUsers: number;
}

export default function CustomersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    googleUsers: 0,
    credentialsUsers: 0,
    lockedUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);

  const [roleTargetUser, setRoleTargetUser] = useState<UserItem | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const [deleteTargetUser, setDeleteTargetUser] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        search,
        provider: providerFilter,
        role: roleFilter,
        status: statusFilter,
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load users");
      }

      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [search, providerFilter, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUnlock = async (userId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlock" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to unlock user");

      setSuccess("User account unlocked successfully.");
      setTimeout(() => setSuccess(null), 3000);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    setIsUpdatingDetails(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_details",
          name: editName,
          phone: editPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user details");

      setSuccess("User details updated successfully.");
      setTimeout(() => setSuccess(null), 3000);
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdatingDetails(false);
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!roleTargetUser) return;

    const newRole = roleTargetUser.role === "admin" ? "user" : "admin";
    setIsUpdatingRole(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${roleTargetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_role", role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change user role");

      setSuccess(`User role changed to ${newRole.toUpperCase()} successfully.`);
      setTimeout(() => setSuccess(null), 3000);
      setRoleTargetUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetUser) return;

    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${deleteTargetUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      setSuccess("User account deleted successfully.");
      setTimeout(() => setSuccess(null), 3000);
      setDeleteTargetUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor customer registrations, signup methods, account statuses, and admin controls.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center space-x-2 bg-destructive/15 text-destructive p-4 rounded-xl text-sm border border-destructive/30">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 bg-green-500/15 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm border border-green-500/30">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Google OAuth</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{stats.googleUsers}</h3>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email & Password</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{stats.credentialsUsers}</h3>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Locked Accounts</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{stats.lockedUsers}</h3>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by name, email, or contact number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Provider Filter */}
          <select 
            value={providerFilter}
            onChange={(e) => {
              setProviderFilter(e.target.value);
              setPage(1);
            }}
            className="bg-secondary/50 border border-border/50 rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">All Signup Methods</option>
            <option value="google">Google OAuth</option>
            <option value="credentials">Email & Password</option>
          </select>

          {/* Role Filter */}
          <select 
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-secondary/50 border border-border/50 rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-secondary/50 border border-border/50 rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
          </select>

        </div>

      </div>

      {/* Users Table */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">No users found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query or filter options.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Signup Method</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions & Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((u) => {
                  const isGoogle = u.providers.includes("google");
                  const isEmail = u.providers.includes("credentials");

                  return (
                    <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                      
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center shrink-0 border border-primary/20">
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{u.name}</div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center"><Mail className="w-3 h-3 mr-1 opacity-70" />{u.email}</span>
                            </div>
                            {u.phone && u.phone !== "N/A" && (
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-0.5">
                                <span className="flex items-center"><Phone className="w-3 h-3 mr-1 opacity-70" />{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Signup Method */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {isGoogle && (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20 w-fit">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                              <span>Google OAuth</span>
                            </span>
                          )}
                          {isEmail && (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20 w-fit">
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email & Password</span>
                            </span>
                          )}
                          {!isGoogle && !isEmail && (
                            <span className="text-xs text-muted-foreground font-mono">Standard</span>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ADMIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground border border-border/50">
                            USER
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="px-6 py-4">
                        {u.isLocked ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Locked</span>
                            </span>
                            <button
                              onClick={() => handleUnlock(u.id)}
                              className="text-xs text-primary hover:underline inline-flex items-center font-medium"
                            >
                              <Unlock className="w-3 h-3 mr-1" />
                              Unlock Account
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                          {new Date(u.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          
                          {/* Edit details */}
                          <button
                            title="Edit Details"
                            onClick={() => {
                              setEditUser(u);
                              setEditName(u.name);
                              setEditPhone(u.phone === "N/A" ? "" : u.phone);
                            }}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Toggle Role */}
                          <button
                            title={u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                            onClick={() => setRoleTargetUser(u)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            {u.role === "admin" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>

                          {/* Delete user */}
                          <button
                            title="Delete User"
                            onClick={() => setDeleteTargetUser(u)}
                            className="p-2 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border/50 bg-secondary/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-border/50 hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-border/50 hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="text-lg font-bold text-foreground">Edit User Details</h3>
              <button onClick={() => setEditUser(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Email Address (Read-only)</label>
                <input 
                  type="email" 
                  value={editUser.email} 
                  disabled 
                  className="w-full bg-secondary/50 border border-transparent rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Contact Number</label>
                <input 
                  type="tel" 
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" 
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingDetails}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center"
                >
                  {isUpdatingDetails ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleTargetUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="text-lg font-bold text-foreground">Confirm Role Change</h3>
              <button onClick={() => setRoleTargetUser(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Are you sure you want to change the role of <span className="font-semibold text-foreground">{roleTargetUser.name}</span> ({roleTargetUser.email}) from <span className="uppercase font-mono text-primary font-bold">{roleTargetUser.role}</span> to <span className="uppercase font-mono text-primary font-bold">{roleTargetUser.role === "admin" ? "user" : "admin"}</span>?
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRoleTargetUser(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                disabled={isUpdatingRole}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center"
              >
                {isUpdatingRole ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Confirm Role Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteTargetUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h3 className="text-lg font-bold text-destructive">Delete User Account</h3>
              <button onClick={() => setDeleteTargetUser(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete user <span className="font-semibold text-foreground">{deleteTargetUser.name}</span> ({deleteTargetUser.email})? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
