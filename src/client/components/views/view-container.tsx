/**
 * (C) 2016-2017 printf.jp
 */
import bind          from 'bind-decorator';
import * as React    from 'react';
import * as ReactDOM from 'react-dom';

import {BaseStore}   from 'client/components/views/base-store';
import {slog}        from 'libs/slog';

import _ = require('lodash');

interface ViewContainerProps
{
    store : BaseStore;
}

export default class ViewContainer extends React.Component<ViewContainerProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        const {store} = props;
        const {active, displayStatus, effect} = store;
        let style : {} = _.clone(styles[effect][active ? 'active' : 'inactive']);

        if (displayStatus === 'hidden')
        {
            // 非アクティブ化が完了しているので非表示にする
            style['display'] = 'none';
        }

        if (displayStatus === 'preparation')
        {
            // アクティブ化するためにまずはdisplayをnoneからflexにして描画し、次の描画でエフェクト開始
            // （displayの変更と同時にエフェクトを行うと即完了状態になってしまう）
            style =
            {
                display: 'flex',
                opacity: 0
            };
        }

        return (
            <div className="view-container" style={style} onTransitionEnd={this.onTransitionEnd}>
                {props.children}
            </div>
        );
    }

    /**
     * onTransitionEnd
     */
    @bind
    onTransitionEnd(e : React.TransitionEvent<Element>)
    {
        const el = ReactDOM.findDOMNode(this);
        if (el === e.target)
        {
            const log = slog.stepIn('ViewContainer', 'onTransitionEnd');
            this.props.store.onTransitionEnd();
            log.stepOut();
        }
    }
}

const styles =
{
    none:
    {
        active:
        {
            display:    'flex',
            transition: 'all .01s',
            zIndex:     1,
            opacity:    1
        },

        inactive:
        {
            display:    'flex',
            transition: 'all .01s',
            zIndex:     0,
            opacity:    0
        },
    },

    fade:
    {
        active:
        {
            display:    'flex',
            transition: 'all .5s',
            zIndex:     1,
            opacity:    1
        },

        inactive:
        {
            display:    'flex',
            transition: 'all .5s',
            zIndex:     0,
            opacity:    0
        },
    },

    slide:
    {
        active:
        {
            display:    'flex',
            transition: 'all .5s',
            zIndex:     1,
            transform:  'translateX(0)'
        },

        inactive:
        {
            display:    'flex',
            transition: 'all .5s',
            zIndex:     0,
            transform:  'translateX(-100%)'
        }
    }
};
