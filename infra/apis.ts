import * as gcp from '@pulumi/gcp';

export const enableCloudRunApi = new gcp.projects.Service('enable-cloud-run-api', {
  service: 'run.googleapis.com',
});
export const enableIamApi = new gcp.projects.Service('enable-iam-api', {
  service: 'iam.googleapis.com',
});
export const enableCloudResourceManagerApi = new gcp.projects.Service(
  'enable-cloud-resouce-manager-api',
  {
    service: 'cloudresourcemanager.googleapis.com',
  }
);
export const enableSqlAdminApi = new gcp.projects.Service('enable-sql-admin-api', {
  service: 'sqladmin.googleapis.com',
});
export const enableVpcAccessApi = new gcp.projects.Service('enable-vpc-access-api', {
  service: 'vpcaccess.googleapis.com',
});
export const enableServiceNetworkingApi = new gcp.projects.Service(
  'enable-service-networking-api',
  {
    service: 'servicenetworking.googleapis.com',
  }
);
