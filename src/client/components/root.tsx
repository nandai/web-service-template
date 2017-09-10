/**
 * (C) 2016-2017 printf.jp
 */
import * as React     from 'react';

import {App}          from 'client/app/app';
import PageTransition from 'client/libs/page-transition';

interface RootProps
{
    pageTransition? : PageTransition;
    app?            : App;  // SSR用
}

export default class Root extends React.Component<RootProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        let {pageTransition} = props;

        if (props.app) {
            pageTransition = new PageTransition(props.app);
        }

        const page = pageTransition.getPage();
        let bgClassName = 'root-background';

        switch (page.bgTheme)
        {
        case 'black':
            bgClassName += ' black';
            break;
        }

        const bgEl = this.createBgElement(pageTransition);

        return (
            <div className='root'>
                <div className={bgClassName}>
                    {bgEl}
                </div>
                {page.elements}
            </div>
        );
    }

    /**
     * バックグラウンド生成
     */
    private createBgElement(pageTransition : PageTransition) : JSX.Element
    {
        let el : JSX.Element;

        if (pageTransition.isDuringTransition())
        {
            const effectDelay = pageTransition.getEffectDelay();
            if (effectDelay >= 500)
            {
                el = (
                    <div>
                        <div>web service template</div>
                    </div>
                );
            }
        }

        return el;
    }
}
