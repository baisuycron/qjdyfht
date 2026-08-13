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

For the combination-price list, do not provide a last-modified-time query. Query by combination code (exact, max 50 characters) and combination name (fuzzy, max 100 characters); blank fields mean all combinations.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
