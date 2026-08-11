import { useMemo, useState } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiCreditCard,
  FiHome,
  FiMapPin,
  FiMenu,
  FiPackage,
  FiSettings,
  FiSliders,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import "./trade.css";

const mainNav = [
  ["首页", FiHome, "dashboard"],
  ["商品", FiPackage],
  ["交易", FiCreditCard, "trade"],
  ["门店", FiMapPin],
  ["会员", FiUsers],
  ["营销", FiBarChart2, "marketing"],
  ["统计", FiActivity],
  ["设置", FiSettings],
  ["系统", FiSliders],
];

const tradeMenus = [
  ["orders", "订单管理"],
  ["refunds", "退款处理"],
  ["returns", "退货处理"],
  ["reasons", "售后原因"],
  ["freight", "运费模板"],
  ["address", "发/退货地址"],
  ["invoice", "发票管理"],
];

const ordersSeed = [
  { id: "2026081109001001", product: "小儿氨酚烷胺颗粒/ZQ/A", spec: "6g*15袋", image: "/assets/trade-product-067053.jpg", price: 20, total: 20, time: "2026-08-11 09:36:18", store: "千金大药房株洲演示店", buyer: "演示会员A", account: "demo_user_01", receiver: "张*", phone: "188****1024", address: "湖南省 长沙市 演示地址***", delivery: "快递配送", status: "待付款", note: "—" },
  { id: "2026081109001002", product: "可孚医用棉签/YP/A", spec: "50支/袋", image: "/assets/trade-product-special.png", price: 3.5, total: 3.16, time: "2026-08-11 09:28:45", store: "千金大药房车站北路演示店", buyer: "演示会员B", account: "demo_user_02", receiver: "李*", phone: "177****3256", address: "湖南省 株洲市 演示地址***", delivery: "同城配送", status: "待发货", note: "优先发货" },
  { id: "2026081109001003", product: "云南白药气雾剂/TT", spec: "85g+30g", image: "/assets/trade-product-alt.jpg", price: 68, total: 68, time: "2026-08-11 09:17:02", store: "千金大药房芙蓉路演示店", buyer: "演示会员C", account: "demo_user_03", receiver: "王*", phone: "139****6688", address: "湖南省 衡阳市 演示地址***", delivery: "快递配送", status: "待收货", note: "—" },
  { id: "2026081009000988", product: "维生素C泡腾片", spec: "1g*20片", image: "/assets/trade-product-special.png", price: 29.9, total: 29.9, time: "2026-08-10 17:42:30", store: "千金大药房河西演示店", buyer: "演示会员D", account: "demo_user_04", receiver: "陈*", phone: "186****9012", address: "湖南省 湘潭市 演示地址***", delivery: "门店自提", status: "交易完成", note: "已电话确认" },
  { id: "2026081009000976", product: "医用外科口罩", spec: "10只/袋", image: "/assets/trade-product-alt.jpg", price: 12.8, total: 12.8, time: "2026-08-10 15:06:11", store: "千金大药房中心广场演示店", buyer: "演示会员E", account: "demo_user_05", receiver: "刘*", phone: "155****7788", address: "湖南省 长沙市 演示地址***", delivery: "快递配送", status: "已关闭", note: "—" },
  { id: "2026081009000961", product: "复方板蓝根颗粒", spec: "15g*20袋", image: "/assets/trade-product-067053.jpg", price: 24.8, total: 24.8, time: "2026-08-10 12:18:44", store: "千金大药房云龙演示店", buyer: "演示会员F", account: "demo_user_06", receiver: "周*", phone: "133****2048", address: "湖南省 株洲市 演示地址***", delivery: "快递配送", status: "待发货", note: "—" },
];

