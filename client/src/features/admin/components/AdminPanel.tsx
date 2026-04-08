import { useState, useEffect } from 'react';
import { Users, Shield, AlertTriangle, Search } from 'lucide-react';
import { Avatar, Badge, Button } from '../../../components/ui';
import { usersApi, type SafeUser } from '../../../lib/api/endpoints';

type TabType = 'users' | 'bans' | 'audit';

export function AdminPanel(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId: string): Promise<void> => {
    try {
      await usersApi.ban(userId);
      loadUsers();
    } catch (error) {
      console.error('Failed to ban user:', error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: SafeUser['role']): JSX.Element => {
    const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
      ADMIN: 'danger',
      MODERATOR: 'warning',
      MEMBER: 'success',
      GUEST: 'primary',
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  const getStatusBadge = (status: SafeUser['status']): JSX.Element => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
      ONLINE: 'success',
      AWAY: 'warning',
      DND: 'danger',
      OFFLINE: 'secondary',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="h-14 px-6 flex items-center gap-4 border-b border-[var(--border-default)]">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-[var(--border-default)]">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Users size={16} />
            Users
          </button>
          <button
            onClick={() => setActiveTab('bans')}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              activeTab === 'bans'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Shield size={16} />
            Bans
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              activeTab === 'audit'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <AlertTriangle size={16} />
            Audit Log
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md pl-9 pr-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="spinner" />
              </div>
            ) : (
              <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-default)] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-default)]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)]">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[var(--bg-tertiary)]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user.avatar || undefined}
                              alt={user.username}
                              size="sm"
                            />
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">
                                {user.username}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {user.role !== 'ADMIN' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleBanUser(user.id)}
                            >
                              Ban
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bans' && (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
            <Shield size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No banned users</p>
            <p className="text-sm">Banned users will appear here</p>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
            <AlertTriangle size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Audit log is empty</p>
            <p className="text-sm">Recent actions will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
