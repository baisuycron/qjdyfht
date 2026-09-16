# Prototype Instructions

当前千金大药房后台组合价原型中，所有后台面向用户的“组合购”文案统一使用“组合价”；商城消费者端仍使用“组合购”。

组合价活动中的每个组合商品均可单独配置“组合单价”；新增选择商品时默认取最新售价，组合单价必须大于 0、最多两位小数，新增配置时不得高于最新售价；后续商品降价后，编辑保存不按最新售价重新校验组合单价上限。活动级“组合价格”只读展示，并按各商品的“组合单价 × 数量”实时累加。

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

For the combination-price list, use 活动名称 (fuzzy, max 100 characters), 活动状态 (全部、启用、停用), 商品名称 (fuzzy, max 100 characters), and 商品编码 (exact, max 50 characters). Do not expose 活动单号、活动时间 or last-modified time as query conditions; blank fields mean all combination-price activities.

The combination-price query bar starts with 活动名称. ERP promotion lists retain their own activity-time-first layout.

For the combination-price list, start with 活动名称; do not show 活动单号, 活动时间, 规格/单位, 场景, 组成商品数, or 厂家. Show only the stored two-state 活动状态（启用、停用）and retain the view action.

The combination-price list provides a 新增组合价 action inside the lower white list/table card, above the table. It opens an interactive local-prototype form for activity title, a required activity image, a read-only activity-level 组合价格 derived from the selected products, up to nine combination products, a 500-character description, and save; it has no start or end time and does not distinguish a main product. The activity image sits between 活动名称 and 组合价格, has a red required marker, accepts only JPG/JPEG/PNG files of at most 2M, and previews the selected image; it is required on save and is displayed read-only in 查看. Clicking its upload tile opens an image-picker dialog with 我的图库 and 本地上传 tabs. The library tab offers category filtering, selectable image cards, cancel, and 使用选中的图片; the local-upload tab applies the same file-type and size checks before its selected image can be used. Adding combination products opens a large 商品选择 dialog with a two-level category cascader and product-name/code filters, 最新售价, checkbox multi-selection, current-page select all, selection preserved across pages, pagination, cancel, and confirm. The 14 px category trigger reads “请选择商品分类”; opening it reveals primary categories on the left and the hovered category's secondary choices on the right. The product-name/code control is also 14 px, and the first table heading is “商品编码”. Confirmation adds every checked product to the form, but the nine-product limit must remain enforced with an explicit over-limit message. Selected combination products are displayed as a detail table with image, code, name, 最新售价, an editable 组合单价 defaulting to 最新售价, specification, a bordered centered quantity input defaulting to 1, and delete action. Each 组合单价 must be greater than 0 with at most two decimal places and, on initial configuration, no greater than its 最新售价; subsequent product price reductions do not trigger revalidation of that ceiling when editing and saving; the activity-level 组合价格 is recalculated as the sum of 组合单价 × 数量. Center the price, quantity, and operation headings and controls. Label the helper text “组合商品最多可添加9个”. Do not show near-expiry fields in this selected-product table; edited quantities and combination unit prices must be preserved when saving. This explicit prototype decision supersedes the earlier readonly-only boundary for combination price; do not imply that the local prototype already has a production write contract until that contract is confirmed.

千金大药房后台组合价活动是千金大药房商城组合购的唯一活动来源，两端使用同一活动编号和同一套活动、商品、组合单价、数量、组合价格及状态数据；商城不得单独创建、编辑或改写组合价活动。该组合价不接入其他外部系统的组合价数据。后台配置时不区分主商品，每个组合至少包含 2 个、最多包含 9 个商品；每个商品均配置组合单价和数量，活动组合价格按“商品组合单价 × 数量”相加自动得到。单品仅在普通销售渠道下架不影响组合价；任一组成单品被停用或删除时，组合价自动变为停用且不自动恢复。仅某一门店库存不足时，只在该门店隐藏组合购，不能停用全门店活动；库存恢复且活动仍为启用时可恢复展示。

