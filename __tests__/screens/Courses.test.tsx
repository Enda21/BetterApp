/**
 * Courses (Skool classroom) screen tests
 *
 * Verifies:
 *  - "Courses" header renders
 *  - Skool info banner is shown
 *  - The WebView pointing at the Skool classroom URL is mounted
 *  - Account icon button opens the account menu modal
 *  - Modal can be dismissed
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// useFocusEffect accepts a memoised callback that returns an optional cleanup.
// We stub it as a no-op so it never triggers state updates during tests.
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

import Courses from '../../screens/Courses';

describe('Courses Screen', () => {
  it('renders the Courses header', () => {
    render(<Courses />);
    expect(screen.getByText('Courses')).toBeTruthy();
  });

  it('shows the Skool third-party info banner', () => {
    render(<Courses />);
    expect(screen.getByText(/hosted by Skool/i)).toBeTruthy();
  });

  it('renders the Skool classroom WebView', () => {
    render(<Courses />);
    expect(screen.getByTestId('courses-webview')).toBeTruthy();
  });

  it('renders the account icon button', () => {
    render(<Courses />);
    expect(screen.getByTestId('courses-account-btn')).toBeTruthy();
  });

  it('opens the account menu modal when the icon is pressed', () => {
    render(<Courses />);
    fireEvent.press(screen.getByTestId('courses-account-btn'));
    expect(screen.getByTestId('courses-account-modal')).toBeTruthy();
  });

  it('closes the modal when the backdrop is pressed', () => {
    render(<Courses />);
    fireEvent.press(screen.getByTestId('courses-account-btn'));
    fireEvent.press(screen.getByTestId('courses-modal-backdrop'));
    expect(screen.queryByTestId('courses-account-modal')).toBeNull();
  });
});
