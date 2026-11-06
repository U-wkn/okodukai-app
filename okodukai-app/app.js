/**
 * おこづかい管理アプリ - app.js
 * 学生向けかんたん収支ノート
 */

// ========================================================
// 定数 & カテゴリー定義
// ========================================================
const STORAGE_KEY_ENTRIES = 'okodukai_entries_v1';
const STORAGE_KEY_BUDGET = 'okodukai_budget_v1';

// カテゴリーマスター
const CATEGORIES = {
  expense: [
    { id: 'food', name: '食費', icon: '🍔', color: '#f97316', bg: '#fff7ed' },
    { id: 'transport', name: '交通費', icon: '🚃', color: '#0284c7', bg: '#f0f9ff' },
    { id: 'hobby', name: '娯楽・趣味', icon: '🎮', color: '#8b5cf6', bg: '#f5f3ff' },
    { id: 'shopping', name: '買い物・服', icon: '🛍️', color: '#ec4899', bg: '#fdf2f8' },
    { id: 'study', name: '本・勉強', icon: '📚', color: '#06b6d4', bg: '#ecfeff' },
    { id: 'social', name: '交際費・カフェ', icon: '☕', color: '#d97706', bg: '#fffbeb' },
    { id: 'daily', name: '日用品', icon: '🧴', color: '#10b981', bg: '#ecfdf5' },
    { id: 'other_exp', name: 'その他', icon: '📦', color: '#64748b', bg: '#f8fafc' }
  ],
  income: [
    { id: 'allowance', name: 'お小遣い', icon: '💰', color: '#10b981', bg: '#ecfdf5' },
    { id: 'parttime', name: 'バイト代', icon: '💼', color: '#0284c7', bg: '#f0f9ff' },
    { id: 'otoshidama', name: 'お年玉', icon: '🧧', color: '#ef4444', bg: '#fef2f2' },
    { id: 'extra', name: '臨時収入', icon: '✨', color: '#f59e0b', bg: '#fffbeb' },
    { id: 'other_inc', name: 'その他', icon: '🎁', color: '#64748b', bg: '#f8fafc' }
  ]
};

// ========================================================
// アプリケーション状態 (State)
// ========================================================
let entries = [];
let monthlyBudget = 0;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1; // 1-12
let currentFilterType = 'all'; // 'all' | 'expense' | 'income'
let currentSearchQuery = '';
let currentCategoryFilter = 'all';
let currentEntryType = 'expense'; // 'expense' | 'income' (モーダル内)
let myChart = null; // Chart.js インスタンス

// ========================================================
// DOM要素参照
// ========================================================
const elTotalBalance = document.getElementById('totalBalance');
const elMonthIncome = document.getElementById('monthIncome');
const elMonthExpense = document.getElementById('monthExpense');
const elCurrentMonthLabel = document.getElementById('currentMonthLabel');
const elPrevMonthBtn = document.getElementById('prevMonthBtn');
const elNextMonthBtn = document.getElementById('nextMonthBtn');
const elTodayBtn = document.getElementById('todayBtn');

// 予算関連
const elBudgetStatusBox = document.getElementById('budgetStatusBox');
const elBudgetTargetDisplay = document.getElementById('budgetTargetDisplay');
const elBudgetPercentDisplay = document.getElementById('budgetPercentDisplay');
const elBudgetProgressBar = document.getElementById('budgetProgressBar');
const elBudgetAdviceText = document.getElementById('budgetAdviceText');

// クイック追加ボタン
const elOpenIncomeModalBtn = document.getElementById('openIncomeModalBtn');
const elOpenExpenseModalBtn = document.getElementById('openExpenseModalBtn');

// グラフ関連
const elExpensePieChart = document.getElementById('expensePieChart');
const elChartCanvasBox = document.getElementById('chartCanvasBox');
const elChartCenterAmount = document.getElementById('chartCenterAmount');
const elChartTotalExpense = document.getElementById('chartTotalExpense');
const elNoChartDataMessage = document.getElementById('noChartDataMessage');
const elCategoryBreakdownList = document.getElementById('categoryBreakdownList');