商城组合购与会员价、优惠券、折扣、满减及其他任何营销活动互斥，不参与叠加、比较或择优。同一商品允许同时参与两个或以上不同的启用组合价活动，组合价活动之间不构成商品促销冲突；与组合购以外其他促销的互斥规则保持不变，停用活动不占用商品促销资格。只要订单中存在组合购，售后就只能整单退款，不能选择部分商品、部分数量或部分套数。组合购商品行成交金额直接按“组合单价 × 每套数量 × 购买套数”计算，各组合商品行成交金额之和等于组合成交总额；不按门店原价比例重新分摊，不做分摊尾差处理。

商城组合商品列表同时支持“加入购物车”和“立即购买”。每点击一次“加入购物车”必须增加 1 套完整组合；同一活动版本、同一履约门店的组合在购物车合并为同一组合行并将套数加 1，购物车角标也按组合套数加 1。加入前按增加后的总套数重新校验活动、门店、商品集合和库存；校验失败不得增加数量。组合行中的商品、数量和价格保持整组绑定，用户不能只勾选、删除或修改其中部分商品。

组合购原价取用户当前选择门店或 LBS 定位门店的实时售价，结算时以最终履约门店为准；地址、定位或门店发生变化必须重新获取可售商品、库存和售价并重新计价。商品原售价在活动期间变化时，活动与固定组合价格均不调整；即使实时原价合计下降至低于组合价格，活动仍继续生效，但商城不得展示优惠、节省或原价划线，只展示固定组合价。商城不限制组合购的单笔购买套数、单用户每日套数或活动周期累计套数，但仍执行商品自身的合规与交易限制。

组合购活动名称不做唯一性限制，允许重名，不因启用、停用或删除状态限制名称复用。活动单号在商城组合购域内全局唯一，由服务端生成，生成后永久不可修改或复用。新增和编辑保存时服务端校验单号和商品促销冲突，不校验活动名称唯一性。商品参与其他组合价活动不判定冲突；商品参与组合购以外的其他促销时仍判定冲突。

组合购只保留启用、停用两种活动状态，不再使用开始时间、结束时间、未开始、进行中或已结束。启用活动可展示和成交，操作栏提供“停用”；停用活动立即从商城隐藏并拒绝新订单，操作栏提供“启用”，点击后恢复为启用。状态切换需记录操作人和操作时间；切换前已创建但未支付的订单允许继续支付至订单自身超时，不自动取消。

组合购订单发生缺货、漏发、破损、召回、配送丢失等单品异常时，系统退款仍只能走整单退款；需要保留订单的单品问题通过补发、客服补偿等独立流程处理，不生成部分退款。部分发货、部分签收或跨仓配送时创建一个整单售后主单，并按包裹/仓库生成履约子任务；在途包裹先拦截、已签收商品按整单范围退回，所有子任务闭环后统一执行整单退款，不得按仓或包裹先行部分退款。未发货且未产生履约服务时退还原始运费和服务费；商家、平台或物流责任时退还原始运费和服务费，拦截及退回费用由责任方承担；用户责任且已开始履约时原始运费和已发生服务费不退，消费者最多承担一次标准退回运费，跨仓拆包新增费用由平台承担；混合责任按商家/平台/物流责任口径处理。所有费用由售后主单统一计算和退款，子任务不得独立退费。

In the 商品选择 dialog, keep 商品编码 on one line: its checkbox-and-code column is 126 px with no wrapping, while 商品名称 takes the remaining width.

The 商品选择 table has no header select-all checkbox. The selector initializes from the form's current combination products, including when all nine slots are filled. Its checked rows remain removable: unchecking a product and confirming synchronizes the form list by removing it while preserving the quantity of every retained item. Clicking an additional unselected row at nine selections leaves the selection unchanged and shows “组合商品最多只能选择9个~” in the page's upper-center area.

