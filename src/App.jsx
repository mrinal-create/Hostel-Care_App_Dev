import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { adminNav, studentNav } from './ui.jsx';
import Dashboard from './components/Dashboard.jsx';
import Complaints from './components/Complaints.jsx';
import NewComplaint from './components/NewComplaint.jsx';
import Announcements from './components/Announcements.jsx';
import Workers from './components/Workers.jsx';
import ComplaintModal from './components/ComplaintModal.jsx';
import AnnouncementModal from './components/AnnouncementModal.jsx';

let demoAdminUnlocked = false;

const demo = {
  load: async () => ({
    complaints: [],
    announcements: [],
    admin: demoAdminUnlocked,
  }),

  unlockAdmin: async (password) => {
    demoAdminUnlocked = password === '123456';
    return demoAdminUnlocked;
  },

  lockAdmin: async () => {
    demoAdminUnlocked = false;
    return true;
  },

  createComplaint: async (complaint) => ({
    ...complaint,
    id: `HC-${Date.now()}`,
    reporter: 'Rahul Sharma',
    studentId: 'student',
    status: 'Submitted',
    assignedTo: 'Unassigned',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
    history: ['Complaint submitted', 'Awaiting staff assignment by Warden'],
  }),

  updateComplaint: async (id, changes) => ({
    id,
    ...changes,
  }),

  createAnnouncement: async (announcement) => ({
    ...announcement,
    id: `AN-${Date.now()}`,
    author: 'Warden',
    createdAt: new Date().toISOString(),
  }),

  updateAnnouncement: async (id, changes) => ({
    id,
    ...changes,
  }),

  deleteAnnouncement: async () => true,
  confirm: async (message) => window.confirm(message),
};

const api = window.hostelCare || demo;

