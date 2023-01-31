import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { location } from "./variables";

const sqlInstance = new gcp.sql.DatabaseInstance("sql-instance", {
    region: location,
    databaseVersion: "POSTGRES_14",
    settings: {
        tier: "db-f1-micro",
    },
    deletionProtection: true,
});

const database = new gcp.sql.Database("database", { instance: sqlInstance.name });