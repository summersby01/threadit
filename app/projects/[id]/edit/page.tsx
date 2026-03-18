"use client";

import { useParams } from "next/navigation";
import { ProjectPatternEditForm } from "@/components/project-pattern-edit-form";

export default function ProjectEditPage() {
  const params = useParams<{ id: string }>();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  if (!projectId) {
    return null;
  }

  return <ProjectPatternEditForm projectId={projectId} />;
}
