import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useSocket } from './SocketProvider';

// Simple test to verify useSocket throws when used outside provider
function TestConsumer() {
  const context = useSocket();
  return (
    <div>
      <span data-testid="is-connected">{context.isConnected.toString()}</span>
    </div>
  );
}

describe('SocketProvider', () => {
  describe('useSocket hook', () => {
    it('should throw error when used outside SocketProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useSocket must be used within SocketProvider');

      consoleError.mockRestore();
    });
  });
});
