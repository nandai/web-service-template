/**
 * (C) 2016-2017 printf.jp
 */
import 'babel-polyfill';

/**
 * ユーティリティ
 */
export default class Utils
{
    /**
     * @param   query       クエリ文字列
     * @param   separator   セパレータ
     *
     * @return  オブジェクト
     */
    static parseRawQueryString(query : string, separator : string = '&') : any
    {
        const obj = {};

        if (query)
        {
            const pairs = query.split(separator);

            for (const pair of pairs)
            {
                const [key, value] = pair.split('=');
                obj[key.trim()] = value;
            }
        }

        return obj;
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
}
