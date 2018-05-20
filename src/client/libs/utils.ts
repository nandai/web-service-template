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
        const languages = window.navigator['languages'];
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
        if (! url || ! format) {
            return null;
        }

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
     * モバイルかどうかを調べる
     */
    static isMobile() : boolean
    {
        let ua = navigator.userAgent;
        ua = ua.toLowerCase();
        return /android|iphone/.test(ua);
    }
}
