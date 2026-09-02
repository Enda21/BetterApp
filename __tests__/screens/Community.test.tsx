/**
 * Community (Skool) screen tests
 *
 * Verifies:
 *  - "Community" header renders
 *  - Skool info banner is shown
 *  - The WebView pointing at the Skool community URL is mounted
 *  - Account icon button opens the account menu modal
 *  - The modal contains account-management copy and a close action
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import Community from '../../screens/Community';

describe('Community Screen', () => {
  it('renders the Community header', () => {
    render(<Community />);
    expect(screen.getByText('Community')).toBeTruthy();
  });

  it('shows the Skool third-party info banner', () => {
    render(<Community />);
    expect(screen.getByText(/hosted by Skool/i)).toBeTruthy();
  });

  it('renders the Skool community WebView', () => {
    render(<Community />);
    expect(screen.getByTestId('community-webview')).toBeTruthy();
  });

  it('renders the account icon button', () => {
    render(<Community />);
    expect(screen.getByTestId('community-account-btn')).toBeTruthy();
  });

  it('opens the account menu modal when the account icon is pressed', () => {
    render(<Community />);
    fireEvent.press(screen.getByTestId('community-account-btn'));
    expect(screen.getByTestId('community-account-modal')).toBeTruthy();
  });

  it('displays Skool account info inside the modal', () => {
    render(<Community />);
    fireEvent.press(screen.getByTestId('community-account-btn'));
    // Use getAllByText because RN Modal may render children even when hidden
    const matches = screen.getAllByText(/Skool Account/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('closes the modal when the backdrop is pressed', () => {
    render(<Community />);
    fireEvent.press(screen.getByTestId('community-account-btn'));
    fireEvent.press(screen.getByTestId('community-modal-backdrop'));
    expect(screen.queryByTestId('community-account-modal')).toBeNull();
  });
});
