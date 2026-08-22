# 交易模块 Design QA

**Comparison target**

- Source visual truth: authenticated production pages for `#/trade/manage`, `#/trade/refund`, `#/trade/returnProduct`, order detail, refund audit, and return audit. Saved source screenshots are privacy-redacted under `qa/trade-source-*.png`.
- Implementation: `http://127.0.0.1:4173/`, rendered from `src/TradeModule.jsx` and `src/trade.css`.
- Desktop viewport: 1569 × 912 CSS px, device scale factor 1. Source and implementation captures are both 1569 × 912 physical px; no density resampling was required.
- Mobile check: 390 × 844 CSS px, device scale factor 1. Both source and implementation intentionally retain a fixed 1366 px desktop canvas with horizontal overflow.
- State: order list, order detail, refund list, refund audit dialog, return list, return logistics dialog, and return audit dialog.

**Evidence**

- Full-view comparisons:
  - `qa/trade-comparison-order.png`
  - `qa/trade-comparison-refund.png`
  - `qa/trade-comparison-return.png`
  - `qa/trade-comparison-order-detail.png`
- Focused dialog comparisons:
  - `qa/trade-comparison-refund-audit.png`
  - `qa/trade-comparison-return-audit.png`
- Mobile implementation evidence: `qa/trade-prototype-mobile-return.png`.
- Browser interactions tested: tab switching, compact/expanded filters, query/reset, CSV export, seller note edit/save, order detail/back, address expansion, refund detail/audit, return detail/logistics/audit, and local audit-state update.
- Browser console: checked after the final interaction pass; no warnings or errors.

**Findings**

- No actionable P0/P1/P2 differences remain.
- [P3] Icon rendering differs slightly because the implementation uses the project React icon set while the source uses its private icon font. Placement, size, and meaning are preserved.
- [P3] Production customer, order, address, and account values were deliberately replaced with synthetic masked data. This changes row text and natural wrapping but preserves table density and hierarchy without copying sensitive data.

**Required fidelity surfaces**

- Fonts and typography: matched the source system-font stack, compact 12–14 px control/table text, hierarchy, weight, line height, truncation, and non-wrapping brand labels.
- Spacing and layout rhythm: matched the two-tier navigation, 1366 px fixed content canvas, filter grid, tab/filter attachment, table density, card gaps, modal dimensions, and footer positioning.
- Colors and visual tokens: matched the source blue primary actions/navigation, pale page background, white cards, gray borders, muted labels, and semantic status colors.
- Image quality and asset fidelity: three public product thumbnails were copied from the visible source asset bundle; crops, sizing, and transparency treatment are preserved. No source customer/order data was copied.
- Copy and content: reproduced the visible trade labels, tabs, filter names, columns, dialogs, actions, and validation copy; dynamic values are synthetic mock data.

**Comparison history**

- Initial [P1] finding: refund and return pages shared after-sales state, which could expose a refund-shaped row in the return table. Fixed by keying the after-sales page per route; post-fix return list and dialog evidence is in `qa/trade-comparison-return.png` and `qa/trade-comparison-return-audit.png`.
- Initial [P2] finding: after-sales query actions sat one row lower than the source. Fixed the filter grid/action placement; post-fix evidence is in the refund and return full-view comparisons.
- Initial [P2] finding: audit dialogs had incorrect height, field ordering, and footer placement. Fixed the modal flex layout and split refund/return field sets; post-fix evidence is in both focused audit comparisons.
- Initial [P2] finding: return quantity wrapped in the narrow table column. Fixed the column width and no-wrap behavior; post-fix evidence is in `qa/trade-comparison-return.png`.
- Initial [P2] finding: order detail inherited the list scroll position. Added scroll reset on detail entry; post-fix detail capture starts at the expected top position.
- Initial [P2] finding: after-sales rows were too sparse to match source density. Increased synthetic rows to ten; post-fix evidence is in both after-sales full-view comparisons.

**Implementation checklist**

- [x] Match order, refund, and return list composition.
- [x] Reproduce core visible interactions and modal states with mock data.
- [x] Verify desktop and source-style mobile overflow behavior.
- [x] Run production build and Sites packaging tests.
- [x] Check final browser console.

final result: passed

---

# 商品选择弹窗 Design QA

**Comparison target**

- Source visual truth: Browser Comment 1 additional reference attachment, showing the 商品选择 dialog at 1080 × 730 px. The conversation attachment is the source; the app did not expose a local filesystem path for it.
- Implementation screenshot: in-app Browser capture `multiSelectShot`, showing the default multi-select 商品选择 state at 1390 × 912 CSS px and device scale factor 1. The capture is session evidence rather than a filesystem-backed image.
- Density normalization: the dialog itself is 1050 × 710 CSS px in both the source and implementation. Comparison used the dialog content region so the different surrounding viewport and admin shell did not create false findings.
- State: default filters, page 1, 10 items per page, unchecked current-page select-all and row checkboxes, disabled confirm action.

**Evidence**

