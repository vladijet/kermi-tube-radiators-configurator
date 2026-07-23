import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Loader2, Shield } from 'lucide-react';
import { SUPERADMIN_ID } from '@/lib/superadmin';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.User.list('-created_date', 100);
      setUsers(res || []);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError('');
    setSuccess('');
    try {
      await base44.users.inviteUser(inviteEmail.trim(), inviteRole);
      setSuccess(`Приглашение отправлено на ${inviteEmail.trim()}`);
      setInviteEmail('');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Ошибка при отправке приглашения');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    if (userId === SUPERADMIN_ID) return;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await base44.entities.User.update(userId, { role: newRole });
      await loadUsers();
    } catch (err) {
      setError('Ошибка при изменении роли');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/30 bg-card/50 p-5">
        <h3 className="text-[14px] font-bold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" />
          Пригласить пользователя
        </h3>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="email@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1"
            required
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
          >
            <option value="user">Пользователь</option>
            <option value="admin">Администратор</option>
          </select>
          <Button type="submit" disabled={inviting} className="bg-primary text-primary-foreground">
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Пригласить'}
          </Button>
        </form>
        {error && <p className="text-[12px] text-red-500 mt-2">{error}</p>}
        {success && <p className="text-[12px] text-green-500 mt-2">{success}</p>}
      </div>

      <div className="rounded-xl border border-border/30 overflow-hidden bg-card/50">
        <div className="px-5 py-3 border-b border-border/30">
          <h3 className="text-[14px] font-bold text-foreground">Пользователи ({users.length})</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {users.map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-foreground truncate">
                    {u.full_name || u.email}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{u.email}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {u.id === SUPERADMIN_ID ? (
                    <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-bold flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Суперадмин
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRoleChange(u.id, u.role)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        u.role === 'admin'
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {u.role === 'admin' ? 'Админ' : 'Пользователь'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}