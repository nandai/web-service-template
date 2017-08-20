/**
 * (C) 2016-2017 printf.jp
 */
import bind            from 'bind-decorator';
import * as React      from 'react';
import * as ReactDOM   from 'react-dom';

import Tabs, {TabItem} from 'client/components/common/tabs';
import ViewContainer   from 'client/components/views/view-container';
import {pageNS}        from 'client/libs/page';
import R               from 'client/libs/r';

interface ModalProps
{
    locale   : string;
    page     : pageNS.Page;
    message  : string;
    onOK     : () => void;
    onCancel : () => void;
}

export default class Modal extends React.Component<ModalProps, {}>
{
    render() : JSX.Element
    {
        const {props} = this;
        const {locale, page} = props;

        const items : TabItem[] =
        [
            {name:'yes', label:R.text(R.YES, locale), onClick:props.onOK},
            {name:'no',  label:R.text(R.NO,  locale), onClick:props.onCancel}
        ];

        let el : JSX.Element = null;

        if (page.displayStatus !== 'hidden')
        {
            el = (
                <ViewContainer page={page} zIndex={200} backgroundColor="rgba(0, 0, 0, 0)">
                    <div className="wst-modal-overlay" onClick={this.onClickOverlay} ref="overlay">
                        <div className="wst-modal">
                            <p style={{margin:'30px 10px'}}>{props.message}</p>
                            <Tabs items={items} />
                        </div>
                    </div>
                </ViewContainer>
            );
        }

        return el;
    }

    @bind
    private onClickOverlay(e : React.MouseEvent<Element>)
    {
        if (e.target === ReactDOM.findDOMNode(this.refs.overlay)) {
            this.props.onCancel();
        }
    }
}