In 新增组合价, 活动名称 is empty by default and uses the placeholder “请输入活动名称”. After a save attempt, empty activity name and combination-price fields receive a red border; each border clears as that individual field is completed.

Each invalid 新增组合价 field displays its own red help text immediately below the control. The activity-name message is “请输入活动名称”; the read-only activity-level 组合价格 shows “请添加组合商品” below the control when no products have been selected. Keep the add-product control unstyled and also show the upper-center Toast “请添加组合商品”.

The required 新增组合价 rows reserve the error-message height whether or not an error is visible. Their labels use the same 33 px control-line alignment as the input, so showing an error below the field does not shift or misalign the title/input pairs.

The container-level default input style must not override the red `aria-invalid` border for 新增组合价 title or price fields.

Required fields in 新增组合价 (title, activity image, combination price, and combination products) show a red `*` before the label; the optional description label has no marker.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

For combination-price activity actions, use only the stored 启用、停用 status. Both statuses support 查看 and the corresponding 启用 or 停用 action. Only 停用 activities may be edited or deleted; hide 编辑 and 删除 for 启用 activities. An 启用 activity must be disabled before editing or deleting. List actions appear in the order 查看、编辑、启用/停用、删除. Both 启用 and 停用 use the standard blue action color; 删除 remains red. Clicking 启用 changes the status immediately. Clicking 停用 opens a confirmation dialog; only confirmation changes the status. A completed status change records the operator and operation time, and shows “活动已启用” or “活动已停用”. Deletion requires a confirmation and removes the activity from the local list.

The combination-price list shows 活动名称、组合价格、活动状态、操作 in that order. Its 组合价格 cell is the current activity's `combinationPrice`, formatted to two decimal places exactly as on the activity detail page.

The combination-price 查看 page reuses the 新增组合价 field structure and selected-product table for 活动名称, 组合价格, 组合商品, and 组合描述. It is a read-only form: no product picker, quantity edits, deletion, or save action. The 编辑 page reuses the same components in editable mode so create, edit, and view do not drift into separate field definitions.

后台订单详情的“优惠合计”需要展示该订单实际参与的促销优惠明细，交互参考商城购物车金额明细：有促销明细时支持展开和收起，明细逐项展示促销名称及优惠金额；所有汇总金额和明细金额共用同一右边界，并保留最右侧展开箭头列。优惠券仍作为独立汇总项展示，不并入促销明细。

在保留 ERP 满减满赠类三个独立生产入口的同时，另提供一个只读“四合一营销活动接口”演示模型。该模型按主活动最后修改时间的左闭右开区间查询，支持页码和每页活动数，并用“满减满赠”“满额+XX元换购”“买X送Y”“X元Y件（任选）”四个页签查看同一接口响应；列表保持活动识别、时间、实时状态、门店、最后修改时间和操作列，详情完整展示条件商品与赠送、换购或候选商品明细。

四合一促销试算模型作为独立接口演示入口保留，支持四种活动类型、具体活动选择、订单日期、门店、金额、数量以及条件商品金额、数量和毛利率输入；试算结果逐项展示门槛通过状态、重复优惠次数和优惠结果。页面必须明确标注为“演示口径”，不得把尚未确认的重复次数、毛利率和多条件计算方式描述为生产结算规则。
When an activity image is present, its removal button must be fully visible above the image's top-right corner. Leave 20 px between the activity-image row and the following combination-price row so the combination price, goods, table, and form actions are visually separated from the image block.
The activity-image form shows no separate “从图库选择图片” or “更换图片” text action: the empty upload tile alone opens the picker, while an existing image is removed with its top-right delete control. Display the format hint as “支持 JPG/PNG 格式，最大 2M”.
The combination-price list reserves 24% for 操作 and 35% for 活动状态, placing the 操作 header and action group toward the right edge while keeping 查看、编辑、启用/停用、删除 on one line.

