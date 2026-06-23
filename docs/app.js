const searchInput = document.querySelector('#demo-search');
const clearSearchButton = document.querySelector('#clear-search');
const clearHistoryButton = document.querySelector('#clear-history');
const navButtons = [...document.querySelectorAll('[data-view]')];
const historyPanel = document.querySelector('[data-panel="history"]');
const settingsPanel = document.querySelector('[data-panel="settings"]');
const historyList = document.querySelector('#history-list');
const emptyState = document.querySelector('#empty-state');
const toggleButtons = [...document.querySelectorAll('.toggle')];
const segmentButtons = [...document.querySelectorAll('.segmented button')];
const languageButtons = [...document.querySelectorAll('[data-lang]')];
const progress = document.querySelector('#scroll-progress');
const revealItems = [...document.querySelectorAll('.reveal')];
const featureTiles = [...document.querySelectorAll('.feature-tile')];
const appWindow = document.querySelector('#app-window');

let activeView = 'all';
let language = 'ko';

const dictionary = {
  ko: {
    'nav.preview': '미리보기',
    'nav.features': '기능',
    'nav.install': '설치',
    'nav.download': '다운로드',
    'hero.eyebrow': 'macOS Menu Bar Clipboard',
    'hero.title': '필요한 내용은 언제든.',
    'hero.intro': '메뉴바에서 최근 클립보드 기록을 확인하세요. 검색으로 빠르게 찾고, 자주 쓰는 항목은 잠가 두고, 클릭 한 번으로 다시 복사할 수 있습니다.',
    'hero.primary': '다운로드',
    'hero.secondary': 'GitHub에서 보기',
    'preview.eyebrow': 'Designed like a native macOS utility',
    'preview.title': '익숙한 macOS 창 안에, 필요한 기록만.',
    'app.eyebrow': 'Clipboard',
    'app.title': '클립보드 기록',
    'app.clear': '지우기',
    'app.navAll': '전체',
    'app.navLocked': '잠금됨',
    'app.navSettings': '설정',
    'app.search': '히스토리 검색',
    'app.textType': '텍스트',
    'app.delete': '삭제',
    'app.lock': '잠금',
    'app.unlock': '해제',
    'app.noResults': '검색 결과가 없습니다.',
    'app.empty': '잠금 항목만 남았습니다.',
    'app.samplePinned': '문의 감사합니다. 확인 후 다시 안내드리겠습니다.',
    'settings.general': '일반',
    'settings.launch': '로그인 시 실행',
    'settings.launchDesc': 'macOS 로그인 후 자동으로 시작합니다.',
    'settings.shortcut': '단축키',
    'settings.shortcutDesc': '메뉴바에서 창을 빠르게 엽니다.',
    'settings.history': '히스토리',
    'settings.limit': '기록 개수',
    'settings.limitDesc': '저장할 최근 항목 수를 정합니다.',
    'settings.theme': '테마',
    'settings.themeDesc': '시스템 설정에 맞춰 표시합니다.',
    'statement.title': '찾느라 멈추지 말고, 바로 이어가세요.',
    'statement.body': '최근 기록과 잠근 항목을 한곳에서 확인할 수 있습니다. 필요한 내용을 검색하고 선택하면 곧바로 다시 사용할 수 있습니다.',
    'features.searchTitle': '검색',
    'features.searchBody': '방금 복사한 링크부터 이전에 사용한 문장까지, 검색어를 입력하는 즉시 원하는 기록을 찾을 수 있습니다.',
    'features.lockTitle': '잠금',
    'features.lockBody': '자주 쓰는 문장과 링크, 체크리스트는 잠가 두세요. 기록이 정리되어도 그대로 남아 있습니다.',
    'features.settingsTitle': '설정',
    'features.settingsBody': '기록 개수, 텍스트 길이, 자동 닫기, 테마와 언어를 작업 방식에 맞게 조정합니다.',
    'install.title': 'DMG를 내려받고 메뉴바에서 시작하세요.',
    'install.body': '최신 버전을 설치하고 앱을 실행하세요. 이후 복사하는 내용이 자동으로 기록됩니다.',
    'install.cta': '다운로드',
    'install.noticeTitle': '첫 실행이 막히면 이렇게 허용하세요.',
    'install.noticeBody': '이 앱은 Apple Developer ID로 서명되지 않아 macOS가 경고를 표시합니다. 계속하려면 아래 절차로 직접 허용해야 합니다.',
    'install.step1': 'DMG를 열고 Oh My Clipboard를 응용 프로그램 폴더로 드래그합니다.',
    'install.step2': '응용 프로그램에서 앱을 한 번 실행해 macOS 경고를 확인합니다.',
    'install.step3': '시스템 설정 → 개인정보 보호 및 보안에서 아래로 내려 확인 없이 열기를 누른 뒤 다시 엽니다.',
    'install.requirements': '현재 배포판은 Apple Silicon(M1 이상) 및 macOS 12 이상을 지원합니다.',
  },
  en: {
    'nav.preview': 'Preview',
    'nav.features': 'Features',
    'nav.install': 'Install',
    'nav.download': 'Download',
    'hero.eyebrow': 'macOS Menu Bar Clipboard',
    'hero.title': 'Bring back anything you’ve copied, whenever you need it.',
    'hero.intro': 'Access your recent clipboard history from the menu bar. Find items instantly, pin the ones you use often, and copy them again with a single click.',
    'hero.primary': 'Download',
    'hero.secondary': 'View on GitHub',
    'preview.eyebrow': 'Designed like a native macOS utility',
    'preview.title': 'Only the history you need, inside a familiar macOS window.',
    'app.eyebrow': 'Clipboard',
    'app.title': 'Clipboard History',
    'app.clear': 'Clear',
    'app.navAll': 'All',
    'app.navLocked': 'Locked',
    'app.navSettings': 'Settings',
    'app.search': 'Search history',
    'app.textType': 'Text',
    'app.delete': 'Delete',
    'app.lock': 'Lock',
    'app.unlock': 'Unlock',
    'app.noResults': 'No matching history.',
    'app.empty': 'Only locked items remain.',
    'app.samplePinned': 'Thanks for reaching out. I will check and get back to you.',
    'settings.general': 'General',
    'settings.launch': 'Launch at login',
    'settings.launchDesc': 'Start automatically after macOS login.',
    'settings.shortcut': 'Shortcut',
    'settings.shortcutDesc': 'Open the menu bar window quickly.',
    'settings.history': 'History',
    'settings.limit': 'History limit',
    'settings.limitDesc': 'Choose how many recent items to keep.',
    'settings.theme': 'Theme',
    'settings.themeDesc': 'Follow the system appearance.',
    'statement.title': 'Keep working without stopping to search.',
    'statement.body': 'View your recent history and pinned items in one place. Search, select, and reuse what you need in seconds.',
    'features.searchTitle': 'Search',
    'features.searchBody': 'From a link you just copied to a sentence from earlier, start typing to find the right item instantly.',
    'features.lockTitle': 'Lock',
    'features.lockBody': 'Pin frequently used replies, links, and checklists so they remain available even as your history changes.',
    'features.settingsTitle': 'Settings',
    'features.settingsBody': 'Tune history size, text length, auto-hide behavior, theme, and language to match your workflow.',
    'install.title': 'Download the DMG and start from the menu bar.',
    'install.body': 'Install the latest release and open the app. Everything you copy from then on will be saved automatically.',
    'install.cta': 'Download',
    'install.noticeTitle': 'If macOS blocks the first launch',
    'install.noticeBody': 'This app is not signed with an Apple Developer ID, so macOS displays a security warning. Follow these steps to allow it manually.',
    'install.step1': 'Open the DMG and drag Oh My Clipboard into the Applications folder.',
    'install.step2': 'Launch the app once from Applications to trigger the macOS warning.',
    'install.step3': 'Open System Settings → Privacy & Security, scroll down, click Open Anyway, then open the app again.',
    'install.requirements': 'The current release supports Apple Silicon (M1 or later) and macOS 12 or later.',
  },
  ja: {
    'nav.preview': 'プレビュー',
    'nav.features': '機能',
    'nav.install': 'インストール',
    'nav.download': 'ダウンロード',
    'hero.eyebrow': 'macOS Menu Bar Clipboard',
    'hero.title': 'コピーした内容を、必要なときにすぐ取り出せます。',
    'hero.intro': 'メニューバーから最近のクリップボード履歴を確認できます。検索ですばやく見つけ、よく使う項目は固定し、ワンクリックでもう一度コピーできます。',
    'hero.primary': 'ダウンロード',
    'hero.secondary': 'GitHubで見る',
    'preview.eyebrow': 'Designed like a native macOS utility',
    'preview.title': '使い慣れたmacOSウィンドウの中に、必要な履歴だけを。',
    'app.eyebrow': 'Clipboard',
    'app.title': 'クリップボード履歴',
    'app.clear': 'クリア',
    'app.navAll': 'すべて',
    'app.navLocked': 'ロック',
    'app.navSettings': '設定',
    'app.search': '履歴を検索',
    'app.textType': 'テキスト',
    'app.delete': '削除',
    'app.lock': 'ロック',
    'app.unlock': '解除',
    'app.noResults': '一致する履歴がありません。',
    'app.empty': 'ロック項目だけが残っています。',
    'app.samplePinned': 'お問い合わせありがとうございます。確認して折り返しご連絡します。',
    'settings.general': '一般',
    'settings.launch': 'ログイン時に起動',
    'settings.launchDesc': 'macOSログイン後に自動で起動します。',
    'settings.shortcut': 'ショートカット',
    'settings.shortcutDesc': 'メニューバーウィンドウをすばやく開きます。',
    'settings.history': '履歴',
    'settings.limit': '履歴件数',
    'settings.limitDesc': '保存する最近の項目数を選びます。',
    'settings.theme': 'テーマ',
    'settings.themeDesc': 'システムの外観に合わせます。',
    'statement.title': '探すために手を止めず、そのまま作業を続けられます。',
    'statement.body': '最近の履歴と固定した項目を一つの画面で確認できます。必要な内容を検索して選ぶだけで、すぐに再利用できます。',
    'features.searchTitle': '検索',
    'features.searchBody': '直前にコピーしたリンクから以前使った文章まで、キーワードを入力すると必要な履歴がすぐに見つかります。',
    'features.lockTitle': 'ロック',
    'features.lockBody': 'よく使う返信文、リンク、チェックリストを固定しておけば、履歴が整理されてもそのまま残せます。',
    'features.settingsTitle': '設定',
    'features.settingsBody': '履歴件数、文字数、自動非表示、テーマ、言語を作業スタイルに合わせて調整できます。',
    'install.title': 'DMGをダウンロードして、メニューバーから開始。',
    'install.body': '最新バージョンをインストールしてアプリを起動してください。それ以降にコピーした内容は自動的に保存されます。',
    'install.cta': 'ダウンロード',
    'install.noticeTitle': '初回起動がブロックされた場合',
    'install.noticeBody': 'このアプリはApple Developer IDで署名されていないため、macOSに警告が表示されます。次の手順で手動で許可してください。',
    'install.step1': 'DMGを開き、Oh My Clipboardをアプリケーションフォルダへドラッグします。',
    'install.step2': 'アプリケーションから一度起動し、macOSの警告を表示します。',
    'install.step3': 'システム設定 → プライバシーとセキュリティを開いて下へスクロールし、「このまま開く」を押してから再度起動します。',
    'install.requirements': '現在のリリースはApple Silicon（M1以降）とmacOS 12以降に対応しています。',
  },
  zh: {
    'nav.preview': '预览',
    'nav.features': '功能',
    'nav.install': '安装',
    'nav.download': '下载',
    'hero.eyebrow': 'macOS Menu Bar Clipboard',
    'hero.title': '复制过的内容，需要时随时取用。',
    'hero.intro': '从菜单栏查看最近的剪贴板记录。快速搜索所需内容，固定常用项目，并可一键再次复制。',
    'hero.primary': '下载',
    'hero.secondary': '查看 GitHub',
    'preview.eyebrow': 'Designed like a native macOS utility',
    'preview.title': '在熟悉的 macOS 窗口中，只保留需要的记录。',
    'app.eyebrow': 'Clipboard',
    'app.title': '剪贴板记录',
    'app.clear': '清空',
    'app.navAll': '全部',
    'app.navLocked': '锁定',
    'app.navSettings': '设置',
    'app.search': '搜索记录',
    'app.textType': '文本',
    'app.delete': '删除',
    'app.lock': '锁定',
    'app.unlock': '解锁',
    'app.noResults': '没有匹配的记录。',
    'app.empty': '只剩锁定项目。',
    'app.samplePinned': '感谢联系。我会确认后再回复你。',
    'settings.general': '通用',
    'settings.launch': '登录时启动',
    'settings.launchDesc': 'macOS 登录后自动启动。',
    'settings.shortcut': '快捷键',
    'settings.shortcutDesc': '快速打开菜单栏窗口。',
    'settings.history': '记录',
    'settings.limit': '记录数量',
    'settings.limitDesc': '选择要保留的最近项目数量。',
    'settings.theme': '主题',
    'settings.themeDesc': '跟随系统外观。',
    'statement.title': '无需停下来查找，工作保持连贯。',
    'statement.body': '在一个界面中查看最近记录和固定项目。搜索并选择所需内容，即可立即再次使用。',
    'features.searchTitle': '搜索',
    'features.searchBody': '无论是刚刚复制的链接，还是之前使用过的句子，输入关键词即可快速找到。',
    'features.lockTitle': '锁定',
    'features.lockBody': '将常用回复、链接和清单固定保存，即使其他记录被清理，也能随时使用。',
    'features.settingsTitle': '设置',
    'features.settingsBody': '根据工作方式调整记录数量、文本长度、自动隐藏、主题和语言。',
    'install.title': '下载 DMG，从菜单栏开始使用。',
    'install.body': '安装最新版本并启动应用。此后复制的内容将自动保存。',
    'install.cta': '下载',
    'install.noticeTitle': '首次启动被阻止时',
    'install.noticeBody': '此应用未使用Apple Developer ID签名，因此macOS会显示安全警告。请按照以下步骤手动允许。',
    'install.step1': '打开DMG，并将Oh My Clipboard拖到“应用程序”文件夹。',
    'install.step2': '从“应用程序”中启动一次，以显示macOS警告。',
    'install.step3': '打开“系统设置”→“隐私与安全性”，向下滚动并点击“仍要打开”，然后再次启动应用。',
    'install.requirements': '当前版本支持Apple Silicon（M1或更新机型）以及macOS 12或更高版本。',
  },
};