// 履歴関連
const elHistoryList = document.getElementById('historyList');
const elHistoryCountText = document.getElementById('historyCountText');
const elNoHistoryPlaceholder = document.getElementById('noHistoryPlaceholder');
const elSearchInput = document.getElementById('searchInput');
const elClearSearchBtn = document.getElementById('clearSearchBtn');
const elCategorySelectFilter = document.getElementById('categorySelectFilter');
const filterTabBtns = document.querySelectorAll('.filter-tab-btn');

// モーダル (登録/編集)
const elEntryModalBackdrop = document.getElementById('entryModalBackdrop');
const elCloseModalBtn = document.getElementById('closeModalBtn');
const elCancelModalBtn = document.getElementById('cancelModalBtn');
const elEntryForm = document.getElementById('entryForm');
const elModalTitle = document.getElementById('modalTitle');
const elEntryId = document.getElementById('entryId');
const elTypeExpenseBtn = document.getElementById('typeExpenseBtn');
const elTypeIncomeBtn = document.getElementById('typeIncomeBtn');
const elAmountInput = document.getElementById('amountInput');
const elCategoryPickerGrid = document.getElementById('categoryPickerGrid');
const elSelectedCategory = document.getElementById('selectedCategory');
const elDateInput = document.getElementById('dateInput');
const elMemoInput = document.getElementById('memoInput');
const elDeleteEntryBtn = document.getElementById('deleteEntryBtn');
const quickAddBtns = document.querySelectorAll('.quick-add-btn');
const elClearAmountBtn = document.getElementById('clearAmountBtn');

// 設定モーダル
const elBtnSettings = document.getElementById('btnSettings');
const elSettingsModalBackdrop = document.getElementById('settingsModalBackdrop');
const elCloseSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
const elCloseSettingsFooterBtn = document.getElementById('closeSettingsFooterBtn');
const elMonthlyBudgetInput = document.getElementById('monthlyBudgetInput');
const elSaveBudgetBtn = document.getElementById('saveBudgetBtn');
const elClearBudgetBtn = document.getElementById('clearBudgetBtn');
const elExportDataBtn = document.getElementById('exportDataBtn');
const elImportDataFile = document.getElementById('importDataFile');
const elLoadSampleDataBtn = document.getElementById('loadSampleDataBtn');
const elResetAllDataBtn = document.getElementById('resetAllDataBtn');

// トースト通知
const elToast = document.getElementById('toastNotification');

// ========================================================
// 初期化 & サンプルデータ
// ========================================================

/**
 * 初回訪問時用サンプルデータ
 * ユーザーの希望イメージ（残高¥18,500、収入¥30,000、支出¥11,500）に忠実に合わせる
 */
function getInitialSampleData() {
  const y = currentYear;
  const m = String(currentMonth).padStart(2, '0');
  
  return [
    {
      id: 'sample_inc_1',
      type: 'income',
      amount: 10000,
      category: 'お小遣い',
      date: `${y}-${m}-01`,
      memo: '今月のお小遣い 💰',
      createdAt: Date.now() - 500000
    },
    {
      id: 'sample_inc_2',
      type: 'income',
      amount: 20000,
      category: 'バイト代',
      date: `${y}-${m}-05`,
      memo: 'カフェのアルバイト代 ☕',
      createdAt: Date.now() - 400000
    },
    {
      id: 'sample_exp_1',
      type: 'expense',
      amount: 800,
      category: '食費',
      date: `${y}-${m}-06`,
      memo: '昼ごはん（学食ラーメン） 🍜',
      createdAt: Date.now() - 300000
    },
    {
      id: 'sample_exp_2',
      type: 'expense',
      amount: 500,
      category: '交通費',
      date: `${y}-${m}-06`,
      memo: '交通費（電車往復） 🚃',
      createdAt: Date.now() - 200000
    },
    {
      id: 'sample_exp_3',
      type: 'expense',
      amount: 2200,
      category: '本・勉強',
      date: `${y}-${m}-04`,
      memo: '資格試験の参考書 📖',
      createdAt: Date.now() - 150000
    },
    {
      id: 'sample_exp_4',
      type: 'expense',
      amount: 5000,
      category: '娯楽・趣味',
      date: `${y}-${m}-03`,
      memo: 'ゲームソフト 🎮',
      createdAt: Date.now() - 100000
    },
    {
      id: 'sample_exp_5',
      type: 'expense',
      amount: 3000,
      category: '買い物・服',
      date: `${y}-${m}-02`,
      memo: '秋物のシャツ 👕',
      createdAt: Date.now() - 50000
    }
  ];
}

