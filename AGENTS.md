# Prototype Instructions

当前千金大药房后台组合价原型中，所有后台面向用户的“组合购”文案统一使用“组合价”；商城消费者端仍使用“组合购”。

组合价活动中的每个组合商品均可单独配置“组合单价”；新增选择商品时默认取最新售价，组合单价必须大于 0 且不得高于最新售价。活动级“组合价格”只读展示，并按各商品的“组合单价 × 数量”实时累加。

组合商品表格底部不显示最新售价总价、组合价格或数量合计汇总栏；活动级组合价格仅在表格上方的只读“组合价格”字段展示。

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

ERP 满减满赠类活动在营销入口中拆分为“满减满赠”“满额+XX元换购”“买X送Y”三个独立的只读列表/详情入口，页面复用限时折扣的筛选、表格和详情视觉语言。
“满减满赠”原型数据应覆盖接口中的不同规则形态，包括金额/数量满减、固定赠品、候选赠品任选、任选多件、最低售价赠品，以及条件商品任一满足或全部满足。

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

For the ERP promotion lists, provide activity name (fuzzy, max 100 characters), activity number (exact, max 50 characters), and activity date range. Label activity number as “活动编号” across marketing lists, filters, and details. Add activity type (single-select, with an all option) only to the full-reduction/full-gift list; do not show it for full-amount exchange or buy-X-get-Y. Query applies all visible criteria; reset clears every criterion.

Keep ERP promotion list columns focused on activity identification, time, real-time activity status, store scope, and actions; do not show 活动类型, 优惠规则, or 商品明细 in these lists. For the combination-price list, do not show the 营销类型 column. Keep those rule/type details available on their respective detail pages.

ERP promotion lists also display `最后修改时间` between `适用门店` and `操作`, using the same datetime format as the limited-discount list. This is distinct from the single list-level `活动同步时间` beside the sync control.

The ERP list's `最后修改时间` heading and its full datetime values are left-aligned.

Do not show 商品明细 in any ERP promotion list.

Show an 活动状态 column between 活动时间 and 适用门店 in every ERP promotion list. Calculate it from the current China Standard Time and the activity interval: before starttime is 未开始, from starttime through endtime inclusive is 进行中, and after endtime is 已结束. Do not use a stored status field.

For ERP promotion lists, show only one 活动同步时间: place it to the left of the 同步ERP活动 action in the list card's upper-right whitespace. Do not render it as a repeated table column; a completed sync updates that single displayed timestamp.

The 同步ERP活动 control keeps its idle width while disabled and labelled “同步中...”; do not let its width contract during the sync state.

For combination-price manual ending, use the visible term “结束” consistently: list action, confirmation heading, prompt, confirmation button, and success Toast. The confirmation dialog has no secondary explanatory line.

Apply the same single 活动同步时间 and 同步ERP活动 operation-bar pattern to the limited-discount list: show the timestamp once, immediately left of the control, and never as a repeated table column. In ERP promotion and limited-discount detail cards, omit the secondary “ERP 活动规则” or “活动规则” heading below “基本信息”.

For the limited-discount list, provide query controls for activity name (fuzzy, max 100 characters), activity number (exact, max 50 characters), and discount method (single-select: all, discount rate, promotional price, price reduction). Label this field and its table column “优惠方式”.

Calculate limited-discount activity status from the current China Standard Time and the activity interval: before `starttime` is “未开始”, from `starttime` through `endtime` inclusive is “进行中”, and after `endtime` is “已结束”. Do not display a stored status field.

For the combination-price list, use 活动名称 (fuzzy, max 100 characters), 活动时间, 商品名称 (fuzzy, max 100 characters), and 商品编码 (exact, max 50 characters). Do not expose 活动单号 as a query condition. The activity-time filter matches activities whose effective period overlaps the selected range. Do not provide a last-modified-time query; blank fields mean all combination-price activities.

Across the combination-price and ERP promotion lists, place 活动时间 first in the query bar. Its left edge follows the combination-price filter reference and aligns with the list-table content below.

For the combination-price list, start with 活动名称; do not show 活动单号, 规格/单位, 场景, 组成商品数, or 厂家. Show 活动状态 computed from the current China Standard Time instead. Display activity time as 年月日时分秒, and retain the view action.

