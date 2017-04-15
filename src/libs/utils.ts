/**
 * (C) 2016-2017 printf.jp
 */

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
        const pairs = query.split(separator);

        for (const pair of pairs)
        {
            const [key, value] = pair.split('=');
            obj[key.trim()] = value;
        }

        return obj;
    }
}
