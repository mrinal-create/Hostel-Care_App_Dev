import { useState, useMemo } from 'react';
import { Priority, Status, formatDate } from '../ui.jsx';

const DEFAULT_STAFF = [
  { name: 'Amit Sharma', departments: ['Electrical', 'Fans / Lighting'] },
  { name: 'Sandeep Yadav', departments: ['Electrical', 'Fans / Lighting'] },
  { name: 'Manoj Kumar', departments: ['Plumbing', 'Furniture', 'Cleaning / Sanitation'] },
  { name: 'Deepak Verma', departments: ['Plumbing', 'Furniture', 'Cleaning / Sanitation'] },
  { name: 'Vikram Patel', departments: ['AC Related', 'Other'] },
  { name: 'Imran Khan', departments: ['AC Related', 'Other'] },
  { name: 'Rahul Singh', departments: ['Wi-Fi'] },
  { name: 'Karan Mehta', departments: ['Wi-Fi'] },
];

function Workers({ complaints, select, go }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Discover all staff (including any custom staff assigned in complaints)
  const staffList = useMemo(() => {
    const map = new Map();

    DEFAULT_STAFF.forEach((s) => {
      map.set(s.name.trim().toLowerCase(), { ...s, departments: [...s.departments] });
    });

    complaints.forEach((c) => {
      const assigned = c.assignedTo?.trim();
      if (assigned && assigned.toLowerCase() !== 'unassigned') {
        const key = assigned.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            name: assigned,
            departments: [c.category || 'General'],
          });
        }
      }
    });

    return Array.from(map.values());
  }, [complaints]);

  // Compute workload for each staff member
  const workersWithWorkload = useMemo(() => {
    return staffList.map((worker) => {
      const workerComplaints = complaints.filter(
        (c) => c.assignedTo?.trim().toLowerCase() === worker.name.toLowerCase()
      );

      const activeTasks = workerComplaints.filter(
        (c) => c.status !== 'Resolved' && c.status !== 'Rejected'
      );

      const resolvedTasks = workerComplaints.filter(
        (c) => c.status === 'Resolved'
      );

      return {
        ...worker,
        allTasks: workerComplaints,
        activeTasks,
        resolvedTasks,
        activeCount: activeTasks.length,
        resolvedCount: resolvedTasks.length,
      };
    });
  }, [staffList, complaints]);

  // Metrics
  const totalStaff = workersWithWorkload.length;
  const totalActiveTasks = workersWithWorkload.reduce((sum, w) => sum + w.activeCount, 0);
  const availableStaff = workersWithWorkload.filter((w) => w.activeCount === 0).length;
  const activeStaff = workersWithWorkload.filter((w) => w.activeCount > 0).length;

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    return workersWithWorkload.filter((worker) => {
      const matchesSearch =
        worker.name.toLowerCase().includes(search.toLowerCase()) ||
        worker.departments.some((d) => d.toLowerCase().includes(search.toLowerCase())) ||
        worker.activeTasks.some((t) => t.title.toLowerCase().includes(search.toLowerCase()));

      const matchesDept =
        deptFilter === 'All' || worker.departments.includes(deptFilter);

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Available' && worker.activeCount === 0) ||
        (statusFilter === 'Active' && worker.activeCount > 0);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [workersWithWorkload, search, deptFilter, statusFilter]);

  const allDepartments = useMemo(() => {
    const set = new Set();
    DEFAULT_STAFF.forEach((s) => s.departments.forEach((d) => set.add(d)));
    return ['All', ...Array.from(set)];
  }, []);

  return (
    <div className="page">
      <div className="heading">
        <div>
          <p className="eyebrow">STAFF &amp; WORKLOAD MANAGEMENT</p>
          <h1>Maintenance workers</h1>
          <p className="subtitle">
            Track active assignments, staff workload, and distribute hostel maintenance requests.
          </p>
        </div>

        <span className="date">{totalStaff} maintenance staff</span>
      </div>

      {/* Overview Metrics */}
      <div className="metrics worker-metrics">
        <article className="card metric">
          <div className="metric-icon mint">👥</div>
          <span>Total staff</span>
          <strong>{totalStaff}</strong>
          <small>Registered workers</small>
        </article>

        <article className="card metric">
          <div className="metric-icon blue">⚙</div>
          <span>Active tasks</span>
          <strong>{totalActiveTasks}</strong>
          <small>Currently assigned</small>
        </article>

        <article className="card metric">
          <div className="metric-icon green">✓</div>
          <span>Free staff</span>
          <strong>{availableStaff}</strong>
          <small>0 tasks assigned</small>
        </article>

        <article className="card metric">
          <div className="metric-icon blue">📋</div>
          <span>Assigned staff</span>
          <strong>{activeStaff}</strong>
          <small>Currently on duty</small>
        </article>
      </div>

      {/* Filters Bar */}
      <section className="card list-card" style={{ marginBottom: '18px' }}>
        <div className="filters">
          <div className="table-search">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search worker or task..."
            />
            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            {allDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All specialties' : dept}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All workloads</option>
            <option value="Available">Free (0 tasks)</option>
            <option value="Active">Assigned (1+ tasks)</option>
          </select>
        </div>
      </section>

      {/* Worker Cards Grid */}
      <div className="workers-grid">
        {filteredWorkers.map((worker) => {
          const initials = worker.name
            .split(' ')
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          const isOverdue = (deadline) => {
            if (!deadline) return false;
            return new Date(deadline) < new Date();
          };

          return (
            <div key={worker.name} className="card worker-card">
              {/* Card Header */}
              <div className="worker-header">
                <div className="worker-avatar">{initials}</div>

                <div className="worker-info">
                  <h3>{worker.name}</h3>
                  <div className="worker-depts">
                    {worker.departments.map((d) => (
                      <span key={d} className="cat-tag">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="worker-badge">
                  {worker.activeCount > 0 ? (
                    <span className="pill s-in-progress">{worker.activeCount} Active</span>
                  ) : (
                    <span className="pill s-resolved">Available</span>
                  )}
                </div>
              </div>

              {/* Workload & Assignment Counters */}
              <div className="worker-counter-box">
                <div className="worker-counter-header">
                  <span className="worker-counter-title">ASSIGNED WORKLOAD</span>
                  <span
                    className={`worker-status-badge ${
                      worker.activeCount === 0 ? 'badge-free' : 'badge-busy'
                    }`}
                  >
                    {worker.activeCount === 0 ? '● Free' : `● ${worker.activeCount} In Progress`}
                  </span>
                </div>

                <div className="worker-counter-stats">
                  <div className="worker-stat-cell active-stat">
                    <span className="stat-number">{worker.activeCount}</span>
                    <span className="stat-label">Active {worker.activeCount === 1 ? 'task' : 'tasks'}</span>
                  </div>
                  <div className="worker-stat-divider" />
                  <div className="worker-stat-cell resolved-stat">
                    <span className="stat-number">{worker.resolvedCount}</span>
                    <span className="stat-label">Resolved</span>
                  </div>
                  <div className="worker-stat-divider" />
                  <div className="worker-stat-cell total-stat">
                    <span className="stat-number">{worker.allTasks.length}</span>
                    <span className="stat-label">Total assigned</span>
                  </div>
                </div>
              </div>

              {/* Active Tasks List */}
              <div className="worker-tasks-section">
                <div className="worker-tasks-title">
                  <span>CURRENT ASSIGNMENTS</span>
                  <small>{worker.activeCount} active</small>
                </div>

                {worker.activeTasks.length > 0 ? (
                  <div className="worker-tasks-list">
                    {worker.activeTasks.map((task) => (
                      <div
                        key={task.id}
                        className="worker-task-item"
                        onClick={() => select(task)}
                        title="Click to view or manage complaint"
                      >
                        <div className="task-item-head">
                          <b>{task.title}</b>
                          <Priority value={task.priority} />
                        </div>

                        <div className="task-item-sub">
                          <span>
                            {task.id} · {task.building || 'Hostel'} · Room {task.room || '—'}
                          </span>
                          <Status value={task.status} />
                        </div>

                        {task.deadline && (
                          <div
                            className={`task-deadline ${
                              isOverdue(task.deadline) ? 'late' : ''
                            }`}
                          >
                            <span>⏰ Deadline: {formatDate(task.deadline)}</span>
                            {isOverdue(task.deadline) && (
                              <span className="late-pill">Overdue</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="worker-empty-tasks">
                    <span className="check-icon">✓</span>
                    <p>No active tasks assigned</p>
                    <small>Ready to take new maintenance requests.</small>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="worker-card-footer">
                <span>Completed history:</span>
                <b>{worker.resolvedCount} tasks resolved</b>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Workers;
