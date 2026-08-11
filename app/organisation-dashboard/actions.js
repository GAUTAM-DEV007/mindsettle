"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }

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
  return { error: null };
}

export async function removeMember(memberId) {
  const { supabase, user } = await requireOrganisation();

  await supabase
    .from("organisation_members")
    .delete()
    .eq("id", memberId)
    .eq("organisation_id", user.id);

  revalidatePath("/organisation-dashboard");
}
