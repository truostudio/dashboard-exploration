import { useMemo, useState } from 'react';
import { Icon } from '../components/Icons';
import { Panel, Table, ViewToolbar, SearchInput, Badge, Select, Empty } from '../components/ui';
import { team } from '../data/mock';

const roles = ['all', 'Owner', 'Admin', 'Developer', 'Viewer'] as const;
type Role = (typeof roles)[number];

const columns = [
  { key: 'member', header: 'Team Member' },
  { key: 'role', header: 'Role' },
  { key: 'edit', header: 'Edit' },
  { key: 'delete', header: 'Delete' },
];

export function SettingsTeam() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<Role>('all');

  const rows = useMemo(() => {
    let out = team;
    if (role !== 'all') out = out.filter((m) => m.role === role);
    const q = query.trim().toLowerCase();
    if (q) out = out.filter((m) => m.email.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    return out;
  }, [query, role]);

  return (
    <div className="view">
      <ViewToolbar
        className="rise rise-1"
        lead={<span className="dim">Members, roles, and invites for this project.</span>}
      >
        <button className="btn primary"><Icon.Plus size={14} /> New User</button>
      </ViewToolbar>

      <Panel flush className="rise rise-2">
        <div className="users-toolbar">
          <Select
            label="Filter by role"
            value={role}
            onChange={setRole}
            width={160}
            options={roles.map((r) => ({ value: r, label: r === 'all' ? 'All roles' : r }))}
          />
          <SearchInput grow value={query} onChange={setQuery} placeholder="Search team members…" />
        </div>
        <Table columns={columns}>
          {rows.map((m) => (
            <tr key={m.id}>
              <td>
                <span className="member-cell">
                  <span className="avatar">{m.initials}</span>
                  <span className="list-main">
                    <span className="cell-strong">
                      {m.name}
                      {m.status === 'invited' && <Badge tone="warning" className="ml-2">invited</Badge>}
                    </span>
                    <span className="mono dim">{m.email}</span>
                  </span>
                </span>
              </td>
              <td><Badge>{m.role}</Badge></td>
              <td><button className="btn ghost icon-only" aria-label="Edit"><Icon.Settings size={15} /></button></td>
              <td>
                <button className="btn ghost icon-only" aria-label="Delete" disabled={m.role === 'Owner'}>
                  <Icon.Trash size={15} />
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4}><Empty bare>No matching results.</Empty></td></tr>
          )}
        </Table>
      </Panel>
    </div>
  );
}
