/* ============================================
   HỆ THỐNG QUẢN LÝ & ĐIỀU HÀNH ĐỘI XE TẬP TRUNG
   VietinBank Chi nhánh Tây Cần Thơ – PROTOTYPE
   app.js – Logic & Mock Data
   ============================================ */

(function () {
    'use strict';

    // ========== DEFAULT DATA ==========
    var DEFAULT_VEHICLES = [
        { id: 'v1', plate: '65A-136.92', type: 'Xe ô tô 4 chỗ', status: 'available', freeAt: '', note: '', route: '', driverName: '' },
        { id: 'v2', plate: '65A-131.78', type: 'Xe ô tô 7 chỗ', status: 'available', freeAt: '', note: '', route: '', driverName: '' },
        { id: 'v3', plate: '65A-218.31', type: 'Xe chuyên dùng', status: 'available', freeAt: '', note: '', route: '', driverName: '' },
        { id: 'v4', plate: '65A-000.45', type: 'Xe ô tô 4 chỗ', status: 'available', freeAt: '', note: '', route: '', driverName: '' },
        { id: 'v5', plate: '65A-410.26', type: 'Xe ô tô 7 chỗ', status: 'onduty', freeAt: '2025-02-01 15:00', note: 'Chở khách VIP', route: 'Trụ sở → PGD Bình Thủy', driverName: 'Nguyễn Thiên Khương' },
        { id: 'v6', plate: '65C-201.72', type: 'Xe chuyên dùng', status: 'maintenance', freeAt: '', note: 'Bảo dưỡng định kỳ', route: '', driverName: '' },
        { id: 'v7', plate: '64C-200.10', type: 'Xe chuyên dùng', status: 'available', freeAt: '', note: '', route: '', driverName: '' },
        { id: 'v8', plate: '65A-108.21', type: 'Xe chuyên dùng', status: 'onduty', freeAt: '2025-02-01 17:30', note: 'Vận chuyển tài liệu', route: 'PGD Ô Môn → PGD KCN Thốt Nốt', driverName: 'Phan Ngọc An' },
        { id: 'v9', plate: '65B-018.35', type: 'Xe ô tô 16 chỗ', status: 'available', freeAt: '', note: '', route: '', driverName: '' },
        { id: 'v10', plate: '65A-319.06', type: 'Xe chuyên dùng', status: 'available', freeAt: '', note: '', route: '', driverName: '' }
    ];

    var DEFAULT_DRIVERS = [
        { id: 'd1', name: 'Nguyễn Anh Vũ', status: 'waiting', trip: '', note: '' },
        { id: 'd2', name: 'Nguyễn Thiên Khương', status: 'driving', trip: '65A-410.26: Trụ sở → PGD Bình Thủy', note: '' },
        { id: 'd3', name: 'Nguyễn Quốc Khánh', status: 'waiting', trip: '', note: '' },
        { id: 'd4', name: 'Phan Ngọc An', status: 'driving', trip: '65A-108.21: PGD Ô Môn → PGD KCN Thốt Nốt', note: '' },
        { id: 'd5', name: 'Nguyễn Minh Tươi', status: 'waiting', trip: '', note: '' },
        { id: 'd6', name: 'Nguyễn Chánh Tín', status: 'leave', trip: '', note: 'Nghỉ phép 30/01 – 02/02' }
    ];

    var DEFAULT_REQUESTS = [];

    var DEFAULT_REPORT = {
        totalTrips: 47,
        totalKm: 3820,
        totalFuel: 612,
        topDrivers: [
            { name: 'Nguyễn Anh Vũ', trips: 14 },
            { name: 'Nguyễn Thiên Khương', trips: 12 },
            { name: 'Phan Ngọc An', trips: 9 }
        ]
    };

    // Mock employee names for request creation
    var EMPLOYEE_LIST = [
        'Trần Thị Mai Hương',
        'Lê Văn Phúc',
        'Nguyễn Hoàng Nam',
        'Phạm Thị Bích Ngọc',
        'Võ Minh Trí'
    ];

    // ========== STORAGE ==========
    var STORAGE_KEY = 'vtb_fleet_data';

    function loadData() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return null;
    }

    function saveData() {
        var data = {
            vehicles: state.vehicles,
            drivers: state.drivers,
            requests: state.requests,
            report: state.report
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function resetData() {
        localStorage.removeItem(STORAGE_KEY);
        state.vehicles = JSON.parse(JSON.stringify(DEFAULT_VEHICLES));
        state.drivers = JSON.parse(JSON.stringify(DEFAULT_DRIVERS));
        state.requests = JSON.parse(JSON.stringify(DEFAULT_REQUESTS));
        state.report = JSON.parse(JSON.stringify(DEFAULT_REPORT));
        renderAll();
    }

    // ========== STATE ==========
    var saved = loadData();
    var state = {
        vehicles: saved ? saved.vehicles : JSON.parse(JSON.stringify(DEFAULT_VEHICLES)),
        drivers: saved ? saved.drivers : JSON.parse(JSON.stringify(DEFAULT_DRIVERS)),
        requests: saved && saved.requests ? saved.requests : JSON.parse(JSON.stringify(DEFAULT_REQUESTS)),
        report: saved && saved.report ? saved.report : JSON.parse(JSON.stringify(DEFAULT_REPORT)),
        role: 'employee', // 'admin' | 'employee'
        vehicleSearch: '',
        vehicleFilter: '',
        driverSearch: '',
        driverFilter: '',
        requestSearch: '',
        requestFilter: '',
        selectedVehicleId: null,
        selectedRequestId: null,
        activeTab: 'tab-fleet'
    };

    // ========== UTILS ==========
    function $(sel) { return document.querySelector(sel); }
    function $$(sel) { return document.querySelectorAll(sel); }
    function esc(str) {
        var div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }
    function formatDT(str) {
        if (!str) return '—';
        var d = new Date(str.replace(' ', 'T'));
        if (isNaN(d.getTime())) return str;
        var dd = String(d.getDate()).padStart(2, '0');
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var yy = d.getFullYear();
        var hh = String(d.getHours()).padStart(2, '0');
        var mi = String(d.getMinutes()).padStart(2, '0');
        return dd + '/' + mm + '/' + yy + ' ' + hh + ':' + mi;
    }

    function toLocalISOString(d) {
        var yyyy = d.getFullYear();
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        var hh = String(d.getHours()).padStart(2, '0');
        var mi = String(d.getMinutes()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + mi;
    }

    function isAdmin() { return state.role === 'admin'; }

    // ========== VEHICLE HELPERS ==========
    function vehicleStatusLabel(s) {
        switch (s) {
            case 'available': return 'Sẵn sàng';
            case 'onduty': return 'Đang đi công tác';
            case 'maintenance': return 'Đang bảo trì';
            default: return s;
        }
    }
    function vehicleStatusBadge(s) {
        switch (s) {
            case 'available': return 'badge-available';
            case 'onduty': return 'badge-onduty';
            case 'maintenance': return 'badge-maintenance';
            default: return '';
        }
    }

    // ========== DRIVER HELPERS ==========
    function driverStatusLabel(s) {
        switch (s) {
            case 'waiting': return 'Đang chờ lệnh';
            case 'driving': return 'Đang cầm lái';
            case 'leave': return 'Nghỉ phép';
            default: return s;
        }
    }
    function driverStatusBadge(s) {
        switch (s) {
            case 'waiting': return 'badge-waiting';
            case 'driving': return 'badge-driving';
            case 'leave': return 'badge-leave';
            default: return '';
        }
    }

    // ========== REQUEST HELPERS ==========
    function requestStatusLabel(s) {
        switch (s) {
            case 'pending': return 'Chờ phê duyệt';
            case 'approved': return 'Đã phê duyệt';
            case 'rejected': return 'Bị từ chối';
            default: return s;
        }
    }
    function requestStatusBadge(s) {
        switch (s) {
            case 'pending': return 'badge-pending';
            case 'approved': return 'badge-approved';
            case 'rejected': return 'badge-rejected';
            default: return '';
        }
    }
    function priorityLabel(p) {
        return p === 'urgent' ? 'Gấp' : 'Thường';
    }
    function priorityBadge(p) {
        return p === 'urgent' ? 'badge-priority-urgent' : 'badge-priority-normal';
    }

    // ========== TAB NAVIGATION ==========
    function switchTab(tabId) {
        state.activeTab = tabId;
        $$('.tab-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
        $$('.tab-panel').forEach(function (panel) {
            panel.classList.toggle('active', panel.id === tabId);
        });
    }

    // ========== RENDER: DASHBOARD ==========
    function renderDashboard() {
        var total = state.vehicles.length;
        var onduty = state.vehicles.filter(function (v) { return v.status === 'onduty'; }).length;
        var maint = state.vehicles.filter(function (v) { return v.status === 'maintenance'; }).length;
        var avail = state.vehicles.filter(function (v) { return v.status === 'available'; }).length;

        $('#stat-total').textContent = total;
        $('#stat-onduty').textContent = onduty;
        $('#stat-maintenance').textContent = maint;
        $('#stat-available').textContent = avail;

        // Request stats
        var reqPending = state.requests.filter(function (r) { return r.status === 'pending'; }).length;
        var reqApproved = state.requests.filter(function (r) { return r.status === 'approved'; }).length;
        var reqRejected = state.requests.filter(function (r) { return r.status === 'rejected'; }).length;

        $('#stat-req-pending').textContent = reqPending;
        $('#stat-req-approved').textContent = reqApproved;
        $('#stat-req-rejected').textContent = reqRejected;

        // Update tab badge for pending requests
        var tabBadge = $('#tab-req-badge');
        if (tabBadge) {
            tabBadge.textContent = reqPending;
            tabBadge.style.display = reqPending > 0 ? 'inline-block' : 'none';
        }

        renderChart(avail, onduty, maint);
    }

    // ========== RENDER: CHART (Donut) ==========
    function renderChart(avail, onduty, maint) {
        var canvas = $('#statusChart');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width;
        var h = canvas.height;
        var cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 10;
        var innerR = r * 0.55;
        var total = avail + onduty + maint;
        if (total === 0) total = 1;

        ctx.clearRect(0, 0, w, h);

        var slices = [
            { val: avail, color: '#1B7A2D' },
            { val: onduty, color: '#00529B' },
            { val: maint, color: '#C8102E' }
        ];
        var startAngle = -Math.PI / 2;
        slices.forEach(function (s) {
            var sweep = (s.val / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
            ctx.closePath();
            ctx.fillStyle = s.color;
            ctx.fill();
            startAngle += sweep;
        });

        ctx.beginPath();
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.fillStyle = '#222';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total, cx, cy - 8);
        ctx.font = '11px Arial';
        ctx.fillStyle = '#555';
        ctx.fillText('phương tiện', cx, cy + 12);

        var legAvail = $('#legend-avail');
        var legOnduty = $('#legend-onduty');
        var legMaint = $('#legend-maint');
        if (legAvail) legAvail.textContent = 'Sẵn sàng: ' + avail;
        if (legOnduty) legOnduty.textContent = 'Đang công tác: ' + onduty;
        if (legMaint) legMaint.textContent = 'Đang bảo trì: ' + maint;
    }

    // ========== RENDER: VEHICLE TABLE ==========
    function renderVehicles() {
        var tbody = $('#vehicle-tbody');
        if (!tbody) return;

        var list = state.vehicles.filter(function (v) {
            var matchSearch = !state.vehicleSearch || v.plate.toLowerCase().indexOf(state.vehicleSearch.toLowerCase()) >= 0;
            var matchFilter = !state.vehicleFilter || v.status === state.vehicleFilter;
            return matchSearch && matchFilter;
        });

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="no-data">Không tìm thấy phương tiện nào.</td></tr>';
            return;
        }

        var html = '';
        list.forEach(function (v, idx) {
            var admin = isAdmin();
            var btnMaint = '';
            var btnEnd = '';
            var disabledAttr = admin ? '' : ' disabled title="Chỉ Admin/Điều hành được thao tác"';
            var wrapClass = admin ? '' : ' viewer-tooltip';

            if (v.status === 'available' && admin) {
                btnMaint = '<button class="btn btn-warning btn-sm" onclick="APP.toggleMaintenance(\'' + v.id + '\')">Chuyển bảo trì</button>';
            } else if (v.status === 'available' && !admin) {
                btnMaint = '<button class="btn btn-warning btn-sm viewer-tooltip" disabled title="Chỉ Admin/Điều hành được thao tác">Chuyển bảo trì</button>';
            } else if (v.status === 'onduty') {
                btnEnd = '<button class="btn btn-success btn-sm' + wrapClass + '" onclick="APP.endTrip(\'' + v.id + '\')"' + disabledAttr + '>Kết thúc chuyến</button>';
            } else if (v.status === 'maintenance') {
                btnMaint = '<button class="btn btn-success btn-sm' + wrapClass + '" onclick="APP.toggleMaintenance(\'' + v.id + '\')"' + disabledAttr + '>Hoàn tất bảo trì</button>';
            }

            // Show driver + route info for onduty vehicles
            var routeInfo = '';
            if (v.status === 'onduty') {
                var parts = [];
                if (v.driverName) parts.push('TX: ' + v.driverName);
                if (v.route) parts.push(v.route);
                routeInfo = parts.join(' – ');
            }

            html += '<tr>'
                + '<td class="col-stt">' + (idx + 1) + '</td>'
                + '<td><strong>' + esc(v.plate) + '</strong></td>'
                + '<td>' + esc(v.type) + '</td>'
                + '<td><span class="badge ' + vehicleStatusBadge(v.status) + '">' + vehicleStatusLabel(v.status) + '</span></td>'
                + '<td>' + formatDT(v.freeAt) + '</td>'
                + '<td>' + esc(routeInfo || v.note) + '</td>'
                + '<td>' + esc(routeInfo ? v.note : '') + '</td>'
                + '<td class="col-action">' + btnMaint + btnEnd + '</td>'
                + '</tr>';
        });
        tbody.innerHTML = html;
    }

    // ========== RENDER: DRIVER TABLE ==========
    function renderDrivers() {
        var tbody = $('#driver-tbody');
        if (!tbody) return;

        var list = state.drivers.filter(function (d) {
            var matchSearch = !state.driverSearch || d.name.toLowerCase().indexOf(state.driverSearch.toLowerCase()) >= 0;
            var matchFilter = !state.driverFilter || d.status === state.driverFilter;
            return matchSearch && matchFilter;
        });

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">Không tìm thấy lái xe nào.</td></tr>';
            return;
        }

        var html = '';
        list.forEach(function (d, idx) {
            var admin = isAdmin();
            var btnLeave = '';
            var disabledAttr = admin ? '' : ' disabled title="Chỉ Admin/Điều hành được thao tác"';
            var wrapClass = admin ? '' : ' viewer-tooltip';

            if (d.status === 'waiting') {
                btnLeave = '<button class="btn btn-warning btn-sm' + wrapClass + '" onclick="APP.toggleLeave(\'' + d.id + '\')"' + disabledAttr + '>Cho nghỉ phép</button>';
            } else if (d.status === 'leave') {
                btnLeave = '<button class="btn btn-success btn-sm' + wrapClass + '" onclick="APP.toggleLeave(\'' + d.id + '\')"' + disabledAttr + '>Hủy nghỉ phép</button>';
            } else if (d.status === 'driving') {
                btnLeave = '<span style="font-size:0.75rem;color:#555;">Đang cầm lái</span>';
            }

            html += '<tr>'
                + '<td class="col-stt">' + (idx + 1) + '</td>'
                + '<td><strong>' + esc(d.name) + '</strong></td>'
                + '<td><span class="badge ' + driverStatusBadge(d.status) + '">' + driverStatusLabel(d.status) + '</span></td>'
                + '<td>' + esc(d.trip || '—') + '</td>'
                + '<td>' + esc(d.note || '—') + '</td>'
                + '<td class="col-action">' + btnLeave + '</td>'
                + '</tr>';
        });
        tbody.innerHTML = html;
    }

    // ========== RENDER: REQUEST TABLE ==========
    function renderRequests() {
        var tbody = $('#request-tbody');
        if (!tbody) return;

        var list = state.requests.filter(function (r) {
            var searchTerm = state.requestSearch.toLowerCase();
            var matchSearch = !searchTerm
                || (r.requester && r.requester.toLowerCase().indexOf(searchTerm) >= 0)
                || (r.route && r.route.toLowerCase().indexOf(searchTerm) >= 0);
            var matchFilter = !state.requestFilter || r.status === state.requestFilter;
            return matchSearch && matchFilter;
        });

        // Sort: pending first, then by creation date desc
        list.sort(function (a, b) {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="no-data">Không có yêu cầu nào.</td></tr>';
            return;
        }

        var html = '';
        list.forEach(function (r, idx) {
            var admin = isAdmin();
            var actions = '';

            if (r.status === 'pending' && admin) {
                actions = '<button class="btn btn-primary btn-sm" onclick="APP.openApproveModal(\'' + r.id + '\')">Phê duyệt</button> '
                    + '<button class="btn btn-danger btn-sm" onclick="APP.openRejectModal(\'' + r.id + '\')">Từ chối</button>';
            } else if (r.status === 'pending' && !admin) {
                actions = '<span style="font-size:0.72rem;color:#555;font-style:italic;">Chờ Admin duyệt</span>';
            } else if (r.status === 'approved') {
                var info = [];
                if (r.assignedPlate) info.push(r.assignedPlate);
                if (r.assignedDriver) info.push(r.assignedDriver);
                actions = '<span style="font-size:0.72rem;color:#1B7A2D;">' + esc(info.join(' / ')) + '</span>';
            } else if (r.status === 'rejected') {
                actions = '<span style="font-size:0.72rem;color:#C8102E;" title="' + esc(r.rejectReason || '') + '">Đã từ chối</span>';
            }

            // Show reject reason in note column if rejected
            var noteDisplay = r.note || '—';
            if (r.status === 'rejected' && r.rejectReason) {
                noteDisplay = 'Lý do: ' + r.rejectReason;
            }

            html += '<tr>'
                + '<td class="col-stt">' + (idx + 1) + '</td>'
                + '<td>' + esc(r.requester) + '</td>'
                + '<td>' + esc(r.purpose) + '</td>'
                + '<td>' + esc(r.route) + '</td>'
                + '<td>' + formatDT(r.startTime) + '</td>'
                + '<td>' + formatDT(r.endTime) + '</td>'
                + '<td><span class="badge ' + priorityBadge(r.priority) + '">' + priorityLabel(r.priority) + '</span></td>'
                + '<td><span class="badge ' + requestStatusBadge(r.status) + '">' + requestStatusLabel(r.status) + '</span></td>'
                + '<td>' + esc(noteDisplay) + '</td>'
                + '<td class="col-action">' + actions + '</td>'
                + '</tr>';
        });
        tbody.innerHTML = html;
    }

    // ========== RENDER: UPCOMING FREE ==========
    function renderUpcoming() {
        var tbody = $('#upcoming-tbody');
        if (!tbody) return;

        var busy = state.vehicles.filter(function (v) { return v.status === 'onduty' && v.freeAt; });
        busy.sort(function (a, b) { return new Date(a.freeAt.replace(' ', 'T')) - new Date(b.freeAt.replace(' ', 'T')); });
        var top5 = busy.slice(0, 5);

        if (top5.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="no-data">Không có xe đang công tác.</td></tr>';
            return;
        }

        var html = '';
        top5.forEach(function (v) {
            html += '<tr>'
                + '<td><strong>' + esc(v.plate) + '</strong></td>'
                + '<td>' + formatDT(v.freeAt) + '</td>'
                + '<td>' + esc(v.route || '—') + '</td>'
                + '</tr>';
        });
        tbody.innerHTML = html;
    }

    // ========== RENDER: REPORT ==========
    function renderReport() {
        var r = state.report;
        var rTotal = $('#report-trips');
        var rKm = $('#report-km');
        var rFuel = $('#report-fuel');
        if (rTotal) rTotal.textContent = r.totalTrips;
        if (rKm) rKm.textContent = r.totalKm.toLocaleString('vi-VN');
        if (rFuel) rFuel.textContent = r.totalFuel;

        var tbody = $('#report-top-tbody');
        if (!tbody) return;
        var html = '';
        r.topDrivers.forEach(function (d, i) {
            html += '<tr><td class="col-stt">' + (i + 1) + '</td><td>' + esc(d.name) + '</td><td style="text-align:center;font-weight:700;">' + d.trips + '</td></tr>';
        });
        tbody.innerHTML = html;
    }

    // ========== RENDER ALL ==========
    function renderAll() {
        renderDashboard();
        renderVehicles();
        renderDrivers();
        renderRequests();
        renderUpcoming();
        renderReport();
        updateRoleUI();
    }

    // ========== ROLE UI UPDATE ==========
    function updateRoleUI() {
        var admin = isAdmin();
        // Show/hide "Tạo yêu cầu" button (employee only, in request toolbar)
        var btnCreateReq = $('#btn-create-request');
        if (btnCreateReq) {
            btnCreateReq.style.display = admin ? 'none' : 'inline-block';
        }
        // Show/hide admin-only "Tạo lệnh" button in old modal (hide it; now workflow is via requests)
        // The old "Tạo lệnh" buttons in vehicle table are removed; admin dispatches via approve modal
    }

    // ========== ACTIONS: VEHICLE ==========

    function toggleMaintenance(vehicleId) {
        var v = state.vehicles.find(function (x) { return x.id === vehicleId; });
        if (!v) return;
        if (v.status === 'available') {
            v.status = 'maintenance';
            v.note = 'Chuyển bảo trì ' + new Date().toLocaleDateString('vi-VN');
        } else if (v.status === 'maintenance') {
            v.status = 'available';
            v.note = '';
        }
        saveData();
        renderAll();
    }

    function endTrip(vehicleId) {
        var v = state.vehicles.find(function (x) { return x.id === vehicleId; });
        if (!v || v.status !== 'onduty') return;

        var driverTrip = v.plate;
        state.drivers.forEach(function (d) {
            if (d.status === 'driving' && d.trip && d.trip.indexOf(driverTrip) >= 0) {
                d.status = 'waiting';
                d.trip = '';
            }
        });

        v.status = 'available';
        v.freeAt = '';
        v.note = '';
        v.route = '';
        v.driverName = '';

        state.report.totalTrips += 1;
        state.report.totalKm += Math.floor(Math.random() * 80 + 20);

        saveData();
        renderAll();
    }

    function toggleLeave(driverId) {
        var d = state.drivers.find(function (x) { return x.id === driverId; });
        if (!d) return;
        if (d.status === 'waiting') {
            d.status = 'leave';
            d.note = 'Nghỉ phép từ ' + new Date().toLocaleDateString('vi-VN');
        } else if (d.status === 'leave') {
            d.status = 'waiting';
            d.note = '';
        }
        saveData();
        renderAll();
    }

    // ========== MODAL: CREATE REQUEST (Employee) ==========
    function openCreateRequestModal() {
        var now = new Date();
        var later = new Date(now.getTime() + 3 * 3600000);
        $('#req-requester').value = '';
        $('#req-purpose').value = '';
        $('#req-route').value = '';
        $('#req-start').value = toLocalISOString(now);
        $('#req-end').value = toLocalISOString(later);
        $('#req-priority').value = 'normal';
        $('#req-note').value = '';
        $('#modal-create-request').classList.add('active');
    }

    function closeCreateRequestModal() {
        $('#modal-create-request').classList.remove('active');
    }

    function submitCreateRequest() {
        var requester = $('#req-requester').value.trim();
        var purpose = $('#req-purpose').value.trim();
        var route = $('#req-route').value.trim();
        var startTime = $('#req-start').value;
        var endTime = $('#req-end').value;
        var priority = $('#req-priority').value;
        var note = $('#req-note').value.trim();

        if (!requester) { alert('Vui lòng nhập tên người yêu cầu.'); return; }
        if (!purpose) { alert('Vui lòng nhập mục đích công tác.'); return; }
        if (!route) { alert('Vui lòng nhập lộ trình.'); return; }
        if (!startTime || !endTime) { alert('Vui lòng nhập thời gian.'); return; }

        state.requests.push({
            id: 'req' + Date.now(),
            requester: requester,
            purpose: purpose,
            route: route,
            startTime: startTime.replace('T', ' '),
            endTime: endTime.replace('T', ' '),
            priority: priority,
            note: note,
            status: 'pending',
            createdAt: new Date().toISOString(),
            assignedVehicleId: '',
            assignedDriverId: '',
            assignedPlate: '',
            assignedDriver: '',
            rejectReason: ''
        });

        saveData();
        closeCreateRequestModal();
        renderAll();
        // Auto-switch to request tab to see the new request
        switchTab('tab-requests');
    }

    // ========== MODAL: APPROVE REQUEST (Admin) ==========
    function openApproveModal(requestId) {
        state.selectedRequestId = requestId;
        var req = state.requests.find(function (r) { return r.id === requestId; });
        if (!req) return;

        // Fill request info
        $('#approve-info').innerHTML =
            '<strong>Người yêu cầu:</strong> ' + esc(req.requester) + '<br>'
            + '<strong>Mục đích:</strong> ' + esc(req.purpose) + '<br>'
            + '<strong>Lộ trình:</strong> ' + esc(req.route) + '<br>'
            + '<strong>Thời gian:</strong> ' + formatDT(req.startTime) + ' → ' + formatDT(req.endTime) + '<br>'
            + '<strong>Ưu tiên:</strong> ' + priorityLabel(req.priority)
            + (req.note ? '<br><strong>Ghi chú:</strong> ' + esc(req.note) : '');

        // Populate vehicle select (only available)
        var vSel = $('#approve-vehicle');
        vSel.innerHTML = '<option value="">-- Chọn xe --</option>';
        state.vehicles.filter(function (v) { return v.status === 'available'; }).forEach(function (v) {
            vSel.innerHTML += '<option value="' + v.id + '">' + esc(v.plate + ' – ' + v.type) + '</option>';
        });

        // Populate driver select (only waiting)
        var dSel = $('#approve-driver');
        dSel.innerHTML = '<option value="">-- Chọn lái xe --</option>';
        state.drivers.filter(function (d) { return d.status === 'waiting'; }).forEach(function (d) {
            dSel.innerHTML += '<option value="' + d.id + '">' + esc(d.name) + '</option>';
        });

        // Pre-fill times from request (admin can adjust)
        $('#approve-start').value = req.startTime.replace(' ', 'T');
        $('#approve-end').value = req.endTime.replace(' ', 'T');

        $('#modal-approve').classList.add('active');
    }

    function closeApproveModal() {
        $('#modal-approve').classList.remove('active');
        state.selectedRequestId = null;
    }

    function submitApprove() {
        var reqId = state.selectedRequestId;
        var req = state.requests.find(function (r) { return r.id === reqId; });
        if (!req) return;

        var vehicleId = $('#approve-vehicle').value;
        var driverId = $('#approve-driver').value;
        var startTime = $('#approve-start').value;
        var endTime = $('#approve-end').value;

        if (!vehicleId) { alert('Vui lòng chọn xe.'); return; }
        if (!driverId) { alert('Vui lòng chọn lái xe.'); return; }
        if (!startTime || !endTime) { alert('Vui lòng nhập thời gian.'); return; }

        var v = state.vehicles.find(function (x) { return x.id === vehicleId; });
        var d = state.drivers.find(function (x) { return x.id === driverId; });
        if (!v || !d) return;

        // Update request
        req.status = 'approved';
        req.assignedVehicleId = vehicleId;
        req.assignedDriverId = driverId;
        req.assignedPlate = v.plate;
        req.assignedDriver = d.name;
        req.startTime = startTime.replace('T', ' ');
        req.endTime = endTime.replace('T', ' ');

        // Update vehicle
        v.status = 'onduty';
        v.freeAt = endTime.replace('T', ' ');
        v.route = req.route;
        v.note = req.purpose + ' (' + req.requester + ')';
        v.driverName = d.name;

        // Update driver
        d.status = 'driving';
        d.trip = v.plate + ': ' + req.route;

        saveData();
        closeApproveModal();
        renderAll();
    }

    // ========== MODAL: REJECT REQUEST (Admin) ==========
    function openRejectModal(requestId) {
        state.selectedRequestId = requestId;
        var req = state.requests.find(function (r) { return r.id === requestId; });
        if (!req) return;

        $('#reject-info').innerHTML =
            '<strong>Người yêu cầu:</strong> ' + esc(req.requester) + '<br>'
            + '<strong>Mục đích:</strong> ' + esc(req.purpose) + '<br>'
            + '<strong>Lộ trình:</strong> ' + esc(req.route);

        $('#reject-reason').value = '';
        $('#modal-reject').classList.add('active');
    }

    function closeRejectModal() {
        $('#modal-reject').classList.remove('active');
        state.selectedRequestId = null;
    }

    function submitReject() {
        var reqId = state.selectedRequestId;
        var req = state.requests.find(function (r) { return r.id === reqId; });
        if (!req) return;

        var reason = $('#reject-reason').value.trim();
        if (!reason) { alert('Vui lòng nhập lý do từ chối.'); return; }

        req.status = 'rejected';
        req.rejectReason = reason;

        saveData();
        closeRejectModal();
        renderAll();
    }

    // ========== ROLE SWITCH ==========
    function switchRole(role) {
        state.role = role;
        renderAll();
    }

    // ========== MODAL HELPERS ==========
    function setupModal(overlayId, closeBtnSel) {
        var overlay = $(overlayId);
        if (!overlay) return;
        var closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                overlay.classList.remove('active');
            });
        }
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    }

    // ========== INIT ==========
    function init() {
        // Role dropdown
        var roleSelect = $('#role-select');
        if (roleSelect) {
            roleSelect.value = state.role;
            roleSelect.addEventListener('change', function () {
                switchRole(this.value);
            });
        }

        // Tab navigation
        $$('.tab-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchTab(this.getAttribute('data-tab'));
            });
        });
        // Set initial active tab
        switchTab(state.activeTab);

        // Vehicle search & filter
        var vSearch = $('#vehicle-search');
        if (vSearch) {
            vSearch.addEventListener('input', function () {
                state.vehicleSearch = this.value;
                renderVehicles();
            });
        }
        var vFilter = $('#vehicle-filter');
        if (vFilter) {
            vFilter.addEventListener('change', function () {
                state.vehicleFilter = this.value;
                renderVehicles();
            });
        }

        // Driver search & filter
        var dSearch = $('#driver-search');
        if (dSearch) {
            dSearch.addEventListener('input', function () {
                state.driverSearch = this.value;
                renderDrivers();
            });
        }
        var dFilter = $('#driver-filter');
        if (dFilter) {
            dFilter.addEventListener('change', function () {
                state.driverFilter = this.value;
                renderDrivers();
            });
        }

        // Request search & filter
        var rSearch = $('#request-search');
        if (rSearch) {
            rSearch.addEventListener('input', function () {
                state.requestSearch = this.value;
                renderRequests();
            });
        }
        var rFilter = $('#request-filter');
        if (rFilter) {
            rFilter.addEventListener('change', function () {
                state.requestFilter = this.value;
                renderRequests();
            });
        }

        // Create Request modal
        var btnCreateReq = $('#btn-create-request');
        if (btnCreateReq) btnCreateReq.addEventListener('click', openCreateRequestModal);
        var btnSubmitReq = $('#btn-submit-request');
        if (btnSubmitReq) btnSubmitReq.addEventListener('click', submitCreateRequest);
        var btnCancelReq = $('#btn-cancel-request');
        if (btnCancelReq) btnCancelReq.addEventListener('click', closeCreateRequestModal);
        setupModal('#modal-create-request');

        // Approve modal
        var btnSubmitApprove = $('#btn-submit-approve');
        if (btnSubmitApprove) btnSubmitApprove.addEventListener('click', submitApprove);
        var btnCancelApprove = $('#btn-cancel-approve');
        if (btnCancelApprove) btnCancelApprove.addEventListener('click', closeApproveModal);
        setupModal('#modal-approve');

        // Reject modal
        var btnSubmitReject = $('#btn-submit-reject');
        if (btnSubmitReject) btnSubmitReject.addEventListener('click', submitReject);
        var btnCancelReject = $('#btn-cancel-reject');
        if (btnCancelReject) btnCancelReject.addEventListener('click', closeRejectModal);
        setupModal('#modal-reject');

        // Reset button
        var btnReset = $('#btn-reset');
        if (btnReset) {
            btnReset.addEventListener('click', function () {
                if (confirm('Đặt lại toàn bộ dữ liệu về mặc định?')) {
                    resetData();
                }
            });
        }

        // Set date range display
        var dateRange = $('#date-range');
        if (dateRange) {
            var now = new Date();
            var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            var lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            dateRange.textContent = 'Từ ngày ' + firstDay.toLocaleDateString('vi-VN') + ' đến ngày ' + lastDay.toLocaleDateString('vi-VN') + ' (demo)';
        }

        renderAll();
    }

    // ========== PUBLIC API ==========
    window.APP = {
        toggleMaintenance: toggleMaintenance,
        endTrip: endTrip,
        toggleLeave: toggleLeave,
        resetData: resetData,
        openApproveModal: openApproveModal,
        openRejectModal: openRejectModal
    };

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
