import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { setupLocalStorageMock } from '@/test/mocks/localStorage';

// Test component to access theme context
function ThemeConsumer() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    setupLocalStorageMock({});
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with "system" theme when no localStorage value exists', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme').textContent).toBe('system');
    });

    it('should load theme from localStorage on mount', () => {
      setupLocalStorageMock({ 'chatreal-theme': 'dark' });

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });

    it('should use invalid localStorage value as-is (no validation)', () => {
      setupLocalStorageMock({ 'chatreal-theme': 'invalid-value' });

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      // Provider doesn't validate - it uses whatever is stored
      expect(screen.getByTestId('theme').textContent).toBe('invalid-value');
    });
  });

  describe('setTheme', () => {
    it('should update theme state when setTheme is called', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      act(() => {
        screen.getByText('Set Dark').click();
      });

      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });

    it('should persist theme to localStorage', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      act(() => {
        screen.getByText('Set Dark').click();
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('chatreal-theme', 'dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      setupLocalStorageMock({ 'chatreal-theme': 'light' });

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      act(() => {
        screen.getByText('Toggle').click();
      });

      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      setupLocalStorageMock({ 'chatreal-theme': 'dark' });

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      act(() => {
        screen.getByText('Toggle').click();
      });

      expect(screen.getByTestId('theme').textContent).toBe('light');
    });
  });

  describe('resolvedTheme', () => {
    it('should resolve "system" to actual system preference', () => {
      vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('resolved-theme').textContent).toBe('dark');
    });
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<ThemeConsumer />);
      }).toThrow('useTheme must be used within ThemeProvider');

      consoleError.mockRestore();
    });
  });
});