const getItems = () => [...document.querySelectorAll('.history-item')];

const t = (key) => dictionary[language]?.[key] || dictionary.ko[key] || key;

const applyLanguage = () => {
  document.documentElement.lang = language;

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder));
  });

  languageButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.lang === language);
  });

  updateView();
};

const updateDeleteState = (item) => {
  const locked = item.dataset.locked === 'true';
  const lockButton = item.querySelector('[data-action="lock"]');
  const deleteButton = item.querySelector('[data-action="delete"]');

  item.classList.toggle('locked', locked);
  if (lockButton) {
    lockButton.textContent = locked ? t('app.unlock') : t('app.lock');
  }
  if (deleteButton) {
    deleteButton.disabled = locked;
  }
};

const updateView = () => {
  const isSettings = activeView === 'settings';
  const query = (searchInput?.value || '').trim().toLowerCase();
  let visibleCount = 0;

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === activeView);
  });

  if (historyPanel) historyPanel.hidden = isSettings;
  if (settingsPanel) settingsPanel.hidden = !isSettings;
  if (clearHistoryButton) clearHistoryButton.hidden = isSettings;

  if (isSettings) return;

  getItems().forEach((item) => {
    const isLocked = item.dataset.locked === 'true';
    const matchesView = activeView !== 'locked' || isLocked;
    const matchesQuery = !query || (item.textContent || '').toLowerCase().includes(query);
    const visible = matchesView && matchesQuery;

    item.hidden = !visible;
    if (visible) visibleCount += 1;
    updateDeleteState(item);
  });

  if (emptyState) {
    emptyState.hidden = visibleCount > 0;
    emptyState.textContent = getItems().length ? t('app.noResults') : t('app.empty');
  }
};

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeView = button.dataset.view || 'all';
    updateView();
  });
});

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    language = button.dataset.lang || 'ko';
    applyLanguage();
  });
});

