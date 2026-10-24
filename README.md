# HostelCare — Electron Desktop App

A fast, modern React + Vite + Electron desktop application designed for student hostel complaint management, maintenance dispatch, and notice dissemination. Completely self-contained with local JSON persistence — no external database, cloud service, or backend configuration required.

---

## 📥 Direct Download (macOS)

Pre-built application installer is available for direct download without needing Node.js or development tools:

* 🍏 **[Download HostelCare v1.0.0 for macOS (Apple Silicon DMG)](https://drive.google.com/file/d/18L3rLVxUQ1guRm26_y39lnFz9TZvzIka/view?usp=sharing)** *(Hosted on Google Drive)*

> **macOS Security Note:** Because the application is packaged for demo/testing without an Apple Developer certificate, macOS Gatekeeper may show an *unidentified developer* notice. To open it: Right-click (or Control-click) `HostelCare.app` in `/Applications`, choose **Open**, and confirm **Open**. You can also approve it in **System Settings → Privacy & Security**.

---

## Quick Start (Run from Source)

### 1. Install Dependencies
```bash
npm install
```

> **Note for newer Node.js versions (Node 26+):** If your npm security policy blocks download scripts during install, simply run:
> ```bash
> npm rebuild electron
> ```

### 2. Launch Development Mode
```bash
npm run dev
```
* Vite starts the frontend server at `http://127.0.0.1:5173`.
* Electron automatically launches the desktop application window once the dev server is ready.
* **To exit:** Press `Cmd + Q` inside the app window, or press `Ctrl + C` in your terminal. *(Exiting via `Ctrl + C` in the terminal may report exit code 1; this is standard terminal behavior indicating the dev process was manually stopped).*

---

### Alternative: Production Build & Run
To compile the production React bundle and launch Electron directly against `dist/index.html`:
```bash
npm run build
npm start
```

To build a fresh macOS `.dmg` installer package locally:
```bash
npm run dist:dmg
```

---

## Role-Based Demo Access & Testing

The app includes two distinct operational modes accessible from the sidebar:

### 1. Student Portal (Default Mode)
* **Student Identity:** Rahul Sharma (`student`, Room 101, Block A).
* **Dashboard:** Displays personal stats (Active Complaints, Resolved History), quick status cards, and 24/7 Hostel Emergency Duty contacts.
* **New Complaint:** Submit new maintenance issues with Category, Building, Room, Priority, and Description.
* **Announcements:** Read official hostel circulars and pinned notices from the warden.

### 2. Admin / Warden Portal
* **How to Access:** Click **Admin access** at the bottom of the sidebar.
* **Demo Passcode:** `123456`
* **Features Unlocked:**
  * **Hostel-Wide Dashboard:** Total volume, pending tasks, resolution rate, and high-priority alerts.
  * **All Complaints:** Searchable and filterable master register across all hostel blocks and categories.
  * **Complaint Management Modal:** Click any complaint to inspect its full timeline, assign maintenance staff, update priority/status (`Submitted`, `Assigned`, `In Progress`, `Resolved`, `Rejected`), and log resolution remarks.
  * **Workers Hub (Maintenance Dispatch):** Dedicated department roster tracking real-time workload, active vs. resolved tasks, and worker capacity.
  * **Announcements Manager:** Create new announcements, toggle pinned notices, or delete circulars.
* **To Exit Admin Mode:** Click the profile button at the bottom of the sidebar and select **Exit Admin Mode**.

---

## Maintenance Staff & Workload Management

The app tracks dedicated maintenance staff across key hostel departments:
* **Electrical / Fans & Lighting:** Amit Sharma, Sandeep Yadav
* **Plumbing / Furniture / Cleaning:** Manoj Kumar, Deepak Verma
* **AC Related & General:** Vikram Patel, Imran Khan
* **Wi-Fi & Networking:** Rahul Singh, Karan Mehta

The **Workers** screen calculates active assignments dynamically to help wardens balance workload and prevent bottlenecked repairs.

---

## Project Structure

```text
HostelCare/
├── app/
│   ├── app.js               # Electron main process (lifecycle, IPC handlers, JSON storage)
│   └── preload.js           # Secure contextBridge exposure
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx        # Stats, metric cards & duty contacts
│   │   ├── Complaints.jsx       # Filterable & searchable complaint list
│   │   ├── NewComplaint.jsx     # Student issue submission form
│   │   ├── Workers.jsx          # Maintenance worker workload & department view
│   │   ├── Announcements.jsx    # Circulars list & warden announcement controls
│   │   ├── ComplaintModal.jsx   # Detailed ticket view, status updates & audit trail
│   │   └── AnnouncementModal.jsx# Create announcement dialog
│   ├── App.jsx              # Main layout, router & state synchronization
│   ├── ui.jsx               # Shared badges, priority pills, navigation definitions
│   ├── App.css              # Custom responsive stylesheet
│   └── main.jsx             # React DOM entry point
├── package.json             # Scripts & dependency manifest
└── vite.config.js           # Vite build configuration
```

---

## Technical Highlights & Electron Features Demonstrated

1. **Secure Electron Architecture:**
   * Context isolation enabled (`contextIsolation: true`)
   * Node integration disabled in renderer (`nodeIntegration: false`)
   * Sandbox enabled (`sandbox: true`)
   * Secure IPC messaging via `contextBridge` and `ipcRenderer.invoke`
2. **Local JSON Persistence:**
   * Automatically stores and seeds `complaints.json` and `announcements.json` inside Electron's OS-level `app.getPath('userData')` directory.
   * Safe atomic writes (`.tmp` file renaming) prevent data corruption on sudden shutdown.
3. **Native Desktop Integration:**
   * Native macOS/Windows notifications when new tickets are lodged (`Notification`).
   * Native dialog verification for destructive actions (`dialog.showMessageBox`).
4. **Fast Modern Tooling:**
   * Vite HMR (Hot Module Replacement) during development.
   * Production bundling into static assets loaded via `loadFile()`.
