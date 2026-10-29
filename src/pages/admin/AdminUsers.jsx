import { usersApi } from '../../api/index.js';
import { dateOnly, initials } from '../../utils/format.js';
import { RoleBadge } from './ui/Badge.jsx';
import DataTable from './ui/DataTable.jsx';
import PageHeader from './ui/PageHeader.jsx';
import SearchBox from './ui/SearchBox.jsx';
import usePagedList from './ui/usePagedList.js';

const columns = [
  {
    key: 'name',
    header: 'User',
    render: (u) => (
      <div className="ad-media" style={{ minWidth: 0 }}>
        <span className="ad-avatar" aria-hidden="true">{initials(u.name)}</span>
        <span className="ad-cell-main">{u.name}</span>
      </div>
    ),
  },
  { key: 'email', header: 'Email', render: (u) => u.email },
  { key: 'role', header: 'Role', render: (u) => <RoleBadge role={u.role} /> },
  { key: 'joined', header: 'Joined', render: (u) => dateOnly(u.createdAt) },
];

export default function AdminUsers() {
  const list = usePagedList((p) => usersApi.list(p));
  return (
    <>
      <PageHeader title="Users" subtitle="Everyone with an account: customers, helpers and admins." />
      <div className="ad-toolbar">
        <SearchBox placeholder="Search by name or email…" label="Search users" onChange={(q) => list.setFilter({ q })} />
        <select className="ad-select" aria-label="Role" value={list.params.role || ''} onChange={(e) => list.setFilter({ role: e.target.value || undefined })}>
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="helper">Helpers</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      <DataTable
        columns={columns}
        rows={list.items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle="No users found"
        emptyHint="Try a different search or role."
        pagination={{ ...list.meta, page: list.params.page, limit: list.params.limit, onPage: list.setPage, onLimit: list.setLimit }}
      />
    </>
  );
}