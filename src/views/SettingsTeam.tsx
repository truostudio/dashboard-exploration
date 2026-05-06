import { useState } from 'react';
import { Icon } from '../components/Icons';
import { team } from '../data/mock';
import type { TeamMember } from '../data/mock';

const roles: TeamMember['role'][] = ['Owner', 'Admin', 'Developer', 'Viewer'];

const roleDescriptions: Record<TeamMember['role'], string> = {
  Owner:     'Full access. Can transfer ownership, delete the project, and manage billing.',
  Admin:     'Manage members, API keys, and project settings. Cannot transfer ownership.',
  Developer: 'Make API calls, configure webhooks, view logs. Cannot manage members or billing.',
  Viewer:    'Read-only access to the dashboard, logs, and metrics.',
};

export function SettingsTeam() {
  const [members, setMembers] = useState(team);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Developer');

  function invite() {
    if (!inviteEmail.includes('@')) return;
    const initials = inviteEmail.slice(0, 2).toUpperCase();
    setMembers((m) => [
      ...m,
      {
        id: `t${m.length + 1}`,
        name: 'pending invite',
        email: inviteEmail,
        role: inviteRole,
        initials,
        lastActive: '—',
        status: 'invited',
      },
    ]);
    setInviteEmail('');
  }

  function remove(id: string) {
    setMembers((m) => m.filter((x) => x.id !== id));
  }

  function setRole(id: string, role: TeamMember['role']) {
    setMembers((m) => m.map((x) => (x.id === id ? { ...x, role } : x)));
  }

  return (
    <div className="view">
      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Invite teammates</h2>
            <p className="panel-sub dim">They'll get an email with a one-click join link.</p>
          </div>
        </header>

        <div className="invite-row">
          <input
            className="input invite-input"
            type="email"
            placeholder="teammate@yourcompany.xyz"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <div className="seg">
            {roles.filter((r) => r !== 'Owner').map((r) => (
              <button key={r} className={`seg-item ${inviteRole === r ? 'active' : ''}`} onClick={() => setInviteRole(r)}>
                {r}
              </button>
            ))}
          </div>
          <button className="btn primary" disabled={!inviteEmail.includes('@')} onClick={invite}>
            <Icon.Mail size={13} /> Send invite
          </button>
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Members</h2>
            <p className="panel-sub dim"><span className="mono">{members.length}</span> people on this project</p>
          </div>
          <button className="btn ghost"><Icon.Download size={13} /> Export CSV</button>
        </header>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last active</th>
                <th>Status</th>
                <th className="num"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="member-cell">
                      <span className="avatar mono">{m.initials}</span>
                      <span>{m.name}</span>
                    </div>
                  </td>
                  <td className="muted mono" style={{ fontSize: 12 }}>{m.email}</td>
                  <td>
                    <select
                      className="role-select"
                      value={m.role}
                      onChange={(e) => setRole(m.id, e.target.value as TeamMember['role'])}
                      disabled={m.role === 'Owner'}
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="muted">{m.lastActive}</td>
                  <td>
                    {m.status === 'invited'
                      ? <span className="badge warning">Invited</span>
                      : <span className="badge success">Active</span>}
                  </td>
                  <td className="num">
                    {m.role !== 'Owner' && (
                      <button className="btn ghost icon-only" aria-label="Remove" onClick={() => remove(m.id)}>
                        <Icon.Trash size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Roles</h2>
            <p className="panel-sub dim">What each role can do.</p>
          </div>
        </header>
        <ul className="list">
          {roles.map((r) => (
            <li key={r} className="list-row roles-row">
              <div className="list-main">
                <span className="role-name">{r}</span>
                <span className="dim">{roleDescriptions[r]}</span>
              </div>
              <span className="mono dim">{members.filter((m) => m.role === r).length}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
