/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import NotFoundView  from '../components/views/not-found-view/not-found-view';

class NotFoundApp
{
    private static CLS_NAME = 'NotFoundApp';

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <NotFoundView />,
            document.getElementById('root'));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new NotFoundApp();
    app.render();
});
