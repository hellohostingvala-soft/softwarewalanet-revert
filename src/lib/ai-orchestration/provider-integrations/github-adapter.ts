/**
 * GitHub API Adapter
 * Routes all GitHub calls through AI_GATEWAY – no direct fetch allowed.
 */

import AI_GATEWAY from '../ai-gateway';

export interface CreateBranchOptions {
  owner: string;
  repo: string;
  branch: string;
  fromSha: string;
  userId?: string;
  tenantId?: string;
}

export interface CreatePROptions {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  head: string;
  base: string;
  userId?: string;
  tenantId?: string;
}

/**
 * Get repository information.
 */
export async function getRepository(
  owner: string,
  repo: string,
  opts?: { userId?: string; tenantId?: string }
) {
  return AI_GATEWAY({
    provider: 'github',
    endpoint: `/repos/${owner}/${repo}`,
    method: 'GET',
    userId: opts?.userId,
    tenantId: opts?.tenantId,
  });
}

/**
 * Create a new branch in a repository.
 */
export async function createBranch(opts: CreateBranchOptions) {
  return AI_GATEWAY({
    provider: 'github',
    endpoint: `/repos/${opts.owner}/${opts.repo}/git/refs`,
    method: 'POST',
    body: {
      ref: `refs/heads/${opts.branch}`,
      sha: opts.fromSha,
    },
    userId: opts.userId,
    tenantId: opts.tenantId,
  });
}

/**
 * Create a pull request.
 */
export async function createPullRequest(opts: CreatePROptions) {
  return AI_GATEWAY({
    provider: 'github',
    endpoint: `/repos/${opts.owner}/${opts.repo}/pulls`,
    method: 'POST',
    body: {
      title: opts.title,
      body: opts.body ?? '',
      head: opts.head,
      base: opts.base,
    },
    userId: opts.userId,
    tenantId: opts.tenantId,
  });
}

/**
 * List recent commits on a branch.
 */
export async function listCommits(
  owner: string,
  repo: string,
  branch: string,
  opts?: { userId?: string; tenantId?: string }
) {
  return AI_GATEWAY({
    provider: 'github',
    endpoint: `/repos/${owner}/${repo}/commits?sha=${branch}&per_page=20`,
    method: 'GET',
    userId: opts?.userId,
    tenantId: opts?.tenantId,
  });
}