The combination-price list provides a 新增组合价 action inside the lower white list/table card, above the table. It opens an interactive local-prototype form for activity title, start/end time, a read-only activity-level 组合价格 derived from the selected products, up to nine combination products, a 500-character description, and save; the form does not distinguish a main product. Adding combination products opens a large 商品选择 dialog with a two-level category cascader and product-name/code filters, 最新售价, checkbox multi-selection, current-page select all, selection preserved across pages, pagination, cancel, and confirm. The 14 px category trigger reads “请选择商品分类”; opening it reveals primary categories on the left and the hovered category's secondary choices on the right. The product-name/code control is also 14 px, and the first table heading is “商品编码”. Confirmation adds every checked product to the form, but the nine-product limit must remain enforced with an explicit over-limit message. Selected combination products are displayed as a detail table with image, code, name, 最新售价, an editable 组合单价 defaulting to 最新售价, specification, a bordered centered quantity input defaulting to 1, and delete action. Each 组合单价 must be greater than 0 and no greater than its 最新售价; the activity-level 组合价格 is recalculated as the sum of 组合单价 × 数量. Center the price, quantity, and operation headings and controls. Label the helper text “组合商品最多可添加9个”. Do not show near-expiry fields in this selected-product table; edited quantities and combination unit prices must be preserved when saving. This explicit prototype decision supersedes the earlier readonly-only boundary for combination price; do not imply that the local prototype already has a production write contract until that contract is confirmed.

千金大药房后台组合价活动是千金大药房商城组合购的唯一活动来源，两端使用同一活动编号和同一套活动、商品、组合单价、数量、组合价格及状态数据；商城不得单独创建、编辑或改写组合价活动。该组合价不接入其他外部系统的组合价数据。后台配置时不区分主商品，每个组合至少包含 2 个、最多包含 9 个商品；每个商品均配置组合单价和数量，活动组合价格按“商品组合单价 × 数量”相加自动得到。交易时若配置商品因下架、停售、删除或库存不足而不可购，商城端隐藏该商品，组合价格保持不变，并按剩余可购商品生成订单。全局下架、停售或删除后剩余具备活动资格的商品少于 2 个时，后台活动自动结束、释放商品促销占用且不自动恢复，原计划结束时间保持不变；仅某一门店库存不足导致少于 2 个时，只在该门店隐藏组合购，不能终止全门店活动，库存恢复且活动仍有效时可恢复展示。

商城组合购与会员价、优惠券、折扣、满减及其他任何营销活动互斥，不参与叠加、比较或择优。未开始和进行中的组合购所含商品不得再参加其他组合购或任何其他促销，已结束活动不占用商品促销资格。只要订单中存在组合购，售后就只能整单退款，不能选择部分商品、部分数量或部分套数。订单商品行成交金额按实际成交商品的门店原价金额（最终履约门店售价 × 每组数量 × 购买套数）占实际成交商品原价总额的比例分摊组合成交总额；金额保留到分，尾差必须通过确定性规则归集，且所有商品行分摊金额之和必须等于组合成交总额。

商城组合商品列表同时支持“加入购物车”和“立即购买”。每点击一次“加入购物车”必须增加 1 套完整组合；同一活动版本、同一履约门店的组合在购物车合并为同一组合行并将套数加 1，购物车角标也按组合套数加 1。加入前按增加后的总套数重新校验活动、门店、商品集合和库存；校验失败不得增加数量。组合行中的商品、数量和价格保持整组绑定，用户不能只勾选、删除或修改其中部分商品。

组合购原价取用户当前选择门店或 LBS 定位门店的实时售价，结算时以最终履约门店为准；地址、定位或门店发生变化必须重新获取可售商品、库存和售价并重新计价。商品原售价在活动期间变化时，活动与固定组合价格均不调整；即使实时原价合计下降至低于组合价格，活动仍继续生效，但商城不得展示优惠、节省或原价划线，只展示固定组合价。商城不限制组合购的单笔购买套数、单用户每日套数或活动周期累计套数，但仍执行商品自身的合规与交易限制。

组合购活动名称与活动单号在商城组合购域内均必须全局唯一，已结束活动也参与唯一性校验。活动名称去除首尾空格后比较；活动单号由服务端生成，生成后永久不可修改或复用。新增和编辑保存时服务端同时校验名称、单号和商品促销冲突。商品只要存在于任一未开始或进行中的组合购或其他促销中即判定冲突，不因活动时间不重叠而放行。

未开始的组合购在商城端不展示活动标识且不生效。进行中的活动才可展示和成交。未开始或进行中的活动均可由后台手动终止；终止后立即失效、商城端立即隐藏，并拒绝所有新订单提交，历史订单和原计划结束时间保持不变。数据库操作日志必须记录终止操作人和终止时间。终止前已创建但未支付的订单允许继续支付至订单自身超时，不自动取消。

