/**
 * (C) 2016-2017 printf.jp
 */
import bind              from 'bind-decorator';

import History           from 'client/libs/history';
import {slog}            from 'client/libs/slog';
import {SocketEventData} from 'client/libs/socket-event-data';

export abstract class App
{
    active = false;
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

    /**
     * view
     */
    abstract view() : JSX.Element;

    /**
     * ソケットイベント通知
     */
    notifySocketEvent(data : SocketEventData) : void
    {
    }

    /**
     * onBack
     */
    @bind
    protected onBack() : void
    {
        const log = slog.stepIn('App', 'onBack');
        History.back();
        log.stepOut();
    }
}
