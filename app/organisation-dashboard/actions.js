"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireOrganisation() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roleRecord } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleRecord?.role !== "organisation") redirect("/");

  return { supabase, user };
}

export async function addMember(_prevState, formData) {
  const { supabase, user } = await requireOrganisation();
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return { error: "Enter a valid email address." };
  }

  if (email === user.email?.toLowerCase()) return { error: "Your organisation account is already included." };

  const { error } = await supabase.from("organisation_members").insert({
    organisation_id: user.id,
    email,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "That email has already been invited." };
    }
    return { error: "Could not add member. Please try again." };
  }

  revalidatePath("/organisation-dashboard");
  revalidatePath("/organisation-dashboard/members");
  return { error: null };
}

export async function removeMember(memberId) {
  const { supabase, user } = await requireOrganisation();

  if (!UUID_RE.test(String(memberId || ""))) throw new Error("Invalid member identifier.");

  const { error } = await supabase
    .from("organisation_members")
    .delete()
    .eq("id", memberId)
    .eq("organisation_id", user.id);

  if (error) throw new Error("Could not remove this member. Please try again.");

  revalidatePath("/organisation-dashboard");
  revalidatePath("/organisation-dashboard/members");
}