const refundSeed = [
  { id: "2026081108002001", product: "云南白药气雾剂/TT", image: "/assets/trade-product-alt.jpg", buyer: "演示买家A", date: "2026-08-11 08:45:31", type: "部分退款", amount: "68.00", status: "退款成功", reason: "商品包装轻微破损", contact: "演示联系人A", phone: "188****1024" },
  { id: "2026081108002002", product: "订单所有商品", buyer: "演示买家B", date: "2026-08-11 08:18:26", type: "整单退款", amount: "29.90", status: "待审核", reason: "重复下单", contact: "演示联系人B", phone: "177****3256" },
  { id: "2026081008001981", product: "订单所有商品", buyer: "演示买家C", date: "2026-08-10 16:35:40", type: "整单退款", amount: "12.80", status: "买家取消", reason: "不再需要", contact: "演示联系人C", phone: "139****6688" },
  { id: "2026081008001972", product: "可孚医用棉签/YP/A", image: "/assets/trade-product-special.png", buyer: "演示买家D", date: "2026-08-10 14:22:17", type: "部分退款", amount: "3.16", status: "审核拒绝", reason: "已拆封影响二次销售", contact: "演示联系人D", phone: "186****9012" },
  ...Array.from({ length: 6 }, (_, index) => ({ id: `2026080${9 - index}080019${60 - index}`, product: index % 2 ? "订单所有商品" : "复方板蓝根颗粒", image: index % 2 ? undefined : "/assets/trade-product-067053.jpg", buyer: `演示买家${String.fromCharCode(69 + index)}`, date: `2026-08-${String(9 - index).padStart(2, "0")} 10:${String(38 - index * 3).padStart(2, "0")}:20`, type: index % 2 ? "整单退款" : "部分退款", amount: index % 2 ? "24.80" : "20.00", status: index === 2 ? "买家取消" : "退款成功", reason: "演示退款原因", contact: `演示联系人${String.fromCharCode(69 + index)}`, phone: "138****0000" })),
];

const returnSeed = [
  { id: "2026081107003001", product: "订单所有商品", buyer: "演示买家A", date: "2026-08-11 07:46:12", type: "整单退款", amount: "68.00", quantity: 2, status: "退款成功", reason: "服用后出现不适，申请退货", contact: "演示联系人A", phone: "188****1024", express: "中通快递", tracking: "DEMO55550001" },
  { id: "2026081107003002", product: "订单所有商品", buyer: "演示买家B", date: "2026-08-11 07:18:38", type: "整单退款", amount: "29.90", quantity: 1, status: "待审核", reason: "商品规格与预期不符", contact: "演示联系人B", phone: "177****3256", express: "顺丰速运", tracking: "DEMO55550002" },
  { id: "2026081007002966", product: "云南白药气雾剂/TT", image: "/assets/trade-product-alt.jpg", buyer: "演示买家C", date: "2026-08-10 13:54:09", type: "部分退款", amount: "68.00", quantity: 1, status: "退款成功", reason: "外包装运输挤压", contact: "演示联系人C", phone: "139****6688", express: "圆通速递", tracking: "DEMO55550003" },
  { id: "2026080907002881", product: "订单所有商品", buyer: "演示买家D", date: "2026-08-09 11:42:27", type: "整单退款", amount: "12.80", quantity: 1, status: "买家取消", reason: "撤销申请", contact: "演示联系人D", phone: "186****9012", express: "—", tracking: "—" },
  ...Array.from({ length: 6 }, (_, index) => ({ id: `2026080${8 - index}070028${70 - index}`, product: index % 2 ? "订单所有商品" : "复方板蓝根颗粒", image: index % 2 ? undefined : "/assets/trade-product-067053.jpg", buyer: `演示买家${String.fromCharCode(69 + index)}`, date: `2026-08-${String(8 - index).padStart(2, "0")} 09:${String(42 - index * 3).padStart(2, "0")}:18`, type: index % 2 ? "整单退款" : "部分退款", amount: index % 2 ? "24.80" : "20.00", quantity: index % 3 + 1, status: index === 3 ? "买家取消" : "退款成功", reason: "演示退货原因", contact: `演示联系人${String.fromCharCode(69 + index)}`, phone: "138****0000", express: "中通快递", tracking: `DEMO55551${index}` })),
];

const blankOrderFilters = { order: "", store: "", product: "", code: "", storeType: "", storeCode: "", orderType: "", delivery: "", receiver: "", mobile: "", buyer: "", prescription: "", transaction: "", orderDate: "", finishDate: "" };
const blankAfterFilters = { order: "", buyer: "", storeCode: "", storeName: "", status: "", date: "" };

