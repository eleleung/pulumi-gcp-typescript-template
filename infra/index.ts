import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const location = gcp.config.region || "europe-west2";

const enableCloudRun = new gcp.projects.Service("EnableCloudRun", {
    service: "run.googleapis.com",
});

const exampleApp = new gcp.cloudrun.Service("ktor-sample", {
    location: "europe-west2",
    template: {
        spec: {
            containers: [{
                image: "gcr.io/cloudrun/hello",
            }],
        },
    },
    traffics: [{
        latestRevision: true,
        percent: 100,
    }],
}, { dependsOn: enableCloudRun });

const exposer = new gcp.cloudrun.IamMember("exampleApp-exposer", {
    service: exampleApp.name,
    location,
    role: "roles/run.invoker",
    member: "allUsers",
});