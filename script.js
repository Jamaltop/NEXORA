document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  // State & Seed Data
  const metricsByRange = {
    '7d': {
      mrr: '$284,920.00', users: '4,812', ndr: '118.4%', churn: '0.82%',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [261000, 265400, 269100, 273800, 278200, 281900, 284920]
    },
    '30d': {
      mrr: '$284,920.00', users: '4,812', ndr: '118.4%', churn: '0.82%',
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [249490, 261200, 274500, 284920]
    },
    '12m': {
      mrr: '$284,920.00', users: '4,812', ndr: '118.4%', churn: '0.82%',
      labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
      data: [142000, 168500, 195000, 224000, 256000, 284920]
    }
  };

  let transactions = [
    { id: 'INV-8841', org: 'Vercel Inc.', tier: 'Enterprise', date: '2026-11-16', status: 'Settled', amount: 4800 },
    { id: 'INV-8840', org: 'Raycast Labs', tier: 'Scale', date: '2026-11-16', status: 'Settled', amount: 1780 },
    { id: 'INV-8839', org: 'Linear Orbit', tier: 'Enterprise', date: '2026-11-15', status: 'Pending', amount: 2400 },
    { id: 'INV-8838', org: 'Kinetix AI', tier: 'Growth', date: '2026-11-14', status: 'Settled', amount: 580 },
    { id: 'INV-8837', org: 'Monolith Cloud', tier: 'Enterprise', date: '2026-11-13', status: 'Failed', amount: 2400 },
    { id: 'INV-8836', org: 'Vektor Studio', tier: 'Scale', date: '2026-11-12', status: 'Settled', amount: 890 }
  ];

  let accounts = JSON.parse(localStorage.getItem('nexora_accounts')) || [
    { id: 1, name: 'Vercel Inc.', email: 'finance@vercel.com', role: 'Enterprise', seats: 140, status: 'Active' },
    { id: 2, name: 'Raycast Labs', email: 'ops@raycast.com', role: 'Scale', seats: 48, status: 'Active' },
    { id: 3, name: 'Monolith Cloud', email: 'ap@monolith.dev', role: 'Enterprise', seats: 95, status: 'Suspended' },
    { id: 4, name: 'Kinetix AI', email: 'billing@kinetix.ai', role: 'Growth', seats: 16, status: 'Active' }
  ];

  let notifications = [
    { id: 1, text: 'Enterprise wire settled: Vercel Inc. ($4,800.00)', unread: true },
    { id: 2, text: 'Payment retry scheduled for Monolith Cloud', unread: true },
    { id: 3, text: 'NDR crossed 118% quarterly benchmark', unread: true }
  ];

  // Theme Persistence
  const savedTheme = localStorage.getItem('nexora_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  document.getElementById('themeToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nexora_theme', next);
    updateThemeIcon(next);
    renderCharts('7d');
  });

  function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    lucide.createIcons();
  }

  // Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view-section');
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.view;
      views.forEach(v => v.classList.remove('active'));
      document.getElementById(`view-${target}`).classList.add('active');
      document.getElementById('currentViewTitle').textContent = btn.textContent.trim();
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  // Mobile Sidebar
  document.getElementById('openSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
  });
  document.getElementById('closeSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
  });

  // Notifications
  const notifPanel = document.getElementById('notifPanel');
  document.getElementById('notifToggle').addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel.classList.toggle('open');
  });
  document.addEventListener('click', () => notifPanel.classList.remove('open'));
  notifPanel.addEventListener('click', e => e.stopPropagation());

  document.getElementById('markAllRead').addEventListener('click', () => {
    notifications = notifications.map(n => ({ ...n, unread: false }));
    renderNotifications();
  });

  function renderNotifications() {
    const unreadCount = notifications.filter(n => n.unread).length;
    const badge = document.getElementById('notifBadge');
    badge.textContent = unreadCount;
    badge.style.display = unreadCount ? 'grid' : 'none';
    document.getElementById('notifList').innerHTML = notifications.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}">${n.text}</div>
    `).join('');
  }

  // Charts
  let revChartInstance = null;
  let planChartInstance = null;

  function renderCharts(rangeKey) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? '#1e293b' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const dataset = metricsByRange[rangeKey];

    const revCtx = document.getElementById('revenueChart').getContext('2d');
    if (revChartInstance) revChartInstance.destroy();
    revChartInstance = new Chart(revCtx, {
      type: 'line',
      data: {
        labels: dataset.labels,
        datasets: [{
          label: 'Net MRR ($)',
          data: dataset.data,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderWidth: 2,
          tension: 0.25,
          fill: true,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });

    const planCtx = document.getElementById('planChart').getContext('2d');
    if (planChartInstance) planChartInstance.destroy();
    planChartInstance = new Chart(planCtx, {
      type: 'doughnut',
      data: {
        labels: ['Enterprise', 'Scale', 'Growth'],
        datasets: [{
          data: [58, 29, 13],
          backgroundColor: ['#2563eb', '#10b981', '#64748b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12 } }
        }
      }
    });
  }

  document.querySelectorAll('.tf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCharts(btn.dataset.range);
    });
  });

  // Render Tables
  function renderTransactions(query = '', status = 'all') {
    const filtered = transactions.filter(tx => {
      const matchesQuery = tx.org.toLowerCase().includes(query.toLowerCase()) ||
                           tx.id.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' || tx.status === status;
      return matchesQuery && matchesStatus;
    });

    const rows = filtered.map(tx => `
      <tr>
        <td class="mono">${tx.id}</td>
        <td><strong>${tx.org}</strong></td>
        <td>${tx.tier}</td>
        <td class="mono">${tx.date}</td>
        <td><span class="status-pill status-${tx.status}">${tx.status}</span></td>
        <td class="text-right mono">$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    document.getElementById('recentTxBody').innerHTML = rows;
    document.getElementById('fullTxBody').innerHTML = rows;
  }

  function renderUsers(query = '') {
    const filtered = accounts.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
    document.getElementById('usersTableBody').innerHTML = filtered.map(acc => `
      <tr>
        <td>
          <strong>${acc.name}</strong><br>
          <span style="font-size:0.75rem;color:var(--text-muted)">${acc.email}</span>
        </td>
        <td>${acc.role}</td>
        <td class="mono">${acc.seats}</td>
        <td><span class="status-pill status-${acc.status}">${acc.status}</span></td>
        <td class="text-right">
          <button class="btn-outline" onclick="toggleAccountStatus(${acc.id})">
            ${acc.status === 'Active' ? 'Suspend' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.toggleAccountStatus = (id) => {
    accounts = accounts.map(a => a.id === id ? { ...a, status: a.status === 'Active' ? 'Suspended' : 'Active' } : a);
    localStorage.setItem('nexora_accounts', JSON.stringify(accounts));
    renderUsers(document.getElementById('globalSearch').value);
  };

  // Search & Filter Listeners
  document.getElementById('globalSearch').addEventListener('input', (e) => {
    renderTransactions(e.target.value, document.getElementById('statusFilter').value);
    renderUsers(e.target.value);
  });

  document.getElementById('statusFilter').addEventListener('change', (e) => {
    renderTransactions(document.getElementById('globalSearch').value, e.target.value);
  });

  // Modal Provisioning
  const modal = document.getElementById('userModal');
  document.getElementById('openAddUserModal').addEventListener('click', () => modal.classList.add('open'));
  document.getElementById('closeUserModal').addEventListener('click', () => modal.classList.remove('open'));
  document.getElementById('cancelUserModal').addEventListener('click', () => modal.classList.remove('open'));

  document.getElementById('addUserForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newAcc = {
      id: Date.now(),
      name: document.getElementById('newOrgName').value,
      email: document.getElementById('newOrgEmail').value,
      role: document.getElementById('newOrgRole').value,
      seats: 10,
      status: 'Active'
    };
    accounts.unshift(newAcc);
    localStorage.setItem('nexora_accounts', JSON.stringify(accounts));
    renderUsers();
    e.target.reset();
    modal.classList.remove('open');
  });

  // CSV Export
  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    const csv = ['Invoice,Organization,Tier,Date,Status,Amount',
      ...transactions.map(t => `${t.id},"${t.org}",${t.tier},${t.date},${t.status},${t.amount}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexora-ledger-export.csv';
    a.click();
  });

  renderNotifications();
  renderCharts('7d');
  renderTransactions();
  renderUsers();
});