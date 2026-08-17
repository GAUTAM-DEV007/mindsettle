import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS = { trialing: "Trial", active: "Active", past_due: "Payment due", canceled: "Cancelled", incomplete: "Incomplete" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error("We could not load your subscription details.");

  return <div className="flex flex-col gap-6"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">My Mindsettle</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Billing</h1></div><div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">{subscription ? <><div className="flex items-start justify-between gap-6"><div><p className="text-sm text-slate-500">Current plan</p><p className="mt-1 text-xl font-semibold text-slate-950">{subscription.plan || "Mindsettle subscription"}</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{STATUS_LABELS[subscription.status] || subscription.status}</span></div>{subscription.current_period_end && <p className="mt-5 text-sm text-slate-600">Current period ends {new Date(subscription.current_period_end).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}.</p>}</> : <><p className="text-lg font-semibold text-slate-950">No subscription is connected</p><p className="mt-2 text-sm leading-6 text-slate-600">There is no billing record associated with this account. Contact Mindsettle if your organisation should already have access.</p></>}<Link href="/contact" className="mt-6 inline-flex rounded-full border border-emerald-700 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50">Contact billing support</Link></div></div>;
}