/**
 * データのロード
 */
function loadData() {
  const savedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
  const savedBudget = localStorage.getItem(STORAGE_KEY_BUDGET);

  if (savedEntries) {
    try {
      entries = JSON.parse(savedEntries);
    } catch (e) {
      console.error('Failed to parse saved entries:', e);
      entries = getInitialSampleData();
      saveData();
    }
  } else {
    // 初回起動時は親しみやすいサンプルデータをセット
    entries = getInitialSampleData();
    saveData();
  }

  if (savedBudget) {
    monthlyBudget = parseInt(savedBudget, 10) || 0;
  } else {
    monthlyBudget = 20000; // デフォルト予算目安20,000円
    localStorage.setItem(STORAGE_KEY_BUDGET, monthlyBudget.toString());
  }
}

/**
 * データの保存
 */
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save entries to localStorage:', e);
    showToast('データの保存に失敗しました（容量制限など）', 'error');
  }
}

// ========================================================
// フォーマット & ヘルパー関数
// ========================================================

/**
 * 金額のカンマ区切り表示 (例: 18500 -> 18,500)
 */
function formatCurrency(num) {
  return Number(num || 0).toLocaleString('ja-JP');
}

/**
 * 日付のフォーマット (例: 2026-11-06 -> 11月6日(金))
 */
function formatDateJapanese(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeek = weekDays[d.getDay()];
  
  return `${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日(${dayOfWeek})`;
}

/**
 * 今日の日付文字列取得 (YYYY-MM-DD)
 */
function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * カテゴリーメタ情報取得
 */
function getCategoryMeta(type, categoryName) {
  const catList = CATEGORIES[type] || [];
  const found = catList.find(c => c.name === categoryName);
  if (found) return found;

  // もし逆のリストにある場合も念のため探索
  const altList = type === 'expense' ? CATEGORIES.income : CATEGORIES.expense;
  const altFound = altList.find(c => c.name === categoryName);
  if (altFound) return altFound;

  return {
    id: 'unknown',
    name: categoryName || '未分類',
    icon: type === 'income' ? '💰' : '🏷️',
    color: '#0ea5e9',
    bg: '#f0f9ff'
  };
}

/**
 * トースト通知の表示
 */
let toastTimeout = null;
function showToast(message, type = 'info') {
  if (toastTimeout) clearTimeout(toastTimeout);
  
  let icon = '<i class="fa-solid fa-circle-check" style="color: #38bdf8;"></i>';
  if (type === 'error') {
    icon = '<i class="fa-solid fa-triangle-exclamation" style="color: #f43f5e;"></i>';
  } else if (type === 'success') {
    icon = '<i class="fa-solid fa-check-circle" style="color: #10b981;"></i>';
  }

  elToast.innerHTML = `${icon} <span>${message}</span>`;
  elToast.classList.add('show');

  toastTimeout = setTimeout(() => {
    elToast.classList.remove('show');
  }, 3000);
}

// ========================================================
// 画面更新メイン処理
// ========================================================

/**
 * アプリ全体の再描画
 */
function updateApp() {
  updateMonthHeader();
  updateBalanceSummary();
  updateBudgetDisplay();
  updateChartAndBreakdown();
  populateCategorySelectFilter();
  updateHistoryList();
}

/**
 * 月ヘッダーの表示更新
 */
function updateMonthHeader() {
  elCurrentMonthLabel.textContent = `${currentYear}年 ${currentMonth}月`;

  // 今月かどうかで「今月」ボタンの強調を変更
  const now = new Date();
  const isThisMonth = (currentYear === now.getFullYear() && currentMonth === (now.getMonth() + 1));
  if (isThisMonth) {
    elTodayBtn.style.background = 'var(--primary)';
    elTodayBtn.style.color = '#ffffff';
  } else {
    elTodayBtn.style.background = 'var(--primary-pale)';
    elTodayBtn.style.color = 'var(--primary)';
  }
}

/**
 * 残高および今月の収入・支出を計算・更新
 */