- Full-view comparison: the user-attached reference and the emitted `finalModalShot` were reviewed together in the active task context.
- Focused comparison: header/filter controls, fixed table columns, row density, thumbnails, scrollbar, pagination, and footer actions were compared at the shared 1050 × 710 dialog size.
- Primary interactions tested: keyword search, reset, current-page select all, individual deselection, next-page navigation, cross-page selection persistence, over-nine validation, batch confirm, dialog close, and nine product rows returned to the form.
- Browser console: checked after the full selection flow; no warnings or errors.

**Findings**

- No actionable P0/P1/P2 differences remain.
- [P3] The dimmed background retains the 千金健康商城 shell rather than the source system page. This is intentional because the dialog is being added to the existing prototype.
- [P3] Product thumbnails reuse the prototype's three existing real medicine images instead of copying the source system's product assets, which were not supplied as individual files. Thumbnail size, crop, and table treatment match the reference.

**Required fidelity surfaces**

- Fonts and typography: retained the existing system-font stack and matched the reference's 18 px dialog title, compact 14 px table text, muted placeholders, and 13 px pagination copy.
- Spacing and layout rhythm: matched the 1050 × 710 dialog, 17 px horizontal inset, compact filters, sticky 47 px table header, 54 px data rows, scrollable table body, 64 px pagination area, and 58 px action footer.
- Colors and visual tokens: matched the white dialog, gray overlay, pale table header, subtle row dividers, blue primary actions, muted disabled confirm state, and restrained borders.
- Image quality and asset fidelity: used real project product imagery with `object-fit: contain`; no drawn placeholders, CSS illustrations, or fake raster assets were introduced.
- Copy and content: matched 商品选择, the category and product keyword controls, 搜索/重置, 本页全选, 选择/商品名称/库存/售价, selection count and limit feedback, total count, pagination, 取消, and 确认.

**Comparison history**

- Initial [P2] finding: product-name cells were rendered as flex table cells, which collapsed the table grid, hid names, and produced oversized row gaps. Fixed by nesting flex wrappers inside normal table cells and assigning stable code, inventory, and price column widths. The post-fix `finalModalShot` shows all names, thumbnails, stock, and prices aligned at reference-like row density.
- Annotation update: the original radio selection was replaced with checkbox multi-selection. A header checkbox now selects or clears every selectable item on the current page, checked items persist across pages, and confirming returns the entire checked batch. Selecting more than the remaining nine-product allowance shows an explicit error and disables confirmation.

**Implementation checklist**

- [x] Match the reference dialog structure and sizing.
- [x] Implement category and product-name/code filters.
- [x] Implement row multi-selection, current-page select all, paging, cancel, and batch confirm.
- [x] Return confirmed products to the combination-price form.
- [x] Verify the primary interaction flow and browser console.

final result: passed

---

# 已选组合商品明细表 Design QA

**Comparison target**

- Source visual truth: Browser Comment 1 additional reference attachment, showing selected combination products as a nine-column editable table. The conversation attachment is the source; the app did not expose a local filesystem path for it.
- Implementation screenshot: in-app Browser capture `finalTableShot`, rendered at 1390 × 912 CSS px and device scale factor 1 after selecting three products.
- State: three selected products with real thumbnails, product metadata, bordered quantity inputs defaulting to 1, and row delete actions.

**Evidence**

- The source attachment and `finalTableShot` were reviewed together for column order, row density, control placement, borders, thumbnails, and surrounding form alignment.
- Browser interactions tested: batch-add three products, edit quantity, delete one row, reload, and recreate the final three-row state.
- Browser console: checked after the final interaction pass; no warnings or errors.

**Findings**

- No actionable P0/P1/P2 differences remain.
- [P3] Product thumbnails reuse the prototype's existing medicine assets rather than the source system's image set, because the reference images were not supplied as individual assets.
- [P3] Quantity uses a native number input with hidden spinner controls so it retains keyboard editing while matching the supplied centered, bordered treatment.

**Required fidelity surfaces**

- Fonts and typography: retained the existing compact system-font treatment and aligned header/body hierarchy with the source table.
- Spacing and layout rhythm: implemented the seven-column table, stable column widths, compact rows, contained thumbnails, centered quantity input, and right-aligned delete action inside the existing responsive form.
- Colors and visual tokens: reused the project's pale header, subtle borders, blue delete action, and blue input focus state.
- Copy and content: matched 商品图片、商品编码、商品名称、参考价(元)、商品规格、数量、操作 and 删除; removed 组合单价 and 近效期商品, and updated the helper to “组合商品最多可添加9个”.
- Responsive behavior: the table remains full-width at the verified desktop viewport and gains horizontal scrolling inside the form at narrower widths without breaking the existing page shell.

**Implementation checklist**

- [x] Replace selected-product tags with an editable detail table.
- [x] Preserve batch selection and the nine-product maximum.
- [x] Make quantity and delete actions functional, with quantity defaulting to 1.
- [x] Center the quantity heading, input control, and input value within the column.
- [x] Center the 操作 heading and each 删除 action within the final column.
- [x] Add a required activity-level 组合价格 input between the date fields and product selection.
- [x] Block saving and show “请输入组合价格” when the price is blank.
- [x] Verify a clean reload produces product specifications and final table layout.
- [x] Run production build, Sites packaging tests, and browser console checks.

