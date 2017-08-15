/**
 * (C) 2016-2017 printf.jp
 */

/**
 * ユーティリティ
 */
export default class Utils
{
    /**
     * ブラウザの設定からロケールを取得する
     *
     * @return  言語
     */
    static getLocale() : string
    {
        const languages : string[] = window.navigator['languages'];
        const language  : string = (languages && languages[0]) || window.navigator['language'];

        let locale = language.substr(0, 2);

        if (locale !== 'ja') {
            locale = 'en';
        }

        return locale;
    }

    /**
     * URLからパラメータを取得する
     *
     * @param   url     /users/1のようなURL（location.pathname相当）
     * @param   format  /users/:idのようなフォーマット
     *
     * @return  {id:'1}のようなオブジェクト。内容はformatに依る
     */
    static getParamsFromUrl(url : string, format : string) : any
    {
        const formatKeys = format.split('/');
        const urlKeys = url.split('/');
        const count = formatKeys.length;
        let params = {};

        if (formatKeys.length !== urlKeys.length) {
            return null;
        }

        for (let i = 0; i < count; i++)
        {
            const formatKey = formatKeys[i];
            const urlKey = urlKeys[i];

            if (formatKey.charAt(0) === ':')
            {
                params[formatKey.substr(1)] = urlKey;
            }
            else
            {
                if (formatKey !== urlKey)
                {
                    params = null;
                    break;
                }
            }
        }

        return params;
    }

    /**
     * Server Side Rendering Store を取得する
     */
    static getSsrStore<T>() : T
    {
        return window['ssrStore'];
    }

    /**
     * モバイルかどうかを調べる
     */
    static isMobile() : boolean
    {
        let ua = navigator.userAgent;
        ua = ua.toLowerCase();
        return /android|iphone/.test(ua);
    }

    /**
     * モバイルブラウザのバウンスを無効にする
     */
    private static touchY = 0;
    static disableBounceScroll() : void
    {
        document.body.addEventListener('touchstart', (e) =>
        {
            Utils.touchY = e.touches[0].screenY;
        });

        document.body.addEventListener('touchmove', (e) =>
        {
            let el = e.target as HTMLElement;
            const moveY = e.touches[0].screenY;
            let noScroll = true;

            while (el !== null)
            {
                if (el.offsetHeight < el.scrollHeight)
                {
                    if (Utils.touchY < moveY && el.scrollTop === 0) {
                        break;
                    }

                    if (Utils.touchY > moveY && el.scrollTop === el.scrollHeight - el.offsetHeight) {
                        break;
                    }

                    noScroll = false;
                    break;
                }
                el = el.parentElement;
            }

            if (noScroll) {
                e.preventDefault();
            }

            Utils.touchY = moveY;
        });
    }
}