function updateBalanceSummary() {
  let totalBalance = 0;
  let monthIncome = 0;
  let monthExpense = 0;

  const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  entries.forEach(entry => {
    const amt = Number(entry.amount) || 0;
    
    // 全期間累計残高
    if (entry.type === 'income') {
      totalBalance += amt;
    } else if (entry.type === 'expense') {
      totalBalance -= amt;
    }

    // 当月の収入・支出
    if (entry.date && entry.date.startsWith(currentMonthPrefix)) {
      if (entry.type === 'income') {
        monthIncome += amt;
      } else if (entry.type === 'expense') {
        monthExpense += amt;
      }
    }
  });

  // DOMに反映
  elTotalBalance.textContent = formatCurrency(totalBalance);
  elMonthIncome.textContent = `+ ¥${formatCurrency(monthIncome)}`;
  elMonthExpense.textContent = `- ¥${formatCurrency(monthExpense)}`;
}

/**
 * 予算進捗バーとアドバイスの更新
 */
function updateBudgetDisplay() {
  const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  let currentMonthExpense = 0;

  entries.forEach(entry => {
    if (entry.type === 'expense' && entry.date && entry.date.startsWith(currentMonthPrefix)) {
      currentMonthExpense += Number(entry.amount) || 0;
    }
  });

  if (monthlyBudget > 0) {
    elBudgetTargetDisplay.textContent = `¥${formatCurrency(monthlyBudget)}`;
    const percent = Math.min(Math.round((currentMonthExpense / monthlyBudget) * 100), 100);
    const actualPercent = Math.round((currentMonthExpense / monthlyBudget) * 100);
    elBudgetPercentDisplay.textContent = `${actualPercent}%`;
    elBudgetProgressBar.style.width = `${percent}%`;

    // プログレスバーの色味
    elBudgetProgressBar.className = 'progress-bar-fill';
    if (actualPercent >= 100) {
      elBudgetProgressBar.classList.add('danger');
      elBudgetAdviceText.innerHTML = `⚠️ 予算を <strong>¥${formatCurrency(currentMonthExpense - monthlyBudget)}</strong> 超過しています！無駄遣いを控えよう。`;
    } else if (actualPercent >= 80) {
      elBudgetProgressBar.classList.add('warning');
      elBudgetAdviceText.innerHTML = `⚡ 予算まであと <strong>¥${formatCurrency(monthlyBudget - currentMonthExpense)}</strong> です。月末まで上手に節約しよう！`;
    } else {
      elBudgetAdviceText.innerHTML = `✨ 予算まであと <strong>¥${formatCurrency(monthlyBudget - currentMonthExpense)}</strong> 使えます。いい調子です！`;
    }
  } else {
    elBudgetTargetDisplay.textContent = '未設定';
    elBudgetPercentDisplay.textContent = '-';
    elBudgetProgressBar.style.width = '0%';
    elBudgetAdviceText.innerHTML = '💡 設定メニューから「毎月の支出予算」を決めると、使いすぎをチェックできます。';
  }
}

/**
 * カテゴリー別支出グラフ (Chart.js) および内訳リストの更新
 */
