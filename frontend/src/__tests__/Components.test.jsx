import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import LandingPage from '../pages/LandingPage';

function CrashingChild() {
  throw new Error('Simulated component failure');
}

describe('Core Frontend Components & Accessibility Landmarks', () => {
  it('renders LandingPage with primary navigation, main landmark, and 4 architecture pillars', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByRole('main')).toBeTruthy();
    expect(screen.getByText(/The 4 Intelligent Pillars/i)).toBeTruthy();
    expect(screen.getByText(/1\. Knowledge Gap Detection/i)).toBeTruthy();
    expect(screen.getByText(/2\. Personalized Roadmaps/i)).toBeTruthy();
  });

  it('catches runtime render errors inside ErrorBoundary and displays alert fallback', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <CrashingChild />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/Something went wrong/i)).toBeTruthy();
    expect(screen.getByText(/Simulated component failure/i)).toBeTruthy();
    spy.mockRestore();
  });
});
