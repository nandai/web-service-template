/**
 * (C) 2016-2017 printf.jp
 */
export abstract class App
{
    render : () => void;

    init() : void
    {
    }

    abstract view() : JSX.Element;
}