The 适用门店 dialog provides separate 门店名称 and 门店编码 inputs with contains-style fuzzy matching. Query and reset apply to the scoped store list, reset pagination to page 1, and update the displayed result count.

限时折扣的列表、筛选和详情中，将活动唯一标识统一标注为“活动单号”。

限时折扣的活动单号筛选为精确查询；提交查询时忽略输入值的首尾空格。

限时折扣的门店名称筛选使用可搜索的单选门店选择器：输入展示匹配门店，从结果中选择后以可清除标签显示；查询仅使用已选择的门店。

限时折扣门店名称筛选的匹配结果只展示门店名称，不展示门店编码。

限时折扣门店名称筛选在已有选中门店时，点击该标签应切回输入框并展开完整门店列表，当前选中门店在列表中高亮，以便重新选择。

重新打开已选门店的输入框时，输入框继续显示上次所选门店；仅在从列表确认新门店后更新选择。

点击限时折扣门店选择器的清空按钮时，清除门店信息并收起下拉列表。

限时折扣筛选中的活动状态和优惠方式不提供“全部”选项；未选择时显示“请选择”并代表查询全部。已选择的值支持通过右侧清空按钮恢复为“请选择”。

限时折扣的活动状态和优惠方式在已选状态默认显示下拉箭头；仅在鼠标移入或键盘聚焦时显示右侧清空按钮。

组合价/组合购需求确认（2026-09-07）：
- 每次进入购物车时刷新组合购活动及其商品、价格和状态数据；不采用此前建议的“旧版本必须由用户确认后重新加入”作为既定规则。仍保留加购和结算时的有效性、库存校验。
- 只有活动停用后才允许编辑，启用中的活动不能直接编辑。此规则覆盖旧的“两种状态均可编辑”约定；重新启用的具体校验条件未由本次答复补充确认。
- 商品降价后，编辑保存不用按最新售价重新校验组合单价上限；组合单价仍必须大于 0，最多两位小数。
- 活动名称不做唯一性限制；活动单号的唯一、不可修改和不可复用规则保持有效。
- 组合购与普通商品可以一起结算；只要本单包含组合购，整单不能使用优惠券。组合购商品不与其他营销叠加，包含组合购的订单仍只支持整单退款。
- 商品自身限购约束组合购买套数：某商品限购 3 件、每套含 2 件时最多买 1 套；限购 1 件、每套含 2 件时无法购买，并提示“某商品已达购买上限”（某商品替换为实际商品名称）。商品数量与购买套数均为正整数。
- 金额采用组合单价直接计算：每套组合价格＝Σ（组合单价 × 每套数量）；组合购商品行成交金额＝组合单价 × 每套数量 × 购买套数，组合成交总额为各组合商品行成交金额之和。组合单价最多两位小数，数量和套数为正整数；取消此前按门店原价比例分摊及尾差补分规则。
- 门店原价仅用于商城原价展示和优惠展示判断，不参与组合成交金额计算；即使门店原价总额为 0，也不将固定组合成交金额或商品行成交金额改为 0。本次直接按组合单价计价的确认覆盖此前“原价总额为 0 时就 0 元”的分摊讨论。
组合价活动只有停用后才允许编辑活动及组成商品或删除；启用时隐藏编辑、删除入口，表单与数据更新逻辑同时执行状态限制。启用时保留查看、停用按钮。
点击组合价列表的停用按钮时，复用删除确认弹窗的布局和样式，标题为“停用组合价活动”，提示为“确认停用‘活动名称’吗？”（活动名称使用实际值），按钮为取消、停用，右上角可关闭；不显示删除不可恢复文案或次级说明。确认后才切换为停用并记录操作人、操作时间和显示“活动已停用”；取消或关闭不改变活动状态。
同一商品允许同时参加多个不同组合价活动，后台商品选择与保存均不得因已参与其他组合价而拦截。商城商品详情的优惠组合展示需支持该商品关联的多个可售组合购活动，每个活动独立使用自己的商品集合、组合单价、数量、组合价格和状态；不能只取一个活动，也不能将不同活动混为一个组合。具体展示布局需基于商城现有页面进一步调整。
组合价活动停用确认弹窗的主按钮文案使用“确认”，点击后执行停用；标题及确认提示仍使用“停用”。
组合价活动启用也必须弹窗确认：标题为启用组合价活动，提示确认启用具体活动，按钮为取消和确认；只有点击确认才切换状态，取消或关闭不改变状态。
组合价列表在“活动名称”和“组合价格”之间增加“组合商品种类”列，按活动 itemList 中不同商品标识的数量实时统计，不累加每种商品的配置件数；新增或编辑商品后同步更新。本规则覆盖此前列表不展示组成商品数的约定。
组合价列表的活动状态筛选去掉“全部”选项，仅提供“启用”和“停用”；初始及重置后显示“请选择”，空值代表不限制活动状态。
组合价的活动状态查询复用限时折扣的可清空下拉组件：选中后，鼠标移入或键盘聚焦时右侧显示清空按钮；点击清空恢复“请选择”并收起下拉列表，查询时空值表示不限制状态。
组合价活动图片建议尺寸 700×700，文件最大 10M，支持 GIF、PNG、JPG/JPEG（兼容 jepg 扩展名）、BMP，最多 1 张；表单及本地上传提示统一为“建议尺寸 700×700，图片文件最大10M；支持 gif、png、jpg、jepg、bmp；最多 1 张。”，上传格式与大小校验同步执行。覆盖旧的 JPG/PNG、2M 限制，建议尺寸不作为强制校验。

