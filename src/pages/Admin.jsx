import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import PartnerTable from '@/components/admin/PartnerTable';
import PartnerForm from '@/components/admin/PartnerForm';
import WidgetStats from '@/components/admin/WidgetStats';
import WidgetCodeModal from '@/components/admin/WidgetCodeModal';
import { Plus, Loader2, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import UserManagement from '@/components/admin/UserManagement';
import { SUPERADMIN_ID } from '@/lib/superadmin';

export default function Admin() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [statsPartner, setStatsPartner] = useState(null);
  const [codePartner, setCodePartner] = useState(null);
  const { user } = useAuth();
  const [tab, setTab] = useState('partners');
  const isSuperadmin = user?.id === SUPERADMIN_ID;

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Partner.list('-created_date', 100);
      setPartners(res || []);
    } catch (err) {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const handleSave = async (form) => {
    if (editingPartner) {
      await base44.entities.Partner.update(editingPartner.id, form);
    } else {
      await base44.entities.Partner.create(form);
    }
    await loadPartners();
  };

  const handleDelete = async (partner) => {
    if (!confirm(`Удалить партнёра «${partner.name}»?`)) return;
    await base44.entities.Partner.delete(partner.id);
    await loadPartners();
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingPartner(null);
    setShowForm(true);
  };

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 bg-background shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <h1 className="text-[18px] font-bold text-foreground">Панель администратора</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary text-[12px] font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </header>

      {isSuperadmin && (
        <div className="border-b border-border/30 px-6 flex gap-1">
          <button
            onClick={() => setTab('partners')}
            className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-all ${
              tab === 'partners' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Партнёры
          </button>
          <button
            onClick={() => setTab('users')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-all ${
              tab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Пользователи
          </button>
        </div>
      )}

      <main className="max-w-[1200px] mx-auto px-6 py-6">
        {tab === 'users' && isSuperadmin ? (
          <UserManagement />
        ) : (
        <>
        <div className="flex items-center justify-between mb-5">
          <div className="text-[13px] text-muted-foreground">
            {partners.length} партнёр(ов) всего
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-bold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Добавить виджет
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : partners.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[14px] font-semibold text-foreground">Партнёры не найдены</p>
            <p className="text-[12px] text-muted-foreground mt-1">Создайте первого партнёра, чтобы начать</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/30 overflow-hidden bg-card/50">
            <PartnerTable
              partners={partners}
              onStats={setStatsPartner}
              onCode={setCodePartner}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
        </>
        )}
      </main>

      {showForm && (
        <PartnerForm
          open={showForm}
          onOpenChange={(v) => { setShowForm(v); if (!v) setEditingPartner(null); }}
          partner={editingPartner}
          onSave={handleSave}
        />
      )}

      {codePartner && (
        <WidgetCodeModal
          open={!!codePartner}
          onOpenChange={(v) => { if (!v) setCodePartner(null); }}
          partner={codePartner}
        />
      )}

      {statsPartner && (
        <WidgetStats
          partner={statsPartner}
          onClose={() => setStatsPartner(null)}
        />
      )}
    </div>
  );
}