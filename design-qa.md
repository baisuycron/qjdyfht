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

# 角色权限新增页 Design QA

**Comparison target**

- Source visual truth: the two user-attached role-permission references `C:\Users\THUNDE~1\AppData\Local\Temp\codex-clipboard-3d4faafb-515c-4915-b6ed-cdd0768c76d6.png` and `C:\Users\THUNDE~1\AppData\Local\Temp\codex-clipboard-f0f774ee-4c45-4b2f-b694-bb280ab125cf.png`.
- Implementation: `http://localhost:4173/?preview=role-management`, entered through 系统 > 角色管理 > 添加角色, rendered from `src/App.jsx` and `src/role-management.css`.
- Desktop comparison viewport: 2562 × 1347, matching the supplied source image dimensions. States compared were the initial permission-tree position and the scrolled 会员/营销/统计 position.

**Evidence and findings**

- Matched the two-level system navigation, breadcrumb, required 角色名称 input, 20-character counter, fixed permission panel, native permission checkboxes, blue group markers, collapse affordances, action chips, scrollbar density, and 保存/取消 footer.
- Verified the initial state shows 首页 and the beginning of 商品; the permission tree scrolls through additional system modules and reaches 会员、营销、统计 at the reference-like mid-scroll position.
- Verified 全选, 分组/模块/动作 checkbox selection, 全部收起, required-name validation with a red border and message, cancel navigation, create save, and edit reuse of the same form component.
- No actionable P0/P1/P2 visual or interaction issue remains.
- [P3] The production icon font is represented with the project's existing React icon set; icon meaning and placement are preserved.

**Implementation checklist**

- [x] Reproduce the role list shell and system navigation entry.
- [x] Replace the add-role modal with the screenshot-matched full-page permission form.
- [x] Implement scrollable grouped permissions, selection behavior, collapse behavior, validation, create save, and edit reuse.
- [x] Compare top and scrolled permission states at the supplied desktop dimensions.
- [x] Run the production build, Sites packaging tests, and browser console check.

final result: passed

---

# 小程序商城商品试算 Design QA

**Comparison target**

- Source visual reference: the separate read-only `D:\Thunderobot\GitHub\qjdyfsc` 千金商城 project, especially `qa/cart-promotion-groups-implementation.png` and `qa-implementation-home-final.png`.
- Implementation: `http://localhost:4173/?preview=mall-promotion-calculator`, rendered from `src/MallPromotionCalculator.jsx` and `src/mall.css`.
- State: product list, one-item cart, promotion threshold gap, reached promotion list, cart sheet, benefit sheet, and demo checkout notice.

**Evidence and findings**

- The implementation reuses the reference project's green mobile-mall hierarchy, two-column product cards, circular add-to-cart control, quantity stepper, bottom cart total, and bottom-sheet pattern without modifying that project.
- Product selection, quantity updates, cart opening, activity matching, threshold-gap updates, reached-activity benefit details, and the demo checkout notice were verified in the in-app browser.
- No actionable P0/P1/P2 visual or interaction issue remains in the core trial flow.
- Product names, specifications, prices, and the uniform 20% margin are explicitly labelled as demo data because the three promotion tables do not supply those fields.
- Multiple reached promotions are not summed into a payable price. The page shows product total and promotion configuration separately until stacking and preference rules are confirmed.

**Implementation checklist**

- [x] Keep the 千金商城 project read-only.
- [x] Provide activity and ordinary product selection in the standalone trial page.
- [x] Reverse-match database snapshot activities from the selected cart.
- [x] Show reached activities, benefit rows, and near-threshold gaps.
- [x] Verify the cart and benefit bottom-sheet interactions.
- [x] Run the production build and Sites packaging tests.

final result: passed

---

# 适用门店弹窗 Design QA

**Comparison target**

- Source visual truth: `C:\Users\ADMINI~1.DES\AppData\Local\Temp\ScreenShot_2026-08-24_145249_806.png`, supplied as the additional reference image in Browser Comment 1.
- Implementation screenshot: `qa/store-list-modal-implementation.png`.
- Comparison image: `C:\Users\Administrator.DESKTOP-734BMB4\.codex\visualizations\2026\08\24\01a03280-1c18-7ff0-9e49-b0819468f263\store-list-modal-comparison.png`.
- Viewport and normalization: source image is 1000 × 684 px; its 960 × 650 px dialog was cropped and compared beside the implementation's 960 × 650 CSS-pixel dialog at device scale factor 1.
- State: specified-store activity detail with the 适用门店 dialog open, page 1, 20 items per page selected, and close action visible.

**Evidence**

- Full-view comparison: the source and implementation dialog crops were placed side by side in the comparison image.
- Focused comparison: title/header, five-column table, multiline first column, row density, total count, page-size control, pagination, jump-page field, and bottom close action.
- Primary interactions tested: open from 指定门店, change page size, page controls, top-right close, and bottom close.
- Browser console: checked after the final open state; no errors.

**Findings**