function updateChartAndBreakdown() {
  const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  
  // カテゴリごとの支出合計をマップ
  const expenseMap = {};
  let totalExpense = 0;

  entries.forEach(entry => {
    if (entry.type === 'expense' && entry.date && entry.date.startsWith(currentMonthPrefix)) {
      const amt = Number(entry.amount) || 0;
      const cat = entry.category || 'その他';
      expenseMap[cat] = (expenseMap[cat] || 0) + amt;
      totalExpense += amt;
    }
  });

  elChartTotalExpense.textContent = `合計: ¥${formatCurrency(totalExpense)}`;
  elChartCenterAmount.textContent = `¥${formatCurrency(totalExpense)}`;

  const categories = Object.keys(expenseMap);

  // 支出が0円の場合
  if (totalExpense === 0 || categories.length === 0) {
    if (myChart) {
      myChart.destroy();
      myChart = null;
    }
    elChartCanvasBox.style.display = 'none';
    elNoChartDataMessage.style.display = 'block';
    elCategoryBreakdownList.innerHTML = '';
    return;
  }

  // 支出がある場合
  elChartCanvasBox.style.display = 'block';
  elNoChartDataMessage.style.display = 'none';

  // 金額の大きい順にソート
  categories.sort((a, b) => expenseMap[b] - expenseMap[a]);

  const labels = [];
  const data = [];
  const bgColors = [];

  categories.forEach(catName => {
    const meta = getCategoryMeta('expense', catName);
    labels.push(`${meta.icon} ${catName}`);
    data.push(expenseMap[catName]);
    bgColors.push(meta.color);
  });

  // Chart.js インスタンスの生成/更新
  if (myChart) {
    myChart.data.labels = labels;
    myChart.data.datasets[0].data = data;
    myChart.data.datasets[0].backgroundColor = bgColors;
    myChart.update();
  } else {
    const ctx = elExpensePieChart.getContext('2d');
    myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '70%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                const pct = Math.round((val / totalExpense) * 100);
                return ` ¥${formatCurrency(val)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // カテゴリー内訳プログレスバーリストを生成
  let breakdownHtml = '';
  categories.forEach(catName => {
    const meta = getCategoryMeta('expense', catName);
    const amt = expenseMap[catName];
    const pct = Math.round((amt / totalExpense) * 100);

    breakdownHtml += `
      <div class="breakdown-row">
        <div class="breakdown-info">
          <span class="breakdown-category">
            <span class="breakdown-color-dot" style="background-color: ${meta.color};"></span>
            <span>${meta.icon} ${catName}</span>
          </span>
          <span class="breakdown-amount">
            ¥${formatCurrency(amt)}
            <span class="breakdown-percent">${pct}%</span>
          </span>
        </div>
        <div class="breakdown-bar-bg">
          <div class="breakdown-bar-fill" style="width: ${pct}%; background-color: ${meta.color};"></div>
        </div>
      </div>
    `;
  });
  elCategoryBreakdownList.innerHTML = breakdownHtml;
}

/**
 * カテゴリー絞り込みセレクトボックスのオプション生成
 */
function populateCategorySelectFilter() {
  const currentVal = elCategorySelectFilter.value;
  let optionsHtml = '<option value="all">すべてのカテゴリー</option>';

  const allCats = [...CATEGORIES.expense, ...CATEGORIES.income];
  const uniqueNames = Array.from(new Set(allCats.map(c => c.name)));

  uniqueNames.forEach(name => {
    const meta = getCategoryMeta('expense', name);
    optionsHtml += `<option value="${name}">${meta.icon} ${name}</option>`;
  });

  elCategorySelectFilter.innerHTML = optionsHtml;
  if (currentVal && uniqueNames.includes(currentVal)) {
    elCategorySelectFilter.value = currentVal;
  }
}

/**
 * 収支履歴リストの描画
 */
function updateHistoryList() {
  const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  
  // 絞り込み
  let filtered = entries.filter(entry => {
    // 月一致
    if (!entry.date || !entry.date.startsWith(currentMonthPrefix)) {
      return false;
    }
    // タイプ一致
    if (currentFilterType !== 'all' && entry.type !== currentFilterType) {
      return false;
    }
    // カテゴリー一致
    if (currentCategoryFilter !== 'all' && entry.category !== currentCategoryFilter) {
      return false;
    }
    // キーワード検索（メモやカテゴリ名）
    if (currentSearchQuery.trim()) {
      const q = currentSearchQuery.toLowerCase();
      const matchMemo = (entry.memo || '').toLowerCase().includes(q);
      const matchCat = (entry.category || '').toLowerCase().includes(q);
      if (!matchMemo && !matchCat) {
        return false;
      }
    }
    return true;
  });

  // 日付の降順（新しい順）、同日は作成順
  filtered.sort((a, b) => {
    if (a.date === b.date) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    return b.date.localeCompare(a.date);
  });

  elHistoryCountText.textContent = `${filtered.length}件の記録`;

  if (filtered.length === 0) {
    elHistoryList.innerHTML = '';
    elNoHistoryPlaceholder.style.display = 'block';
    return;
  }

  elNoHistoryPlaceholder.style.display = 'none';

  let listHtml = '';
  filtered.forEach(item => {
    const isIncome = item.type === 'income';
    const meta = getCategoryMeta(item.type, item.category);
    const amountSign = isIncome ? '＋' : '−';
    const amountClass = isIncome ? 'income' : 'expense';
    const dateFormatted = formatDateJapanese(item.date);

    listHtml += `
      <div class="history-item" data-id="${item.id}">
        <div class="history-item-left">
          <div class="history-icon-badge" style="background-color: ${meta.bg}; color: ${meta.color};">
            ${meta.icon}
          </div>
          <div class="history-details">
            <span class="history-category-name">${escapeHtml(item.category)}</span>
            ${item.memo ? `<span class="history-memo">${escapeHtml(item.memo)}</span>` : ''}
            <span class="history-date">${dateFormatted}</span>
          </div>
        </div>

        <div class="history-item-right">
          <div class="history-amount ${amountClass}">
            ${amountSign}¥${formatCurrency(item.amount)}
          </div>
          <div class="history-actions">
            <button class="history-btn btn-edit" title="編集" data-id="${item.id}" aria-label="編集">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="history-btn btn-delete" title="削除" data-id="${item.id}" aria-label="削除">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  elHistoryList.innerHTML = listHtml;
}

/**
 * XSS対策エスケープ
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ========================================================
// モーダル操作 (登録・編集)
// ========================================================

/**
 * カテゴリー選択グリッドの描画
 */
function renderCategoryPicker(type, selectedName = null) {
  const catList = CATEGORIES[type] || [];
  let html = '';

  catList.forEach((cat, index) => {
    const isSelected = selectedName ? (cat.name === selectedName) : (index === 0);
    if (isSelected) {
      elSelectedCategory.value = cat.name;
    }

    html += `
      <button type="button" class="category-choice-btn ${isSelected ? 'selected' : ''}" data-category="${cat.name}">
        <span class="category-choice-icon">${cat.icon}</span>
        <span class="category-choice-name">${cat.name}</span>
      </button>
    `;
  });

  elCategoryPickerGrid.innerHTML = html;

  // 選択イベント
  const buttons = elCategoryPickerGrid.querySelectorAll('.category-choice-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      elSelectedCategory.value = btn.dataset.category;
    });
  });
}

