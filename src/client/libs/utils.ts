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

        if (locale !== 'ja')
            locale = 'en';

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
    static formatString(format : string, args : Object) : string
    {
        return format.replace(/\${(.*?)}/g, (match, key) =>
        {
            return (key in args ? args[key] : match);
        });
    };
}