- No actionable P0/P1/P2 differences remain.
- [P3] The implementation contains only the stores assigned to the selected activity, so the example has two rows and one page instead of the reference's 50 rows and three pages. This is intentional data fidelity, not layout drift.

**Required fidelity surfaces**

- Fonts and typography: matched the existing system-font stack, 18 px semibold title, compact 13–14 px table and pagination copy, single-line headers, and ellipsis treatment.
- Spacing and layout rhythm: matched the 960 × 650 dialog, 16 px horizontal inset, 60 px header, 48 px table header, 88 px rows, scrollable body, 52 px pagination strip, and 60 px action footer.
- Colors and visual tokens: matched the dim overlay, white dialog, pale gray table header, subtle row dividers, muted controls, and blue active page.
- Image quality and asset fidelity: the reference contains no raster assets beyond the captured UI; the implementation uses the existing icon library for close and pagination icons.
- Copy and content: matched 适用门店、门店、门店名称、门店性质、门店电话、区域、总数、每页条数、前往、页、关闭.

**Comparison history**

- Initial [P1] finding: the generic `.modal` width overrode the custom dialog, producing a 400 px narrow modal with vertically wrapped headers. Fixed with a higher-specificity 960 px dialog rule and reference-matched column tracks.
- Initial [P2] finding: the dialog lacked the reference pagination and jump-page strip. Added total count, page-size selector, previous/next controls, page numbers, jump field, and separate close footer.
- Initial [P2] finding: prefixed phone numbers truncated in the allocated column. Switched the prototype values to eight-digit store phone numbers so the column matches the reference without clipping.

**Implementation checklist**

- [x] Match the reference dialog frame and overlay.
- [x] Match the five-column table and multiline store identity cell.
- [x] Add scrollable body, total count, pagination, jump-page, and close regions.
- [x] Verify open/close behavior and browser console.

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

---

# 小程序商城指定活动试算 Design QA

**Comparison target**

- Source visual truth: `C:\Users\THUNDE~1\AppData\Local\Temp\codex-clipboard-db65dc96-31fd-4db3-b180-55923ad2487c.png`, showing the backend independent-trial activity-type tabs, activity search, and selected-activity control.
- Implementation evidence: in-app Browser capture at `http://localhost:4173/?preview=mall-promotion-calculator`; the current Codex browser session contains the rendered source-comparison state because this browser API does not expose a filesystem screenshot path.
- Source pixels: 1154 × 774 at supplied density. Implementation viewport: 750 × 880 CSS px at device scale factor 1; comparison focused on the activity-selector region rather than the different surrounding page width.
- State: 买X件+XX元换购 selected, activity number search `260205`, activity `2026年买赠，3:1（2602050001011）` selected, one condition product increased to three units, and the current activity reaching its threshold.

**Evidence and comparison**

- Full-view comparison: both source and implementation use a horizontally scrollable activity-type row with per-type counts, followed by activity search and an explicit activity selector. The mobile implementation compresses the same hierarchy vertically inside the existing phone shell.
- Focused comparison: verified active-tab styling, horizontal overflow, search filtering, activity selection, selected-activity banner update, condition/non-condition product refresh, threshold-gap update, and reached-benefit result.
- Fonts and typography: retained the existing 千金商城 system-font hierarchy and compact 10–12 px selector labels appropriate to the mobile shell.
- Spacing and layout rhythm: the selector occupies 126 px between the activity banner and product grid; controls remain fully visible and the product list keeps an independent scroll area.
- Colors and visual tokens: active selection uses the existing teal mall token while inactive tabs and counts use restrained gray values.
- Image quality and asset fidelity: product cards continue using the project's existing medicine image assets with contained cropping; the selector introduces no replacement raster or drawn assets.
- Copy and content: labels use the database play classifications, actual activity names, activity numbers, 条件商品, 非条件商品, 已达标权益, and 未达标差额.

**Findings**

- No actionable P0/P1/P2 visual or interaction issue remains in the selected-activity trial flow.
- [P3] The native activity select can contain hundreds of records for large classifications; the preceding search reduces the practical list, but a production implementation may eventually benefit from a virtualized searchable selector.

**Comparison history**

- Initial [P1] finding: the玩法 row was generated only from activities already matching the selected date and store, so six database玩法 disappeared completely rather than remaining selectable. Fixed by sourcing the tabs and counts from the complete 1,382-activity snapshot and applying date/store only during the selected activity's trial calculation. Post-fix browser evidence exposes all ten玩法, including the far-right “无优惠商品结果 24”, and retains horizontal tab navigation.

**Implementation checklist**

- [x] Replace product-category tabs with play-classification tabs and counts.
- [x] Add real-activity search and explicit activity selection.
- [x] Rebuild the catalog from the selected activity's condition and benefit data plus demo non-condition products.
- [x] Restrict calculation to the selected activity.
- [x] Verify activity switching, search, selection, threshold gap, and reached-benefit states in the in-app Browser.
- [x] Run the production build and Sites packaging tests.

final result: passed
