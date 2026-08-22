# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

ERP 满减满赠类活动在营销入口中拆分为“满减满赠”“满额+XX元换购”“买X送Y”三个独立的只读列表/详情入口，页面复用限时折扣的筛选、表格和详情视觉语言。
“满减满赠”原型数据应覆盖接口中的不同规则形态，包括金额/数量满减、固定赠品、候选赠品任选、任选多件、最低售价赠品，以及条件商品任一满足或全部满足。

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

For the ERP promotion lists, provide activity name (fuzzy, max 100 characters), activity number (exact, max 50 characters), and activity date range. Label activity number as “活动编号” across marketing lists, filters, and details. Add activity type (single-select, with an all option) only to the full-reduction/full-gift list; do not show it for full-amount exchange or buy-X-get-Y. Query applies all visible criteria; reset clears every criterion.

Keep ERP promotion list columns focused on activity identification, time, real-time activity status, store scope, and actions; do not show 活动类型, 优惠规则, or 商品明细 in these lists. For the combination-price list, do not show the 营销类型 column. Keep those rule/type details available on their respective detail pages.

Do not show 商品明细 in any ERP promotion list.

Show an 活动状态 column between 活动时间 and 适用门店 in every ERP promotion list. Calculate it from the current China Standard Time and the activity interval: before starttime is 未开始, from starttime through endtime inclusive is 进行中, and after endtime is 已结束. Do not use a stored status field.

For the limited-discount list, provide query controls for activity name (fuzzy, max 100 characters), activity number (exact, max 50 characters), and discount method (single-select: all, discount rate, promotional price, price reduction). Label this field and its table column “优惠方式”.

Calculate limited-discount activity status from the current China Standard Time and the activity interval: before `starttime` is “未开始”, from `starttime` through `endtime` inclusive is “进行中”, and after `endtime` is “已结束”. Do not display a stored status field.

For the combination-price list, use 活动单号 (exact, max 50 characters), 活动名称 (fuzzy, max 100 characters), 活动起止时间, 商品名称 (fuzzy, max 100 characters), and 商品编码 (exact, max 50 characters). The activity-time filter matches activities whose effective period overlaps the selected range. Do not provide a last-modified-time query; blank fields mean all combination-price activities.

For the combination-price list, label the first two columns 活动单号 and 活动名称. Do not show 规格/单位, 场景, 组成商品数, or 厂家; show 活动状态 computed from the current China Standard Time instead. Display activity time as 年月日时分秒, and retain the view action.

The combination-price list provides a 新增组合价 action inside the lower white list/table card, above the table. It opens an interactive local-prototype form for activity title, start/end time, a required activity-level 组合价格, up to nine combination products, a 500-character description, and save; the form does not distinguish a main product. Saving with a blank 组合价格 must show an explicit error and must not create the activity. Adding combination products opens a large 商品选择 dialog with a two-level category cascader and product-name/code filters, 最新售价, checkbox multi-selection, current-page select all, selection preserved across pages, pagination, cancel, and confirm. The 14 px category trigger reads “请选择商品分类”; opening it reveals primary categories on the left and the hovered category's secondary choices on the right. The product-name/code control is also 14 px, and the first table heading is “商品编码”. Confirmation adds every checked product to the form, but the nine-product limit must remain enforced with an explicit over-limit message. Selected combination products are displayed as a detail table with image, code, name, 最新售价, specification, a bordered centered quantity input defaulting to 1, and delete action. Center the quantity heading and input, and center the 操作 heading and every 删除 action within that column. Label the helper text “组合商品最多可添加9个”. Do not show combination unit price or near-expiry fields in this selected-product table; the edited quantity must be preserved when saving. This explicit prototype decision supersedes the earlier readonly-only boundary for combination price; do not imply that local creation is supported by the ERP API until a write contract is confirmed.

In the 商品选择 dialog, keep 商品编码 on one line: its checkbox-and-code column is 126 px with no wrapping, while 商品名称 takes the remaining width.

The 商品选择 table has no header select-all checkbox. The selector initializes from the form's current combination products, including when all nine slots are filled. Its checked rows remain removable: unchecking a product and confirming synchronizes the form list by removing it while preserving the quantity of every retained item. Clicking an additional unselected row at nine selections leaves the selection unchanged and shows “组合商品最多只能选择9个~” in the page's upper-center area.

In 新增组合价, 活动名称 is empty by default and uses the placeholder “请输入活动名称”. After a save attempt, empty activity name, start time, end time, and combination-price fields receive a red border; each border clears as that individual field is completed.

Each invalid 新增组合价 field displays its own red help text immediately below the control: “请输入活动名称”, “请选择开始时间”, “请选择结束时间”, or “请输入组合价格”. Do not substitute a generic missing-fields message for these four cases. When the four fields are valid but no combination product was added, leave the add-product control unstyled and show the upper-center Toast “请添加组合商品”.

The first four 新增组合价 required rows reserve the error-message height whether or not an error is visible. Their labels use the same 33 px control-line alignment as the input, so showing an error below the field does not shift or misalign the title/input pairs.

Use the custom calendar-and-time picker for 新增组合价 start/end time. Its empty trigger labels are “请选择开始时间” and “请选择结束时间”. The start picker must disable dates after the selected end date and cap its same-day time at the end time; the end picker must disable dates before the selected start date and floor its same-day time at the start time.

The container-level default input style must not override the red `aria-invalid` border for 新增组合价 title or price fields.

Required fields in 新增组合价 (title, start time, end time, combination price, and combination products) show a red `*` before the label; the optional description label has no marker.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

When saved start/end values are not chronological, show the `结束时间必须晚于开始时间` upper-center Toast instead of rendering validation beside the 保存 button.