function TradePrimaryNav({ onNavigate }) {
  return <aside className="trade-primary-nav">
    <div className="trade-brand"><strong>千金健康商城</strong><span>运营平台</span></div>
    <nav>{mainNav.map(([label, Icon, target]) => <button key={label} className={target === "trade" ? "active" : ""} onClick={() => target && onNavigate(target)}><Icon /><span>{label}</span></button>)}</nav>
    <button className="trade-collapse" aria-label="收起导航"><FiMenu /></button>
  </aside>;
}

function TradeSecondaryNav({ page, setPage }) {
  return <aside className="trade-secondary-nav"><div className="trade-section-title">交易</div>{tradeMenus.map(([key, label]) => <button key={key} className={page === key ? "active" : ""} onClick={() => ["orders", "refunds", "returns"].includes(key) && setPage(key)}>{label}</button>)}</aside>;
}

function TradeTopbar({ crumb, toast }) {
  return <header className="trade-topbar"><span>{crumb}</span><div className="trade-account"><button><FiClipboard /> 导出记录</button><span><FiUser /> admin⌄</span></div>{toast && <div className="trade-toast">{toast}</div>}</header>;
}

function TradeShell({ children, page, setPage, onNavigate, crumb, toast }) {
  return <div className="trade-app"><TradePrimaryNav onNavigate={onNavigate} /><TradeSecondaryNav page={page} setPage={setPage} /><main className="trade-main"><TradeTopbar crumb={crumb} toast={toast} /><div className="trade-page">{children}</div></main></div>;
}

function Tabs({ items, value, onChange }) {
  return <div className="trade-tabs">{items.map(item => <button key={item.value} className={value === item.value ? "active" : ""} onClick={() => onChange(item.value)}>{item.label}{item.count !== undefined && <b>{item.count}</b>}</button>)}</div>;
}

function FilterField({ label, value, onChange, placeholder, options, className = "" }) {
  return <label className={className}><span>{label}</span>{options ? <select value={value} onChange={event => onChange(event.target.value)}><option value="">{placeholder || "请选择"}</option>{options.map(option => <option key={option}>{option}</option>)}</select> : <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} />}</label>;
}

