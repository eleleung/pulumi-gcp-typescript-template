import * as gcp from "@pulumi/gcp";

export const location = gcp.config.region || "europe-west2";