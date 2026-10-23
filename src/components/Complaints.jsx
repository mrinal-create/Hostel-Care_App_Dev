import { useState, useEffect, useMemo } from 'react';
import { categories, categoryStaff, Empty, Priority, Status, formatDate } from '../ui.jsx';

function Complaints({
  items,
  allComplaints,
  search,
  setSearch,
  status,
  setStatus,
  category,
  setCategory,
  select,
  onUpdate,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    function handleClickOutside() {
      setOpenMenuId(null);
    }
    if (openMenuId) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const workerTaskCounts = useMemo(() => {
    const list = allComplaints || items || [];
    const counts = {};
    list.forEach((c) => {
      const assigned = c.assignedTo?.trim();
      if (
        assigned &&
        assigned.toLowerCase() !== 'unassigned' &&
        c.status !== 'Resolved' &&
        c.status !== 'Rejected'
      ) {
        const key = assigned.toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [allComplaints, items]);

  const unresolvedCount = items.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Rejected'
  ).length;

  return (
    <div className="page">
      <div className="heading">
        <div>
          <p className="eyebrow">MAINTENANCE RECORDS</p>
          <h1>All complaints</h1>
          <p className="subtitle">
            Review reports, assignments and resolution progress.
          </p>
        </div>

        <span className="date">
          {unresolvedCount} {unresolvedCount === 1 ? 'unresolved complaint' : 'unresolved complaints'}
        </span>
      </div>

      <section className="card table-card">
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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search complaints..."
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
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>All statuses</option>
            {[
              'Submitted',
              'Pending',
              'Awaiting Capacity',
              'Assigned',
              'In Progress',
              'Resolved',
              'Rejected',
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>All categories</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        {items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned staff</th>
                  <th>Deadline</th>
                  <th className="action-col" aria-label="Actions"></th>
                </tr>
              </thead>

              <tbody>
                {items.map((complaint) => {
                  const eligibleWorkers =
                    categoryStaff[complaint.category] || categoryStaff.Other || [];

                  return (
                    <tr
                      key={complaint.id}
                      onClick={() => select(complaint)}
                    >
                      <td>
                        <b>{complaint.title}</b>
                        <small>
                          {complaint.id} · {complaint.building} · Room{' '}
                          {complaint.room}
                        </small>
                      </td>
                      <td>{complaint.category}</td>
                      <td>
                        <Priority value={complaint.priority} />
                      </td>
                      <td>
                        <Status value={complaint.status} />
                      </td>
                      <td>{complaint.assignedTo || 'Unassigned'}</td>
                      <td>{formatDate(complaint.deadline)}</td>
                      <td
                        className="action-cell"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="action-menu-wrap">
                          <button
                            type="button"
                            className={`action-dots-btn ${
                              openMenuId === complaint.id ? 'active' : ''
                            }`}
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === complaint.id
                                  ? null
                                  : complaint.id
                              )
                            }
                            title="Actions"
                            aria-label="Actions menu"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <circle cx="12" cy="5" r="2.2" />
                              <circle cx="12" cy="12" r="2.2" />
                              <circle cx="12" cy="19" r="2.2" />
                            </svg>
                          </button>

                          {openMenuId === complaint.id && (
                            <div className="action-dropdown">
                              <div className="action-dropdown-header">
                                <span>Assign ({complaint.category}):</span>
                              </div>

                              {eligibleWorkers.map((workerName) => {
                                const isCurrent = complaint.assignedTo === workerName;
                                const count = workerTaskCounts[workerName.toLowerCase()] || 0;
                                return (
                                  <button
                                    key={workerName}
                                    type="button"
                                    className={`action-dropdown-item assign-action ${
                                      isCurrent ? 'current-assigned' : ''
                                    }`}
                                    onClick={() => {
                                      const unassignedStatuses = [
                                        'Submitted',
                                        'Pending',
                                        'Awaiting Capacity',
                                      ];
                                      onUpdate?.(complaint.id, {
                                        assignedTo: workerName,
                                        status: unassignedStatuses.includes(
                                          complaint.status
                                        )
                                          ? 'Assigned'
                                          : complaint.status,
                                      });
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <span className="action-icon">
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                      </svg>
                                    </span>
                                    <span className="worker-assign-name">
                                      {workerName}
                                    </span>
                                    <span
                                      className={`worker-assign-count ${
                                        count === 0 ? 'count-zero' : 'count-active'
                                      }`}
                                      title={`${count} active complaints assigned`}
                                    >
                                      {count} active
                                    </span>
                                    {isCurrent && (
                                      <span className="assigned-check">✓</span>
                                    )}
                                  </button>
                                );
                              })}

                              {complaint.assignedTo &&
                                complaint.assignedTo !== 'Unassigned' && (
                                  <button
                                    type="button"
                                    className="action-dropdown-item unassign-action"
                                    onClick={() => {
                                      onUpdate?.(complaint.id, {
                                        assignedTo: 'Unassigned',
                                        status:
                                          complaint.status === 'Assigned'
                                            ? 'Submitted'
                                            : complaint.status,
                                      });
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <span className="action-icon">✕</span>
                                    <span className="worker-assign-name">
                                      Unassign worker
                                    </span>
                                  </button>
                              )}

                              <div className="action-dropdown-divider" />

                              <button
                                type="button"
                                className="action-dropdown-item resolve-action"
                              onClick={() => {
                                onUpdate?.(complaint.id, {
                                  status: 'Resolved',
                                });
                                setOpenMenuId(null);
                              }}
                            >
                              <span className="action-icon">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                              Mark as Resolved
                            </button>
                            <button
                              type="button"
                              className="action-dropdown-item reject-action"
                              onClick={() => {
                                onUpdate?.(complaint.id, {
                                  status: 'Rejected',
                                });
                                setOpenMenuId(null);
                              }}
                            >
                              <span className="action-icon">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </span>
                              Reject Complaint
                            </button>
                            <button
                              type="button"
                              className="action-dropdown-item view-action"
                              onClick={() => {
                                select(complaint);
                                setOpenMenuId(null);
                              }}
                            >
                              <span className="action-icon">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="16" x2="12" y2="12" />
                                  <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                              </span>
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No matching complaints"
            detail="Try changing your search or filters."
          />
        )}
      </section>
    </div>
  );
}

export default Complaints;
