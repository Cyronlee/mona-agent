import { redirect } from "next/navigation";
import { listProjects } from "@/lib/projects/loader";

export default function Home() {
  const projects = listProjects();
  redirect(projects.length > 0 ? "/dashboard" : "/new");
}
