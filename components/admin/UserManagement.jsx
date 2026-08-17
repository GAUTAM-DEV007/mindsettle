"use client";

import { useTransition } from "react";
import ConfigMissingNotice from "./ConfigMissingNotice";
import {
  changeUserRole,
  setUserSuspended,
  deleteUserAccount,
} from "@/app/admin/users-actions";

export default function UserManagement({ users, configured }) {
  if (!configured) {
    return (
      <ConfigMissingNotice
        envVar="SUPABASE_SERVICE_ROLE_KEY"
        purpose="list and manage user accounts"
      />
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-sky-100 bg-white p-6 text-center shadow-md">
        <p className="text-sm text-slate-500">No registered users yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-md">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Email</th>
            <th className="px-5 py-3">Role</th>
            <th className="px-5 py-3">Joined</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRow({ user }) {
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(event) {
    const formData = new FormData();
    formData.set("userId", user.id);
    formData.set("role", event.target.value);
    startTransition(() => {
      changeUserRole(formData);
    });
  }

  function handleSuspendToggle() {
    const message = user.suspended
      ? "Unsuspend this account?"
      : "Suspend this account? They won't be able to log in until unsuspended.";

    if (!confirm(message)) {
      return;
    }

    startTransition(() => {
      setUserSuspended(user.id, !user.suspended);
    });
  }

  function handleDelete() {
    if (
      !confirm(
        `Permanently delete ${user.email}? This cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(() => {
      deleteUserAccount(user.id);
    });
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-5 py-3 text-slate-700">{user.email}</td>
      <td className="px-5 py-3">
        <select
          defaultValue={user.role}
          disabled={isPending}
          onChange={handleRoleChange}
          className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs capitalize outline-none focus:border-emerald-500"
        >
          <option value="user">User</option>
          <option value="organisation">Organisation</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-5 py-3 text-slate-500">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-5 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            user.suspended
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {user.suspended ? "Suspended" : "Active"}
        </span>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSuspendToggle}
            className="text-amber-700 hover:underline disabled:opacity-50"
          >
            {user.suspended ? "Unsuspend" : "Suspend"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="text-red-600 hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
