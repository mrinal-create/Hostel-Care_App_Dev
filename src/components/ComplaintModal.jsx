import { useState, useMemo } from 'react';
import { priorities, categoryStaff, Priority, Status, formatDate } from '../ui.jsx';

function ComplaintModal({ complaint, complaints = [], admin, close, update }) {
  const [status, setStatus] = useState(complaint.status);
  const [priority, setPriority] = useState(complaint.priority);
  const [assignee, setAssignee] = useState(
    complaint.assignedTo || ''
  );

  const eligibleWorkers =
    categoryStaff[complaint.category] || categoryStaff.Other || [];

  const workerTaskCounts = useMemo(() => {
    const counts = {};
    (complaints || []).forEach((c) => {
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
  }, [complaints]);

  const active =
    complaint.status !== 'Resolved' && complaint.status !== 'Rejected';

  return (
    <div
      className="backdrop"
      onMouseDown={(event) =>
        event.target === event.currentTarget && close()
      }
    >
      <div className="modal detail-modal">
        <button className="close" onClick={close}>
          ×
        </button>

        <div className="modal-head">
          <div>
            <p className="eyebrow">{complaint.id}</p>
            <h2>{complaint.title}</h2>
            <p className="muted">
              {complaint.building} · Floor {complaint.floor || '—'} ·
              Room {complaint.room}
            </p>
          </div>

          <Status value={complaint.status} />
        </div>

        <div className="modal-pills">
          <Priority value={complaint.priority} />
          <span className="cat-tag">{complaint.category}</span>
        </div>

        <div className="description">
          <small>DESCRIPTION</small>
          <p>{complaint.description}</p>

          {complaint.photoName && (
            <small>Photo: {complaint.photoName}</small>
          )}
        </div>

        <div className="detail-grid">
          {[
            ['REPORTED BY', complaint.reporter],
            ['ASSIGNED TO', complaint.assignedTo || 'Unassigned'],
            ['SUBMITTED', formatDate(complaint.createdAt)],
            ['DEADLINE', formatDate(complaint.deadline)],
          ].map(([label, value]) => (
            <div key={label}>
              <small>{label}</small>
              <b>{value}</b>
            </div>
          ))}
        </div>

        {admin ? (
          <div className="admin-edit">
            <div className="section-title">
              <h3>Manage complaint</h3>
              <span className="tag">WARDEN ACTIONS</span>
            </div>

            <div className="form-grid">
              <label>
                Status
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
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
              </label>

              <label>
                Priority
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                >
                  {priorities.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="full-field">
                Assigned staff ({complaint.category} specialists)
                <select
                  value={assignee || 'Unassigned'}
                  onChange={(event) => {
                    const newAssignee = event.target.value;
                    setAssignee(newAssignee);
                    const unassignedStatuses = [
                      'Submitted',
                      'Pending',
                      'Awaiting Capacity',
                    ];
                    if (
                      newAssignee &&
                      newAssignee !== 'Unassigned' &&
                      unassignedStatuses.includes(status)
                    ) {
                      setStatus('Assigned');
                    } else if (
                      (!newAssignee || newAssignee === 'Unassigned') &&
                      status === 'Assigned'
                    ) {
                      setStatus('Submitted');
                    }
                  }}
                >
                  <option value="Unassigned">Unassigned (Awaiting assignment)</option>
                  <optgroup label={`${complaint.category} specialists`}>
                    {eligibleWorkers.map((workerName) => {
                      const count = workerTaskCounts[workerName.toLowerCase()] || 0;
                      return (
                        <option key={workerName} value={workerName}>
                          {workerName} — {count} active {count === 1 ? 'task' : 'tasks'}
                        </option>
                      );
                    })}
                  </optgroup>
                  {assignee &&
                    assignee !== 'Unassigned' &&
                    !eligibleWorkers.includes(assignee) && (
                      <optgroup label="Current Assignee">
                        <option value={assignee}>
                          {assignee} — {workerTaskCounts[assignee.toLowerCase()] || 0} active
                        </option>
                      </optgroup>
                  )}
                </select>
              </label>
            </div>
          </div>
        ) : (
          <div className="timeline">
            <small>ACTIVITY</small>

            {(complaint.history || ['Complaint submitted']).map(
              (item, index) => (
                <p key={index}>● &nbsp; {item}</p>
              )
            )}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn ghost" onClick={close}>
            Close
          </button>

          {admin && (
            <>
              <button
                className="btn outline"
                onClick={() =>
                  update(complaint.id, {
                    status,
                    priority,
                    assignedTo: assignee,
                  })
                }
              >
                Save changes
              </button>

              {active ? (
                <>
                  <button
                    className="btn danger"
                    onClick={() =>
                      update(complaint.id, {
                        status: 'Rejected',
                        assignedTo: assignee,
                      })
                    }
                  >
                    ✕ Reject
                  </button>
                  <button
                    className="btn primary"
                    onClick={() =>
                      update(complaint.id, {
                        status: 'Resolved',
                        assignedTo: assignee,
                      })
                    }
                  >
                    ✓ Mark resolved
                  </button>
                </>
              ) : (
                <button
                  className="btn outline"
                  onClick={() =>
                    update(complaint.id, {
                      status:
                        assignee && assignee !== 'Unassigned'
                          ? 'Assigned'
                          : 'Submitted',
                      assignedTo: assignee,
                    })
                  }
                >
                  ↺ Reopen complaint
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export default ComplaintModal;