组合购订单发生缺货、漏发、破损、召回、配送丢失等单品异常时，系统退款仍只能走整单退款；需要保留订单的单品问题通过补发、客服补偿等独立流程处理，不生成部分退款。部分发货、部分签收或跨仓配送时创建一个整单售后主单，并按包裹/仓库生成履约子任务；在途包裹先拦截、已签收商品按整单范围退回，所有子任务闭环后统一执行整单退款，不得按仓或包裹先行部分退款。未发货且未产生履约服务时退还原始运费和服务费；商家、平台或物流责任时退还原始运费和服务费，拦截及退回费用由责任方承担；用户责任且已开始履约时原始运费和已发生服务费不退，消费者最多承担一次标准退回运费，跨仓拆包新增费用由平台承担；混合责任按商家/平台/物流责任口径处理。所有费用由售后主单统一计算和退款，子任务不得独立退费。新增和编辑允许开始时间早于当前时间，但结束时间必须严格晚于保存时的当前中国标准时间；开始时间早于当前且结束时间有效时，保存后立即进入进行中，不允许创建即结束。

In the 商品选择 dialog, keep 商品编码 on one line: its checkbox-and-code column is 126 px with no wrapping, while 商品名称 takes the remaining width.

The 商品选择 table has no header select-all checkbox. The selector initializes from the form's current combination products, including when all nine slots are filled. Its checked rows remain removable: unchecking a product and confirming synchronizes the form list by removing it while preserving the quantity of every retained item. Clicking an additional unselected row at nine selections leaves the selection unchanged and shows “组合商品最多只能选择9个~” in the page's upper-center area.

In 新增组合价, 活动名称 is empty by default and uses the placeholder “请输入活动名称”. After a save attempt, empty activity name, start time, end time, and combination-price fields receive a red border; each border clears as that individual field is completed.

Each invalid 新增组合价 field displays its own red help text immediately below the control: “请输入活动名称”, “请选择开始时间”, or “请选择结束时间”. The read-only activity-level 组合价格 shows “请添加组合商品” below the control when no products have been selected. Keep the add-product control unstyled and also show the upper-center Toast “请添加组合商品”.

The first four 新增组合价 required rows reserve the error-message height whether or not an error is visible. Their labels use the same 33 px control-line alignment as the input, so showing an error below the field does not shift or misalign the title/input pairs.

Use the custom calendar-and-time picker for 新增组合价 start/end time. Its empty trigger labels are “请选择开始时间” and “请选择结束时间”. The start picker must disable dates after the selected end date and cap its same-day time at the end time; the end picker must disable dates before the selected start date and floor its same-day time at the start time.

The container-level default input style must not override the red `aria-invalid` border for 新增组合价 title or price fields.

Required fields in 新增组合价 (title, start time, end time, combination price, and combination products) show a red `*` before the label; the optional description label has no marker.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

When saved start/end values are not chronological, show the `结束时间必须晚于开始时间` upper-center Toast instead of rendering validation beside the 保存 button.

For combination-price activity actions, derive the normal status from the current China Standard Time and the activity interval, with a manual-termination marker overriding the interval to `已结束`. 未开始 activities support 查看、编辑和终止; 编辑 opens the same full form as 新增组合价 with every field prefilled and editable. 进行中 activities support 查看 and 终止. Both termination paths require confirmation, record the termination time, immediately change the derived status to 已结束, and prevent further mall participation without overwriting the planned end time. 已结束 activities support 查看 only. Keep at least one naturally ended sample activity in the prototype data.

The combination-price 查看 page reuses the 新增组合价 field structure and selected-product table for 活动名称, 开始时间, 结束时间, 组合价格, 组合商品, and 组合描述. It is a read-only form: no product picker, quantity edits, deletion, or save action. The 编辑 page reuses the same components in editable mode so create, edit, and view do not drift into separate field definitions.

后台订单详情的“优惠合计”需要展示该订单实际参与的促销优惠明细，交互参考商城购物车金额明细：有促销明细时支持展开和收起，明细逐项展示促销名称及优惠金额；所有汇总金额和明细金额共用同一右边界，并保留最右侧展开箭头列。优惠券仍作为独立汇总项展示，不并入促销明细。

在保留 ERP 满减满赠类三个独立生产入口的同时，另提供一个只读“四合一营销活动接口”演示模型。该模型按主活动最后修改时间的左闭右开区间查询，支持页码和每页活动数，并用“满减满赠”“满额+XX元换购”“买X送Y”“X元Y件（任选）”四个页签查看同一接口响应；列表保持活动识别、时间、实时状态、门店、最后修改时间和操作列，详情完整展示条件商品与赠送、换购或候选商品明细。

四合一促销试算模型作为独立接口演示入口保留，支持四种活动类型、具体活动选择、订单日期、门店、金额、数量以及条件商品金额、数量和毛利率输入；试算结果逐项展示门槛通过状态、重复优惠次数和优惠结果。页面必须明确标注为“演示口径”，不得把尚未确认的重复次数、毛利率和多条件计算方式描述为生产结算规则。
