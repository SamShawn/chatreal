import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { SocketProvider } from '@/app/providers/SocketProvider';

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export function renderWithThemeProvider(ui: ReactElement, options?: RenderOptions) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export function renderWithAuthProvider(ui: ReactElement, options?: RenderOptions) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export function renderWithSocketProvider(ui: ReactElement, options?: RenderOptions) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <SocketProvider>{children}</SocketProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}
