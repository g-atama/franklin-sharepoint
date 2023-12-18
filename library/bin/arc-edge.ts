#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ArcEdgeStack } from "../lib/arc-edge-stack";

const app = new cdk.App();

// eslint-disable-next-line no-new
new ArcEdgeStack(app, "ArcEdge-sandbox", {
  env: { account: "584780088697", region: "us-east-1" },
  prefix: "sandbox",
  edsURL: "main--aftest--k-atama.hlx.live",
});
