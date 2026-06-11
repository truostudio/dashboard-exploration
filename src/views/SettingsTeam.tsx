import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { team } from '../data/mock';

const roles = ['all', 'Owner', 'Admin', 'Developer', 'Viewer'] as const;

export function SettingsTeam() {
  const [filterEmail, setFilterEmail] = useState('');
  const [filterRole, setFilterRole] = useState<(typeof roles)[number]>('all');

  const rows = useMemo(() => {
    let out = team;
    if (filterRole !== 'all') out = out.filter((m) => m.role === filterRole);
    if (filterEmail.trim()) {
      const q = filterEmail.toLowerCase();
      out = out.filter((m) => m.email.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    }
    return out;
  }, [filterEmail, filterRole]);

  return (
    <div className="view">
      <div className="view-toolbar rise rise-1">
        <span className="dim" style={{ fontSize: 13 }}>Members, roles, and invites for this project.</span>
        <button className="btn primary"><Icon.Plus size={14} /> New User</button>
      </div>

      <article className="panel rise rise-2" style={{ padding: 0 }}>
        <div className="users-toolbar">
          <select className="input" style={{ width: 160, height: 36 }} value={filterRole} onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}>
            {roles.map((r) => <option key={r} value={r}>{r === 'all' ? 'All roles' : r}</option>)}
          </select>
          <div className="tb-search" style={{ flex: 1 }}>
            <Icon.Search size={14} />
            <input placeholder="Search team members…" value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} />
          </div>
        </div>
        <div className="table-wrap" style={{ margin: 0 }}>
          <table className="table">
            <thead>
              <tr><th>Team Member</th><th>Role</th><th>Edit</th><th>Delete</th></tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="member-cell">
                      <span className="avatar">{m.initials}</span>
                      <span className="list-main">
                        <span style={{ fontWeight: 600 }}>{m.name}{m.status === 'invited' && <span className="badge warning" style={{ marginLeft: 8 }}>invited</span>}</span>
                        <span className="mono dim" style={{ fontSize: 12 }}>{m.email}</span>
                      </span>
                    </span>
                  </td>
                  <td><span className="badge">{m.role}</span></td>
                  <td><button className="btn ghost icon-only" aria-label="Edit"><Icon.Settings size={15} /></button></td>
                  <td><button className="btn ghost icon-only" aria-label="Delete" disabled={m.role === 'Owner'}><Icon.Trash size={15} /></button></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4}><div className="empty" style={{ border: 'none', background: 'transparent' }}>No matching results.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