组合购商城搜索需求确认（2026-09-09）：
- 搜索可通过活动名称或任一组成商品名称命中对应组合活动。
- 商品名称采用全模糊匹配，匹配字段为“商品名称”。活动名称的具体匹配方式尚未确认。
- 同一活动不做去重；按用户确认口径“不用去重，该展示多少就展示多少”，不得擅自增加按活动单号去重的规则。
- 同一商品关联多个组合时，返回该商品关联的所有符合当前门店可售条件的组合，每个活动独立展示。
- 组合独立检索和判断可售性。普通渠道下架的组成商品，其名称仍可用于命中可售组合；活动停用、删除或当前门店不足一套库存时不展示。
- 默认排序采用“组合优先”。价格/销量排序下是否仍组合优先、跨分页规则及商品编码是否参与搜索尚未确认。

满减满赠入口需求确认（2026-09-09）：现有满减满赠列表统一容纳截图四类促销：满减满赠、满额+XX元换购、买X件+XX元换购、买X送Y，提供对应类型筛选、分页和完整详情，保留原有满减示例及其他独立入口。加价换购按 givetype=1 且赠品 priceDisc=0、pstprice>0 识别，以主表 sumamt 或条件商品 sumqty 区分金额与数量门槛；givetype=2 不用于表示加价换购。

促销条件商品口径确认（2026-09-09）：wareid=0 表示所有商品，即每个商品分别判断是否满足条件；不得将该条件行的金额、数量直接替换为整单合计。主活动自身的整单金额、数量门槛仍按主表配置判断。试算模型以单个商品输入演示该条件，并明确说明适用所有商品、逐商品判断。

满减满赠范围确认：第二件折扣等 priceDisc=1 活动不纳入现有满减满赠入口；列表及活动类型筛选的数据源排除赠品明细含 priceDisc=1 的活动。

独立促销试算的订单输入采用“所选商品”模型：条件商品配置保持数据库原始值只读展示；用户可同时添加条件商品和非条件商品，并填写每个商品的金额、数量、毛利率。订单商品总金额和总数量由所选商品自动汇总；商品级门槛仅使用匹配条件编码的商品判断，非条件商品只参与整单金额、整单数量门槛。wareid=0 时每个所选商品均作为条件商品逐商品判断。

