/**
 * Bitbucket REST API 2.0 helper.
 * Makes authenticated requests using the user's OAuth access token.
 */

const BITBUCKET_API = 'https://api.bitbucket.org/2.0';

export class BitbucketApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'BitbucketApiError';
  }
}

async function bitbucketFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BITBUCKET_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 401) throw new BitbucketApiError(401, 'Bitbucket token expired or invalid');
  if (res.status === 403) throw new BitbucketApiError(403, 'Bitbucket API access denied');
  if (!res.ok) throw new BitbucketApiError(res.status, `Bitbucket API error: ${res.status}`);

  return res.json() as Promise<T>;
}

interface BitbucketWorkspace {
  slug: string;
  name: string;
  uuid: string;
}

interface BitbucketRepo {
  uuid: string;
  name: string;
  full_name: string;
  description: string;
  language: string;
  updated_on: string;
  links: { html: { href: string } };
  is_private: boolean;
}

interface BitbucketPagedResponse<T> {
  values: T[];
  size: number;
  pagelen: number;
  next?: string;
}

export interface BitbucketRepository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  lastUpdated: string;
  url: string;
  isPrivate: boolean;
}

export async function fetchBitbucketWorkspaces(token: string): Promise<BitbucketWorkspace[]> {
  const data = await bitbucketFetch<BitbucketPagedResponse<{ workspace: BitbucketWorkspace }>>(
    '/workspaces?pagelen=100',
    token,
  );
  return data.values.map(v => v.workspace);
}

export async function fetchBitbucketRepos(token: string): Promise<BitbucketRepository[]> {
  const data = await bitbucketFetch<BitbucketPagedResponse<BitbucketRepo>>(
    '/repositories?role=member&pagelen=100&sort=-updated_on',
    token,
  );

  return data.values.map(r => ({
    id: r.uuid,
    name: r.name,
    fullName: r.full_name,
    description: r.description ?? '',
    language: r.language ?? 'Unknown',
    lastUpdated: r.updated_on,
    url: r.links.html.href,
    isPrivate: r.is_private,
  }));
}
