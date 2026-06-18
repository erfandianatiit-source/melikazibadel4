// ===== اطلاعات ورود ادمین =====
const ADMIN_USER = 'melika';
const ADMIN_PASS = '137613';

// ===== دیتابیس محلی برای رسانه =====
let mediaDB = null;

// ===== راه‌اندازی IndexedDB =====
function initMediaDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('MelikaMediaDB', 1);
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('media')) {
                const store = db.createObjectStore('media', { keyPath: 'id', autoIncrement: true });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('date', 'date', { unique: false });
            }
        };
        request.onsuccess = function(event) {
            mediaDB = event.target.result;
            resolve(mediaDB);
        };
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// ===== ذخیره رسانه =====
function saveMediaToDB(file, type, title) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const data = event.target.result;
            const transaction = mediaDB.transaction(['media'], 'readwrite');
            const store = transaction.objectStore('media');
            const mediaItem = {
                title: title || file.name,
                type: type,
                filename: file.name,
                data: data,
                size: file.size,
                date: new Date().toISOString()
            };
            const request = store.add(mediaItem);
            request.onsuccess = function() { resolve(request.result); };
            request.onerror = function() { reject(request.error); };
        };
        reader.readAsDataURL(file);
    });
}

// ===== دریافت همه رسانه‌ها =====
function getAllMedia() {
    return new Promise((resolve, reject) => {
        const transaction = mediaDB.transaction(['media'], 'readonly');
        const store = transaction.objectStore('media');
        const request = store.getAll();
        request.onsuccess = function() { resolve(request.result); };
        request.onerror = function() { reject(request.error); };
    });
}

// ===== حذف رسانه =====
function deleteMediaFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = mediaDB.transaction(['media'], 'readwrite');
        const store = transaction.objectStore('media');
        const request = store.delete(id);
        request.onsuccess = function() { resolve(); };
        request.onerror = function() { reject(request.error); };
    });
}

// ===== ورود ادمین =====
document.addEventListener('DOMContentLoaded', function() {
    initMediaDB().catch(console.error);
    
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const user = document.getElementById('adminUser').value.trim();
            const pass = document.getElementById('adminPass').value.trim();
            
            if (user.toLowerCase() === ADMIN_USER.toLowerCase() && pass === ADMIN_PASS) {
                document.getElementById('loginAdmin').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                renderPage('dashboard');
            } else {
                const error = document.getElementById('loginError');
                error.style.display = 'block';
                setTimeout(() => { error.style.display = 'none'; }, 3000);
            }
        });
    }
});

// ===== خروج =====
function adminLogout() {
    if (confirm('آیا از خروج مطمئن هستید؟')) {
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('loginAdmin').style.display = 'flex';
        document.getElementById('adminLoginForm').reset();
    }
}

// ===== دریافت داده‌ها =====
function getUsers() { return JSON.parse(localStorage.getItem('melikaUsers')) || {}; }
function getNumbers() { return JSON.parse(localStorage.getItem('melikaNumbers')) || []; }
function getContacts() { return JSON.parse(localStorage.getItem('melikaContacts')) || []; }
function getReservations() { return JSON.parse(localStorage.getItem('melikaReservations')) || []; }

