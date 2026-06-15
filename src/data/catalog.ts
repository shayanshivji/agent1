import {
  type EngagementContext,
  useBsnCatalog,
} from "@/data/engagement-context";
import {
  BSN_ROLES,
  BSN_WORKFLOWS,
  WORKFLOW_ROLE_HINTS,
  getRole as getBsnRole,
  getWorkflow as getBsnWorkflow,
} from "@/data/bsn-catalog";
import {
  filterGenericRoles,
  filterGenericWorkflows,
  GENERIC_ROLES,
  GENERIC_WORKFLOWS,
} from "@/data/generic-catalog";
import type { Role, Workflow } from "@/types/guide";

export function resolveWorkflows(ctx: EngagementContext): Workflow[] {
  if (useBsnCatalog(ctx.industryId, ctx.functionId)) {
    return BSN_WORKFLOWS;
  }
  const filtered = filterGenericWorkflows(ctx.functionId);
  return filtered.length > 0 ? filtered : GENERIC_WORKFLOWS;
}

export function resolveRoles(ctx: EngagementContext): Role[] {
  if (useBsnCatalog(ctx.industryId, ctx.functionId)) {
    return BSN_ROLES;
  }
  const filtered = filterGenericRoles(ctx.functionId);
  return filtered.length > 0 ? filtered : GENERIC_ROLES;
}

export function getWorkflow(
  workflowId: string,
  ctx?: EngagementContext,
): Workflow | undefined {
  const all = ctx
    ? resolveWorkflows(ctx)
    : [...BSN_WORKFLOWS, ...GENERIC_WORKFLOWS];
  return all.find((w) => w.id === workflowId);
}

export function getRole(roleId: string, ctx?: EngagementContext): Role | undefined {
  const all = ctx ? resolveRoles(ctx) : [...BSN_ROLES, ...GENERIC_ROLES];
  return all.find((r) => r.id === roleId);
}

export function getRoleHints(workflowId: string, roleId: string): string[] {
  return WORKFLOW_ROLE_HINTS[workflowId]?.[roleId] ?? [];
}

export function pickDefaultWorkflowId(ctx: EngagementContext): string {
  const workflows = resolveWorkflows(ctx);
  return workflows[0]?.id ?? "order-to-cash";
}

export function pickDefaultRoleId(ctx: EngagementContext): string {
  const roles = resolveRoles(ctx);
  return roles[0]?.id ?? "frontline-operator";
}

export function isValidWorkflowRole(
  ctx: EngagementContext,
  workflowId: string,
  roleId: string,
): boolean {
  const workflows = resolveWorkflows(ctx);
  const roles = resolveRoles(ctx);
  return (
    workflows.some((w) => w.id === workflowId) &&
    roles.some((r) => r.id === roleId)
  );
}

// Re-export BSN helpers for modules that only need BSN data
export { getBsnWorkflow, getBsnRole };
