export type GitHubPayload =
  | { operation: 'list_repos'; org?: string }
  | { operation: 'get_repo'; owner: string; repo: string }
  | { operation: 'list_issues'; owner: string; repo: string; state?: 'open' | 'closed' | 'all' }
  | { operation: 'create_issue'; owner: string; repo: string; title: string; body?: string; labels?: string[] }
  | { operation: 'get_file'; owner: string; repo: string; path: string; ref?: string }
  | { operation: 'create_or_update_file'; owner: string; repo: string; path: string; message: string; content: string; sha?: string; branch?: string };

export interface GitHubResponse {
  status: number;
  data: any;
}

const GITHUB_BASE_URL = 'https://api.github.com';

/** GitHub API is metered by rate limits rather than cost; we assign a nominal cost per call. */
const COST_PER_CALL = 0.0001;

export class GitHubAdapter {
  async executeCall(payload: GitHubPayload, apiKey: string): Promise<GitHubResponse> {
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    };

    let url: string;
    let method = 'GET';
    let body: string | undefined;

    switch (payload.operation) {
      case 'list_repos':
        url = payload.org
          ? `${GITHUB_BASE_URL}/orgs/${payload.org}/repos`
          : `${GITHUB_BASE_URL}/user/repos`;
        break;

      case 'get_repo':
        url = `${GITHUB_BASE_URL}/repos/${payload.owner}/${payload.repo}`;
        break;

      case 'list_issues':
        url = `${GITHUB_BASE_URL}/repos/${payload.owner}/${payload.repo}/issues?state=${payload.state ?? 'open'}`;
        break;

      case 'create_issue':
        url = `${GITHUB_BASE_URL}/repos/${payload.owner}/${payload.repo}/issues`;
        method = 'POST';
        body = JSON.stringify({ title: payload.title, body: payload.body, labels: payload.labels });
        break;

      case 'get_file':
        url = `${GITHUB_BASE_URL}/repos/${payload.owner}/${payload.repo}/contents/${payload.path}${payload.ref ? `?ref=${payload.ref}` : ''}`;
        break;

      case 'create_or_update_file': {
        url = `${GITHUB_BASE_URL}/repos/${payload.owner}/${payload.repo}/contents/${payload.path}`;
        method = 'PUT';
        const bytes = new TextEncoder().encode(payload.content);
        const encoded = btoa(String.fromCharCode(...bytes));
        body = JSON.stringify({
          message: payload.message,
          content: encoded,
          sha: payload.sha,
          branch: payload.branch,
        });
        break;
      }

      default:
        throw new Error(`Unsupported GitHub operation: ${(payload as any).operation}`);
    }

    const response = await fetch(url, { method, headers, body });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`GitHub API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    return { status: response.status, data };
  }

  estimateCost(_payload: GitHubPayload): number {
    return COST_PER_CALL;
  }
}
