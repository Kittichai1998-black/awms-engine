import React from 'react';
import ReactDOM from 'react-dom';
import Page403 from './Page403';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Page403 />, div);
  ReactDOM.unmountComponentAtNode(div);
});
