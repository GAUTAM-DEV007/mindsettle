"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createAdminClient,
  isAdminApiConfigured,
  listAllAuthUsers,
} from "@/lib/supabase/admin";
import {
  isResendConfigured,
  sendOrganisationMemberWelcomeEmail,
} from "@/lib/email/resend";
import { getSitePageUrl } from "@/lib/auth/site-url";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createTemporaryPassword() {
  return `Ms!7${randomBytes(15).toString("base64url")}`;
}

function getLoginUrl() {
  try {
    return getSitePageUrl("/login");
  } catch (error) {
    console.error("Could not create organisation member login URL:", error);
    throw new Error("The site URL is not configured for invitation emails.");
  }
}

function memberError(message) {
  return {
    error: message,
    success: null,
    emailSent: false,
    temporaryPassword: null,
  };
}

function mapReservationError(error) {
  const message = error?.message || "";

  if (error?.code === "23505" || message.includes("member_already_exists")) {
    return "That email has already been added to your organisation.";
  }

  if (message.includes("organisation_seat_limit_reached")) {
    return "All purchased seats are allocated. Remove a member or increase your plan before adding another.";
  }

  if (message.includes("organisation_subscription_required")) {
    return "Choose an organisation plan before adding members.";
  }

  if (error?.code === "42883") {
    return "Member onboarding is not installed in the database yet. Apply the latest Supabase migration.";
  }

  return "Could not reserve a member seat. Please try again.";
}

async function removeReservedMember(admin, memberId, organisationId) {
  await admin
    .from("organisation_members")
    .delete()
    .eq("id", memberId)
    .eq("organisation_id", organisationId);
}

async function requireOrganisation() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.app_metadata?.must_change_password === true) redirect("/set-password");

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
  const suppliedName = String(formData.get("name") || "").trim();
  const fullName = (suppliedName || email.split("@")[0]).slice(0, 100);

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return memberError("Enter a valid email address.");
  }

  if (email === user.email?.toLowerCase()) {
    return memberError("Your organisation-admin account is already included and does not use a member seat.");
  }

  if (!isAdminApiConfigured()) {
    return memberError(
      "Member account creation is not configured. Add SUPABASE_SERVICE_ROLE_KEY to the server environment."
    );
  }

  const admin = createAdminClient();
  const { data: reservationRows, error: reservationError } = await supabase.rpc(
    "reserve_organisation_member",
    { member_email: email }
  );

  if (reservationError) {
    return memberError(mapReservationError(reservationError));
  }

  const reservation = reservationRows?.[0];

  if (!reservation?.member_id) {
    return memberError("The member seat was not reserved. Please try again.");
  }

  if (reservation.linked_user_id) {
    revalidatePath("/organisation-dashboard");
    revalidatePath("/organisation-dashboard/members");
    return {
      error: null,
      success: `${email} already has a Mindsettle account and is now active in your organisation. They can sign in with their existing password.`,
      emailSent: false,
      temporaryPassword: null,
    };
  }

  const temporaryPassword = createTemporaryPassword();
  const organisationName =
    user.user_metadata?.organisation_name || "Your organisation";

  let createdUser = null;
  const { data: createResult, error: createError } = await admin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
    app_metadata: {
      account_type: "organisation_member",
      organisation_id: user.id,
      must_change_password: true,
    },
  });

  createdUser = createResult?.user ?? null;

  if (createError || !createdUser) {
    // A matching account may have appeared between the seat reservation and
    // createUser(). Link it without replacing that person's password.
    const existingUsers = await listAllAuthUsers(admin).catch(() => []);
    const existingUser = existingUsers.find(
      (candidate) => candidate.email?.toLowerCase() === email
    );

    if (existingUser) {
      const { error: linkExistingError } = await admin
        .from("organisation_members")
        .update({
          user_id: existingUser.id,
          status: "active",
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", reservation.member_id)
        .eq("organisation_id", user.id);

      if (!linkExistingError) {
        revalidatePath("/organisation-dashboard");
        revalidatePath("/organisation-dashboard/members");
        return {
          error: null,
          success: `${email} already has a Mindsettle account and is now active in your organisation. They can sign in with their existing password.`,
          emailSent: false,
          temporaryPassword: null,
        };
      }
    }

    await removeReservedMember(admin, reservation.member_id, user.id);
    return memberError(createError?.message || "Could not create the member login.");
  }

  const { error: linkError } = await admin
    .from("organisation_members")
    .update({
      user_id: createdUser.id,
      status: "invited",
      temporary_password_issued_at: new Date().toISOString(),
      onboarding_completed_at: null,
    })
    .eq("id", reservation.member_id)
    .eq("organisation_id", user.id);

  if (linkError) {
    await admin.auth.admin.deleteUser(createdUser.id);
    await removeReservedMember(admin, reservation.member_id, user.id);
    return memberError("The login was created but could not be linked to the organisation. Please try again.");
  }

  let emailSent = false;
  let emailWarning = null;

  if (isResendConfigured()) {
    try {
      await sendOrganisationMemberWelcomeEmail({
        to: email,
        organisationName,
        temporaryPassword,
        loginUrl: getLoginUrl(),
      });
      emailSent = true;
    } catch (error) {
      emailWarning = error?.message || "The welcome email could not be sent.";
    }
  } else {
    emailWarning = "Email delivery is not configured on this server.";
  }

  revalidatePath("/organisation-dashboard");
  revalidatePath("/organisation-dashboard/members");
  return {
    error: null,
    success: emailSent
      ? `Account created for ${email}. Their temporary password was emailed to them.`
      : `Account created for ${email}, but ${emailWarning}`,
    emailSent,
    temporaryPassword: emailSent ? null : temporaryPassword,
  };
}

export async function removeMember(memberId) {
  const { supabase, user } = await requireOrganisation();

  if (!UUID_RE.test(String(memberId || ""))) throw new Error("Invalid member identifier.");

  const { data: member, error: memberLookupError } = await supabase
    .from("organisation_members")
    .select("user_id, status, temporary_password_issued_at")
    .eq("id", memberId)
    .eq("organisation_id", user.id)
    .maybeSingle();

  if (memberLookupError || !member) {
    throw new Error("This member could not be found.");
  }

  const { error } = await supabase
    .from("organisation_members")
    .delete()
    .eq("id", memberId)
    .eq("organisation_id", user.id);

  if (error) throw new Error("Could not remove this member. Please try again.");

  // If this was an unused temporary account created by this organisation,
  // remove the auth record too. Active people and pre-existing Mindsettle
  // users keep their account; removing them only revokes organisation access.
  if (
    member.user_id &&
    member.status === "invited" &&
    member.temporary_password_issued_at &&
    isAdminApiConfigured()
  ) {
    const admin = createAdminClient();
    const { data: authUserResult } = await admin.auth.admin.getUserById(member.user_id);
    const authUser = authUserResult?.user;

    if (
      authUser?.app_metadata?.must_change_password === true &&
      authUser.app_metadata?.organisation_id === user.id
    ) {
      const { data: otherMembership, error: otherMembershipError } = await admin
        .from("organisation_members")
        .select("id")
        .eq("user_id", member.user_id)
        .limit(1)
        .maybeSingle();

      if (!otherMembershipError && !otherMembership) {
        const { error: deleteUserError } = await admin.auth.admin.deleteUser(member.user_id);
        if (deleteUserError) console.error("Temporary member cleanup failed:", deleteUserError);
      }
    }
  }

  revalidatePath("/organisation-dashboard");
  revalidatePath("/organisation-dashboard/members");
}
