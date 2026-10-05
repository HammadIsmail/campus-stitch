import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const DEFAULT_DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Data Science & AI",
  "Cyber Security",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Mechatronics Engineering",
  "Biomedical Engineering",
  "Business Administration (BBA)",
  "Accounting & Finance",
  "Management Sciences",
  "Architecture & Design",
  "Mathematics & Computing",
  "Physics & Applied Sciences",
  "Social Sciences & Humanities",
];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("departments")
      .select("name")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        success: true,
        departments: DEFAULT_DEPARTMENTS,
      });
    }

    const deptList = data.map((d: any) => d.name).filter(Boolean);
    return NextResponse.json({
      success: true,
      departments: deptList.length > 0 ? deptList : DEFAULT_DEPARTMENTS,
    });
  } catch {
    return NextResponse.json({
      success: true,
      departments: DEFAULT_DEPARTMENTS,
    });
  }
}
