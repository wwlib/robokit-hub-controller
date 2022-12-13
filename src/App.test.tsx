import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import Model from './model/Model';

const model: Model = new Model();
test('renders learn react link', () => {
  render(<App model={model}/>);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
