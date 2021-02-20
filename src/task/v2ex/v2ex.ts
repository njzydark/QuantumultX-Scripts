import { cacheInit } from '@utils/cache';

export class V2ex {
  static cookie_key = 'v2ex_cookie';
  static async setCookie() {
    const cookie = $request?.headers?.Cookie;
    if (cookie) {
      const res = cacheInit(V2ex.cookie_key, cookie);
      if (res.reset) {
        $notify('V2ex Cookie 设置成功', '请在Gallery中移除附加组件');
      } else {
        $notify('V2ex Cookie 已存在', '请在Gallery中移除附加组件');
      }
    }
    $done({});
  }

  baseUrl = 'https://www.v2ex.com';
  cookie: string;

  constructor() {
    this.cookie = cacheInit(V2ex.cookie_key).value;
  }

  async bootstrap() {
    try {
      if (!this.cookie) {
        $notify('V2ex', 'Warning', '请在Gallery中添加附加组件');
        $done();
      }
      const { subTitle, detail } = await this.fetchDailyPage();
      $notify('V2ex', subTitle, detail);
      $done();
    } catch (err) {
      $notify('V2ex', 'Error', err.message || err);
      $done();
    }
  }

  private async fetchDailyPage() {
    const { body = '' } = await $task.fetch({ url: `${this.baseUrl}/mission/daily`, headers: { Cookie: this.cookie } });
    if (body.includes('你要查看的页面需要先登录')) {
      return { subTitle: '当前未登录，请在Gallery中添加附加组件更新Cookie' };
    } else {
      const { jumpUrl, loginDays } = this.handleResponseHtml(body);
      if (jumpUrl) {
        const { body } = await $task.fetch({
          url: `${this.baseUrl}${jumpUrl}`,
          headers: { Cookie: this.cookie }
        });
        const { jumpUrl: newJumpUrl, loginDays } = this.handleResponseHtml(body);
        if (newJumpUrl) {
          return { subTitle: '签到失败', detail: body };
        } else {
          return { subTitle: '签到成功, 每日登录奖励已领取', detail: loginDays };
        }
      } else {
        return { subTitle: '每日登录奖励已领取', detail: loginDays };
      }
    }
  }

  private handleResponseHtml(html: string) {
    const urlMatchArr = html.match(/\/mission\/daily\/redeem\?once=(\d)+/g) || [];
    const loginDaysMatchArr = html.match(/已连续登录.*天/g) || [];
    const loginDays = loginDaysMatchArr?.[0] || '';
    return {
      jumpUrl: urlMatchArr[0] || '',
      loginDays
    };
  }
}