/**
 * 収支タイプの切り替え (支出 ⇄ 収入)
 */
function setEntryType(type) {
  currentEntryType = type;
  if (type === 'expense') {
    elTypeExpenseBtn.classList.add('active');
    elTypeIncomeBtn.classList.remove('active');
  } else {
    elTypeIncomeBtn.classList.add('active');
    elTypeExpenseBtn.classList.remove('active');
  }
  renderCategoryPicker(type);
}

/**
 * 登録モーダルを開く (新規追加)
 */
function openAddModal(initialType = 'expense') {
  elEntryForm.reset();
  elEntryId.value = '';
  elModalTitle.innerHTML = initialType === 'income' 
    ? '<i class="fa-solid fa-plus-circle" style="color: var(--income);"></i> 収入を記録する'
    : '<i class="fa-solid fa-minus-circle" style="color: var(--expense);"></i> 支出を記録する';
  
  elDeleteEntryBtn.style.display = 'none';

  // 日付の初期値を今日にセット
  elDateInput.value = getTodayString();
  
  setEntryType(initialType);
  elEntryModalBackdrop.style.display = 'flex';
  elAmountInput.focus();
}

/**
 * 編集モーダルを開く
 */
function openEditModal(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;

  elEntryId.value = entry.id;
  elModalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i> 記録を編集する';
  elDeleteEntryBtn.style.display = 'inline-flex';

  elAmountInput.value = entry.amount;
  elDateInput.value = entry.date;
  elMemoInput.value = entry.memo || '';

  currentEntryType = entry.type;
  if (entry.type === 'expense') {
    elTypeExpenseBtn.classList.add('active');
    elTypeIncomeBtn.classList.remove('active');
  } else {
    elTypeIncomeBtn.classList.add('active');
    elTypeExpenseBtn.classList.remove('active');
  }

  renderCategoryPicker(entry.type, entry.category);
  elSelectedCategory.value = entry.category;

  elEntryModalBackdrop.style.display = 'flex';
}

/**
 * モーダルを閉じる
 */
function closeEntryModal() {
  elEntryModalBackdrop.style.display = 'none';
}

// ========================================================
// イベントリスナー登録
// ========================================================

