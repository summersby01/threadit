"use client";

import { useParams } from "next/navigation";
import { ProjectTrackerView } from "@/components/project-tracker-view";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <ProjectTrackerView projectId={projectId} />;
}
