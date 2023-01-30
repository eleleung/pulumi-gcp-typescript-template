import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

const location = gcp.config.region || "europe-west2";

const enableCloudRun = new gcp.projects.Service("EnableCloudRun", {
    service: "run.googleapis.com",
});

const ktorSampleImage = new docker.Image("ktor-sample-image", {
    imageName: pulumi.interpolate`gcr.io/${gcp.config.project}/ktor-sample:v1.0.0`,
    build: {
        context: "../",
    },
});

const exampleApp = new gcp.cloudrun.Service("ktor-sample", {
    location: "europe-west2",
    template: {
        spec: {
            containers: [{
                image: ktorSampleImage.imageName,
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