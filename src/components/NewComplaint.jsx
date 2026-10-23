import { useState } from 'react';
import { categories, priorities } from '../ui.jsx';

function NewComplaint({ submit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    building: '',
    floor: '',
    room: '',
    priority: 'Medium',
    photoName: '',
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function setField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function send(event) {
    event.preventDefault();
    setError('');

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.category ||
      !form.building ||
      !form.room.trim()
    ) {
      setError('Please complete all required fields.');
      return;
    }

    setBusy(true);

    try {
      await submit(form);

      setForm({
        title: '',
        description: '',
        category: '',
        building: '',
        floor: '',
        room: '',
        priority: 'Medium',
        photoName: '',
      });
    } catch (error) {
      setError(error.message || 'Could not submit complaint.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="heading">
        <div>
          <p className="eyebrow">REPORT AN ISSUE</p>
          <h1>New complaint</h1>
          <p className="subtitle">
            Tell us what needs fixing. We’ll route it to the right
            maintenance team.
          </p>
        </div>

        <span className="date">01 &nbsp; Complaint details</span>
      </div>

      <form className="new-layout" onSubmit={send}>
        <section className="card form-card">
          <div className="form-intro">
            <span>01</span>
            <div>
              <h3>Complaint details</h3>
              <small>Fields marked with * are required.</small>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Complaint title <em>*</em>
              <input
                maxLength={90}
                value={form.title}
                onChange={(event) =>
                  setField('title', event.target.value)
                }
                placeholder="e.g. Fan not working in room"
                required
              />
            </label>

            <label>
              Category <em>*</em>
              <select
                value={form.category}
                onChange={(event) =>
                  setField('category', event.target.value)
                }
                required
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Building / block <em>*</em>
              <select
                value={form.building}
                onChange={(event) =>
                  setField('building', event.target.value)
                }
                required
              >
                <option value="">Select building</option>
                {['Block A', 'Block B', 'Block C', 'Main Hostel'].map(
                  (item) => (
                    <option key={item}>{item}</option>
                  )
                )}
              </select>
            </label>

            <label>
              Floor
              <select
                value={form.floor}
                onChange={(event) =>
                  setField('floor', event.target.value)
                }
              >
                <option value="">Select floor</option>
                {['Ground', '1', '2', '3', '4', '5'].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Room number <em>*</em>
              <input
                value={form.room}
                onChange={(event) =>
                  setField('room', event.target.value)
                }
                placeholder="e.g. 101"
                required
              />
            </label>

            <label>
              Urgency <em>*</em>
              <select
                value={form.priority}
                onChange={(event) =>
                  setField('priority', event.target.value)
                }
              >
                {priorities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="full-field">
              Description <em>*</em>
              <textarea
                rows="5"
                maxLength={500}
                value={form.description}
                onChange={(event) =>
                  setField('description', event.target.value)
                }
                placeholder="Describe the issue, where it is happening, and any useful details…"
                required
              />
              <small className="char-count">
                {form.description.length}/500
              </small>
            </label>

            <label className="full-field">
              Photo (optional)
              <input
                className="file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  setField(
                    'photoName',
                    event.target.files?.[0]?.name || ''
                  )
                }
              />
              <span className="upload">
                ▧ &nbsp;
                {form.photoName ||
                  'Choose a photo to help explain the issue'}
                <small>
                  JPG, PNG or WEBP · demo stores the file name only
                </small>
              </span>
            </label>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <small>◉ Saved locally on this desktop</small>
            <button className="btn primary" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit complaint →'}
            </button>
          </div>
        </section>

        <aside className="card help-card">
          <div className="help-art">
            ✳<span>⌁</span>
          </div>

          <p className="eyebrow">WHAT HAPPENS NEXT</p>
          <h3>We’ll take it from here.</h3>

          <p>
            Your complaint is assessed by the hostel administration and assigned directly to specialized maintenance staff.
          </p>

          {[
            ['1', 'Warden Review', 'Assessed and routed to the right specialist.'],
            ['2', 'Two-hour target', 'A target deadline is set when you submit.'],
            ['3', 'Warden confirms', 'The warden marks it resolved after inspection.'],
          ].map(([number, title, detail]) => (
            <div className="step" key={number}>
              <b>{number}</b>
              <div>
                <strong>{title}</strong>
                <small>{detail}</small>
              </div>
            </div>
          ))}

          <div className="help-foot">
            Assignments and workload are directly managed by the hostel administration.
          </div>
        </aside>
      </form>
    </div>
  );
}


export default NewComplaint;
