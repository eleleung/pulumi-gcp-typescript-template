import * as gcp from '@pulumi/gcp';

export function addProjectServiceAgentRolesToDevops(projectNumber: string, projectId: string) {
  const projectServiceAgentAccount = `serviceAccount:${projectNumber}@serverless-robot-prod.iam.gserviceaccount.com`;

  new gcp.projects.IAMMember(`${projectNumber}-service-agent-storage-viewer-role`, {
    project: projectId,
    member: projectServiceAgentAccount,
    role: 'roles/storage.objectViewer',
  });
}