searchInput?.addEventListener('input', updateView);

clearSearchButton?.addEventListener('click', () => {
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  updateView();
});

historyList?.addEventListener('click', (event) => {
  const target = event.target;
  const item = target.closest?.('.history-item');
  if (!item) return;

  if (target.closest('.history-copy')) {
    item.classList.add('copied');
    window.setTimeout(() => item.classList.remove('copied'), 420);
    return;
  }

  const action = target.dataset?.action;
  if (action === 'lock') {
    item.dataset.locked = item.dataset.locked === 'true' ? 'false' : 'true';
    updateView();
  }

  if (action === 'delete' && item.dataset.locked !== 'true') {
    item.remove();
    updateView();
  }
});

clearHistoryButton?.addEventListener('click', () => {
  getItems().forEach((item) => {
    if (item.dataset.locked !== 'true') {
      item.remove();
    }
  });
  updateView();
});

toggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const next = !button.classList.contains('on');
    button.classList.toggle('on', next);
    button.setAttribute('aria-pressed', String(next));
  });
});

segmentButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const group = button.closest('.segmented');
    group?.querySelectorAll('button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

const updateScrollProgress = () => {
  if (!progress) return;

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
};

const updateScrollMotion = () => {
  if (!appWindow) return;

  const rect = appWindow.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;
  const distance = rect.top + rect.height / 2 - viewportCenter;
  const normalized = Math.max(Math.min(distance / window.innerHeight, 1), -1);
  const lift = normalized * -28;
  const tilt = normalized * -2.4;

  appWindow.style.setProperty('--scroll-lift', `${lift}px`);
  appWindow.style.setProperty('--scroll-tilt', `${tilt}deg`);
};

const syncRevealState = () => {
  const triggerLine = window.innerHeight * 0.82;

  revealItems.forEach((item) => {
    if (item.classList.contains('is-visible')) {
      return;
    }

    const rect = item.getBoundingClientRect();
    if (rect.top <= triggerLine) {
      item.classList.add('is-visible');
    }
  });
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting || entry.intersectionRatio > 0.08) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  {
    rootMargin: '0px 0px -8%',
    threshold: 0.08,
  }
);

revealItems.forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${Math.min(index * 90, 360)}ms`);
  revealObserver.observe(item);
});

featureTiles.forEach((tile) => {
  tile.addEventListener('pointerenter', () => {
    featureTiles.forEach((item) => item.classList.toggle('is-dimmed', item !== tile));
  });

  tile.addEventListener('pointerleave', () => {
    featureTiles.forEach((item) => item.classList.remove('is-dimmed'));
  });
});

window.addEventListener('scroll', () => {
  updateScrollProgress();
  updateScrollMotion();
  syncRevealState();
}, { passive: true });
window.addEventListener('resize', () => {
  updateScrollProgress();
  updateScrollMotion();
  syncRevealState();
});
window.addEventListener('DOMContentLoaded', () => {
  applyLanguage();
  updateScrollProgress();
  updateScrollMotion();
  syncRevealState();
});
window.addEventListener('load', syncRevealState);
