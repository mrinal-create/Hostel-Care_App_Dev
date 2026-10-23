const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
const path = require('node:path'); const fs = require('node:fs/promises');
let win; let adminUnlocked = false; const ADMIN_PASSWORD = '123456'; const rotation = {};
const staff = { Electrical: ['Amit Sharma', 'Sandeep Yadav'], 'Fans / Lighting': ['Amit Sharma', 'Sandeep Yadav'], Plumbing: ['Manoj Kumar', 'Deepak Verma'], 'AC Related': ['Vikram Patel', 'Imran Khan'], 'Wi-Fi': ['Rahul Singh', 'Karan Mehta'], Furniture: ['Manoj Kumar', 'Deepak Verma'], 'Cleaning / Sanitation': ['Manoj Kumar', 'Deepak Verma'], Other: ['Vikram Patel', 'Imran Khan'] };
const seedComplaints = [
    { id: 'HC-2026-001', title: 'Water leakage in bathroom', description: 'Water is leaking under the sink.', category: 'Plumbing', building: 'Block A', floor: '1', room: '101', priority: 'High', status: 'In Progress', reporter: 'Rahul Sharma', studentId: 'student', assignedTo: 'Manoj Kumar', createdAt: '2026-10-21T08:15:00.000Z', deadline: '2026-10-23T03:00:00.000Z', updatedAt: '2026-10-22T08:15:00.000Z', resolutionNote: '', history: ['Complaint submitted', 'Assigned to Manoj Kumar'] },
    { id: 'HC-2026-002', title: 'Fan not working in room', description: 'Ceiling fan does not start.', category: 'Electrical', building: 'Block B', floor: '3', room: '305', priority: 'Medium', status: 'Submitted', reporter: 'Rahul Sharma', studentId: 'student', assignedTo: 'Sandeep Yadav', createdAt: '2026-10-22T06:00:00.000Z', deadline: '2026-10-23T08:00:00.000Z', updatedAt: '2026-10-22T06:00:00.000Z', resolutionNote: '', history: ['Complaint submitted', 'Assigned to Sandeep Yadav'] },
    { id: 'HC-2026-003', title: 'Wi-Fi connectivity issue', description: 'Internet keeps disconnecting.', category: 'Wi-Fi', building: 'Block A', floor: '4', room: '402', priority: 'Low', status: 'Resolved', reporter: 'Rahul Sharma', studentId: 'student', assignedTo: 'Rahul Singh', createdAt: '2026-10-18T05:00:00.000Z', deadline: '2026-10-18T07:00:00.000Z', updatedAt: '2026-10-18T06:10:00.000Z', resolutionNote: 'Router restarted and connection checked.', history: ['Complaint submitted', 'Assigned to Rahul Singh', 'Marked resolved by Warden'] },
    { id: 'HC-2026-004', title: 'AC is not cooling', description: 'AC is running but room is still warm.', category: 'AC Related', building: 'Block C', floor: '2', room: '208', priority: 'High', status: 'Pending', reporter: 'Neha Verma', studentId: 'other-student', assignedTo: 'Vikram Patel', createdAt: '2026-10-22T09:30:00.000Z', deadline: '2026-10-23T11:30:00.000Z', updatedAt: '2026-10-22T09:30:00.000Z', resolutionNote: '', history: ['Complaint submitted', 'Assigned to Vikram Patel'] },
    { id: 'HC-2026-005', title: 'Broken chair in study room', description: 'One chair has a loose leg.', category: 'Furniture', building: 'Block B', floor: '2', room: 'Study room', priority: 'Low', status: 'Resolved', reporter: 'Priya Nair', studentId: 'another-student', assignedTo: 'Manoj Kumar', createdAt: '2026-10-17T10:00:00.000Z', deadline: '2026-10-17T12:00:00.000Z', updatedAt: '2026-10-17T11:15:00.000Z', resolutionNote: 'Chair repaired.', history: ['Complaint submitted', 'Marked resolved by Warden'] }
];
const seedAnnouncements = [
    { id: 'AN-001', title: 'Water supply interruption', category: 'Water Supply', message: 'Water supply will be interrupted from 10 AM to 12 PM for maintenance work.', author: 'Warden', createdAt: '2026-10-22T07:30:00.000Z', pinned: true },
    { id: 'AN-002', title: 'Wi-Fi maintenance', category: 'Wi-Fi', message: 'Wi-Fi maintenance is scheduled for Sunday from 9 AM to 1 PM.', author: 'Warden', createdAt: '2026-10-21T12:00:00.000Z', pinned: false },
    { id: 'AN-003', title: 'Electrical faults', category: 'Electricity', message: 'Please report electrical faults through HostelCare instead of WhatsApp.', author: 'Warden', createdAt: '2026-10-20T08:00:00.000Z', pinned: false },
    { id: 'AN-004', title: 'Hostel inspection', category: 'General', message: 'Hostel inspection is scheduled for Friday. Please keep your rooms clean.', author: 'Warden', createdAt: '2026-10-19T14:00:00.000Z', pinned: false }];
