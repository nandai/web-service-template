/**
 * (C) 2016-2017 printf.jp
 */

/**
 * View
 */
export default class View
{
    /**
     * @constructor
     */
    constructor()
    {
        this.init(false);

        const interval = Math.floor(1000 / 60 * 10);
        let resizeTimer = null;

        window.addEventListener('resize', () =>
        {
            if (resizeTimer !== null)
                clearTimeout(resizeTimer);

            resizeTimer = setTimeout(() => this.init(true), interval);
        });
    }

    /**
     * 初期化
     *
     * @param   isResize    リサイズしたかどうか
     */
    protected init(isResize : boolean) : void
    {
    }
}
