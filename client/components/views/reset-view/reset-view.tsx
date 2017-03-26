/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import R          from 'client/utils/r';
import {Store}    from './store';

interface ResetViewProps
{
    store : Store;
}

export default class ResetView extends React.Component<ResetViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;
        return (
            <div>
                <Input type="password" placeholder={R.text(R.PASSWORD)}           value={store.password} onChange={store.onPasswordChange} />
                <Input type="password" placeholder={R.text(R.NEW_PASSWORD_AGAIN)} value={store.confirm}  onChange={store.onConfirmChange} />
                <Button onClick={store.onChange}>{R.text(R.CHANGE)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}