const file = n => path.join(app.getPath('userData'), n);
async function read(n, fallback) { try { const v = JSON.parse(await fs.readFile(file(n), 'utf8')); return Array.isArray(v) ? v : fallback } catch { return fallback } }
async function write(n, v) { const p = file(n); await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p + '.tmp', JSON.stringify(v, null, 2)); await fs.rename(p + '.tmp', p) }
async function seed() { try { await fs.access(file('complaints.json')) } catch { await write('complaints.json', seedComplaints) } try { await fs.access(file('announcements.json')) } catch { await write('announcements.json', seedAnnouncements) } }
function admin(event) { if (event.sender !== win?.webContents) throw Error('Untrusted sender'); if (!adminUnlocked) throw Error('Admin access required'); }
function register() {
    ipcMain.handle('app:load', async () => {
        await seed();
        return {
            complaints: await read('complaints.json', seedComplaints),
            announcements: await read('announcements.json', seedAnnouncements),
            admin: adminUnlocked
        };
    });
    ipcMain.handle('admin:unlock', (e, p) => { if (e.sender !== win?.webContents) throw Error('Untrusted sender'); adminUnlocked = p === ADMIN_PASSWORD; return adminUnlocked });
    ipcMain.handle('admin:lock', (e) => { if (e.sender !== win?.webContents) throw Error('Untrusted sender'); adminUnlocked = false; return true });
    ipcMain.handle('complaints:create', async (e, p) => {
        if (e.sender !== win?.webContents) throw Error('Untrusted sender');
        const req = ['title', 'description', 'category', 'building', 'room', 'priority'];
        if (!p || req.some(k => !String(p[k] || '').trim())) throw Error('Please complete all required fields.');
        const list = await read('complaints.json', seedComplaints);
        const now = new Date(), id = 'HC-' + now.getFullYear() + '-' + String(Date.now()).slice(-5);
        const item = {
            ...p,
            id,
            reporter: 'Rahul Sharma',
            studentId: 'student',
            status: 'Submitted',
            assignedTo: 'Unassigned',
            createdAt: now.toISOString(),
            deadline: new Date(now.getTime() + 7200000).toISOString(),
            updatedAt: now.toISOString(),
            resolutionNote: '',
            history: ['Complaint submitted', 'Awaiting staff assignment by Warden']
        };
        list.unshift(item);
        await write('complaints.json', list);
        if (Notification.isSupported()) new Notification({ title: 'HostelCare', body: `New complaint submitted: ${p.title}` }).show();
        return item;
    });
    ipcMain.handle('complaints:update', async (e, { id, changes }) => {
        admin(e);
        if (!changes || Object.keys(changes).some(k => !['status', 'priority', 'assignedTo', 'resolutionNote'].includes(k))) throw Error('Invalid update');
        const list = await read('complaints.json', seedComplaints), i = list.findIndex(c => c.id === id);
        if (i < 0) throw Error('Complaint not found');
        const unassignedStatuses = ['Submitted', 'Pending', 'Awaiting Capacity'];
        const effectiveChanges = { ...changes };
        if (effectiveChanges.assignedTo && effectiveChanges.assignedTo !== 'Unassigned' && !effectiveChanges.status && unassignedStatuses.includes(list[i].status)) {
            effectiveChanges.status = 'Assigned';
        } else if (effectiveChanges.assignedTo === 'Unassigned' && !effectiveChanges.status && list[i].status === 'Assigned') {
            effectiveChanges.status = 'Submitted';
        }
        const historyEntry = effectiveChanges.status === 'Resolved'
            ? 'Marked resolved by Warden'
            : effectiveChanges.status === 'Rejected'
                ? 'Complaint rejected by Warden'
                : (effectiveChanges.assignedTo && effectiveChanges.assignedTo !== list[i].assignedTo)
                    ? `Assigned to ${effectiveChanges.assignedTo} by Warden`
                    : 'Complaint updated by Warden';
        list[i] = {
            ...list[i],
            ...effectiveChanges,
            updatedAt: new Date().toISOString(),
            history: [...(list[i].history || []), historyEntry]
        };
        await write('complaints.json', list);
        return list[i];
    });
    ipcMain.handle('announcements:create', async (e, p) => { admin(e); if (!p.title?.trim() || !p.message?.trim() || !p.category) throw Error('Title, category and message are required'); const list = await read('announcements.json', seedAnnouncements), item = { id: 'AN-' + Date.now().toString().slice(-6), title: p.title.trim(), message: p.message.trim(), category: p.category, author: 'Warden', createdAt: new Date().toISOString(), pinned: !!p.pinned }; list.unshift(item); await write('announcements.json', list); return item });
    ipcMain.handle('announcements:update', async (e, { id, changes }) => { admin(e); if (Object.keys(changes || {}).some(k => !['pinned', 'title', 'message', 'category'].includes(k))) throw Error('Invalid update'); const list = await read('announcements.json', seedAnnouncements), i = list.findIndex(a => a.id === id); if (i < 0) throw Error('Announcement not found'); list[i] = { ...list[i], ...changes }; await write('announcements.json', list); return list[i] });
    ipcMain.handle('announcements:delete', async (e, id) => { admin(e); await write('announcements.json', (await read('announcements.json', seedAnnouncements)).filter(a => a.id !== id)); return true });
    ipcMain.handle('app:confirm', async (_e, message) => { const r = await dialog.showMessageBox(win, { type: 'question', buttons: ['Cancel', 'Continue'], defaultId: 0, cancelId: 0, message }); return r.response === 1 });
}
function createWindow() { win = new BrowserWindow({ width: 1440, height: 920, minWidth: 1020, minHeight: 700, backgroundColor: '#f4f7f2', webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } }); const devUrl = process.env.VITE_DEV_SERVER_URL || (!app.isPackaged ? 'http://127.0.0.1:5173' : null); if (devUrl) win.loadURL(devUrl); else win.loadFile(path.join(__dirname, '../dist/index.html')) }
app.whenReady().then(async () => { await seed(); register(); createWindow(); app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow() }) }); app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });
