"use client";

import { useParams } from "next/navigation";
import { PatternAssetDetailView } from "@/components/pattern-asset-detail-view";

export default function PatternAssetDetailPage() {
  const params = useParams<{ id: string }>();
  const assetId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <PatternAssetDetailView assetId={assetId} />;
}
