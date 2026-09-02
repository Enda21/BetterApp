/**
 * Home screen tests
 *
 * Verifies:
 *  - Logo and welcome text render
 *  - "Report Issue" button is present and navigates
 *  - Version string is shown
 *  - Update banner shows when an update is available
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Navigation mock
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  NavigationProp: {},
}));

import Home from '../../screens/Home';
import { useAppUpdate } from '../../hooks/useAppUpdate';

const mockUseAppUpdate = useAppUpdate as jest.MockedFunction<typeof useAppUpdate>;

describe('Home Screen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseAppUpdate.mockReturnValue({
      updateAvailable: false,
      latestVersion: '1.2.3',
      openStore: jest.fn(),
    });
  });

  it('renders the welcome text', () => {
    render(<Home />);
    expect(screen.getByText('Welcome to Better.')).toBeTruthy();
  });

  it('shows the app version', () => {
    render(<Home />);
    expect(screen.getByText('v1.2.3')).toBeTruthy();
  });

  it('renders the Report Issue button', () => {
    render(<Home />);
    expect(screen.getByText('Report Issue')).toBeTruthy();
  });

  it('navigates to ReportIssue when Report Issue is pressed', () => {
    render(<Home />);
    fireEvent.press(screen.getByText('Report Issue'));
    expect(mockNavigate).toHaveBeenCalledWith('ReportIssue');
  });

  it('does NOT show update banner when no update is available', () => {
    render(<Home />);
    expect(screen.queryByText('Update available')).toBeNull();
  });

  it('shows the update banner when an update is available', () => {
    mockUseAppUpdate.mockReturnValue({
      updateAvailable: true,
      latestVersion: '2.0.0',
      openStore: jest.fn(),
    });
    render(<Home />);
    expect(screen.getByText('Update available')).toBeTruthy();
    expect(screen.getByText(/Version 2\.0\.0 is ready/)).toBeTruthy();
  });

  it('calls openStore when the update banner is pressed', () => {
    const mockOpenStore = jest.fn();
    mockUseAppUpdate.mockReturnValue({
      updateAvailable: true,
      latestVersion: '2.0.0',
      openStore: mockOpenStore,
    });
    render(<Home />);
    fireEvent.press(screen.getByText('Update available'));
    expect(mockOpenStore).toHaveBeenCalled();
  });
});
