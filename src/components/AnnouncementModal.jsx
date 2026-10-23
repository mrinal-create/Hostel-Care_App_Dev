import { useState } from 'react';

function AnnouncementModal({ close, submit }) {
  const [form, setForm] = useState({
    title: '',
    category: 'General',
    message: '',
    pinned: false,
  });

  const [error, setError] = useState('');

  async function send(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      setError('Enter a title and message.');
      return;
    }

    await submit(form);
  }

  return (
    <div
      className="backdrop"
      onMouseDown={(event) =>
        event.target === event.currentTarget && close()
      }
    >
      <form className="modal announcement-form" onSubmit={send}>
        <button
          type="button"
          className="close"
          onClick={close}
        >
          ×
        </button>

        <p className="eyebrow">NOTICEBOARD</p>
        <h2>New announcement</h2>
        <p className="muted">
          Share an important update with hostel residents.
        </p>

        <label>
          Title <em>*</em>
          <input
            maxLength={90}
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            required
          />
        </label>

        <label>
          Category <em>*</em>
          <select
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value })
            }
          >
            {[
              'General',
              'Maintenance',
              'Water Supply',
              'Electricity',
              'Wi-Fi',
              'Safety',
              'Urgent Notice',
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label>
          Message <em>*</em>
          <textarea
            rows="4"
            value={form.message}
            onChange={(event) =>
              setForm({ ...form, message: event.target.value })
            }
            required
          />
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.pinned}
            onChange={(event) =>
              setForm({ ...form, pinned: event.target.checked })
            }
          />
          Pin this announcement to the top
        </label>

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button
            type="button"
            className="btn ghost"
            onClick={close}
          >
            Cancel
          </button>

          <button className="btn primary">
            Publish announcement →
          </button>
        </div>
      </form>
    </div>
  );
}

export default AnnouncementModal;
