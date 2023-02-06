import * as gcp from '@pulumi/gcp';

export function addProjectComputeServiceAccountRoles(projectNumber: string, projectId: string) {
  const projectComputeAccount = `serviceAccount:${projectNumber}-compute@developer.gserviceaccount.com`;

  new gcp.projects.IAMMember(`${projectNumber}-compute-service-account-artifact-registry-role`, {
    project: projectId,
    member: projectComputeAccount,
    role: 'roles/artifactregistry.reader',
  });

  new gcp.projects.IAMMember(`${projectNumber}-compute-service-account-container-registry-role`, {
    project: projectId,
    member: projectComputeAccount,
    role: 'roles/containerregistry.ServiceAgent',
  });
}
