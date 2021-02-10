const UserName = 'njzydark';

const BaseUrl = 'https://api.github.com';
// https://docs.github.com/en/rest/reference/users#get-a-user
const GetUserApi = `${BaseUrl}/users/njzydark`;
// https://docs.github.com/en/rest/reference/repos#list-repositories-for-a-user
const ListRepoApi = `${BaseUrl}/users/${UserName}/repos?type=owner&per_page=100`;

type RepoInfo = {
  id: string;
  name: string;
  private: boolean;
  html_url: string;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues: number;
  [prop: string]: any;
};

type UserInfo = {
  name: string;
  followers: number;
  following: number;
  [prop: string]: any;
};

type ListRepoResponse = QuanXResponse & {
  /**
   * @description https://docs.github.com/en/rest/overview/resources-in-the-rest-api
   */
  headers: {
    /** The maximum number of requests you're permitted to make per hour. */
    'X-RateLimit-Limit': number;
    /** The number of requests remaining in the current rate limit window. */
    'X-RateLimit-Remaining': number;
    /** The time at which the current rate limit window resets in UTC epoch seconds. */
    'X-RateLimit-Reset': number;
    /** The Link header includes pagination information */
    Link: string;
  };
};

const fetchUserInfo = async () => {
  const { body } = await $task.fetch({ url: GetUserApi });
  const parseBody = JSON.parse(body) as UserInfo;
  return parseBody;
};

const fetchAllRepo = async (
  allData = {
    total_star_count: 0,
    total_issuses_count: 0,
    detail: [] as string[]
  },
  page = 1
) => {
  const { body, headers } = await $task.fetch<ListRepoResponse>({ url: `${ListRepoApi}&page=${page}` });
  const parseBody = JSON.parse(body) as RepoInfo[];
  if (body?.length > 0) {
    let data = parseBody
      .filter(item => !item.fork)
      .reduce((pre, cur) => {
        pre.total_issuses_count += cur.open_issues;
        pre.total_star_count += cur.stargazers_count;
        if (cur.stargazers_count !== 0 || cur.open_issues !== 0) {
          pre.detail.push(`${cur.name} star: ${cur.stargazers_count} issuses: ${cur.open_issues}`);
        }
        return pre;
      }, allData);
    if (headers.Link.includes(`rel="next"`)) {
      data = await fetchAllRepo(data, page + 1);
    }
    return data;
  } else {
    return allData;
  }
};

const bootstrap = async () => {
  try {
    const [userInfo, repoInfo] = await Promise.all([fetchUserInfo(), fetchAllRepo()]);
    $notify(
      'GitHub',
      `Star: ${repoInfo?.total_star_count} Issues: ${repoInfo?.total_issuses_count} Followers: ${userInfo?.followers} `,
      repoInfo?.detail.join('\r\n')
    );
    $done();
  } catch (err) {
    $notify('GitHub Error', err.message || err);
    $done();
  }
};

bootstrap();

export {};