// 1. 月送り・月戻し
elPrevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  }
  updateApp();
});

elNextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  }
  updateApp();
});

elTodayBtn.addEventListener('click', () => {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth() + 1;
  updateApp();
});

// 2. クイック追加ボタン
elOpenIncomeModalBtn.addEventListener('click', () => openAddModal('income'));
elOpenExpenseModalBtn.addEventListener('click', () => openAddModal('expense'));

// 3. モーダルタイプ切り替え
elTypeExpenseBtn.addEventListener('click', () => setEntryType('expense'));
elTypeIncomeBtn.addEventListener('click', () => setEntryType('income'));

// 4. クイック金額加算ボタン
quickAddBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const addVal = parseInt(btn.dataset.add, 10);
    const curVal = parseInt(elAmountInput.value, 10) || 0;
    elAmountInput.value = curVal + addVal;
  });
});

elClearAmountBtn.addEventListener('click', () => {
  elAmountInput.value = '';
  elAmountInput.focus();
});

// 5. モーダル閉じる
elCloseModalBtn.addEventListener('click', closeEntryModal);
elCancelModalBtn.addEventListener('click', closeEntryModal);
elEntryModalBackdrop.addEventListener('click', (e) => {
  if (e.target === elEntryModalBackdrop) closeEntryModal();
});

// 6. 収支データの保存 (登録 / 更新)
elEntryForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const id = elEntryId.value.trim();
  const amount = parseInt(elAmountInput.value, 10);
  const category = elSelectedCategory.value;
  const date = elDateInput.value;
  const memo = elMemoInput.value.trim();
  const type = currentEntryType;

  if (!amount || amount <= 0) {
    showToast('正しい金額を入力してください', 'error');
    return;
  }

  if (!category) {
    showToast('カテゴリーを選択してください', 'error');
    return;
  }

  if (!date) {
    showToast('日付を入力してください', 'error');
    return;
  }

  if (id) {
    // 更新
    const idx = entries.findIndex(item => item.id === id);
    if (idx !== -1) {
      entries[idx] = {
        ...entries[idx],
        type,
        amount,
        category,
        date,
        memo,
        updatedAt: Date.now()
      };
      showToast('記録を更新しました', 'success');
    }
  } else {
    // 新規作成
    const newEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type,
      amount,
      category,
      date,
      memo,
      createdAt: Date.now()
    };
    entries.unshift(newEntry);
    showToast(type === 'income' ? '収入を記録しました 🎉' : '支出を記録しました 💸', 'success');

    // もし登録した日付が現在表示中の年月と異なる場合、その年月にジャンプする親切機能
    const [entryY, entryM] = date.split('-').map(Number);
    if (entryY && entryM && (entryY !== currentYear || entryM !== currentMonth)) {
      currentYear = entryY;
      currentMonth = entryM;
    }
  }

  saveData();
  closeEntryModal();
  updateApp();
});

// 7. モーダル内からの削除
elDeleteEntryBtn.addEventListener('click', () => {
  const id = elEntryId.value.trim();
  if (!id) return;

  if (confirm('この記録を削除してもよろしいですか？')) {
    entries = entries.filter(item => item.id !== id);
    saveData();
    closeEntryModal();
    updateApp();
    showToast('記録を削除しました', 'info');
  }
});

// 8. 履歴一覧のクリックイベント（編集・削除）
elHistoryList.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.btn-edit');
  const deleteBtn = e.target.closest('.btn-delete');
  const historyItem = e.target.closest('.history-item');

  if (editBtn) {
    e.stopPropagation();
    openEditModal(editBtn.dataset.id);
    return;
  }

  if (deleteBtn) {
    e.stopPropagation();
    const id = deleteBtn.dataset.id;
    if (confirm('この記録を削除してもよろしいですか？')) {
      entries = entries.filter(item => item.id !== id);
      saveData();
      updateApp();
      showToast('記録を削除しました', 'info');
    }
    return;
  }

  if (historyItem) {
    openEditModal(historyItem.dataset.id);
  }
});

// 9. フィルタータブ切り替え (すべて / 支出 / 収入)
filterTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterTabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilterType = btn.dataset.filter;
    updateHistoryList();
  });
});