// ===== رندر صفحه =====
function renderPage(tab) {
    const content = document.getElementById('adminContent');
    const title = document.getElementById('pageTitle');
    
    document.querySelectorAll('.sidebar nav li').forEach(li => li.classList.remove('active'));
    const activeTab = document.querySelector(`[data-tab="${tab}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    switch(tab) {
        case 'dashboard': title.textContent = '📊 داشبورد'; content.innerHTML = renderDashboard(); break;
        case 'users': title.textContent = '👥 کاربران'; content.innerHTML = renderUsers(); break;
        case 'numbers': title.textContent = '📱 شماره‌ها'; content.innerHTML = renderNumbers(); break;
        case 'contacts': title.textContent = '✉️ پیام‌ها'; content.innerHTML = renderContacts(); break;
        case 'reservations': title.textContent = '📅 رزروها'; content.innerHTML = renderReservations(); break;
        case 'media': title.textContent = '🎬 رسانه'; content.innerHTML = renderMedia(); break;
        case 'discounts': title.textContent = '🎯 تخفیف‌ها'; content.innerHTML = renderDiscounts(); break;
        default: content.innerHTML = '<h2>صفحه پیدا نشد!</h2>';
    }
    
    // اگر برگه رسانه هست، گالری رو بارگذاری کن
    if (tab === 'media') {
        setTimeout(loadMediaGallery, 500);
    }
}

// ===== داشبورد =====
function renderDashboard() {
    const users = getUsers();
    const numbers = getNumbers();
    const contacts = getContacts();
    const reservations = getReservations();
    return `
        <div class="dashboard-grid">
            <div class="stat-card"><div class="icon">👤</div><div class="number">${Object.keys(users).length}</div><div class="label">کاربران</div></div>
            <div class="stat-card"><div class="icon">📋</div><div class="number">${Object.values(users).reduce((s,u) => s + (u.visitCount||0), 0)}</div><div class="label">مراجعات</div></div>
            <div class="stat-card"><div class="icon">📱</div><div class="number">${numbers.length}</div><div class="label">شماره‌ها</div></div>
            <div class="stat-card"><div class="icon">✉️</div><div class="number">${contacts.length}</div><div class="label">پیام‌ها</div></div>
            <div class="stat-card"><div class="icon">📅</div><div class="number">${reservations.length}</div><div class="label">رزروها</div></div>
        </div>
        <div class="table-container">
            <h3>📋 آخرین رزروها</h3>
            ${reservations.length === 0 ? '<p style="color:#888;">هیچ رزروی ثبت نشده است.</p>' : `
            <table>
                <tr><th>نام</th><th>شماره</th><th>خدمت</th><th>تاریخ</th><th>وضعیت</th></tr>
                ${reservations.slice(-5).reverse().map(r => `<tr><td>${r.name||'---'}</td><td>${r.phone}</td><td>${r.service}</td><td>${new Date(r.date).toLocaleDateString('fa-IR')}</td><td><span class="status-${r.status||'pending'}">${r.status==='confirmed'?'✅ تایید':r.status==='cancelled'?'❌ لغو':'⏳ در انتظار'}</span></td></tr>`).join('')}
            </table>`}
        </div>
    `;
}

// ===== کاربران =====
function renderUsers() {
    const users = getUsers();
    const entries = Object.entries(users);
    return `
        <div class="table-container">
            <h3>👥 لیست کاربران (${entries.length})</h3>
            ${entries.length === 0 ? '<p style="color:#888;">هیچ کاربری ثبت نشده است.</p>' : `
            <table>
                <tr><th>شماره</th><th>نام</th><th>مراجعه</th><th>تخفیف</th><th>عملیات</th></tr>
                ${entries.map(([phone, data]) => {
                    const discount = data.visitCount >= 10 ? 10 : data.visitCount >= 5 ? 7 : data.visitCount >= 3 ? 4 : data.visitCount >= 2 ? 2 : 0;
                    return `<tr><td>${phone}</td><td>${data.name||'---'}</td><td>${data.visitCount||0}</td><td>${discount}%</td><td><button class="btn-delete" onclick="deleteUser('${phone}')">🗑️</button></td></tr>`;
                }).join('')}
            </table>`}
        </div>
    `;
}

// ===== شماره‌ها =====
function renderNumbers() {
    const numbers = getNumbers();
    return `
        <div class="table-container">
            <h3>📱 لیست شماره‌ها (${numbers.length}) ${numbers.length > 0 ? `<button class="btn-export" onclick="exportNumbers()"><i class="fas fa-file-excel"></i> خروجی اکسل</button>` : ''}</h3>
            ${numbers.length === 0 ? '<p style="color:#888;">هیچ شماره‌ای ثبت نشده است.</p>' : `
            <table>
                <tr><th>ردیف</th><th>شماره</th><th>تاریخ ثبت</th><th>عملیات</th></tr>
                ${numbers.map((num, i) => `<tr><td>${i+1}</td><td>${num}</td><td>${new Date().toLocaleDateString('fa-IR')}</td><td><button class="btn-delete" onclick="deleteNumber('${num}')">🗑️</button></td></tr>`).join('')}
            </table>`}
        </div>
    `;
}

// ===== پیام‌ها =====
function renderContacts() {
    const contacts = getContacts();
    return `
        <div class="table-container">
            <h3>✉️ لیست پیام‌ها (${contacts.length}) ${contacts.length > 0 ? `<button class="btn-export" onclick="exportContacts()"><i class="fas fa-file-excel"></i> خروجی اکسل</button>` : ''}</h3>
            ${contacts.length === 0 ? '<p style="color:#888;">هیچ پیامی ثبت نشده است.</p>' : `
            <table>
                <tr><th>نام</th><th>شماره</th><th>خدمت</th><th>پیام</th><th>تاریخ</th><th>عملیات</th></tr>
                ${contacts.map((c, i) => `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.service}</td><td>${c.message||'-'}</td><td>${new Date(c.date).toLocaleDateString('fa-IR')}</td><td><button class="btn-delete" onclick="deleteContact(${i})">🗑️</button></td></tr>`).join('')}
            </table>`}
        </div>
    `;
}

// ===== رزروها =====
function renderReservations() {
    const reservations = getReservations();
    return `
        <div class="table-container">
            <h3>📅 لیست رزروها (${reservations.length}) ${reservations.length > 0 ? `<button class="btn-export" onclick="exportReservations()"><i class="fas fa-file-excel"></i> خروجی اکسل</button>` : ''}</h3>
            ${reservations.length === 0 ? '<p style="color:#888;">هیچ رزروی ثبت نشده است.</p>' : `
            <table>
                <tr><th>نام</th><th>شماره</th><th>خدمت</th><th>تاریخ</th><th>وضعیت</th><th>عملیات</th></tr>
                ${reservations.map((r, i) => `
                    <tr>
                        <td>${r.name||'---'}</td>
                        <td>${r.phone}</td>
                        <td>${r.service}</td>
                        <td>${new Date(r.date).toLocaleDateString('fa-IR')}</td>
                        <td><span class="status-${r.status||'pending'}">${r.status==='confirmed'?'✅ تایید':r.status==='cancelled'?'❌ لغو':'⏳ در انتظار'}</span></td>
                        <td>
                            <button onclick="updateReservation(${i}, 'confirmed')" style="background:#27ae60;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">✅</button>
                            <button onclick="updateReservation(${i}, 'cancelled')" style="background:#e74c3c;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">❌</button>
                            <button class="btn-delete" onclick="deleteReservation(${i})">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </table>`}
        </div>
    `;
}

// ===== رسانه =====
function renderMedia() {
    return `
        <div class="media-upload-section">
            <h3 style="margin-bottom:1rem;">📤 آپلود عکس و فیلم</h3>
            <div class="upload-area" id="dropZone">
                <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
                <p>فایل‌های خود را بکشید و اینجا رها کنید</p>
                <p style="font-size:0.9rem;color:#888;">یا کلیک کنید تا انتخاب کنید</p>
                <input type="file" id="fileInput" multiple accept="image/*,video/*" style="display:none;">
                <div style="margin-top:1rem;">
                    <button onclick="document.getElementById('fileInput').click()" class="btn-primary" style="border:none;cursor:pointer;padding:12px 30px;background:linear-gradient(135deg,#FF1493,#C71585);color:white;border-radius:12px;font-weight:700;">انتخاب فایل</button>
                </div>
                <div id="uploadProgress" style="display:none;margin-top:1rem;">
                    <div class="progress-bar"><div id="progressFill" style="width:0%;height:8px;background:linear-gradient(135deg,#FF1493,#C71585);border-radius:4px;transition:width 0.3s;"></div></div>
                    <p id="progressText" style="margin-top:0.5rem;color:#888;">در حال آپلود...</p>
                </div>
            </div>
        </div>
        <div class="media-gallery">
            <h3 style="margin:2rem 0 1rem;">🖼️ گالری رسانه</h3>
            <div id="mediaGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1.5rem;">
                <p style="color:#888;grid-column:1/-1;">در حال بارگذاری...</p>
            </div>
        </div>
    `;
}

// ===== راه‌اندازی آپلود =====
function setupUploadHandlers() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    if (!dropZone || !fileInput) return;
    
    dropZone.addEventListener('click', function(e) {
        if (e.target === dropZone || e.target.closest('.upload-icon') || e.target.closest('p')) {
            fileInput.click();
        }
    });
    
    fileInput.addEventListener('change', function(e) {
        if (this.files.length > 0) handleFiles(this.files);
    });
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    });
}

