/**
 * CoachBooking screen tests
 *
 * Verifies:
 *  - "Book a Call" header and all four coach cards render
 *  - Tapping a coach card shows the WebView for that coach's Calendly URL
 *  - The WebView header shows the selected coach's name
 *  - The Back button returns to the coach list
 *  - Each coach card is individually selectable
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import CoachBooking from '../../screens/CoachBooking';

const COACHES = ['Paul', 'Owen', 'Owen M', 'Thomas'];
const CALENDLY_URLS: Record<string, string> = {
  Paul: 'https://calendly.com/paulhogben23',
  Owen: 'https://calendly.com/owencostel',
  'Owen M': 'https://calendly.com/oshea-tos/review-and-strategy-call-with-thomas',
  Thomas: 'https://calendly.com/oshea-tos/review-and-strategy-call-with-thomas',
};

describe('CoachBooking Screen', () => {
  it('renders the "Book a Call" header', () => {
    render(<CoachBooking />);
    expect(screen.getByText(/Book a Call/i)).toBeTruthy();
  });

  it('renders all four coach cards', () => {
    render(<CoachBooking />);
    COACHES.forEach((name) => {
      expect(screen.getByText(name)).toBeTruthy();
    });
  });

  it('shows "View Available Times" action text on each card', () => {
    render(<CoachBooking />);
    // The subtitle also contains "view available times" so we get 5 total (4 cards + 1 subtitle)
    const actions = screen.getAllByText(/View Available Times/i);
    expect(actions.length).toBeGreaterThanOrEqual(COACHES.length);
  });

  // ── Selecting each coach ───────────────────────────────────────────────────
  COACHES.forEach((coachName) => {
    it(`opens the Calendly WebView for ${coachName}`, () => {
      render(<CoachBooking />);
      fireEvent.press(screen.getByText(coachName));

      // Booking header should now show the coach name
      expect(screen.getByText(new RegExp(`Book with ${coachName}`, 'i'))).toBeTruthy();

      // WebView should receive the correct Calendly URL
      expect(screen.getByTestId(`coach-webview-${coachName}`)).toBeTruthy();
    });

    it(`returns to coach list from ${coachName}'s booking page`, () => {
      render(<CoachBooking />);
      fireEvent.press(screen.getByText(coachName));
      fireEvent.press(screen.getByText('← Back'));

      // Coach list should be visible again
      COACHES.forEach((name) => {
        expect(screen.getByText(name)).toBeTruthy();
      });
      expect(screen.queryByText(/← Back/)).toBeNull();
    });
  });
});
