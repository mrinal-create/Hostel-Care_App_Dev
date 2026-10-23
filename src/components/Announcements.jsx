import { useState } from 'react';
import { Empty, formatDate } from '../ui.jsx';

function Announcements({
  items,
  admin,
  create,
  update,
  remove,
}) {
  const [category, setCategory] = useState('All categories');

  const announcementCategories = [
    'General',
    'Maintenance',
    'Water Supply',
    'Electricity',
    'Wi-Fi',
    'Safety',
    'Urgent Notice',
  ];

  const filtered = items
    .filter(
      (item) =>
        category === 'All categories' ||
        item.category === category
    )
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        new Date(b.createdAt) - new Date(a.createdAt)
    );

  return (
    <div className="page">
      <div className="heading">
        <div>
          <p className="eyebrow">HOSTEL NOTICEBOARD</p>
          <h1>Announcements</h1>
          <p className="subtitle">
            Important updates, maintenance schedules and notices for
            residents.
          </p>
        </div>

        {admin && (
          <button className="btn primary" onClick={create}>
            ＋ New announcement
          </button>
        )}
      </div>

      <div className="announcement-layout">
        <section>
          <div className="announcement-toolbar">
            <b>
              LATEST UPDATES <span>{filtered.length}</span>
            </b>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>All categories</option>
              {announcementCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          {filtered.length ? (
            filtered.map((announcement, index) => (
              <article
                className={`card announcement ${
                  announcement.pinned ? 'pinned' : ''
                }`}
                key={announcement.id}
              >
                <div className={`announcement-icon n${index % 4}`}>
                  {announcement.category === 'Water Supply'
                    ? '≋'
                    : announcement.category === 'Wi-Fi'
                      ? '⌁'
                      : announcement.category === 'Electricity'
                        ? 'ϟ'
                        : '✳'}
                </div>

                <div className="announcement-body">
                  <div className="announce-tags">
                    <span>{announcement.category}</span>
                    {announcement.pinned && <i>⚑ Pinned</i>}
                  </div>

                  <h3>{announcement.title}</h3>
                  <p>{announcement.message}</p>

                  <small>
                    ♙ {announcement.author || 'Warden'} &nbsp; · &nbsp;
                    ◷ {formatDate(announcement.createdAt)}
                  </small>
                </div>

                {admin && (
                  <div className="announce-actions">
                    <button
                      title="Pin / unpin"
                      onClick={() =>
                        update(announcement, {
                          pinned: !announcement.pinned,
                        })
                      }
                    >
                      {announcement.pinned ? '⚑' : '⚐'}
                    </button>

                    <button
                      title="Delete"
                      onClick={() => remove(announcement)}
                    >
                      ×
                    </button>
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="card">
              <Empty
                title="No announcements here"
                detail="Try a different category filter."
              />
            </div>
          )}
        </section>

        <aside className="card notice-side">
          <div>✳</div>
          <h3>Stay informed</h3>
          <p>
            Check this noticeboard regularly for maintenance updates
            and important hostel information.
          </p>

          <hr />

          <p>
            Noticeboard posts <b>{items.length}</b>
          </p>
          <p>
            Pinned notices{' '}
            <b>{items.filter((item) => item.pinned).length}</b>
          </p>
        </aside>
      </div>
    </div>
  );
}


export default Announcements;