function downloadCsv(filename, headers, rows) {
  const quote = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [headers, ...rows].map(row => row.map(quote).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function Pagination({ total }) {
  return <div className="trade-pagination"><span>共 {total} 条</span><select aria-label="每页条数"><option>10条/页</option><option>20条/页</option></select><button disabled aria-label="上一页"><FiChevronLeft /></button><b>1</b><button disabled aria-label="下一页"><FiChevronRight /></button><span>前往</span><input aria-label="跳转页码" defaultValue="1" /><span>页</span></div>;
}

function OrderFilters({ filters, setFilters, expanded, setExpanded, onQuery, onReset }) {
  const field = (key, label, placeholder, options) => <FilterField key={key} label={label} value={filters[key]} onChange={value => setFilters(current => ({ ...current, [key]: value }))} placeholder={placeholder} options={options} />;
  return <section className={`trade-filter-card order-filter ${expanded ? "expanded" : ""}`}>
    <div className="trade-filter-grid">
      {field("order", "订单号", "请输入订单号")}{field("store", "门店名称", "请输入关键字搜索")}{field("product", "商品名称", "请输入商品名称")}{field("code", "商品编码", "请输入商品编码")}
      {field("storeType", "门店性质", "请选择门店性质", ["直营门店", "加盟门店"])}{field("storeCode", "门店编码", "请输入门店编码")}{field("orderType", "订单类型", "请选择订单类型", ["普通订单", "处方订单"])}{field("delivery", "配送方式", "请选择配送方式", ["快递配送", "同城配送", "门店自提"])}
      {expanded && <>{field("receiver", "收货人", "请输入收货人姓名")}{field("mobile", "收货人手机", "请输入手机号")}{field("buyer", "买家", "买家账号/昵称")}{field("prescription", "处方编号", "请输入处方编号")}{field("transaction", "交易单号", "第三方交易单号")}{field("orderDate", "订单日期", "开始日期 - 结束日期")}{field("finishDate", "完成日期", "开始 至 结束")}</>}
    </div>
    <div className="trade-filter-actions"><button className="trade-secondary" onClick={() => setExpanded(!expanded)}><FiChevronDown className={expanded ? "rotate" : ""} />{expanded ? "收起" : "展开"}</button><button className="trade-primary" onClick={onQuery}>查询</button><button className="trade-secondary" onClick={onReset}>重置</button></div>
  </section>;
}

function OrdersPage({ onDetail, showToast }) {
  const [status, setStatus] = useState("all");
  const [filters, setFilters] = useState(blankOrderFilters);
  const [query, setQuery] = useState(blankOrderFilters);
  const [expanded, setExpanded] = useState(false);
  const [orders, setOrders] = useState(ordersSeed);
  const [noteOrder, setNoteOrder] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [noteColor, setNoteColor] = useState("红");
  const statusMap = { unpaid: "待付款", shipping: "待发货", receiving: "待收货", done: "交易完成", closed: "已关闭" };
  const rows = useMemo(() => orders.filter(order => (!statusMap[status] || order.status === statusMap[status]) && (!query.order || order.id.includes(query.order)) && (!query.store || order.store.includes(query.store)) && (!query.product || order.product.includes(query.product)) && (!query.delivery || order.delivery === query.delivery) && (!query.buyer || `${order.buyer}${order.account}`.includes(query.buyer))), [orders, query, status]);
  const tabs = [{ value: "all", label: "所有订单" }, { value: "unpaid", label: "待付款", count: 4 }, { value: "shipping", label: "待发货", count: 256 }, { value: "receiving", label: "待收货", count: 22 }, { value: "done", label: "交易完成" }, { value: "closed", label: "已关闭" }];
  const openNote = order => { setNoteOrder(order); setNoteText(order.note === "—" ? "" : order.note); };
  const saveNote = () => { setOrders(current => current.map(order => order.id === noteOrder.id ? { ...order, note: noteText || "—", noteColor } : order)); setNoteOrder(null); showToast("卖家备注已保存（演示）"); };
  return <>
    <section className="trade-card"><Tabs items={tabs} value={status} onChange={setStatus} /></section>
    <OrderFilters filters={filters} setFilters={setFilters} expanded={expanded} setExpanded={setExpanded} onQuery={() => setQuery(filters)} onReset={() => { setFilters(blankOrderFilters); setQuery(blankOrderFilters); }} />
    <section className="trade-card trade-table-card"><button className="trade-export" onClick={() => downloadCsv("演示订单查询结果.csv", ["订单号", "商品", "订单总额", "下单时间", "门店", "买家", "状态"], rows.map(order => [order.id, order.product, order.total, order.time, order.store, order.buyer, order.status]))}>导出查询结果</button>
      <div className="trade-table-scroll"><table className="trade-table order-table"><thead><tr><th className="check-col"><input type="checkbox" aria-label="全选订单" /></th><th>订单号</th><th>商品</th><th>订单总额</th><th>下单时间</th><th>门店</th><th>买家</th><th>收货信息</th><th>配送方式</th><th>订单状态</th><th>卖家备注</th><th className="operation-col">操作</th></tr></thead><tbody>{rows.map(order => <tr key={order.id}><td><input type="checkbox" aria-label={`选择订单${order.id}`} /></td><td><strong>{order.id}</strong><span className="order-type-tag">普通订单</span></td><td><div className="trade-product"><img src={order.image} alt="" /><div><span>{order.product}</span><small>¥{order.price} · 1</small></div></div></td><td>{order.total}</td><td>{order.time}</td><td><button className="trade-link store-link">{order.store}</button></td><td><span>账号：{order.account}</span><span>昵称：{order.buyer}</span></td><td><span>收货人：{order.receiver}</span><span>手机：{order.phone}</span><span>地址：{order.address}</span></td><td>{order.delivery}</td><td><span className={`trade-status status-${order.status}`}>{order.status}</span></td><td>{order.note}</td><td className="operation-col"><button className="trade-link" onClick={() => onDetail(order)}>查看</button><button className="trade-link" onClick={() => openNote(order)}>备注</button></td></tr>)}</tbody></table></div>
      <Pagination total={rows.length} />
    </section>
    {noteOrder && <Dialog title="卖家备注" onClose={() => setNoteOrder(null)} width={560} footer={<><button className="trade-secondary" onClick={() => setNoteOrder(null)}>取消</button><button className="trade-primary" onClick={saveNote}>确定</button></>}><div className="note-form"><label><span className="required">*</span> 标注</label><div className="note-colors">{["红", "橙", "黄", "绿", "蓝"].map(color => <label key={color} className={`note-${color}`}><input type="radio" checked={noteColor === color} onChange={() => setNoteColor(color)} /><i />{color}</label>)}</div><label><span className="required">*</span> 卖家备注</label><div className="note-textarea"><textarea value={noteText} maxLength={200} onChange={event => setNoteText(event.target.value)} placeholder="请输入卖家备注" /><small>{noteText.length}/200</small></div></div></Dialog>}
  </>;
}

function OrderDetail({ order, onBack, showToast }) {
  const [addressExpanded, setAddressExpanded] = useState(false);
  return <><div className="detail-toolbar"><button className="trade-secondary" onClick={onBack}>返回订单列表</button></div>
    <section className="trade-detail-card"><h2>订单信息</h2><div className="order-info-grid"><Detail label="订单编号" value={order.id} /><Detail label="订单状态" value={order.status} /><Detail label="买家" value={order.buyer} /><Detail label="下单时间" value={order.time} /><Detail label="交易单号" value="DEMO-TRANS-20260811" /><Detail label="支付方式" value="微信支付" /><Detail label="支付时间" value={order.status === "待付款" ? "—" : order.time} /><Detail label="门店" value={`${order.store}（ID: DEMO1522）`} /><Detail label="配送方式" value={<span className="delivery-tag">{order.delivery}</span>} /><Detail label="卖家备注" value={<>{order.note}　<button className="trade-link" onClick={() => showToast("请在订单列表中修改备注")}>修改</button></>} /></div></section>
    <section className="trade-detail-card"><h2>收货信息</h2><div className="order-info-grid three"><Detail label="收货人" value={order.receiver} /><Detail label="手机号码" value={order.phone} /><Detail label="收货地址" value={<>{addressExpanded ? `${order.address.replace("***", "演示街道88号")}` : order.address}<button className="trade-link" onClick={() => setAddressExpanded(!addressExpanded)}>{addressExpanded ? "收起" : "展开"}</button></>} /><Detail label="发货时间" value={order.status === "待收货" || order.status === "交易完成" ? order.time : "—"} /></div></section>
    <section className="trade-detail-card"><h2>订单清单</h2><table className="trade-table detail-product-table"><thead><tr><th>商品名称</th><th>商品编码</th><th>商品类型</th><th>单价/数量</th><th>小计</th></tr></thead><tbody><tr><td><div className="trade-product"><img src={order.image} alt="" /><div><span>{order.product}</span><small>{order.spec}</small></div></div></td><td>DEMO067053</td><td>非处方药</td><td>{order.price} * 1件</td><td className="price-red">{order.total}</td></tr></tbody></table><div className="order-summary"><span>买家留言　无</span><dl><div><dt>商品总价</dt><dd>¥ {order.total}</dd></div><div><dt>订单总额</dt><dd>¥ {order.total}</dd></div><div><dt>运费</dt><dd>¥ 0</dd></div><div className="paid"><dt>订单实付</dt><dd>¥ {order.total}</dd></div></dl></div></section>
    <section className="trade-detail-card"><h2>其他</h2><div className="order-info-grid four"><Detail label="有物流" value="是" /><Detail label="有退款" value="否" /><Detail label="剩余支付(秒)" value={order.status === "待付款" ? "1260" : "—"} /><Detail label="剩余支付说明" value="—" /><Detail label="可取消自提" value="否" /><Detail label="自提取消窗口过期" value="否" /><Detail label="自提取消截止时间" value="—" /></div></section>
    <section className="trade-detail-card"><h2>订单操作日志</h2><table className="trade-table"><thead><tr><th>操作人</th><th>操作时间</th><th>操作内容</th></tr></thead><tbody><tr><td>演示操作员</td><td>{order.time}</td><td>创建演示订单</td></tr></tbody></table></section>
  </>;
}

function Detail({ label, value }) { return <div className="trade-detail-item"><span>{label}</span><div>{value || "—"}</div></div>; }

function AfterSalesPage({ mode, showToast }) {
  const isReturn = mode === "returns";
  const [records, setRecords] = useState(isReturn ? returnSeed : refundSeed);
  const [tab, setTab] = useState("all");
  const [filters, setFilters] = useState(blankAfterFilters);
  const [query, setQuery] = useState(blankAfterFilters);
  const [detail, setDetail] = useState(null);
  const [audit, setAudit] = useState(null);
  const [logistics, setLogistics] = useState(null);
  const [reply, setReply] = useState("");
  const tabs = [{ value: "all", label: "全部" }, { value: "pending", label: "待处理", count: 1 }, { value: "cancel", label: "买家取消" }];
  const rows = useMemo(() => records.filter(record => (tab === "pending" ? record.status === "待审核" : tab === "cancel" ? record.status === "买家取消" : true) && (!query.order || record.id.includes(query.order)) && (!query.buyer || record.buyer.includes(query.buyer)) && (!query.status || record.status === query.status)), [records, query, tab]);
  const field = (key, label, placeholder, options) => <FilterField key={key} label={label} value={filters[key]} onChange={value => setFilters(current => ({ ...current, [key]: value }))} placeholder={placeholder} options={options} />;
  const review = status => { setRecords(current => current.map(record => record.id === audit.id ? { ...record, status } : record)); setAudit(null); setReply(""); showToast(status === "退款成功" ? "审核已同意（演示）" : "审核已拒绝（演示）"); };
  return <>
    <section className="trade-card"><Tabs items={tabs} value={tab} onChange={setTab} /></section>
    <section className="trade-filter-card after-filter"><div className="trade-filter-grid">{field("order", "订单编号", "请输入订单编号")}{field("buyer", "买家", "请输入买家")}{field("storeCode", "门店编码", "请输入门店编码")}{isReturn && field("storeName", "门店名称", "请输入门店名称")}{field("status", "状态", "请选择", ["待审核", "退款成功", "审核拒绝", "买家取消"])}{field("date", "申请日期", "开始日期 - 结束日期")}</div><div className="trade-filter-actions"><button className="trade-primary" onClick={() => setQuery(filters)}>查询</button><button className="trade-secondary" onClick={() => { setFilters(blankAfterFilters); setQuery(blankAfterFilters); }}>重置</button></div></section>
    <section className="trade-card trade-table-card"><button className="trade-export" onClick={() => downloadCsv(`${isReturn ? "退货" : "退款"}查询结果.csv`, ["订单号", "商品", "买家", "申请日期", "退款类型", "退款金额", ...(isReturn ? ["退货数量"] : []), "状态"], rows.map(record => [record.id, record.product, record.buyer, record.date, record.type, record.amount, ...(isReturn ? [record.quantity] : []), record.status]))}>导出查询结果</button><div className="trade-table-scroll"><table className={`trade-table after-table ${isReturn ? "return-table" : ""}`}><thead><tr><th>订单号</th><th>商品</th><th>买家</th><th>申请日期</th><th>退款类型</th><th>退款金额</th>{isReturn && <th>退货数量</th>}<th>状态</th><th className="operation-col">操作</th></tr></thead><tbody>{rows.map(record => <tr key={record.id}><td><button className="trade-link" onClick={() => setDetail(record)}>{record.id}</button></td><td>{record.image ? <div className="trade-product"><img src={record.image} alt="" /><span>{record.product}</span></div> : record.product}</td><td>{record.buyer}</td><td>{record.date}</td><td>{record.type}</td><td>{record.amount}</td>{isReturn && <td>{record.quantity}</td>}<td><span className={`trade-status status-${record.status}`}>{record.status}</span></td><td className="operation-col"><button className="trade-link" onClick={() => setDetail(record)}>查看详情</button>{isReturn && record.express !== "—" && <button className="trade-link" onClick={() => setLogistics(record)}>查看物流</button>}{record.status === "待审核" && <button className="trade-link" onClick={() => setAudit(record)}>审核</button>}</td></tr>)}</tbody></table></div><Pagination total={rows.length} /></section>
    {detail && <Dialog title="查看详情" onClose={() => setDetail(null)} width={560}><div className="after-detail"><Detail label="售后编号" value={`AFTER-${detail.id}`} /><Detail label="商品名称" value={detail.product} />{isReturn && <Detail label="是否退运费" value="○ 是　● 否" />}<Detail label="退款类型" value={detail.type} /><Detail label="退款金额" value={<strong className="price-red">¥{detail.amount}（实付：¥{detail.amount}）</strong>} />{isReturn && <Detail label="退货数量" value={`${detail.quantity}（购买：${detail.quantity}）`} />}<Detail label="理由" value={detail.reason} /><Detail label="说明" value="演示售后说明" /><Detail label="联系人" value={detail.contact} /><Detail label="联系电话" value={detail.phone} /><Detail label="退款方式" value="原路返回" /><Detail label="当前状态" value={<span className={`trade-status status-${detail.status}`}>{detail.status}</span>} /></div></Dialog>}
    {audit && <Dialog title={isReturn ? "退货退款审核" : "退款审核"} onClose={() => setAudit(null)} width={560} footer={<>{isReturn && <button className="trade-secondary" onClick={() => review("审核拒绝")}>拒绝售后</button>}{isReturn && <button className="trade-secondary" onClick={() => review("退款成功")}>同意并弃货</button>}<button className="trade-primary" onClick={() => review("退款成功")}>同意售后</button>{!isReturn && <button className="trade-secondary reject-button" onClick={() => review("审核拒绝")}>拒绝售后</button>}</>}><div className={`after-detail audit-detail ${isReturn ? "return-audit-detail" : "refund-audit-detail"}`}><Detail label="售后编号" value={`AFTER-${audit.id}`} /><Detail label="商品名称" value={audit.product} />{isReturn && <Detail label="是否退运费" value="● 是　○ 否" />}<Detail label="退款类型" value={audit.type} /><Detail label="退款金额" value={<strong className="price-red">¥{audit.amount}（实付：¥{audit.amount}）</strong>} />{isReturn && <Detail label="退货数量" value={`${audit.quantity}（购买：${audit.quantity}）`} />}<Detail label="理由" value={audit.reason} /><Detail label="说明" value="演示售后说明" /><Detail label="联系人" value={audit.contact} /><Detail label="联系电话" value={audit.phone} /><Detail label={isReturn ? "期望退款方式" : "退款方式"} value="原路返回" />{isReturn ? <Detail label="当前状态" value={<span className="trade-status status-待审核">待审核</span>} /> : <><Detail label="是否退运费" value="● 是　○ 否" /><Detail label="售后凭证" value="—" /><label className="reply-label">回复买家<textarea value={reply} onChange={event => setReply(event.target.value)} placeholder="请输入回复内容" /></label></>}</div></Dialog>}
    {logistics && <Dialog title="查看物流" onClose={() => setLogistics(null)} width={620}><div className="logistics-detail"><p>物流公司：　{logistics.express}</p><p>快递单号：　{logistics.tracking}</p><p className="muted">暂无物流信息</p></div></Dialog>}
  </>;
}

function Dialog({ title, children, onClose, footer, width = 520 }) {
  return <div className="trade-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="trade-modal" style={{ width }} role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button onClick={onClose} aria-label="关闭"><FiX /></button></header><div className="trade-modal-body">{children}</div><footer>{footer || <button className="trade-secondary" onClick={onClose}>关闭</button>}</footer></section></div>;
}

export function TradeModule({ onNavigate }) {
  const [page, setPage] = useState("orders");
  const [detailOrder, setDetailOrder] = useState(null);
  const [toast, setToast] = useState("");
  const showToast = message => { setToast(message); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => setToast(""), 1800); };
  const changePage = next => { setPage(next); setDetailOrder(null); window.scrollTo(0, 0); };
  const crumb = detailOrder ? "订单管理" : tradeMenus.find(([key]) => key === page)?.[1] || "交易";
  return <TradeShell page={page} setPage={changePage} onNavigate={onNavigate} crumb={crumb} toast={toast}>{detailOrder ? <OrderDetail order={detailOrder} onBack={() => { setDetailOrder(null); window.scrollTo(0, 0); }} showToast={showToast} /> : page === "orders" ? <OrdersPage onDetail={order => { setDetailOrder(order); window.scrollTo(0, 0); }} showToast={showToast} /> : <AfterSalesPage key={page} mode={page} showToast={showToast} />}</TradeShell>;
}
