import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { Avatar } from '../../../components/ui';
import type { Message } from '../../../lib/api/endpoints';
import socketClient from '../../../lib/socket/client';

interface SearchMessagesProps {
  channelId?: string;
  conversationId?: string;
}

export function SearchMessages({
  channelId,
  conversationId,
}: SearchMessagesProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const handleSearchResults = (data: { messages: Message[]; total: number }): void => {
      setResults(data.messages);
      setIsLoading(false);
      setHasSearched(true);
    };

    socketClient.on('search:results', handleSearchResults as (data: unknown) => void);

    return () => {
      socketClient.off('search:results', handleSearchResults as (data: unknown) => void);
    };
  }, []);

  const handleSearch = (e: FormEvent): void => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(false);

    socketClient.emit('search:messages', {
      query: query.trim(),
      channelId,
      conversationId,
    });

    // Fallback timeout in case socket doesn't respond
    setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasSearched(true);
      }
    }, 5000);
  };

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const highlightMatch = (text: string, query: string): JSX.Element => {
    if (!query.trim()) return <>{text}</>;

    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-default)] overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-[var(--border-default)]">
        <form onSubmit={handleSearch} className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search messages..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--bg-hover)] rounded"
            >
              <X size={14} className="text-[var(--text-muted)]" />
            </button>
          )}
        </form>
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner" />
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
            <Search size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No messages found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        ) : !hasSearched ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
            <Search size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Search for messages</p>
            <p className="text-xs mt-1">Type to search in this {channelId ? 'channel' : 'conversation'}</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-default)]">
            {results.map((message) => (
              <div
                key={message.id}
                className="p-3 hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors"
              >
                <div className="flex gap-3">
                  <Avatar
                    src={message.sender.avatar || undefined}
                    alt={message.sender.username}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm text-[var(--text-primary)]">
                        {message.sender.username}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                      {highlightMatch(message.content, query)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
