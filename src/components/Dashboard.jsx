import { Empty, Metric, Priority, Status, formatDate } from '../ui.jsx';

const dutyContacts = [
  {
    role: 'Hostel Warden',
    name: 'Dr. A. K. Sharma',
    detail: 'Block Admin Office',
    timing: '10 AM – 5 PM',
    ext: 'Ext: 101',
    phone: '+919876500101',
    theme: 'warden',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    role: 'Hostel Caretaker',
    name: 'Mr. Ramesh Verma',
    detail: 'Ground Floor Desk · Room keys & supplies',
    timing: '8 AM – 8 PM',
    ext: 'Ext: 102',
    phone: '+919876500102',
    theme: 'caretaker',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
  },
  {
    role: 'Maintenance On-Duty',
    name: 'Electrician & Plumber Desk',
    detail: 'Duty Room · Quick repair dispatch',
    timing: '9 AM – 6 PM',
    ext: 'Ext: 108',
    phone: '+919876500108',
    theme: 'maintenance',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    role: 'Security & Main Gate',
    name: 'Main Gate Guard Post',
    detail: 'Night entry, security & visitor logs',
    timing: '24/7 Gate',
    ext: 'Ext: 100',
    phone: '+919876500100',
    theme: 'security',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    role: 'Campus Medical & Ambulance',
    name: 'University Health Centre',
    detail: 'Emergency medical staff on standby',
    timing: '24/7 Immediate',
    ext: 'Call 108',
    phone: '108',
    theme: 'medical',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
];

function Dashboard({ admin, stats, complaints, go, select }) {
  const resolved = complaints.filter(
    (c) => c.status === 'Resolved'
  ).length;

  const inProgress = complaints.filter((c) =>
    ['In Progress', 'Assigned'].includes(c.status)
  ).length;

  const pending = complaints.filter((c) =>
    ['Submitted', 'Pending', 'Awaiting Capacity'].includes(c.status)
  ).length;

  const rejected = complaints.filter(
    (c) => c.status === 'Rejected'
  ).length;

  const total = complaints.length;

  const resPct = total > 0 ? (resolved / total) * 100 : 0;
  const progPct = total > 0 ? (inProgress / total) * 100 : 0;
  const pendPct = total > 0 ? (pending / total) * 100 : 0;

  const donutBackground =
    total > 0
      ? `conic-gradient(
          #64b88c 0% ${resPct}%,
          #60add8 ${resPct}% ${resPct + progPct}%,
          #eab94e ${resPct + progPct}% ${resPct + progPct + pendPct}%,
          #e05e52 ${resPct + progPct + pendPct}% 100%
        )`
      : '#e9f0ea';

  const metrics = admin
    ? [
        ['Total complaints', stats.total, 'All hostel reports', '▦', 'mint'],
        ['Pending', stats.pending, 'Waiting for action', '◷', 'yellow'],
        ['In progress', stats.progress, 'Currently being fixed', '↗', 'blue'],
        ['Resolved', stats.resolved, 'Completed requests', '✓', 'green'],
        ['Urgent', stats.urgent, 'Needs attention', '!', 'red'],
      ]
    : [
        ['My complaints', total, 'All requests submitted', '▦', 'mint'],
        ['Pending', pending, 'Waiting for action', '◷', 'yellow'],
        ['In progress', inProgress, 'Being worked on', '↗', 'blue'],
        ['Resolved', resolved, 'Completed requests', '✓', 'green'],
      ];

  const recent = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const plumbingCount = complaints.filter((c) => c.category === 'Plumbing').length;
  const electricalCount = complaints.filter((c) =>
    ['Electrical', 'Fans / Lighting'].includes(c.category)
  ).length;
  const wifiCount = complaints.filter((c) => c.category === 'Wi-Fi').length;
  const acCount = complaints.filter((c) => c.category === 'AC Related').length;
  const otherCount = complaints.filter(
    (c) =>
      ['Other', 'Furniture', 'Cleaning / Sanitation'].includes(c.category) ||
      !['Plumbing', 'Electrical', 'Fans / Lighting', 'Wi-Fi', 'AC Related'].includes(c.category)
  ).length;

  const maxCategory = Math.max(plumbingCount, electricalCount, wifiCount, acCount, otherCount, 5);

  const categoryBreakdown = [
    {
      name: 'Plumbing',
      count: plumbingCount,
      percent: (plumbingCount / maxCategory) * 100,
      iconClass: '',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      ),
    },
    {
      name: 'Electrical',
      count: electricalCount,
      percent: (electricalCount / maxCategory) * 100,
      iconClass: 'c1',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      name: 'Wi-Fi',
      count: wifiCount,
      percent: (wifiCount / maxCategory) * 100,
      iconClass: 'c2',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      ),
    },
    {
      name: 'AC Related',
      count: acCount,
      percent: (acCount / maxCategory) * 100,
      iconClass: 'c3',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
        </svg>
      ),
    },
    {
      name: 'Other',
      count: otherCount,
      percent: (otherCount / maxCategory) * 100,
      iconClass: '',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="heading">
        <div>
          <p className="eyebrow">
            {admin ? 'WARDEN WORKSPACE' : 'STUDENT WORKSPACE'}
          </p>
          <h1>
            Good morning, {admin ? 'Warden' : 'Rahul'}{' '}
            <span className="sun">✦</span>
          </h1>
          <p className="subtitle">
            {admin
              ? 'A clear view of maintenance requests across the hostel.'
              : 'Here’s the status of your hostel maintenance requests.'}
          </p>
        </div>

        <span className="date">
          {new Date().toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className={`metrics ${!admin ? 'student-metrics' : ''}`}>
        {metrics.map((metric) => (
          <Metric
            key={metric[0]}
            label={metric[0]}
            value={metric[1]}
            sub={metric[2]}
            icon={metric[3]}
            tone={metric[4]}
          />
        ))}
      </div>

      <div className="dash-grid">
        <section className="card chart-card">
          <div className="section-title">
            <div>
              <h3>Complaint overview</h3>
              <p>How reports are progressing</p>
            </div>
            <span className="tag">All time</span>
          </div>

          <div className="chart">
            <div className="donut" style={{ background: donutBackground }}>
              <div>
                <b>{total}</b>
                <small>Total</small>
              </div>
            </div>

            <div className="legend">
              <div>
                <i />
                <span>Submitted / pending</span>
                <b>{pending}</b>
              </div>
              <div>
                <i className="blue" />
                <span>In progress</span>
                <b>{inProgress}</b>
              </div>
              <div>
                <i className="green" />
                <span>Resolved</span>
                <b>{resolved}</b>
              </div>
              {rejected > 0 && (
                <div>
                  <i className="red" />
                  <span>Rejected</span>
                  <b>{rejected}</b>
                </div>
              )}
            </div>
          </div>
        </section>

        {admin ? (
          <section className="card category-card">
            <div className="section-title">
              <div>
                <h3>Category breakdown</h3>
                <p>Common maintenance requests</p>
              </div>
              <span className="tag">By type</span>
            </div>

            <div className="category-list">
              {categoryBreakdown.map((item) => (
                <div className="category-row" key={item.name}>
                  <div className={`cat-icon ${item.iconClass}`}>
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
                  <div className="bar">
                    <i style={{ width: `${item.percent}%` }} />
                  </div>
                  <b>{item.count}</b>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="card contacts-card">
            <div className="section-title">
              <div>
                <h3>Emergency &amp; duty contacts</h3>
                <p>Hostel assistance, caretaker &amp; repair desk</p>
              </div>
              <span className="tag live-tag">● 24/7 Support</span>
            </div>

            <div className="contacts-list">
              {dutyContacts.map((contact) => (
                <div className="contact-row" key={contact.role}>
                  <div className={`contact-icon ${contact.theme}`}>
                    {contact.icon}
                  </div>
                  <div className="contact-info">
                    <div className="contact-head">
                      <b>{contact.role}</b>
                      <span className="contact-timing">{contact.timing}</span>
                    </div>
                    <div className="contact-sub">
                      {contact.name} · {contact.detail}
                    </div>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="contact-phone-btn"
                    title={`Call ${contact.role}`}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{contact.ext}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="card recent">
        <div className="section-title">
          <div>
            <h3>Recent complaints</h3>
            <p>Latest maintenance requests submitted.</p>
          </div>
          <button
            className="btn ghost small"
            onClick={() => go(admin ? 'complaints' : 'new')}
          >
            {admin ? 'View all complaints →' : '＋ New complaint'}
          </button>
        </div>

        {recent.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>COMPLAINT</th>
                  <th>CATEGORY</th>
                  <th>ROOM</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>SUBMITTED</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr
                    key={item.id}
                    className="row-click"
                    onClick={() => select(item)}
                  >
                    <td>
                      <b>{item.id}</b>
                    </td>
                    <td>
                      <b>{item.title}</b>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.room || item.building || '—'}</td>
                    <td>
                      <Priority value={item.priority} />
                    </td>
                    <td>
                      <Status value={item.status} />
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No complaints yet"
            detail={
              admin
                ? 'Hostel complaints will appear here.'
                : 'Raise your first complaint to see updates here.'
            }
          />
        )}
      </section>
    </div>
  );
}

export default Dashboard;
