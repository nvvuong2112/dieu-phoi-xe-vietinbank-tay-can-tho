/* ============================================
   HỆ THỐNG QUẢN LÝ & ĐIỀU HÀNH ĐỘI XE TẬP TRUNG
   VietinBank Chi nhánh Tây Cần Thơ – PROTOTYPE
   app.js – Logic & Mock Data
   ============================================ */

(function () {
    'use strict';

    // ========== DEFAULT DATA ==========
    var DEFAULT_VEHICLES = [
        { id: 'v1', plate: '65A-136.92', type: 'Xe ô tô 4 chỗ', status: 'available', freeAt: '', note: '', route: '' },
        { id: 'v2', plate: '65A-131.78', type: 'Xe ô tô 7 chỗ', status: 'available', freeAt: '', note: '', route: '' },
        { id: 'v3', plate: '65A-218.31', type: 'Xe chuyên dùng', status: 'available', freeAt: '', note: '', route: '' },
        { id: 'v4', plate: '65A-000.45', type: 'Xe ô tô 4 chỗ', status: 'available', freeAt: '', note: '', route: '' },
        { id: 'v5', plate: '65A-410.26', type: 'Xe ô tô 7 chỗ', status: 'onduty', freeAt: '2025-02-01 15:00', note: 'Chở khách VIP', route: 'Trụ sở → PGD Bình Thủy' },
        { id: 'v6', plate: '65C-201.72', type: 'Xe chuyên dùng', status: 'maintenance', freeAt: '', note: 'Bảo dưỡng định kỳ', route: '' },
        { id: 'v7', plate: '64C-200.10', type: 'Xe chuyên dùng', status: 'available', freeAt: '', note: '', route: '' },
        { id: 'v8', plate: '65A-108.21', type: 'Xe chuyên dùng', status: 'onduty', freeAt: '2025-02-01 17:30', note: 'Vận chuyển tài liệu', route: 'PGD Ô Môn → PGD KCN Thốt Nốt' },
        { id: 'v9', plate: '65B-018.35', type: 'Xe ô tô 16 chỗ', status: 'available', freeAt: '', note: '', route: '' },
        { id: 'v10', plate: '65A-319.06', type: 'Xe chuyên dùng', status: 'available', freeAt: '', note: '', route: '' }
    ];

    var DEFAULT_DRIVERS = [
        { id: 'd1', name: 'Nguyễn Anh Vũ', status: 'waiting', trip: '', note: '' },
        { id: 'd2', name: 'Nguyễn Thiên Khương', status: 'driving', trip: '65A-410.26: Trụ sở → PGD Bình Thủy', note: '' },
        { id: 'd3', name: 'Nguyễn Quốc Khánh', status: 'waiting', trip: '', note: '' },
        { id: 'd4', name: 'Phan Ngọc An', status: 'driving', trip: '65A-108.21: PGD Ô Môn → PGD KCN Thốt Nốt', note: '' },
        { id: 'd5', name: 'Nguyễn Minh Tươi', status: 'waiting', trip: '', note: '' },
        { id: 'd6', name: 'Nguyễn Chánh Tín', status: 'leave', trip: '', note: 'Nghỉ phép 30/01 – 02/02' }
    ];

    var DEFAULT_ORDERS = [];

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
            orders: state.orders,
            report: state.report
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function resetData() {
        localStorage.removeItem(STORAGE_KEY);
        state.vehicles = JSON.parse(JSON.stringify(DEFAULT_VEHICLES));
        state.drivers = JSON.parse(JSON.stringify(DEFAULT_DRIVERS));
        state.orders = JSON.parse(JSON.stringify(DEFAULT_ORDERS));
        state.report = JSON.parse(JSON.stringify(DEFAULT_REPORT));
        renderAll();
    }

    // ========== STATE ==========
    var saved = loadData();
    var state = {
        vehicles: saved ? saved.vehicles : JSON.parse(JSON.stringify(DEFAULT_VEHICLES)),
        drivers: saved ? saved.drivers : JSON.parse(JSON.stringify(DEFAULT_DRIVERS)),
        orders: saved ? saved.orders : JSON.parse(JSON.stringify(DEFAULT_ORDERS)),
        report: saved && saved.report ? saved.report : JSON.parse(JSON.stringify(DEFAULT_REPORT)),
        role: 'admin', // 'admin' | 'viewer'
        vehicleSearch: '',
        vehicleFilter: '',
        driverSearch: '',
        driverFilter: '',
        selectedVehicleId: null
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
        // Handle both ISO and "YYYY-MM-DD HH:MM" formats
        var d = new Date(str.replace(' ', 'T'));
        if (isNaN(d.getTime())) return str;
        var dd = String(d.getDate()).padStart(2, '0');
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var yy = d.getFullYear();
        var hh = String(d.getHours()).padStart(2, '0');
        var mi = String(d.getMinutes()).padStart(2, '0');
        return dd + '/' + mm + '/' + yy + ' ' + hh + ':' + mi;
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

        // Inner circle (donut hole)
        ctx.beginPath();
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Center text
        ctx.fillStyle = '#222';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total, cx, cy - 8);
        ctx.font = '11px Arial';
        ctx.fillStyle = '#555';
        ctx.fillText('phương tiện', cx, cy + 12);

        // Update legend numbers
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
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">Không tìm thấy phương tiện nào.</td></tr>';
            return;
        }

        var html = '';
        list.forEach(function (v, idx) {
            var admin = isAdmin();
            var btnCreate = '';
            var btnMaint = '';
            var btnEnd = '';
            var disabledAttr = admin ? '' : ' disabled title="Chỉ Admin/Điều hành được thao tác"';
            var wrapClass = admin ? '' : ' viewer-tooltip';

            if (v.status === 'available') {
                btnCreate = '<button class="btn btn-primary btn-sm' + wrapClass + '" onclick="APP.openOrderModal(\'' + v.id + '\')"' + disabledAttr + '>Tạo lệnh</button> ';
                btnMaint = '<button class="btn btn-warning btn-sm' + wrapClass + '" onclick="APP.toggleMaintenance(\'' + v.id + '\')"' + disabledAttr + '>Chuyển bảo trì</button>';
            } else if (v.status === 'onduty') {
                btnEnd = '<button class="btn btn-success btn-sm' + wrapClass + '" onclick="APP.endTrip(\'' + v.id + '\')"' + disabledAttr + '>Kết thúc chuyến</button>';
            } else if (v.status === 'maintenance') {
                btnMaint = '<button class="btn btn-success btn-sm' + wrapClass + '" onclick="APP.toggleMaintenance(\'' + v.id + '\')"' + disabledAttr + '>Hoàn tất bảo trì</button>';
            }

            html += '<tr>'
                + '<td class="col-stt">' + (idx + 1) + '</td>'
                + '<td><strong>' + esc(v.plate) + '</strong></td>'
                + '<td>' + esc(v.type) + '</td>'
                + '<td><span class="badge ' + vehicleStatusBadge(v.status) + '">' + vehicleStatusLabel(v.status) + '</span></td>'
                + '<td>' + formatDT(v.freeAt) + '</td>'
                + '<td>' + esc(v.note) + '</td>'
                + '<td class="col-action">' + btnCreate + btnMaint + btnEnd + '</td>'
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
        renderUpcoming();
        renderReport();
    }

    // ========== ACTIONS ==========

    // Toggle maintenance
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

    // End trip
    function endTrip(vehicleId) {
        var v = state.vehicles.find(function (x) { return x.id === vehicleId; });
        if (!v || v.status !== 'onduty') return;

        // Find associated driver
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

        // Update report
        state.report.totalTrips += 1;
        state.report.totalKm += Math.floor(Math.random() * 80 + 20);

        saveData();
        renderAll();
    }

    // Toggle leave for driver
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

    // ========== MODAL: CREATE ORDER ==========
    function openOrderModal(vehicleId) {
        state.selectedVehicleId = vehicleId;
        var v = state.vehicles.find(function (x) { return x.id === vehicleId; });
        if (!v) return;

        $('#order-vehicle').value = v.plate + ' – ' + v.type;

        // Populate driver select (only waiting)
        var sel = $('#order-driver');
        sel.innerHTML = '<option value="">-- Chọn lái xe --</option>';
        state.drivers.filter(function (d) { return d.status === 'waiting'; }).forEach(function (d) {
            sel.innerHTML += '<option value="' + d.id + '">' + esc(d.name) + '</option>';
        });

        // Default times
        var now = new Date();
        var later = new Date(now.getTime() + 3 * 3600000);
        $('#order-start').value = toLocalISOString(now);
        $('#order-end').value = toLocalISOString(later);
        $('#order-route').value = '';
        $('#order-note').value = '';

        $('#modal-order').classList.add('active');
    }

    function toLocalISOString(d) {
        var yyyy = d.getFullYear();
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        var hh = String(d.getHours()).padStart(2, '0');
        var mi = String(d.getMinutes()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + mi;
    }

    function closeOrderModal() {
        $('#modal-order').classList.remove('active');
        state.selectedVehicleId = null;
    }

    function submitOrder() {
        var vehicleId = state.selectedVehicleId;
        var driverId = $('#order-driver').value;
        var route = $('#order-route').value.trim();
        var start = $('#order-start').value;
        var end = $('#order-end').value;
        var note = $('#order-note').value.trim();

        if (!driverId) { alert('Vui lòng chọn lái xe.'); return; }
        if (!route) { alert('Vui lòng nhập lộ trình.'); return; }
        if (!start || !end) { alert('Vui lòng nhập thời gian.'); return; }

        var v = state.vehicles.find(function (x) { return x.id === vehicleId; });
        var d = state.drivers.find(function (x) { return x.id === driverId; });
        if (!v || !d) return;

        // Update vehicle
        v.status = 'onduty';
        v.freeAt = end.replace('T', ' ');
        v.route = route;
        v.note = note || ('Lệnh điều xe ' + new Date().toLocaleDateString('vi-VN'));

        // Update driver
        d.status = 'driving';
        d.trip = v.plate + ': ' + route;

        // Save order
        state.orders.push({
            id: 'o' + Date.now(),
            vehicleId: vehicleId,
            driverId: driverId,
            plate: v.plate,
            driverName: d.name,
            route: route,
            start: start,
            end: end,
            note: note,
            createdAt: new Date().toISOString()
        });

        saveData();
        closeOrderModal();
        renderAll();
    }

    // ========== ROLE SWITCH ==========
    function switchRole(role) {
        state.role = role;
        renderAll();
    }

    // ========== INIT ==========
    function init() {
        // Role dropdown
        var roleSelect = $('#role-select');
        if (roleSelect) {
            roleSelect.addEventListener('change', function () {
                switchRole(this.value);
            });
        }

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

        // Modal buttons
        var btnSubmit = $('#btn-submit-order');
        if (btnSubmit) btnSubmit.addEventListener('click', submitOrder);

        var btnCancel = $('#btn-cancel-order');
        if (btnCancel) btnCancel.addEventListener('click', closeOrderModal);

        var modalCloseBtn = $('#modal-order .modal-close');
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeOrderModal);

        // Click outside modal to close
        var modalOverlay = $('#modal-order');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function (e) {
                if (e.target === modalOverlay) closeOrderModal();
            });
        }

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
        openOrderModal: openOrderModal,
        closeOrderModal: closeOrderModal,
        toggleMaintenance: toggleMaintenance,
        endTrip: endTrip,
        toggleLeave: toggleLeave,
        resetData: resetData
    };

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
