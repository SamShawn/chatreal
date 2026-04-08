import { useState, type FormEvent } from 'react';
import { Modal, Button, Input } from '../../../components/ui';
import { useUIStore } from '../../../stores/uiStore';
import { channelsApi } from '../../../lib/api/endpoints';

export function CreateChannelModal(): JSX.Element {
  const isOpen = useUIStore((state) => state.modals.createChannel);
  const closeModal = useUIStore((state) => state.closeModal);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await channelsApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
      });
      closeModal('createChannel');
      setName('');
      setDescription('');
      setType('PUBLIC');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create channel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    closeModal('createChannel');
    setName('');
    setDescription('');
    setType('PUBLIC');
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Channel"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Channel Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. general"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this channel about?"
            className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Visibility
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="PUBLIC"
                checked={type === 'PUBLIC'}
                onChange={() => setType('PUBLIC')}
                className="w-4 h-4 text-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text-primary)]">Public</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="PRIVATE"
                checked={type === 'PRIVATE'}
                onChange={() => setType('PRIVATE')}
                className="w-4 h-4 text-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text-primary)]">Private</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!name.trim()}>
            Create Channel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