// 10. 検索 & カテゴリーフィルター
elSearchInput.addEventListener('input', (e) => {
  currentSearchQuery = e.target.value;
  elClearSearchBtn.style.display = currentSearchQuery ? 'block' : 'none';
  updateHistoryList();
});

elClearSearchBtn.addEventListener('click', () => {
  elSearchInput.value = '';
  currentSearchQuery = '';
  elClearSearchBtn.style.display = 'none';
  updateHistoryList();
});

elCategorySelectFilter.addEventListener('change', (e) => {
  currentCategoryFilter = e.target.value;
  updateHistoryList();
});

// ========================================================
// 設定モーダル & データ管理
// ========================================================
elBtnSettings.addEventListener('click', () => {
  elMonthlyBudgetInput.value = monthlyBudget || '';
  elSettingsModalBackdrop.style.display = 'flex';
});

function closeSettingsModal() {
  elSettingsModalBackdrop.style.display = 'none';
}

elCloseSettingsModalBtn.addEventListener('click', closeSettingsModal);
elCloseSettingsFooterBtn.addEventListener('click', closeSettingsModal);
elSettingsModalBackdrop.addEventListener('click', (e) => {
  if (e.target === elSettingsModalBackdrop) closeSettingsModal();
});

// 予算設定保存
elSaveBudgetBtn.addEventListener('click', () => {
  const val = parseInt(elMonthlyBudgetInput.value, 10);
  if (isNaN(val) || val < 0) {
    showToast('0円以上の正しい金額を入力してください', 'error');
    return;
  }
  monthlyBudget = val;
  localStorage.setItem(STORAGE_KEY_BUDGET, val.toString());
  updateBudgetDisplay();
  showToast(`今月の支出目安を ¥${formatCurrency(val)} に設定しました！`, 'success');
  closeSettingsModal();
});

// 予算クリア
elClearBudgetBtn.addEventListener('click', () => {
  monthlyBudget = 0;
  localStorage.removeItem(STORAGE_KEY_BUDGET);
  elMonthlyBudgetInput.value = '';
  updateBudgetDisplay();
  showToast('予算設定を解除しました', 'info');
});

// JSONファイルエクスポート
elExportDataBtn.addEventListener('click', () => {
  const exportPayload = {
    app: 'おこづかい管理アプリ',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    monthlyBudget: monthlyBudget,
    entries: entries
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', dataStr);
  const now = new Date();
  const filename = `okodukai_backup_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.json`;
  dlAnchor.setAttribute('download', filename);
  dlAnchor.click();
  showToast('データをJSONファイルとしてダウンロードしました', 'success');
});

// JSONファイルインポート
elImportDataFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (Array.isArray(data.entries)) {
        if (confirm(`${data.entries.length}件のデータを読み込みます。既存のデータは置き換えられますがよろしいですか？`)) {
          entries = data.entries;
          if (data.monthlyBudget !== undefined) {
            monthlyBudget = Number(data.monthlyBudget) || 0;
            localStorage.setItem(STORAGE_KEY_BUDGET, monthlyBudget.toString());
          }
          saveData();
          updateApp();
          showToast('データを正常に読み込みました！', 'success');
          closeSettingsModal();
        }
      } else {
        showToast('無効なバックアップファイル形式です', 'error');
      }
    } catch (err) {
      console.error('Import parse error:', err);
      showToast('ファイルの読み込みに失敗しました', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // リセット
});

// サンプルデータ復元
elLoadSampleDataBtn.addEventListener('click', () => {
  if (confirm('現在の記録をリセットして、サンプルの収支データを復元しますか？')) {
    entries = getInitialSampleData();
    monthlyBudget = 20000;
    localStorage.setItem(STORAGE_KEY_BUDGET, monthlyBudget.toString());
    saveData();
    updateApp();
    showToast('サンプルデータを復元しました ✨', 'success');
    closeSettingsModal();
  }
});

// 全データ消去
elResetAllDataBtn.addEventListener('click', () => {
  if (confirm('本当にすべての収支データを完全に消去しますか？\n※この操作は取り消せません。')) {
    entries = [];
    saveData();
    updateApp();
    showToast('すべてのデータを消去しました', 'info');
    closeSettingsModal();
  }
});

// ========================================================
// アプリ起動
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  updateApp();
});
