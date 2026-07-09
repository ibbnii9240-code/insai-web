import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const cookieStore = await cookies();

  cookieStore.delete("insai_admin_auth");
  cookieStore.delete("insai_admin_role");

  redirect("/admin/login");
}