// ===== پردازش فایل‌ها =====
async function handleFiles(files) {
    const progressDiv = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressDiv.style.display = 'block';
    let uploaded = 0;
    const total = files.length;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const title = prompt(`عنوان ${type === 'video' ? 'فیلم' : 'عکس'} (${file.name}):`, file.name);
        if (title === null) continue;
        
        try {
            await saveMediaToDB(file, type, title);
            uploaded++;
            const percent = Math.round((uploaded / total) * 100);
            progressFill.style.width = percent + '%';
            progressText.textContent = `آپلود شده: ${uploaded} از ${total}`;
        } catch (error) {
            console.error('خطا در آپلود:', error);
        }
    }
    
    setTimeout(() => {
        progressDiv.style.display = 'none';
        progressFill.style.width = '0%';
        loadMediaGallery();
        alert(`✅ ${uploaded} فایل با موفقیت آپلود شد!`);
    }, 500);
}

// ===== بارگذاری گالری =====
async function loadMediaGallery() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;
    
    try {
        const mediaItems = await getAllMedia();
        if (mediaItems.length === 0) {
            grid.innerHTML = '<p style="color:#888;grid-column:1/-1;">هیچ عکس یا فیلمی آپلود نشده است.</p>';
            return;
        }
        
        grid.innerHTML = mediaItems.map(item => `
            <div class="media-item">
                ${item.type === 'video' ? `
                    <video src="${item.data}" style="width:100%;height:200px;object-fit:cover;" controls></video>
                ` : `
                    <img src="${item.data}" alt="${item.title}" style="width:100%;height:200px;object-fit:cover;">
                `}
                <div style="padding:0.8rem;display:flex;justify-content:space-between;align-items:center;background:white;">
                    <span style="font-weight:700;font-size:0.9rem;">${item.title}</span>
                    <button onclick="deleteMedia(${item.id})" class="btn-delete" style="padding:5px 10px;">🗑️</button>
                </div>
                <div style="padding:0 0.8rem 0.8rem;font-size:0.8rem;color:#888;">
                    ${item.type === 'video' ? '🎬' : '🖼️'} ${new Date(item.date).toLocaleDateString('fa-IR')}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('خطا در بارگذاری گالری:', error);
        grid.innerHTML = '<p style="color:#e74c3c;grid-column:1/-1;">خطا در بارگذاری گالری</p>';
    }
}

// ===== حذف رسانه =====
async function deleteMedia(id) {
    if (!confirm('آیا از حذف این فایل مطمئن هستید؟')) return;
    try {
        await deleteMediaFromDB(id);
        loadMediaGallery();
    } catch (error) {
        console.error('خطا در حذف:', error);
        alert('خطا در حذف فایل');
    }
}

// ===== تخفیف‌ها =====
function renderDiscounts() {
    return `
        <div class="table-container">
            <h3>🎯 تنظیمات تخفیف</h3>
            <p style="color:#666;margin-bottom:1rem;">تخفیف‌ها بر اساس تعداد مراجعه به صورت خودکار اعمال می‌شوند:</p>
            <table>
                <tr><th>تعداد مراجعه</th><th>درصد تخفیف</th></tr>
                <tr><td>۲ بار</td><td>۲٪</td></tr>
                <tr><td>۳ بار</td><td>۴٪</td></tr>
                <tr><td>۵ بار</td><td>۷٪</td></tr>
                <tr><td>۱۰ بار</td><td>۱۰٪</td></tr>
            </table>
        </div>
    `;
}

// ===== عملیات =====
function deleteUser(phone) {
    if (confirm(`آیا از حذف کاربر ${phone} مطمئن هستید؟`)) {
        let users = getUsers();
        delete users[phone];
        localStorage.setItem('melikaUsers', JSON.stringify(users));
        renderPage('users');
    }
}

function deleteNumber(phone) {
    if (confirm(`آیا از حذف شماره ${phone} مطمئن هستید؟`)) {
        let numbers = getNumbers().filter(n => n !== phone);
        localStorage.setItem('melikaNumbers', JSON.stringify(numbers));
        renderPage('numbers');
    }
}

function deleteContact(index) {
    if (confirm('آیا از حذف این پیام مطمئن هستید؟')) {
        let contacts = getContacts();
        contacts.splice(index, 1);
        localStorage.setItem('melikaContacts', JSON.stringify(contacts));
        renderPage('contacts');
    }
}

function deleteReservation(index) {
    if (confirm('آیا از حذف این رزرو مطمئن هستید؟')) {
        let reservations = getReservations();
        reservations.splice(index, 1);
        localStorage.setItem('melikaReservations', JSON.stringify(reservations));
        renderPage('reservations');
    }
}

function updateReservation(index, status) {
    let reservations = getReservations();
    reservations[index].status = status;
    localStorage.setItem('melikaReservations', JSON.stringify(reservations));
    renderPage('reservations');
}

// ===== خروجی اکسل =====
function exportNumbers() {
    const numbers = getNumbers();
    if (numbers.length === 0) { alert('هیچ شماره‌ای وجود ندارد!'); return; }
    let csv = 'ردیف,شماره موبایل,تاریخ ثبت\n';
    numbers.forEach((num, i) => csv += `${i+1},${num},${new Date().toLocaleDateString('fa-IR')}\n`);
    downloadCSV(csv, 'شماره_مشتریان');
}

function exportContacts() {
    const contacts = getContacts();
    if (contacts.length === 0) { alert('هیچ پیامی وجود ندارد!'); return; }
    let csv = 'نام,شماره,خدمت,پیام,تاریخ\n';
    contacts.forEach(c => csv += `${c.name},${c.phone},${c.service},${c.message||''},${new Date(c.date).toLocaleDateString('fa-IR')}\n`);
    downloadCSV(csv, 'پیام_مشتریان');
}

function exportReservations() {
    const reservations = getReservations();
    if (reservations.length === 0) { alert('هیچ رزروی وجود ندارد!'); return; }
    let csv = 'نام,شماره,خدمت,تاریخ رزرو,وضعیت\n';
    reservations.forEach(r => {
        const status = r.status === 'confirmed' ? 'تایید' : r.status === 'cancelled' ? 'لغو' : 'در انتظار';
        csv += `${r.name||'---'},${r.phone},${r.service},${new Date(r.date).toLocaleDateString('fa-IR')},${status}\n`;
    });
    downloadCSV(csv, 'رزرو_مشتریان');
}

function downloadCSV(csv, filename) {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toLocaleDateString('fa-IR')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ===== رویدادهای منو =====
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.sidebar nav li').forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.dataset.tab;
            if (tab) renderPage(tab);
        });
    });
    
    // راه‌اندازی آپلود بعد از رندر شدن
    setTimeout(() => {
        setupUploadHandlers();
    }, 500);
});
