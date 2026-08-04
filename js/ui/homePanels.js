// スマホのホーム画面で、横スワイプ式パネルを分かりやすいタブ操作と同期する。
const TAB_SWIPE_DISTANCE = 36;
const HORIZONTAL_SWIPE_RATIO = 1.2;

function getPanelOffset(scroller, panel) {
  // snap横スクロール内で、対象パネルの左端が scroller 内の何px目にあるかを求める。
  return panel.getBoundingClientRect().left
    - scroller.getBoundingClientRect().left
    + scroller.scrollLeft;
}

function updateActiveTab(tabs, activePanelId) {
  // aria-selected と見た目のクラスを同時に更新し、CSSのインジケーター位置も同期する。
  tabs.forEach(tab => {
    const isActive = tab.dataset.targetPanel === activePanelId;

    tab.setAttribute("aria-selected", String(isActive));
    tab.classList.toggle("is-active", isActive);
  });

  const activeIndex = Math.max(
    tabs.findIndex(tab => tab.dataset.targetPanel === activePanelId),
    0
  );
  tabs[0]
    ?.closest(".home-panel-tabs")
    ?.style.setProperty("--home-panel-tab-index", String(activeIndex));
}

function findNearestPanel(scroller, panels) {
  // スワイプ後の停止位置に一番近いパネルを、現在表示中のパネルとして扱う。
  return panels.reduce((nearest, panel) => {
    const distance = Math.abs(scroller.scrollLeft - getPanelOffset(scroller, panel));
    return distance < nearest.distance
      ? { panel, distance }
      : nearest;
  }, { panel: panels[0], distance: Infinity }).panel;
}

function getPanelIndexById(panels, panelId) {
  return Math.max(
    panels.findIndex(panel => panel.id === panelId),
    0
  );
}

export function initializeHomePanels({
  scroller,
  panels,
  tabs,
}) {
  if (!scroller || panels.length === 0 || tabs.length === 0) return () => {};

  let scrollTimer = null;
  let swipeStart = null;
  const tabContainer = tabs[0]?.closest(".home-panel-tabs") ?? null;

  const activatePanel = (panel, behavior = "smooth") => {
    updateActiveTab(tabs, panel.id);
    scroller.scrollTo({
      left: getPanelOffset(scroller, panel),
      behavior,
    });
  };

  const activateNearestPanel = () => {
    const activePanel = findNearestPanel(scroller, panels);
    updateActiveTab(tabs, activePanel.id);
  };

  const handleScroll = () => {
    // scrollイベントは連続発火するため、落ち着いたタイミングでタブ状態だけ同期する。
    if (scrollTimer !== null) window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(activateNearestPanel, 80);
  };

  const handleTabClick = event => {
    const targetPanel = panels.find(panel => panel.id === event.currentTarget.dataset.targetPanel);
    if (!targetPanel) return;

    activatePanel(targetPanel);
  };

  const handleTabPointerDown = event => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    swipeStart = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleTabPointerUp = event => {
    if (!swipeStart) return;

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = null;

    // 縦スクロールや軽いタップは通常操作に任せ、明確な横スワイプだけを切り替えに使う。
    if (
      Math.abs(deltaX) < TAB_SWIPE_DISTANCE ||
      Math.abs(deltaX) < Math.abs(deltaY) * HORIZONTAL_SWIPE_RATIO
    ) return;

    const activePanelId =
      tabs.find(tab => tab.getAttribute("aria-selected") === "true")?.dataset.targetPanel
      ?? panels[0].id;
    const activeIndex = getPanelIndexById(panels, activePanelId);
    const nextIndex = deltaX < 0
      ? Math.min(activeIndex + 1, panels.length - 1)
      : Math.max(activeIndex - 1, 0);

    if (nextIndex === activeIndex) return;

    event.preventDefault();
    activatePanel(panels[nextIndex]);
  };

  const handleTabPointerCancel = () => {
    swipeStart = null;
  };

  tabs.forEach(tab => {
    tab.classList.toggle("is-active", tab.getAttribute("aria-selected") === "true");
    tab.addEventListener("click", handleTabClick);
  });
  tabContainer?.addEventListener("pointerdown", handleTabPointerDown);
  tabContainer?.addEventListener("pointerup", handleTabPointerUp);
  tabContainer?.addEventListener("pointercancel", handleTabPointerCancel);
  scroller.addEventListener("scroll", handleScroll, { passive: true });
  activateNearestPanel();

  return () => {
    if (scrollTimer !== null) window.clearTimeout(scrollTimer);
    tabs.forEach(tab => tab.removeEventListener("click", handleTabClick));
    tabContainer?.removeEventListener("pointerdown", handleTabPointerDown);
    tabContainer?.removeEventListener("pointerup", handleTabPointerUp);
    tabContainer?.removeEventListener("pointercancel", handleTabPointerCancel);
    scroller.removeEventListener("scroll", handleScroll);
  };
}