final result: passed

---

# 新增组合价 Design QA

**Comparison target**

- Source visual truth: the original user-attached “组合购 › 新增组合购” reference plus the latest Browser Comment 1 annotation requesting a required 组合价格 row between the date fields and product selection.
- Implementation screenshots: in-app Browser captures `finalPriceShot` for the final default form and `priceErrorShot` for the blank-price validation state, emitted from `http://127.0.0.1:4173/`.
- Implementation viewport: 1390 × 912 CSS px, device scale factor 1. The in-app Browser capped the requested 1920 px width, so comparison used the normalized content region and the focused form crop rather than treating the fluid right-side whitespace as a mismatch.
- State: default create form with three selected products and an empty 组合价格 input; validation evidence additionally includes completed dates, one selected product, a red invalid field, and “请输入组合价格”.

**Evidence**

- Full-view evidence: the user-attached reference image and the first in-app Browser form capture were reviewed together in the active task context.
- Focused region evidence: `finalPriceShot` confirms the new row follows the existing 86 px label and 406 px control alignment; `priceErrorShot` confirms the red invalid border and adjacent error copy.
- Browser interactions tested: list-to-create navigation, title/date/description entry, combination-product selection, blank-price save rejection, clearing the error by entering 29.90, successful save, generated activity number, and saved-row insertion at the top of the list.
- Browser console: checked after the complete creation flow; no warnings or errors.

**Findings**

- No actionable P0/P1/P2 differences remain.
- [P3] The project retains the 千金健康商城 brand/sidebar and React icon set rather than copying the source B2C shell; this is intentional because the annotation asks to add the screen to the existing prototype.
- [P3] The implementation uses “组合价” consistently where the reference says “组合购”, matching the current feature terminology.

**Required fidelity surfaces**

- Fonts and typography: retained the existing system-font stack and matched the reference’s compact 14 px form text, muted helper copy, normal label weight, and 12 px counter.
- Spacing and layout rhythm: matched the white form panel, left-aligned 86 px label column, 406 px primary controls, 810 px description field, approximately 50 px row rhythm, and compact save placement. The form remains fluid inside the narrower verified viewport.
- Colors and visual tokens: matched the existing prototype’s blue primary action, white panel, pale page background, gray borders, muted helper text, and restrained focus state.
- Image quality and asset fidelity: the source form contains no raster imagery or custom decorative assets. UI icons use the existing React icon library; no CSS-drawn or placeholder assets were introduced.
- Copy and content: reproduced the requested title, start/end time, combination-product selection, maximum-nine helper, description counter, save action, and combination-price breadcrumb with terminology adapted to “组合价”.

**Comparison history**

- Initial [P2] finding: the form started about 14 px too far right relative to the reference. Reduced the create-panel left padding from 54 px to 40 px; the post-fix `revisedShot` aligns the label and control column more closely.
- Initial [P2] finding: native datetime-local controls rendered a browser-specific Chinese placeholder and a right-side calendar icon, unlike the source’s left clock icon and “请选择日期时间” placeholder. Replaced the visible control treatment with a left clock icon, explicit placeholder, and validated `YYYY-MM-DD HH:mm:ss` entry; post-fix evidence is in `revisedShot`.
- Annotation update: added the activity-level 组合价格 input using the existing form-row sizing and spacing. Blank submission now marks the field invalid and shows “请输入组合价格”; a filled value is persisted in the newly created local activity.

**Implementation checklist**

- [x] Add the list-page “新增组合价” action.
- [x] Match the reference form hierarchy and density inside the existing shell.
- [x] Make product selection, validation, save, and list insertion functional.
- [x] Run the production build and Sites packaging tests.
- [x] Check the final browser console.

final result: passed

---

# Combination price required fields and chronological Toast Design QA

**Comparison target**

- Source visual truth: the current Browser Comment annotations supplied in this task: a red `*` before each required form label and an upper-center error Toast for `结束时间必须晚于开始时间`.
- Implementation evidence: in-app Browser capture from `http://127.0.0.1:4173/` at 1408 × 912 CSS px, plus the accessible DOM snapshot after a same-value start/end save attempt.
- State: title and combination price completed; start and end both `2026-08-22 00:00:00`; no combination products are required to reach the chronological check because it runs first.

**Evidence and comparison**

- Full view: the required star appears before 活动标题、开始时间、结束时间、组合价格、组合商品. 组合描述 remains unmarked, matching the supplied reference.
- Focused state: saving an equal start/end time exposes an `alert` reading `结束时间必须晚于开始时间`; the message is no longer rendered beside 保存.
- Constraint behavior: the custom start/end pickers keep their date and same-day time boundaries; submission also guards the final serialized timestamps.
- Browser console: verified after the interaction; no warnings or errors.

**Findings**

- No actionable P0/P1/P2 differences remain.

**Implementation checklist**

- [x] Mark each required combination-price form label with a red star.
- [x] Leave the optional description label unmarked.
- [x] Convert non-chronological start/end validation to the shared upper-center Toast treatment.
- [x] Verify the final page state and browser console.

final result: passed
