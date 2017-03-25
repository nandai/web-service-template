/**
 * (C) 2016 printf.jp
 */
import * as React from 'react';
import R          from '../r';

interface TopViewProps
{
    onSettings : () => void;
    onLogout   : () => void;
}

export default class TopView extends React.Component<TopViewProps, {}>
{
    private static CLS_NAME = 'TopView';

    /**
     * render
     */
    render() : JSX.Element {
        const {props} = this;
        return (
            <div>
                <button onClick={props.onSettings}>{R.text(R.GO_SETTINGS)}</button>
                <button onClick={props.onLogout}>{R.text(R.LOGOUT)}</button>
            </div>
        );
    }
}
