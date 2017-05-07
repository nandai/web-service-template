/**
 * (C) 2016-2017 printf.jp
 */
import History from '../libs/history';

const slog = window['slog'];

export abstract class App
{
    render : () => void;

    /**
     * 初期化
     *
     * @param   params  URLに含まれるパラメータ（Utils.getParamsFromUrl参照）
     * @param   message 前画面から渡されるメッセージ（History.pushState参照）
     */
    init(params, message? : string)
    {
        return new Promise((resolve : () => void) =>
        {
            resolve();
        });
    }

    abstract view() : JSX.Element;

    /**
     * onBack
     */
    protected onBack() : void
    {
        const log = slog.stepIn('App', 'onBack');
        History.back();
        log.stepOut();
    }
}
