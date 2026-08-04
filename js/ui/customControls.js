// OS標準UIに依存しない、ProbPlan共通のselect/date入力を描画する。
const ENHANCED_SELECT = "data-custom-select-ready";
const ENHANCED_DATE = "data-custom-date-ready";
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

let openPopover = null;

function closeOpenPopover() {
  openPopover?.();
  openPopover = null;
}

function positionPopover(anchor, popover, { minWidth = 0 } = {}) {
  const margin = 8;
  const anchorRect = anchor.getBoundingClientRect();

  popover.style.minWidth = `${Math.max(anchorRect.width, minWidth)}px`;
  popover.style.maxWidth = `calc(100vw - ${margin * 2}px)`;
  popover.style.left = "0px";
  popover.style.top = "0px";

  const popoverRect = popover.getBoundingClientRect();
  const availableBelow = window.innerHeight - anchorRect.bottom - margin;
  const availableAbove = anchorRect.top - margin;
  const shouldOpenAbove =
    popoverRect.height > availableBelow &&
    availableAbove > availableBelow;
  const top = shouldOpenAbove
    ? Math.max(margin, anchorRect.top - popoverRect.height - 6)
    : Math.min(anchorRect.bottom + 6, window.innerHeight - popoverRect.height - margin);
  const left = Math.min(
    Math.max(anchorRect.left, margin),
    window.innerWidth - popoverRect.width - margin
  );

  popover.style.left = `${left}px`;
  popover.style.top = `${Math.max(margin, top)}px`;
  popover.style.maxHeight = `${Math.max(12, shouldOpenAbove ? availableAbove : availableBelow)}px`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDate(value) {
  if (!DATE_FORMAT.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function dispatchChange(element) {
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function enhanceSelect(select) {
  if (select.hasAttribute(ENHANCED_SELECT)) return;
  select.setAttribute(ENHANCED_SELECT, "true");

  const wrapper = document.createElement("span");
  const button = document.createElement("button");
  const menu = document.createElement("span");

  wrapper.className = `custom-select relative inline-block min-w-0 ${select.classList.contains("mt-2") ? "mt-2" : ""} ${select.classList.contains("w-full") ? "w-full" : ""}`.trim();
  button.type = "button";
  button.className = "custom-select-button flex w-full items-center justify-between gap-2 rounded-md border border-[var(--color-text)]/10 bg-[var(--color-field)] px-3 py-2 text-left text-sm";
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");

  menu.className = "custom-select-menu fixed z-[70] hidden overflow-y-auto rounded-md border border-[var(--color-text)]/10 bg-[var(--color-surface)] p-1";
  menu.setAttribute("role", "listbox");

  select.classList.add("custom-native-control");
  select.after(wrapper);
  wrapper.append(select, button);

  const updateButton = () => {
    const selected = select.selectedOptions[0];
    button.innerHTML = `
      <span class="truncate">${selected?.textContent ?? ""}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    `;
  };

  const closeMenu = () => {
    menu.classList.add("hidden");
    menu.remove();
    button.setAttribute("aria-expanded", "false");
    document.removeEventListener("pointerdown", handleOutside);
    document.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("resize", closeMenu);
    window.removeEventListener("scroll", closeMenu, true);
  };

  const openMenu = () => {
    closeOpenPopover();
    openPopover = closeMenu;
    menu.innerHTML = [...select.options].map(option => `
      <button
        type="button"
        class="custom-select-option flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-text)]/5"
        role="option"
        data-value="${option.value}"
        aria-selected="${option.selected}"
      >
        <span>${option.textContent}</span>
        ${option.selected ? "✓" : ""}
      </button>
    `).join("");
    document.body.appendChild(menu);
    menu.classList.remove("hidden");
    positionPopover(button, menu);
    button.setAttribute("aria-expanded", "true");
    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
  };

  function handleOutside(event) {
    if (wrapper.contains(event.target) || menu.contains(event.target)) return;
    closeMenu();
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      closeMenu();
      button.focus();
    }
  }

  button.addEventListener("click", () => {
    if (button.getAttribute("aria-expanded") === "true") {
      closeMenu();
      return;
    }

    openMenu();
  });

  menu.addEventListener("click", event => {
    const optionButton = event.target.closest(".custom-select-option");
    if (!optionButton) return;

    select.value = optionButton.dataset.value;
    updateButton();
    closeMenu();
    dispatchChange(select);
  });

  select.addEventListener("change", updateButton);
  updateButton();
}

function renderCalendar(menu, input, viewedDate) {
  const selectedDate = parseDate(input.value);
  const firstDay = new Date(viewedDate.getFullYear(), viewedDate.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(viewedDate.getFullYear(), viewedDate.getMonth() + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < startOffset; index++) {
    cells.push("<span></span>");
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewedDate.getFullYear(), viewedDate.getMonth(), day);
    const value = formatDate(date);
    const isSelected = selectedDate && formatDate(selectedDate) === value;

    cells.push(`
      <button
        type="button"
        class="custom-date-day rounded-md px-2 py-1 text-sm transition-colors hover:bg-[var(--color-text)]/10 ${isSelected ? "is-selected" : ""}"
        data-date="${value}"
        aria-pressed="${Boolean(isSelected)}"
      >
        ${day}
      </button>
    `);
  }

  menu.innerHTML = `
    <div class="flex items-center justify-between gap-3">
      <button type="button" class="custom-date-prev rounded-md p-1.5 hover:bg-[var(--color-text)]/10" aria-label="前の月">‹</button>
      <span class="text-sm font-medium">${viewedDate.getFullYear()} / ${viewedDate.getMonth() + 1}</span>
      <button type="button" class="custom-date-next rounded-md p-1.5 hover:bg-[var(--color-text)]/10" aria-label="次の月">›</button>
    </div>
    <div class="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-[var(--color-muted)]">
      ${["日", "月", "火", "水", "木", "金", "土"].map(day => `<span>${day}</span>`).join("")}
    </div>
    <div class="mt-1 grid grid-cols-7 gap-1">
      ${cells.join("")}
    </div>
    <button type="button" class="custom-date-clear mt-3 w-full rounded-md px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-text)]/5">
      日付をクリア
    </button>
  `;
}

function enhanceDateInput(input) {
  if (input.hasAttribute(ENHANCED_DATE)) return;
  input.setAttribute(ENHANCED_DATE, "true");

  const wrapper = document.createElement("span");
  const menu = document.createElement("span");
  let viewedDate = parseDate(input.value) ?? new Date();

  const hasTopMargin = input.classList.contains("mt-2");
  wrapper.className = `custom-date relative min-w-0 ${input.classList.contains("w-full") ? "block w-full" : "inline-block"} ${hasTopMargin ? "mt-2" : ""}`.trim();
  menu.className = "custom-date-menu fixed z-[80] hidden w-72 overflow-y-auto rounded-md border border-[var(--color-text)]/10 bg-[var(--color-surface)] p-3";

  input.type = "text";
  input.inputMode = "numeric";
  input.placeholder ||= "YYYY-MM-DD";
  input.autocomplete = "off";
  input.classList.add("custom-date-input");
  if (hasTopMargin) input.classList.remove("mt-2");
  input.after(wrapper);
  wrapper.append(input);

  const closeMenu = () => {
    menu.classList.add("hidden");
    menu.remove();
    document.removeEventListener("pointerdown", handleOutside);
    document.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("resize", closeMenu);
    window.removeEventListener("scroll", closeMenu, true);
  };

  const openMenu = () => {
    closeOpenPopover();
    openPopover = closeMenu;
    viewedDate = parseDate(input.value) ?? viewedDate;
    renderCalendar(menu, input, viewedDate);
    document.body.appendChild(menu);
    menu.classList.remove("hidden");
    positionPopover(input, menu, { minWidth: 288 });
    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
  };

  function handleOutside(event) {
    if (wrapper.contains(event.target) || menu.contains(event.target)) return;
    closeMenu();
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      closeMenu();
      input.focus();
    }
  }

  input.addEventListener("focus", openMenu);
  input.addEventListener("click", openMenu);

  menu.addEventListener("click", event => {
    const previous = event.target.closest(".custom-date-prev");
    const next = event.target.closest(".custom-date-next");
    const day = event.target.closest(".custom-date-day");
    const clear = event.target.closest(".custom-date-clear");

    if (previous) {
      viewedDate = new Date(viewedDate.getFullYear(), viewedDate.getMonth() - 1, 1);
      renderCalendar(menu, input, viewedDate);
      positionPopover(input, menu, { minWidth: 288 });
      return;
    }

    if (next) {
      viewedDate = new Date(viewedDate.getFullYear(), viewedDate.getMonth() + 1, 1);
      renderCalendar(menu, input, viewedDate);
      positionPopover(input, menu, { minWidth: 288 });
      return;
    }

    if (day) {
      input.value = day.dataset.date;
      closeMenu();
      dispatchChange(input);
      return;
    }

    if (clear) {
      input.value = "";
      closeMenu();
      dispatchChange(input);
    }
  });
}

export function initializeCustomControls(root = document) {
  root.querySelectorAll("select").forEach(enhanceSelect);
  root.querySelectorAll('input[type="date"]').forEach(enhanceDateInput);
}
