/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

import {App}      from 'client/app/app';
import Apps       from 'client/app/apps';

interface RootProps
{
    apps?       : Apps;
    app?        : App;  // SSR用
    clickGuard? : boolean;
}

export default class Root extends React.Component<RootProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        let {apps} = props;

        if (props.app) {
            apps = new Apps(props.app);
        }

        const page = apps.getPage();
        let bgClassName = 'root-background';

        switch (page.bgTheme)
        {
        case 'black':
            bgClassName += ' black';
            break;
        }

        const bgEl =    this.createBgElement(apps);
        const guardEl = this.createClickGuardElement(apps);

        return (
            <div className='root'>
                <div className={bgClassName}>
                    {bgEl}
                </div>
                {page.elements}
                {guardEl}
            </div>
        );
    }

    /**
     * バックグラウンド生成
     */
    private createBgElement(apps : Apps) : JSX.Element
    {
        let el : JSX.Element;

        if (apps.isDuringTransition())
        {
            const effectDelay = apps.getEffectDelay();
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

    /**
     * クリックガード生成
     */
    private createClickGuardElement(apps : Apps) : JSX.Element
    {
        let el : JSX.Element;

        if (apps.isDuringTransition()) {
            el = <div className='root-click-guard' />;
        }

        return el;
    }
}
