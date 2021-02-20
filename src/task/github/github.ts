import { cacheInit } from '@utils/cache';

type UserInfo = {
  name: string;
  followers: number;
  following: number;
  [prop: string]: any;
};

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
    Link?: string;
  };
};

export class GitHub {
  static username_key = 'github_username';

  static setUsername() {
    const url = $request?.url || '';
    const username = url.match(/\?q=(.*)&/)?.[1];
    if (username) {
      const res = cacheInit(GitHub.username_key, username);
      if (res.reset) {
        $notify('GitHub username 设置成功', '请在Gallery中移除附加组件');
      } else {
        $notify('GitHub username 已存在', '请在Gallery中移除附加组件');
      }
    }
    $done({});
  }

  baseUrl = 'https://api.github.com';
  username: string;

  constructor(username?: string) {
    this.username = cacheInit(GitHub.username_key, username).value;
  }

  async bootstrap() {
    try {
      if (!this.username) {
        $notify('GitHub', 'Warning', '请在Gallery中添加附加组件');
        $done();
      }
      const [userInfo, repoInfo] = await Promise.all([this.fetchUserInfo(), this.fetchAllRepo()]);
      $notify(
        'GitHub',
        `Star: ${repoInfo?.total_star_count} Issues: ${repoInfo?.total_issuses_count} Followers: ${userInfo?.followers} `,
        repoInfo?.detail.join('\r\n')
      );
      $done();
    } catch (err) {
      $notify('GitHub', 'Error', err.message || err);
      $done();
    }
  }

  private async fetchUserInfo() {
    // https://docs.github.com/en/rest/reference/users#get-a-user
    const getUserApi = `${this.baseUrl}/users/${this.username}`;
    const { body } = await $task.fetch({ url: getUserApi });
    const parseBody = JSON.parse(body) as UserInfo;
    return parseBody;
  }

  private async fetchAllRepo(
    allData = {
      total_star_count: 0,
      total_issuses_count: 0,
      detail: [] as string[]
    },
    page = 1
  ) {
    // https://docs.github.com/en/rest/reference/repos#list-repositories-for-a-user
    const listRepoApi = `${this.baseUrl}/users/${this.username}/repos?type=owner&per_page=100&page=${page}`;
    const { body, headers } = await $task.fetch<ListRepoResponse>({ url: listRepoApi });
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
      if (headers?.Link?.includes(`rel="next"`)) {
        data = await this.fetchAllRepo(data, page + 1);
      }
      return data;
    } else {
      return allData;
    }
  }
}