真实活动管理与试算需求确认（2026-09-10）：在既有生产入口与四合一接口演示之外，单独提供“活动管理（只读）”和“独立促销试算”入口。活动、条件商品和优惠商品配置必须来自数据库真实数据或明确标注日期的数据库导出快照，浏览器端不得包含数据库连接凭据；活动管理不提供新增、编辑、结束或删除。`X元Y件（任选）`不进入该模块；第二件/多件折扣真实数据继续保留，但详情明确提示其不属于现有满减满赠生产入口。试算必须标注“演示口径”，对 `resprice` 的 0、2、空值、`givenum=0`、重复次数及边缘配置不得伪装成已确认生产规则。

“无明确门槛赠品”口径确认（2026-09-10）：该分类是正式可解释玩法，不再作为边缘配置。其含义是订单只要实际购买了满足条件关系的条件商品即可获得赠品，不另设商品金额或商品数量门槛；试算时以该条件商品购买数量大于 0 判断“已购买”，不能因为数据库门槛字段均为 0 就直接无条件命中。业务解释不得覆盖数据库原始字段展示：条件商品明细中的单品金额门槛、单品数量门槛仍按数据库原值显示，原值为 0 时均显示“不限”；“购买条件商品即可赠送”仅用于规则摘要、辅助说明和试算判断。

真实活动试算调整（2026-09-10）：试算结果按权益明细逐项展示，不得把包含多个赠品、换购品或折扣品的活动压缩成第一个商品结果。条件行与权益行的同行号、同商品编码关系只能标注为数据结构推测，未经业务或ERP确认不得宣称为正式映射。“免费赠品与加价商品混合”完整列出免费和加价配置，并提示同时获得或任选关系待确认；“无优惠商品结果”禁止生成优惠结果并显示明细缺失。达标示例日期需要同时满足活动时间、参与日期和星期限制。

小程序商城商品试算需求确认（2026-09-11）：在千金后台项目中新增独立的小程序商城商品试算页，参考“千金商城”项目已有的商品卡片加减购、购物车促销分组、门槛提示、底部合计与立即支付交互，但不得修改“千金商城”项目本身。试算页按消费者选品反向匹配数据库真实活动，展示已达标活动、优惠权益和未达标差额；活动配置使用数据库快照，三张活动表缺少的商品名称、规格、图片、售价和毛利率必须明确标注为演示数据或演示口径。

小程序商城商品试算活动选择需求确认（2026-09-11）：将原“推荐／活动商品／普通商品”切换改为与后台独立促销试算一致的“先选玩法分类、再搜索并选择具体真实活动”。商城试算只判断当前选中活动，不再同时反向匹配全部活动；商品区展示当前活动的条件商品并补充可自由加购的非条件商品，右侧仅展示当前活动的达标状态、权益或未达标差额。

小程序商城玩法展示口径确认（2026-09-11）：玩法分类和分类活动数始终基于完整数据库活动快照展示，不得先按试算交易日期或履约门店过滤玩法。交易日期、参与日期、星期和履约门店仅用于判断当前所选活动是否达标；不适用时在未达标差额中明确提示日期或门店原因。

促销试算履约门店选项确认（2026-09-11）：商城商品试算与后台独立促销试算均只提供当前活动适用的履约门店和“不适用门店（演示）”两个选项；选择不适用门店时必须判定当前活动门店条件不通过。

