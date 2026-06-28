/**
 * Run this to capture AWS database proof for hackathon submission.
 *
 * Prerequisites – set these env vars first (use the neurodash-vercel IAM keys):
 *   $env:AWS_ACCESS_KEY_ID     = "AKIA..."
 *   $env:AWS_SECRET_ACCESS_KEY = "..."
 *   $env:AWS_DEFAULT_REGION    = "eu-central-1"
 *
 * Then:
 *   node aws-db-proof.mjs
 */

import { RDSClient, DescribeDBClustersCommand, DescribeDBInstancesCommand } from "@aws-sdk/client-rds";
import { CloudFormationClient, DescribeStacksCommand } from "@aws-sdk/client-cloudformation";

const REGION  = process.env.AWS_DEFAULT_REGION || "eu-central-1";
const CLUSTER = "neurodash-aurora-auroracluster-oi4v5afiwcf6";
const STACK   = "neurodash-aurora";

const rds = new RDSClient({ region: REGION });
const cf  = new CloudFormationClient({ region: REGION });

async function main() {
  const line = "─".repeat(70);
  console.log("\n" + line);
  console.log("  NeuroDash — AWS Database Proof  |  Hackathon Submission");
  console.log(line);

  // ── Aurora cluster ──────────────────────────────────────────────────────
  const { DBClusters } = await rds.send(
    new DescribeDBClustersCommand({ DBClusterIdentifier: CLUSTER })
  );
  const c = DBClusters[0];

  console.log("\n  AMAZON AURORA POSTGRESQL CLUSTER");
  console.log(`  Cluster ID  : ${c.DBClusterIdentifier}`);
  console.log(`  Status      : ${c.Status}`);
  console.log(`  Engine      : ${c.Engine} ${c.EngineVersion}`);
  console.log(`  Endpoint    : ${c.Endpoint}:${c.Port}`);
  console.log(`  Multi-AZ    : ${c.MultiAZ}`);
  console.log(`  Serverless  : MinACU=${c.ServerlessV2ScalingConfiguration?.MinCapacity}  MaxACU=${c.ServerlessV2ScalingConfiguration?.MaxCapacity}`);
  console.log(`  Created     : ${c.ClusterCreateTime}`);
  console.log(`  Region      : ${REGION}`);

  // ── CloudFormation stack ─────────────────────────────────────────────────
  const { Stacks } = await cf.send(
    new DescribeStacksCommand({ StackName: STACK })
  );
  const s = Stacks[0];

  console.log("\n  AWS CLOUDFORMATION STACK (IaC)");
  console.log(`  Stack Name  : ${s.StackName}`);
  console.log(`  Status      : ${s.StackStatus}`);
  console.log(`  Created     : ${s.CreationTime}`);
  console.log(`  Updated     : ${s.LastUpdatedTime || "n/a"}`);

  console.log("\n" + line);
  console.log("  Screenshot this terminal output for the hackathon submission.");
  console.log(line + "\n");
}

main().catch(err => {
  console.error("Error:", err.message);
  console.error("Make sure AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are set.");
  process.exit(1);
});
