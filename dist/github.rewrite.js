(function () {
    'use strict';

    /**
     * 利用 $prefs 进行数据初始化
     * @param key string 缓存 key
     * @param value string 缓存值
     * @returns string 缓存值
     */
    const cacheInit = (key, value) => {
        const res = $prefs.valueForKey(key) || '';
        if (value && value !== res) {
            $prefs.setValueForKey(value, key);
            return { value, reset: true };
        }
        else {
            return { value: res };
        }
    };

    class GitHub {
        constructor(username) {
            this.baseUrl = 'https://api.github.com';
            this.username = cacheInit(GitHub.username_key, username).value;
        }
        static setUsername() {
            const url = $request?.url || '';
            const username = url.match(/\?q=(.*)&/)?.[1];
            if (username) {
                const res = cacheInit(GitHub.username_key, username);
                if (res.reset) {
                    $notify('GitHub username 设置成功', '请在Gallery中移除附加组件');
                }
                else {
                    $notify('GitHub username 已存在', '请在Gallery中移除附加组件');
                }
            }
            $done({});
        }
        async bootstrap() {
            try {
                if (!this.username) {
                    $notify('GitHub', 'Warning', '请在Gallery中添加附加组件');
                    $done();
                }
                const [userInfo, repoInfo] = await Promise.all([this.fetchUserInfo(), this.fetchAllRepo()]);
                $notify('GitHub', `Star: ${repoInfo?.total_star_count} Issues: ${repoInfo?.total_issuses_count} Followers: ${userInfo?.followers} `, repoInfo?.detail.join('\r\n'));
                $done();
            }
            catch (err) {
                $notify('GitHub', 'Error', err.message || err);
                $done();
            }
        }
        async fetchUserInfo() {
            // https://docs.github.com/en/rest/reference/users#get-a-user
            const getUserApi = `${this.baseUrl}/users/${this.username}`;
            const { body } = await $task.fetch({ url: getUserApi });
            const parseBody = JSON.parse(body);
            return parseBody;
        }
        async fetchAllRepo(allData = {
            total_star_count: 0,
            total_issuses_count: 0,
            detail: []
        }, page = 1) {
            // https://docs.github.com/en/rest/reference/repos#list-repositories-for-a-user
            const listRepoApi = `${this.baseUrl}/users/${this.username}/repos?type=owner&per_page=100&page=${page}`;
            const { body, headers } = await $task.fetch({ url: listRepoApi });
            const parseBody = JSON.parse(body);
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
            }
            else {
                return allData;
            }
        }
    }
    GitHub.username_key = 'github_username';

    GitHub.setUsername();

}());
