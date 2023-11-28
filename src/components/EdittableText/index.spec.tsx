import React from 'react';
import { render, screen } from '@testing-library/react';
import MyComp from './index';

test('renders --learn react link', () => {
  render(<MyComp text='Session' onSave={() => {}} />);
  const linkElement = screen.getByText(/Session/i);
  (expect(linkElement) as any).toBeInTheDocument();
});
