/**
 * WeeklyCheckIn screen tests
 *
 * Verifies:
 *  - Header and both form cards render
 *  - Tapping "Rapid Fire" opens the Typeform WebView
 *  - The WebView can be closed and returns to the card list
 *  - Tapping "Progress Pit Stop" opens the Progress Pit Stop flow
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// FormWebView & ProgressPitStop are deeply integrated – stub them so tests
// remain fast and focused on WeeklyCheckIn navigation logic.
jest.mock('../../screens/FormWebView', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return ({ title, onClose }: { title: string; onClose: () => void }) => (
    <View testID="form-webview">
      <Text testID="form-webview-title">{title}</Text>
      <TouchableOpacity testID="form-webview-close" onPress={onClose}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock('../../screens/ProgressPitStop', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return ({ onClose }: { onClose: () => void }) => (
    <View testID="progress-pit-stop">
      <Text>Progress Pit Stop</Text>
      <TouchableOpacity testID="progress-pit-stop-close" onPress={onClose}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  );
});

import WeeklyCheckIn from '../../screens/WeeklyCheckIn';

describe('WeeklyCheckIn Screen', () => {
  it('renders the Weekly Check-In header', () => {
    render(<WeeklyCheckIn />);
    expect(screen.getByText('Weekly Check-In')).toBeTruthy();
  });

  it('shows both check-in form cards', () => {
    render(<WeeklyCheckIn />);
    expect(screen.getByText('Rapid Fire')).toBeTruthy();
    expect(screen.getByText('Progress Pit Stop')).toBeTruthy();
  });

  it('shows card descriptions', () => {
    render(<WeeklyCheckIn />);
    expect(screen.getByText(/quick-fire weekly check-in/i)).toBeTruthy();
    expect(screen.getByText(/Reflect on your progress/i)).toBeTruthy();
  });

  // ── Rapid Fire flow ────────────────────────────────────────────────────────
  it('opens the Rapid Fire Typeform when the card is pressed', () => {
    render(<WeeklyCheckIn />);
    fireEvent.press(screen.getByText('Rapid Fire'));
    expect(screen.getByTestId('form-webview')).toBeTruthy();
    // The title is rendered as a Text node inside the stub — find it by text
    expect(screen.getAllByText('Rapid Fire').length).toBeGreaterThan(0);
  });

  it('returns to the card list after closing Rapid Fire', () => {
    render(<WeeklyCheckIn />);
    fireEvent.press(screen.getByText('Rapid Fire'));
    fireEvent.press(screen.getByTestId('form-webview-close'));
    expect(screen.getByText('Weekly Check-In')).toBeTruthy();
    expect(screen.queryByTestId('form-webview')).toBeNull();
  });

  // ── Progress Pit Stop flow ─────────────────────────────────────────────────
  it('opens Progress Pit Stop when the card is pressed', () => {
    render(<WeeklyCheckIn />);
    fireEvent.press(screen.getByText('Progress Pit Stop'));
    expect(screen.getByTestId('progress-pit-stop')).toBeTruthy();
  });

  it('returns to the card list after closing Progress Pit Stop', () => {
    render(<WeeklyCheckIn />);
    fireEvent.press(screen.getByText('Progress Pit Stop'));
    fireEvent.press(screen.getByTestId('progress-pit-stop-close'));
    expect(screen.getByText('Weekly Check-In')).toBeTruthy();
    expect(screen.queryByTestId('progress-pit-stop')).toBeNull();
  });
});
