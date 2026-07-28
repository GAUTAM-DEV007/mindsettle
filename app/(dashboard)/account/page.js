import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <div className="max-w-md rounded-xl border border-neutral-200 p-6">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Member since</dt>
            <dd className="font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
