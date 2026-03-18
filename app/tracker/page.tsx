"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePatternRowsStore } from "@/stores/use-pattern-rows-store";

export default function TrackerPage() {
  const router = useRouter();
  const selectedProjectId = usePatternRowsStore((state) => state.selectedProjectId);
  const projects = usePatternRowsStore((state) => state.projects);
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );

  useEffect(() => {
    if (selectedProject) {
      router.replace(`/projects/${selectedProjectId}`);
      return;
    }

    if (!selectedProjectId) {
      router.replace("/");
    }
  }, [router, selectedProject, selectedProjectId]);

  return null;
}