export default function App() {
  const [data, setData] = useState({
    complaints: [],
    announcements: [],
  });

  const [page, setPage] = useState('dashboard');
  const [admin, setAdmin] = useState(false);
  const [gate, setGate] = useState(false);
  const [password, setPassword] = useState('');
  const [gateError, setGateError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [category, setCategory] = useState('All categories');
  const [selected, setSelected] = useState(null);
  const [noticeModal, setNoticeModal] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await api.load();
      setData(res);
      if (typeof res?.admin === 'boolean') {
        setAdmin(res.admin);
      }
    } catch (error) {
      setToast(error.message || 'Could not load saved data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(''), 3200);

    return () => clearTimeout(timer);
  }, [toast]);

  const all = data.complaints || [];

  const mine = all.filter(
    (complaint) => complaint.studentId === 'student'
  );

  const visible = (admin ? all : mine).filter((complaint) => {
    const searchableText = [
      complaint.id,
      complaint.title,
      complaint.category,
      complaint.room,
      complaint.reporter,
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = searchableText.includes(
      search.toLowerCase()
    );

    const matchesStatus =
      status === 'All statuses' || complaint.status === status;

    const matchesCategory =
      category === 'All categories' ||
      complaint.category === category;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = useMemo(
    () => ({
      total: all.length,

      pending: all.filter((complaint) =>
        ['Submitted', 'Pending', 'Awaiting Capacity'].includes(
          complaint.status
        )
      ).length,

      progress: all.filter((complaint) =>
        ['In Progress', 'Assigned'].includes(complaint.status)
      ).length,

      resolved: all.filter(
        (complaint) => complaint.status === 'Resolved'
      ).length,

      rejected: all.filter(
        (complaint) => complaint.status === 'Rejected'
      ).length,

      urgent: all.filter(
        (complaint) =>
          complaint.priority === 'Urgent' &&
          complaint.status !== 'Resolved' &&
          complaint.status !== 'Rejected'
      ).length,
    }),
    [all]
  );

  async function unlockAdmin(event) {
    event.preventDefault();

    if (!/^\d{6}$/.test(password)) {
      setGateError('Enter a 6-digit password.');
      return;
    }

    if (!(await api.unlockAdmin(password))) {
      setGateError('Incorrect password. Try again.');
      return;
    }

    setAdmin(true);
    setPage('dashboard');
    setGate(false);
    setPassword('');
    setGateError('');
    setToast('Admin access enabled.');
  }

  async function studentMode() {
    if (api.lockAdmin) {
      await api.lockAdmin();
    }

    setAdmin(false);
    setPage('dashboard');
    setSearch('');
    setToast('Student view enabled.');
  }

  async function createComplaint(payload) {
    try {
      const complaint = await api.createComplaint(payload);

      await refresh();
      setPage(admin ? 'complaints' : 'dashboard');
      setToast(`Complaint ${complaint.id} submitted.`);
    } catch (error) {
      setToast(error.message || 'Could not submit complaint.');
      throw error;
    }
  }

  async function updateComplaint(id, changes) {
    try {
      await api.updateComplaint(id, changes);
      await refresh();
      setSelected(null);

      setToast(
        changes.status === 'Resolved'
          ? 'Complaint marked resolved.'
          : changes.status === 'Rejected'
          ? 'Complaint rejected.'
          : changes.assignedTo && changes.assignedTo !== 'Unassigned'
          ? `Assigned to ${changes.assignedTo}.`
          : changes.assignedTo === 'Unassigned'
          ? 'Worker unassigned.'
          : 'Complaint updated.'
      );
    } catch (error) {
      setToast(error.message || 'Could not update complaint.');
    }
  }

  async function createAnnouncement(announcement) {
    try {
      await api.createAnnouncement(announcement);
      await refresh();
      setNoticeModal(false);
      setToast('Announcement published.');
    } catch (error) {
      setToast(error.message || 'Could not publish announcement.');
    }
  }

  async function updateAnnouncement(item, changes) {
    try {
      await api.updateAnnouncement(item.id, changes);
      await refresh();
    } catch (error) {
      setToast(error.message || 'Could not update announcement.');
    }
  }

  async function deleteAnnouncement(item) {
    const confirmed = await api.confirm(
      `Delete “${item.title}”?`
    );

    if (!confirmed) return;

    await api.deleteAnnouncement(item.id);
    await refresh();
    setToast('Announcement deleted.');
  }

  const navigation = admin ? adminNav : studentNav;

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <i />
            <i />
            <i />
            <i />
          </div>

          <div>
            <b>HostelCare</b>
            <small>
              Hostel Complaints &amp;
              <br />
              Maintenance System
            </small>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav>
          {navigation.map(([id, label, icon]) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'active' : ''}`}
              onClick={() => {
                setPage(id);
                setSearch('');
              }}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">{admin ? 'AD' : 'RS'}</div>

            <div>
              <b>{admin ? 'Admin / Warden' : 'Rahul Sharma'}</b>
              <small>{admin ? 'Administrator' : 'Student'}</small>
            </div>

            <button
              onClick={() =>
                admin ? studentMode() : setGate(true)
              }
            >
              ⌄
            </button>
          </div>

          <button
            className="admin-access"
            onClick={() =>
              admin ? studentMode() : setGate(true)
            }
          >
            {admin ? '↩ Switch to student' : '⚿ Admin access'}
          </button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div className="search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                page === 'announcements'
                  ? 'Search announcements...'
                  : 'Search complaints...'
              }
            />
          </div>

          <div className="top-user">
            <div className="avatar">{admin ? 'AD' : 'RS'}</div>

            <div>
              <b>{admin ? 'Warden' : 'Rahul Sharma'}</b>
              <small>{admin ? 'Admin view' : 'Student view'}</small>
            </div>

            <span>⌄</span>
          </div>
        </header>

        <section className="content">
          {loading ? (
            <div className="loading">
              Loading your hostel workspace…
            </div>
          ) : (
            <>
              {page === 'dashboard' && (
                <Dashboard
                  admin={admin}
                  stats={stats}
                  complaints={admin ? all : mine}
                  go={setPage}
                  select={setSelected}
                />
              )}

              {page === 'complaints' && admin && (
                <Complaints
                  items={visible}
                  allComplaints={all}
                  search={search}
                  setSearch={setSearch}
                  status={status}
                  setStatus={setStatus}
                  category={category}
                  setCategory={setCategory}
                  select={setSelected}
                  onUpdate={updateComplaint}
                />
              )}

              {page === 'workers' && admin && (
                <Workers
                  complaints={all}
                  select={setSelected}
                  go={setPage}
                />
              )}

              {page === 'new' && !admin && (
                <NewComplaint submit={createComplaint} />
              )}

              {page === 'announcements' && (
                <Announcements
                  items={(data.announcements || []).filter(
                    (announcement) =>
                      `${announcement.title} ${announcement.message} ${announcement.category}`
                        .toLowerCase()
                        .includes(search.toLowerCase())
                  )}
                  admin={admin}
                  create={() => setNoticeModal(true)}
                  update={updateAnnouncement}
                  remove={deleteAnnouncement}
                />
              )}
            </>
          )}
        </section>
      </main>

      {gate && (
        <div
          className="backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            setGate(false)
          }
        >
          <form className="modal gate" onSubmit={unlockAdmin}>
            <button
              type="button"
              className="close"
              onClick={() => setGate(false)}
            >
              ×
            </button>

            <div className="modal-symbol">♙</div>
            <p className="eyebrow">RESTRICTED AREA</p>
            <h2>Admin access</h2>

            <p className="muted">
              Enter the six-digit demo password to manage hostel
              complaints.
            </p>

            <label>Admin password</label>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value.replace(/\D/g, ''));
                setGateError('');
              }}
              placeholder="• • • • • •"
            />

            {gateError && <p className="error">{gateError}</p>}

            <button className="btn primary full">
              Unlock admin panel →
            </button>

            <small className="hint">
              Demo password: <b>123456</b>
            </small>
          </form>
        </div>
      )}

      {selected && (
        <ComplaintModal
          complaint={selected}
          complaints={all}
          admin={admin}
          close={() => setSelected(null)}
          update={updateComplaint}
        />
      )}

      {noticeModal && (
        <AnnouncementModal
          close={() => setNoticeModal(false)}
          submit={createAnnouncement}
        />
      )}

      {toast && (
        <div className="toast">
          <b>✓</b>
          {toast}
        </div>
      )}
    </div>
  );
}

