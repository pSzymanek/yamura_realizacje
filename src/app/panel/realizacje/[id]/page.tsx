import { notFound } from "next/navigation";

import { AdminProjectLiveView } from "@/components/admin-project-live-view";
import { getStaffProject } from "@/lib/data";
import { demoAdminProjects, isLocalStaffPreview } from "@/lib/customer-demo";
import { getAppUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const project = await getStaffProject(id);
  if (!project) notFound();
  const clientLink = `${getAppUrl()}/r/${project.access_token}`;
  const wasCreated = query.created === "1";
  const caseArchive = isLocalStaffPreview()
    ? demoAdminProjects.find((item) => item.id === project.id) || null
    : null;

  return (
    <AdminProjectLiveView
      project={project}
      caseArchive={caseArchive}
      clientLink={clientLink}
      wasCreated={wasCreated}
    />
  );
}
