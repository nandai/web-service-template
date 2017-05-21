/**
 * (C) 2016 printf.jp
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
     * 文字列フォーマット<br>
     * 使用方法: formatString('Hello ${name} !', {name:'Taro'});
     *
     * @param   format  フォーマット
     * @param   args    引数
     *
     * @return  文字列
     */
    static formatString(format : string, args) : string
    {
        return format.replace(/\${(.*?)}/g, (match, key) =>
        {
            return (key in args ? args[key] : match);
        });
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
}
