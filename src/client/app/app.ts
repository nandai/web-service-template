/**
 * (C) 2016-2017 printf.jp
 */
import History from '../libs/history';

const slog = window['slog'];

export abstract class App
{
    render : () => void;

    init()
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