四合一营销接口周会结论（用户提供，会议日期未注明）：
- 活动数据按正常参数边界放行，异常活动由业务端拦截；具体参数边界及整单/明细级拦截范围仍需评估确认。
- 赠送活动明细的赠送数量为0，无法执行赠送，确认为异常；不得将0自动补为1。是否因此拦截整个活动仍需确定。
- 部分满金额赠品活动条件商品明细为空，由门店错误设置或外部渠道导入导致，此类单据不生效。条件明细为空不同于条件明细存在且金额、数量门槛为0；后者继续遵守已确认的购买条件商品即可赠送规则。
- 同活动同时存在赠品与加价换购为正常业务，顾客可按需选择；不得仅因0元和正价优惠商品共存而标异常。具体选择数量、共用名额及条件与权益映射仍未由本次会议明确。
- 复合营销中确实存在第二件半价等折扣活动，接口marketingType可能统一为满减满赠；小程序展示名称或类型区分方案待确认。本结论覆盖此前将这类活动一概归为独立接口的推断，不自动确定生产入口的最终展示方案。
- resprice=2的含义及是否按大于等于1判断仍待确认，不能作为已批准的算法实现。
- 待排查修复门店保存无条件商品明细活动的逻辑；待确认线上处方药赠送、换购限制及小程序剔除巡检方案，不预设全部允许或全部禁止。
- 本次记录只更新业务依据，不代表已完成接口、ERP或小程序代码修复；当前分析与独立真实活动模块继续排除X元Y件（任选）。

复合营销同步与门槛统计补充确认（2026-09-11）：
- 赠送活动优惠明细的赠送数量 pstqty 为0时，在同步环节拦截整个活动，不仅剔除该明细，也不得自动补为1。此处不指主表或条件商品的数量门槛 sumqty；门槛为0不因本规则判为异常。
- 条件商品明细为空的活动在同步环节拦截。条件行存在但金额、数量门槛为0，以及 wareid=0 的所有商品条件，不等同于无条件明细。
- 活动同步闭环按ERP自身逻辑执行，不另行虚构独立生命周期规则；该业务方向不代表已验证ERP具体同步实现。
- 促销门槛的整单金额及数量仅统计符合本活动参与范围的条件购买商品；非条件商品、其他促销商品、赠品和换购品不计入，优惠券抵扣不计入门槛统计。本规则覆盖此前所选非条件商品也参与整单门槛汇总的演示口径。购物车实际总额/总件数与活动有效门槛金额/件数应区分，不得混用。
- 用户确认只有会员价能叠加本活动优惠，门槛金额的取价口径需结合恢复原价选项；resprice=2及大于等于1判断的具体语义仍待确认，不擅自确定枚举映射或恢复原价算法。
- 本次仅记录已确认业务规则，不代表同步拦截、统计逻辑或试算页面已完成修改；继续排除X元Y件（任选）。

givenum取值定义确认（2026-09-15）：
- 用户确认99999表示按赠送份数任选赠品；88882表示赠送零售中最低售价赠品；1表示赠送任意1个，2表示赠送任意2个，普通正整数N依次类推为赠送任意N个。解析时先识别99999和88882两个特殊值，不能作为普通数量处理。
- 此确认覆盖此前对3、4、5、6等普通正整数含义待确认的描述；givenum=0、空值的含义仍未确认，不自动补为1，也不能与优惠明细pstqty=0的异常规则混淆。
- 不从本次取值定义额外推导同商品能否重复选、赠送份数计算、givenum与pstqty及repeat_flag的计算公式、最低售价比较范围及同价处理；这些细节未由本次确认补充。本次仅更新业务记录，不代表已修改试算代码。

givenum=99999暂定执行口径（2026-09-16）：
- 根据用户提供的ERP沟通截图及本次确认，活动达标后，99999不限制候选赠品的选择个数，可以任选多个，包括全部候选赠品；不再沿用“先计算赠送份数以限制选择名额”的解释。
- 用户暂定：每条选中的赠品按该优惠明细的pstqty发放。可全选不代表同一种赠品数量可无限增加；未选中的明细不发放。
- 本次暂定口径仅针对givenum=99999，不自动推广至普通正整数N；与repeat_flag的重复次数联动仍未确认，不擅自增加倍数算法。本次仅记录规则，未修改试算代码或Excel。
