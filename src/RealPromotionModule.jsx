import { useEffect, useMemo, useState } from "react";
import { FiActivity, FiAlertTriangle, FiCalendar, FiChevronLeft, FiChevronRight, FiDatabase, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";

const DATA_URL = "/data/real-promotion-activities.json";
const EDGE_TYPES = new Set(["免费赠品与加价商品混合", "无优惠商品结果"]);
const PLAY_ORDER = ["满金额赠品", "买X件送Y", "满额+XX元换购", "买X件+XX元换购", "满额减金额", "满件减金额", "第二件/多件折扣", "无明确门槛赠品", "免费赠品与加价商品混合", "无优惠商品结果"];

const toNumber = value => Number(value || 0);
const isAll = value => value === "全部" || value === "all" || value == null || value === "";
const displayValue = value => value === null || value === undefined || value === "" ? "—" : String(value);
const parseChinaTime = value => Date.parse(`${String(value).replace(" ", "T")}+08:00`);
const formatChinaTime = (value = Date.now()) => new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(value).replaceAll("/", "-");
const statusOf = (activity, now = Date.now()) => now < parseChinaTime(activity.starttime) ? "未开始" : now > parseChinaTime(activity.endtime) ? "已结束" : "进行中";
const statusClass = status => status === "进行中" ? "status status-active" : status === "未开始" ? "status status-pending" : "status status-ended";
const storeSummary = busnos => isAll(busnos) ? "全部门店" : `指定门店（${String(busnos).split(",").filter(Boolean).length}家）`;
const storeNamesByCode = {
  "001": "千金大药房株洲演示店", "002": "千金大药房车站北路演示店", "003": "千金大药房芙蓉路演示店", "004": "千金大药房河西演示店",
  "005": "千金大药房中心广场演示店", "006": "千金大药房云龙演示店", "008": "千金大药房天元演示店",
  "101001": "千金大药房株洲演示店", "101002": "千金大药房车站北路演示店", "101003": "千金大药房芙蓉路演示店", "101004": "千金大药房河西演示店",
  "101005": "千金大药房中心广场演示店", "101006": "千金大药房云龙演示店", "101007": "千金大药房天元演示店", "101008": "千金大药房荷塘演示店",
  "101009": "千金大药房石峰演示店", "101010": "千金大药房红旗广场演示店", "101012": "千金大药房醴陵演示店",
};
const scopedStoreRecords = busnos => (isAll(busnos) ? Object.keys(storeNamesByCode) : String(busnos).split(",").map(code => code.trim()).filter(Boolean)).map(code => {
  const name = storeNamesByCode[code] || `千金大药房${code}店`;
  const region = name.includes("醴陵") ? "株洲醴陵区域" : "株洲市区区域";
  return { code, name, nature: ["101002", "101005", "101009"].includes(code) ? "加盟店" : "直营店", phone: String(Number(code.slice(-6)) + 28000000).slice(-8), region, address: `湖南省${region.replace("区域", "")}` };
});
const weekdayText = value => String(value || "1111111").split("").map((flag, index) => flag === "1" ? `周${"一二三四五六日"[index]}` : "").filter(Boolean).join("、") || "未配置";
const relationText = value => Number(value) === 1 ? "任一条件满足（OR）" : Number(value) === 0 ? "全部条件满足（AND）" : `原始值 ${displayValue(value)}（待确认）`;
const repeatText = value => Number(value) === 1 ? "允许重复" : Number(value) === 0 ? "仅一次" : `原始值 ${displayValue(value)}`;
const respriceText = value => Number(value) === 1 ? "恢复会员折扣为100" : value === null || value === undefined ? "未配置（待确认）" : `原始值 ${value}（待确认）`;
const productLabel = code => Number(code) === 0 ? "所有商品（逐商品判断）" : `商品编码 ${code}`;
const selectedItemTotals = items => (items || []).reduce((totals, item) => ({ amount: totals.amount + toNumber(item.amount), qty: totals.qty + toNumber(item.qty) }), { amount: 0, qty: 0 });
const selectedItemKind = (activity, code) => {
  const conditions = activity.conditionItemList || [];
  if (conditions.some(item => Number(item.wareid) === 0)) return "条件商品（所有商品规则）";
  return conditions.some(item => String(item.wareid) === String(code)) ? "条件商品" : "非条件商品";
};
const benefitLabel = activity => {
  if (toNumber(activity.givetype) === 6) return `整单减 ${toNumber(activity.giveprice)} 元`;
  if (!activity.giftItemList?.length) return "无优惠商品明细";
  const priced = activity.giftItemList.filter(item => toNumber(item.priceDisc) === 0 && toNumber(item.pstprice) > 0);
  const discounted = activity.giftItemList.filter(item => toNumber(item.priceDisc) === 1);
  if (discounted.length) return `${discounted[0].pstid} 按 ${(toNumber(discounted[0].pstprice) * 10).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} 折`;
  if (priced.length) return `${priced[0].pstprice} 元换购商品 ${priced[0].pstid}`;
  if (toNumber(activity.givenum) === 88882) return "赠候选商品中最低售价商品";
  if (toNumber(activity.givenum) === 99999) return "按赠送份数选择赠品";
  if (activity.giftItemList.length > 1) return `候选赠品任选 ${toNumber(activity.givenum)} 件`;
  return `赠送商品 ${activity.giftItemList[0].pstid} × ${toNumber(activity.giftItemList[0].pstqty)} 件`;
};
const benefitConfigurationSummary = activity => {
  if (toNumber(activity.givetype) === 6) return `整单减 ${toNumber(activity.giveprice)} 元`;
  const items = activity.giftItemList || [];
  if (!items.length) return "无优惠商品明细，无法试算";
  const freeCount = items.filter(item => toNumber(item.priceDisc) === 0 && toNumber(item.pstprice) === 0).length;
  const paidCount = items.filter(item => toNumber(item.priceDisc) === 0 && toNumber(item.pstprice) > 0).length;
  const discountCount = items.filter(item => toNumber(item.priceDisc) === 1).length;
  if (activity.playType === "免费赠品与加价商品混合") return `${items.length}项优惠配置：${freeCount}项免费、${paidCount}项加价`;
  if (items.length > 1) return `${items.length}项优惠商品配置${discountCount ? `，其中${discountCount}项按折扣` : ""}`;
  return benefitLabel(activity);
};
const ruleSummary = activity => {
  const thresholds = [toNumber(activity.sumamt) > 0 ? `整单满${activity.sumamt}元` : "", toNumber(activity.sumqty) > 0 ? `整单满${activity.sumqty}件` : ""].filter(Boolean);
  const condition = activity.conditionItemList?.find(item => toNumber(item.sumamt) > 0 || toNumber(item.sumqty) > 0);
  if (!thresholds.length && condition) thresholds.push(toNumber(condition.sumamt) > 0 ? `商品满${condition.sumamt}元` : `商品满${condition.sumqty}件`);
  if (!thresholds.length && activity.playType === "无明确门槛赠品") thresholds.push("购买条件商品");
  return `${thresholds.join("且") || "门槛待确认"}，${benefitConfigurationSummary(activity)}`;
};

function useRealPromotionData() {
  const [state, setState] = useState({ loading: true, error: "", meta: null, activities: [] });
  useEffect(() => {
    let active = true;
    fetch(DATA_URL).then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }).then(data => active && setState({ loading: false, error: "", meta: data.meta, activities: data.activities || [] })).catch(() => active && setState({ loading: false, error: "真实活动数据加载失败，请刷新页面重试", meta: null, activities: [] }));
    return () => { active = false; };
  }, []);
  return state;
}

function DataState({ loading, error }) {
  if (loading) return <section className="panel real-data-state"><FiDatabase /><b>正在载入数据库活动快照…</b></section>;
  if (error) return <section className="panel real-data-state error"><FiAlertTriangle /><b>{error}</b></section>;
  return null;
}

function Pager({ total, page, pageSize, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return <div className="pagination real-promotion-pagination"><span>共 {total} 条</span><button aria-label="上一页" disabled={page <= 1} onClick={() => onPage(page - 1)}><FiChevronLeft /></button><b>{page}</b><span>/ {totalPages}</span><button aria-label="下一页" disabled={page >= totalPages} onClick={() => onPage(page + 1)}><FiChevronRight /></button></div>;
}

const pickerDateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const pickerCalendarDays = month => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
};
function PickerCalendarMonth({ month, start, end, onSelect }) {
  return <div className="calendar-month"><h4>{month.getFullYear()} 年 {month.getMonth() + 1} 月</h4><div className="calendar-weekdays">{["日", "一", "二", "三", "四", "五", "六"].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-days">{pickerCalendarDays(month).map(day => { const value = pickerDateKey(day); const outside = day.getMonth() !== month.getMonth(); const selected = value === start || value === end; const inRange = start && end && value > start && value < end; return <button type="button" key={value} className={`${outside ? "outside" : ""} ${selected ? "selected" : ""} ${inRange ? "in-range" : ""}`} onClick={() => onSelect(value)}>{day.getDate()}</button>; })}</div></div>;
}
function ActivityDateRangePicker({ start, end, onChange }) {
  const [open, setOpen] = useState(false); const [visibleMonth, setVisibleMonth] = useState(() => new Date(2026, 7, 1));
  const secondMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  const selectDate = value => {
    if (!start || end || value < start) onChange(value, "");
    else { onChange(start, value); setOpen(false); }
  };
  const shiftMonth = offset => setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  return <div className="date-range-picker"><button type="button" className="date-range-trigger" aria-label="活动时间" aria-expanded={open} onClick={() => setOpen(value => !value)}><FiCalendar /><span className={start ? "" : "placeholder"}>{start || "开始日期"}</span><i>—</i><span className={end ? "" : "placeholder"}>{end || "结束日期"}</span></button>{open && <div className="date-range-popover"><div className="calendar-nav calendar-nav-left"><button type="button" aria-label="上两个月" onClick={() => shiftMonth(-2)}><FiChevronLeft /><FiChevronLeft /></button><button type="button" aria-label="上个月" onClick={() => shiftMonth(-1)}><FiChevronLeft /></button></div><div className="calendar-nav calendar-nav-right"><button type="button" aria-label="下个月" onClick={() => shiftMonth(1)}><FiChevronRight /></button><button type="button" aria-label="下两个月" onClick={() => shiftMonth(2)}><FiChevronRight /><FiChevronRight /></button></div><PickerCalendarMonth month={visibleMonth} start={start} end={end} onSelect={selectDate} /><PickerCalendarMonth month={secondMonth} start={start} end={end} onSelect={selectDate} /></div>}</div>;
}

export function RealPromotionManager({ Frame, setView }) {
  const { loading, error, activities } = useRealPromotionData();
  const [activityStart, setActivityStart] = useState(""); const [activityEnd, setActivityEnd] = useState(""); const [name, setName] = useState(""); const [number, setNumber] = useState(""); const [playType, setPlayType] = useState(""); const [status, setStatus] = useState("");
  const [query, setQuery] = useState({ activityStart: "", activityEnd: "", name: "", number: "", playType: "", status: "" });
  const [page, setPage] = useState(1); const pageSize = 20; const now = Date.now();
  const playTypes = PLAY_ORDER.filter(type => activities.some(activity => activity.playType === type));
  const filtered = useMemo(() => activities.filter(activity => (!query.activityStart || activity.endtime >= query.activityStart) && (!query.activityEnd || activity.starttime <= query.activityEnd) && (!query.name || activity.promName?.includes(query.name)) && (!query.number || String(activity.pstplanno) === query.number) && (!query.playType || activity.playType === query.playType) && (!query.status || statusOf(activity, now) === query.status)), [activities, query, now]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize)); const currentPage = Math.min(page, totalPages); const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const runQuery = () => { setQuery({ activityStart: activityStart ? `${activityStart} 00:00:00` : "", activityEnd: activityEnd ? `${activityEnd} 23:59:59` : "", name: name.trim(), number: number.trim(), playType, status }); setPage(1); };
  const reset = () => { setActivityStart(""); setActivityEnd(""); setName(""); setNumber(""); setPlayType(""); setStatus(""); setQuery({ activityStart: "", activityEnd: "", name: "", number: "", playType: "", status: "" }); setPage(1); };
  return <Frame crumb="活动管理（只读）" section="marketing" setView={setView}>
    <div className="filters panel activity-filter limited-discount-filter real-promotion-filter"><label className="modified-time">活动时间<ActivityDateRangePicker start={activityStart} end={activityEnd} onChange={(start, end) => { setActivityStart(start); setActivityEnd(end); }} /></label><label>活动名称<input maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="请输入活动名称" /></label><label>活动编号<input maxLength={50} value={number} onChange={event => setNumber(event.target.value)} placeholder="请输入完整活动编号" /></label><label>玩法分类<select value={playType} onChange={event => setPlayType(event.target.value)}><option value="">全部</option>{playTypes.map(type => <option key={type}>{type}</option>)}</select></label><label>活动状态<select value={status} onChange={event => setStatus(event.target.value)}><option value="">全部</option><option>未开始</option><option>进行中</option><option>已结束</option></select></label><div className="filter-actions"><button className="primary" onClick={runQuery}><FiSearch /> 查询</button><button className="secondary" onClick={reset}>重置</button></div></div>
    <DataState loading={loading} error={error} />
    {!loading && !error && <section className="panel coupon-table-wrap"><div className="real-result-meta"><span>当前结果 {filtered.length} 条</span></div><table className="coupon-table real-promotion-table"><thead><tr><th>活动名称</th><th>活动编号</th><th>玩法分类</th><th>活动时间</th><th>活动状态</th><th>适用门店</th><th>最后修改时间</th><th>操作</th></tr></thead><tbody>{rows.map(activity => { const currentStatus = statusOf(activity, now); return <tr key={activity.id}><td title={activity.promName}>{activity.promName || "—"}</td><td>{activity.pstplanno}</td><td><span className={EDGE_TYPES.has(activity.playType) ? "play-badge warning" : activity.playType === "第二件/多件折扣" ? "play-badge separate" : "play-badge"}>{activity.playType}</span></td><td className="activity-time-cell"><span>{activity.starttime}</span><span>~ {activity.endtime}</span></td><td><span className={statusClass(currentStatus)}><i className="status-dot" />{currentStatus}</span></td><td>{storeSummary(activity.busnos)}</td><td>{activity.updateTime || "—"}</td><td><button className="text-btn" onClick={() => setView(["realPromotionDetail", activity])}>查看</button></td></tr>; })}</tbody></table>{filtered.length === 0 ? <p className="empty-row">暂无符合条件的真实活动</p> : <Pager total={filtered.length} page={currentPage} pageSize={pageSize} onPage={setPage} />}</section>}
  </Frame>;
}

export function RealPromotionDetail({ Frame, setView, activity }) {
  const edge = EDGE_TYPES.has(activity.playType);
  return <Frame crumb={<><button className="breadcrumb-link" onClick={() => setView("realPromotionManager")}>活动管理（只读）</button><span> › 活动详情</span></>} section="marketing" setView={setView}>
    {edge && <div className="real-rule-alert warning"><FiAlertTriangle /><div><b>该活动属于边缘配置</b><span>可查看原始配置，但优惠结果需要业务确认后才能作为生产规则。</span></div></div>}
    <section className="panel coupon-detail activity-detail"><div className="detail-heading"><h3>基本信息</h3></div><div className="detail-grid"><Info label="活动名称" value={activity.promName} /><Info label="活动编号" value={activity.pstplanno} /><Info label="营销类型" value={activity.marketingType} /><Info label="玩法分类" value={activity.playType} /><Info label="活动时间" value={`${activity.starttime} ~ ${activity.endtime}`} /><Info label="活动状态" value={statusOf(activity)} /><StoreScopeInfo busnos={activity.busnos} /><Info label="参与日期" value={displayValue(activity.days)} /><Info label="参与星期" value={weekdayText(activity.weekdays)} /><Info label="最后修改时间" value={activity.updateTime} /></div></section>
    <section className="panel promotion-rule-panel"><div className="discount-items-title"><div><h3>活动门槛与优惠</h3></div></div><div className="promotion-rule-grid real-promotion-rule-grid"><div><span>整单金额门槛</span><strong>{toNumber(activity.sumamt) > 0 ? `${activity.sumamt}元` : "不限"}</strong></div><div><span>整单数量门槛</span><strong>{toNumber(activity.sumqty) > 0 ? `${activity.sumqty}件` : "不限"}</strong></div><div><span>条件关系</span><strong>{Number(activity.plannum) === 1 ? "任一条件满足" : Number(activity.plannum) === 0 ? "全部条件满足" : relationText(activity.plannum)}</strong></div><div><span>重复赠送</span><strong>{repeatText(activity.repeatflag)}</strong></div><div><span>赠送品种数量</span><strong>{displayValue(activity.givenum)}</strong></div></div></section>
    <section className="panel discount-items-panel"><div className="discount-items-title"><div><h3>条件商品明细</h3></div></div><table className="coupon-table real-condition-table"><thead><tr><th>行号</th><th>条件商品</th><th>单品金额门槛</th><th>单品数量门槛</th><th>毛利率下限</th><th>恢复原价</th></tr></thead><tbody>{activity.conditionItemList?.map(item => <tr key={item.id || item.rowno}><td>{item.rowno}</td><td>{productLabel(item.wareid)}</td><td>{toNumber(item.sumamt) > 0 ? `${item.sumamt}元` : "不限"}</td><td>{toNumber(item.sumqty) > 0 ? `${item.sumqty}件` : "不限"}</td><td>{toNumber(item.profitrate) > 0 ? `${toNumber(item.profitrate) * 100}%` : "不限"}</td><td>{respriceText(item.resprice)}</td></tr>)}</tbody></table>{!activity.conditionItemList?.length && <p className="empty-row">无条件商品明细</p>}</section>
    <section className="panel discount-items-panel"><div className="discount-items-title"><div><h3>优惠商品明细</h3></div></div><table className="coupon-table real-gift-table"><thead><tr><th>行号</th><th>商品编码</th><th>数量</th><th>赠送类型</th><th>价格 / 折扣</th></tr></thead><tbody>{activity.giftItemList?.map(item => <tr key={item.id || item.rowno}><td>{item.rowno}</td><td>{item.pstid}</td><td>{item.pstqty}</td><td>{toNumber(item.priceDisc) === 1 ? "按折扣" : "按价格"}</td><td>{toNumber(item.priceDisc) === 1 ? `${toNumber(item.pstprice) * 10}折` : `${toNumber(item.pstprice)}元`}</td></tr>)}</tbody></table>{!activity.giftItemList?.length && <p className="empty-row">无优惠商品明细</p>}</section>
  </Frame>;
}

function StoreListModal({ busnos, onClose }) {
  const stores = scopedStoreRecords(busnos); const [pageSize, setPageSize] = useState(20); const [page, setPage] = useState(1); const [storeName, setStoreName] = useState(""); const [storeCode, setStoreCode] = useState(""); const [query, setQuery] = useState({ name: "", code: "" });
  const filteredStores = stores.filter(store => (!query.name || store.name.toLowerCase().includes(query.name.toLowerCase())) && (!query.code || String(store.code).includes(query.code))); const totalPages = Math.max(1, Math.ceil(filteredStores.length / pageSize)); const currentPage = Math.min(page, totalPages); const rows = filteredStores.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const runQuery = () => { setQuery({ name: storeName.trim(), code: storeCode.trim() }); setPage(1); }; const reset = () => { setStoreName(""); setStoreCode(""); setQuery({ name: "", code: "" }); setPage(1); };
  return <div className="modal-backdrop store-list-backdrop"><section className="modal store-list-modal" role="dialog" aria-modal="true" aria-label="适用门店"><header><b>适用门店</b><button aria-label="关闭适用门店" onClick={onClose}><FiX /></button></header><div className="store-list-content"><div className="store-list-filters"><label>门店名称<input aria-label="适用门店名称" maxLength={100} value={storeName} onChange={event => setStoreName(event.target.value)} onKeyDown={event => event.key === "Enter" && runQuery()} placeholder="请输入门店名称" /></label><label>门店编码<input aria-label="适用门店编码" maxLength={50} value={storeCode} onChange={event => setStoreCode(event.target.value)} onKeyDown={event => event.key === "Enter" && runQuery()} placeholder="请输入门店编码" /></label><div><button className="primary" onClick={runQuery}><FiSearch /> 查询</button><button className="secondary" onClick={reset}>重置</button></div></div><div className="store-list-scroll"><table className="store-list-table"><thead><tr>{["门店", "门店名称", "门店性质", "门店电话", "区域"].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{rows.map(store => <tr key={store.code}><td><div className="store-list-identity"><span>名称：{store.name}</span><span>编码：{store.code}</span><span>地址：{store.address}</span></div></td><td title={store.name}>{store.name}</td><td>{store.nature}</td><td>{store.phone}</td><td>{store.region}</td></tr>)}{rows.length === 0 && <tr className="store-list-empty"><td colSpan="5">暂无符合条件的门店</td></tr>}</tbody></table></div></div><div className="store-list-pagination"><span>共 {filteredStores.length} 条</span><div><select aria-label="适用门店每页条数" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option></select><button aria-label="适用门店上一页" disabled={currentPage === 1} onClick={() => setPage(value => Math.max(1, value - 1))}><FiChevronLeft /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNo => <button key={pageNo} className={pageNo === currentPage ? "active" : ""} onClick={() => setPage(pageNo)}>{pageNo}</button>)}<button aria-label="适用门店下一页" disabled={currentPage === totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))}><FiChevronRight /></button><span>前往</span><input aria-label="适用门店跳转页码" value={currentPage} readOnly /><span>页</span></div></div><footer><button className="secondary" onClick={onClose}>关闭</button></footer></section></div>;
}

function StoreScopeInfo({ busnos }) {
  const [storeListOpen, setStoreListOpen] = useState(false); const specified = !isAll(busnos); const count = String(busnos).split(",").map(code => code.trim()).filter(Boolean).length;
  return <><Info label="适用门店" value={<span className="store-scope-value">{specified ? `指定门店(${count}家)` : "全部门店"}{specified && <button className="text-btn store-scope-view" onClick={() => setStoreListOpen(true)}>查看</button>}</span>} />{storeListOpen && <StoreListModal busnos={busnos} onClose={() => setStoreListOpen(false)} />}</>;
}

function Info({ className = "", label, value }) { return <div className={`info simple ${className}`}><label>{label}</label><span>{typeof value === "object" ? value : displayValue(value)}</span></div>; }

const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const firstEligibleDate = activity => {
  const start = new Date(`${String(activity.starttime).slice(0, 10)}T12:00:00`);
  const end = new Date(`${String(activity.endtime).slice(0, 10)}T12:00:00`);
  for (let offset = 0; offset < 3700; offset += 1) {
    const candidate = new Date(start); candidate.setDate(start.getDate() + offset);
    if (candidate > end) break;
    const dayAllowed = isAll(activity.days) || String(activity.days).split(",").includes(String(candidate.getDate()));
    const weekdayIndex = (candidate.getDay() + 6) % 7;
    const weekdayAllowed = String(activity.weekdays || "1111111")[weekdayIndex] === "1";
    if (dayAllowed && weekdayAllowed) return dateKey(candidate);
  }
  return String(activity.starttime).slice(0, 10);
};
const scenarioFor = (activity, passing = true) => {
  const firstStore = isAll(activity.busnos) ? "7311555" : String(activity.busnos).split(",")[0];
  const end = new Date(`${String(activity.endtime).slice(0, 10)}T12:00:00`); end.setDate(end.getDate() + 1);
  const selectedItems = [];
  (activity.conditionItemList || []).forEach((item, index) => {
    const code = Number(item.wareid) === 0 ? String(900001 + index) : String(item.wareid);
    const existing = selectedItems.find(row => row.code === code);
    const amount = passing ? Math.max(toNumber(item.sumamt), 100) : 0;
    const qty = passing ? Math.max(toNumber(item.sumqty), 1) : 0;
    const profit = passing ? Math.max(20, toNumber(item.profitrate) * 100 + 5) : 0;
    if (existing) {
      existing.amount = String(Math.max(toNumber(existing.amount), amount));
      existing.qty = String(Math.max(toNumber(existing.qty), qty));
      existing.profit = String(Math.max(toNumber(existing.profit), profit));
    } else selectedItems.push({ id: `${code}-${index}`, code, amount: String(amount), qty: String(qty), profit: String(profit) });
  });
  if (!selectedItems.length) selectedItems.push({ id: "900001-0", code: "900001", amount: passing ? String(toNumber(activity.sumamt) || 100) : "0", qty: passing ? String(toNumber(activity.sumqty) || 1) : "0", profit: passing ? "20" : "0" });
  if (passing) {
    const totals = selectedItemTotals(selectedItems);
    const missingAmount = Math.max(0, toNumber(activity.sumamt) - totals.amount);
    const missingQty = Math.max(0, toNumber(activity.sumqty) - totals.qty);
    selectedItems.push({ id: "999001-non-condition", code: "999001", amount: String(missingAmount || 68), qty: String(missingQty || 2), profit: "20" });
  }
  return { date: passing ? firstEligibleDate(activity) : dateKey(end), store: firstStore, selectedItems };
};
const benefitMode = item => toNumber(item.priceDisc) === 1 ? "折扣" : toNumber(item.pstprice) > 0 ? "加价换购" : "免费赠送";
const benefitValueText = (item, repeatTimes) => {
  if (toNumber(item.priceDisc) === 1) return toNumber(item.pstprice) > 0 ? `${toNumber(item.pstprice) * 10}折` : "折扣原值0（待确认）";
  if (toNumber(item.pstprice) > 0) return `${item.pstprice}元 × ${toNumber(item.pstqty) * repeatTimes}件`;
  return `0元 × ${toNumber(item.pstqty) * repeatTimes}件`;
};
const selectionRuleText = activity => {
  const count = activity.giftItemList?.length || 0; const givenum = toNumber(activity.givenum);
  if (givenum === 88882) return "候选商品中取最低售价";
  if (givenum === 99999) return "givenum=99999，选择规则待确认";
  if (givenum === 0) return "givenum=0，选择数量待确认";
  if (count > givenum) return `候选商品中任选${givenum}项`;
  return count > 1 ? "多项权益配置" : "固定权益";
};
const buildBenefitRows = (activity, conditionRows, eligible, repeatTimes) => {
  if (!eligible) return [];
  if (toNumber(activity.givetype) === 6) return [{ key: "reduction", product: "整单优惠", mode: "减金额", value: `${toNumber(activity.giveprice) * repeatTimes}元`, relation: repeatTimes > 1 ? "按演示重复次数累计" : "活动级优惠" }];
  const conditions = [...(activity.conditionItemList || [])].sort((a, b) => toNumber(a.rowno) - toNumber(b.rowno));
  const gifts = [...(activity.giftItemList || [])].sort((a, b) => toNumber(a.rowno) - toNumber(b.rowno));
  const rowPaired = conditions.length === gifts.length && conditions.length > 0 && conditions.every((condition, index) => toNumber(condition.rowno) === toNumber(gifts[index].rowno) && String(condition.wareid) === String(gifts[index].pstid));
  const matchedRows = new Set(conditionRows.filter(row => row.pass).map(row => toNumber(row.rowno)));
  const effectiveGifts = rowPaired ? gifts.filter(item => matchedRows.has(toNumber(item.rowno))) : gifts;
  return effectiveGifts.map(item => ({ key: item.id || item.rowno, product: `商品编码 ${item.pstid}`, mode: benefitMode(item), value: benefitValueText(item, repeatTimes), relation: rowPaired ? `与条件行${item.rowno}同商品对应（按数据结构推测）` : selectionRuleText(activity) }));
};
const trialFor = (activity, values) => {
  const date = new Date(`${values.date}T12:00:00`); const trialTime = `${values.date} 12:00:00`; const weekdayIndex = (date.getDay() + 6) % 7;
  const orderTotals = selectedItemTotals(values.selectedItems);
  const timePass = trialTime >= activity.starttime && trialTime <= activity.endtime;
  const storePass = values.store !== "__not-participating__" && (isAll(activity.busnos) || String(activity.busnos).split(",").includes(values.store));
  const dayPass = isAll(activity.days) || String(activity.days).split(",").includes(String(date.getDate()));
  const weekdayPass = String(activity.weekdays || "1111111")[weekdayIndex] === "1";
  const amountPass = !toNumber(activity.sumamt) || orderTotals.amount >= toNumber(activity.sumamt);
  const quantityPass = !toNumber(activity.sumqty) || orderTotals.qty >= toNumber(activity.sumqty);
  const conditionRows = (activity.conditionItemList || []).map(item => {
    const matchedItems = (values.selectedItems || []).filter(selected => Number(item.wareid) === 0 || String(item.wareid) === String(selected.code));
    const evaluations = matchedItems.map(selected => {
      const amount = toNumber(selected.amount); const qty = toNumber(selected.qty); const profit = toNumber(selected.profit) / 100;
      const purchasedConditionProduct = activity.playType !== "无明确门槛赠品" || qty > 0;
      const pass = purchasedConditionProduct && (!toNumber(item.sumamt) || amount >= toNumber(item.sumamt)) && (!toNumber(item.sumqty) || qty >= toNumber(item.sumqty)) && (!toNumber(item.profitrate) || profit > toNumber(item.profitrate));
      const ratios = [toNumber(item.sumamt) ? Math.floor(amount / toNumber(item.sumamt)) : null, toNumber(item.sumqty) ? Math.floor(qty / toNumber(item.sumqty)) : null].filter(value => value !== null);
      return { pass, ratio: ratios.length ? Math.min(...ratios) : 1, code: selected.code };
    });
    const passingEvaluations = evaluations.filter(row => row.pass);
    return { rowno: item.rowno, pass: passingEvaluations.length > 0, ratio: passingEvaluations.length ? Math.max(...passingEvaluations.map(row => row.ratio)) : 0, matchedCodes: evaluations.map(row => row.code), passedCodes: passingEvaluations.map(row => row.code) };
  });
  const conditionPass = !conditionRows.length || (toNumber(activity.plannum) === 1 ? conditionRows.some(row => row.pass) : conditionRows.every(row => row.pass));
  const eligible = timePass && storePass && dayPass && weekdayPass && amountPass && quantityPass && conditionPass;
  let repeatTimes = eligible ? 1 : 0;
  if (eligible && toNumber(activity.repeatflag) === 1) { const mainRatios = [toNumber(activity.sumamt) ? Math.floor(orderTotals.amount / toNumber(activity.sumamt)) : null, toNumber(activity.sumqty) ? Math.floor(orderTotals.qty / toNumber(activity.sumqty)) : null].filter(value => value !== null); const rowRatios = conditionRows.filter(row => row.pass).map(row => row.ratio); const candidates = [...mainRatios, ...(rowRatios.length ? [toNumber(activity.plannum) === 1 ? Math.max(...rowRatios) : Math.min(...rowRatios)] : [])]; repeatTimes = candidates.length ? Math.max(1, Math.min(...candidates)) : 1; }
  const missingBenefit = toNumber(activity.givetype) !== 6 && !(activity.giftItemList || []).length;
  const edge = activity.playType === "免费赠品与加价商品混合";
  const benefits = buildBenefitRows(activity, conditionRows, eligible && !missingBenefit, repeatTimes);
  const outcome = missingBenefit ? "优惠明细缺失，无法试算" : !eligible ? "不产生优惠" : edge ? `命中${benefits.length}项配置，执行关系待确认` : `命中${benefits.length}项权益配置`;
  return { eligible: eligible && !missingBenefit, rawEligible: eligible, missingBenefit, edge, outcome, benefits, repeatTimes, conditionRows, orderTotals, checks: [{ label: "活动时间", pass: timePass, detail: `${activity.starttime} 至 ${activity.endtime}` }, { label: "适用门店", pass: storePass, detail: storeSummary(activity.busnos) }, { label: "参与日期", pass: dayPass && weekdayPass, detail: `${isAll(activity.days) ? "所有日期" : `每月${activity.days}日`}；${weekdayText(activity.weekdays)}` }, { label: "整单金额", pass: amountPass, detail: toNumber(activity.sumamt) ? `所选商品合计 ${orderTotals.amount.toFixed(2)} 元，需满 ${activity.sumamt} 元` : `所选商品合计 ${orderTotals.amount.toFixed(2)} 元，无门槛` }, { label: "整单数量", pass: quantityPass, detail: toNumber(activity.sumqty) ? `所选商品合计 ${orderTotals.qty} 件，需满 ${activity.sumqty} 件` : `所选商品合计 ${orderTotals.qty} 件，无门槛` }, { label: "条件商品", pass: conditionPass, detail: relationText(activity.plannum) }] };
};

export function RealPromotionCalculator({ Frame, setView }) {
  const { loading, error, activities } = useRealPromotionData();
  const [playType, setPlayType] = useState("买X件送Y"); const [keyword, setKeyword] = useState(""); const [activityId, setActivityId] = useState(null); const [form, setForm] = useState(null); const [trial, setTrial] = useState(null); const [toast, setToast] = useState(""); const [newProductCode, setNewProductCode] = useState(""); const [quickProductCode, setQuickProductCode] = useState("");
  const typeActivities = useMemo(() => activities.filter(activity => activity.playType === playType && (!keyword.trim() || activity.promName?.includes(keyword.trim()) || String(activity.pstplanno).includes(keyword.trim()))), [activities, playType, keyword]);
  const activity = activities.find(item => item.id === activityId) || typeActivities[0] || activities[0];
  useEffect(() => { if (activity && (!form || activity.id !== activityId)) { const scenario = scenarioFor(activity); setActivityId(activity.id); setForm(scenario); setTrial(scenario); } }, [activity?.id]);
  const result = activity && trial ? trialFor(activity, trial) : null;
  const switchType = type => { setPlayType(type); setKeyword(""); const next = activities.find(item => item.playType === type); if (next) { const scenario = scenarioFor(next); setActivityId(next.id); setForm(scenario); setTrial(scenario); } };
  const loadActivity = id => { const next = activities.find(item => item.id === Number(id)); if (!next) return; const scenario = scenarioFor(next); setActivityId(next.id); setForm(scenario); setTrial(scenario); };
  const updateForm = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const updateSelectedItem = (id, key, value) => setForm(current => ({ ...current, selectedItems: current.selectedItems.map(item => item.id === id ? { ...item, [key]: value } : item) }));
  const removeSelectedItem = id => setForm(current => ({ ...current, selectedItems: current.selectedItems.filter(item => item.id !== id) }));
  const addProductByCode = rawCode => {
    const code = String(rawCode || "").trim();
    if (!code) { setToast("请输入商品编码"); return; }
    if (form.selectedItems.some(item => item.code === code)) { setToast("该商品已在所选商品中"); return; }
    setForm(current => ({ ...current, selectedItems: [...current.selectedItems, { id: `${code}-${Date.now()}`, code, amount: "0", qty: "1", profit: "20" }] }));
    setNewProductCode(""); setQuickProductCode(""); setToast("商品已添加"); window.setTimeout(() => setToast(""), 1800);
  };
  const addSelectedItem = () => addProductByCode(newProductCode);
  const loadScenario = passing => { const scenario = scenarioFor(activity, passing); setForm(scenario); setTrial(scenario); setToast(passing ? "已带入达标示例" : "已带入未达标示例"); };
  const runTrial = () => { setTrial(JSON.parse(JSON.stringify(form))); setToast("促销试算完成"); window.setTimeout(() => setToast(""), 1800); };
  const playTypes = PLAY_ORDER.filter(type => activities.some(activityItem => activityItem.playType === type));
  const currentActivityStore = activity ? (isAll(activity.busnos) ? "7311555" : String(activity.busnos).split(",").find(Boolean) || "7311555") : "";
  const formTotals = form ? selectedItemTotals(form.selectedItems) : { amount: 0, qty: 0 };
  const conditionProductCodes = activity ? [...new Set((activity.conditionItemList || []).map(item => String(item.wareid)).filter(code => code !== "0"))] : [];
  const hasAllProductRule = activity?.conditionItemList?.some(item => Number(item.wareid) === 0);
  const nonConditionProductCodes = useMemo(() => {
    if (!activity || hasAllProductRule) return [];
    const excluded = new Set(conditionProductCodes);
    const candidates = [];
    activities.forEach(source => {
      (source.conditionItemList || []).forEach(item => { const code = String(item.wareid); if (code !== "0" && !excluded.has(code) && !candidates.includes(code)) candidates.push(code); });
      (source.giftItemList || []).forEach(item => { const code = String(item.pstid); if (code !== "0" && !excluded.has(code) && !candidates.includes(code)) candidates.push(code); });
    });
    return candidates.slice(0, 8);
  }, [activities, activity?.id, hasAllProductRule]);
  return <Frame crumb="独立促销试算" section="marketing" setView={setView}>
    <section className="panel promotion-calculator-overview"><div><div className="four-in-one-title-line"><h2>独立促销试算</h2><span className="calculator-scope-badge">演示口径</span><span className="real-source-badge">真实活动数据</span></div><p>活动配置来自数据库快照；试算用于产品与研发核对字段组合，不作为生产订单结算依据。</p></div><button className="secondary" onClick={() => setView("realPromotionManager")}><FiDatabase /> 返回活动管理</button></section>
    <DataState loading={loading} error={error} />
    {!loading && !error && activity && form && result && <><section className="panel real-calculator-selector"><div className="real-play-tabs">{playTypes.map(type => <button key={type} className={playType === type ? "active" : ""} onClick={() => switchType(type)}>{type}<b>{activities.filter(item => item.playType === type).length}</b></button>)}</div><div className="real-activity-picker"><label>搜索真实活动<input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="活动名称或活动编号" /></label><label>选择活动<select value={activity.id} onChange={event => loadActivity(event.target.value)}>{typeActivities.slice(0, 500).map(item => <option key={item.id} value={item.id}>{item.promName}（{item.pstplanno}）</option>)}</select></label></div><div className="calculator-rule-summary"><span>当前配置</span><strong>{ruleSummary(activity)}</strong><em>{relationText(activity.plannum)} · {repeatText(activity.repeatflag)}</em></div>{activity.playType === "免费赠品与加价商品混合" && <div className="calculator-config-warning"><FiAlertTriangle /><span>该活动同时存在免费和加价商品，模型将逐项展示配置，不推断它们是同时获得还是任选。</span></div>}{result.missingBenefit && <div className="calculator-config-warning danger"><FiAlertTriangle /><span>该活动没有优惠商品明细，只能查看主表配置，不能生成优惠试算结果。</span></div>}</section>
      <div className="promotion-calculator-workspace">
        <section className="panel promotion-calculator-input">
          <div className="calculator-section-title"><div><h3>订单与履约条件</h3><p>订单金额与数量由下方所选商品自动汇总。</p></div><div><button className="text-btn" onClick={() => loadScenario(true)}>带入达标示例</button><button className="text-btn" onClick={() => loadScenario(false)}>带入未达标示例</button></div></div>
          <div className="calculator-order-grid">
            <label>交易日期<input type="date" value={form.date} onChange={event => updateForm("date", event.target.value)} /></label>
            <label>履约门店<select value={form.store} onChange={event => updateForm("store", event.target.value)}><option value={currentActivityStore}>{currentActivityStore}</option><option value="__not-participating__">不适用门店（演示）</option></select></label>
            <label>订单商品金额<div className="calculator-total-field"><strong>{formTotals.amount.toFixed(2)}</strong><span>元</span></div></label>
            <label>订单商品数量<div className="calculator-total-field"><strong>{formTotals.qty}</strong><span>件</span></div></label>
          </div>

          <div className="calculator-section-title condition-input-title"><div><h3>条件商品配置</h3><p>{activity.playType === "无明确门槛赠品" ? "数据库原始门槛保持不变；业务判断为实际购买满足条件关系的商品即可。" : "这里仅展示数据库中的规则要求；实际购买数据请在下方所选商品中填写。"}</p></div></div>
          <table className="coupon-table calculator-condition-table condition-config-table">
            <thead><tr><th>条件商品</th><th>规则要求</th><th>所选商品匹配</th><th>判断</th></tr></thead>
            <tbody>{activity.conditionItemList.map(item => { const rowResult = result.conditionRows.find(row => row.rowno === item.rowno); const requirements = activity.playType === "无明确门槛赠品" ? "购买该商品即可" : [toNumber(item.sumamt) ? `满${item.sumamt}元` : "", toNumber(item.sumqty) ? `满${item.sumqty}件` : "", toNumber(item.profitrate) ? `毛利率>${toNumber(item.profitrate) * 100}%` : ""].filter(Boolean).join("、") || "无额外门槛"; return <tr key={item.id || item.rowno}><td><strong>{productLabel(item.wareid)}</strong><span>{respriceText(item.resprice)}</span></td><td>{requirements}</td><td>{rowResult?.matchedCodes?.length ? rowResult.matchedCodes.join("、") : "未选择匹配商品"}</td><td><span className={rowResult?.pass ? "calculator-pass" : "calculator-fail"}>{rowResult?.pass ? "满足" : "不满足"}</span></td></tr>; })}</tbody>
          </table>
          {!activity.conditionItemList.length && <p className="empty-row">该活动没有条件商品明细，仅按活动主表门槛判断。</p>}

          <div className="calculator-section-title selected-products-title">
            <div><h3>所选商品</h3><p>可同时加入条件商品和非条件商品；非条件商品只参与整单金额、数量汇总。</p></div>
            <div className="selected-product-controls">
              <div className="quick-product-picker">
                <select value={quickProductCode} onChange={event => setQuickProductCode(event.target.value)} aria-label="快捷选择商品">
                  <option value="">请选择商品</option>
                  {!!conditionProductCodes.length && <optgroup label="条件商品">{conditionProductCodes.map(code => <option key={`condition-${code}`} value={code}>商品编码 {code}（条件商品）</option>)}</optgroup>}
                  {!!nonConditionProductCodes.length && <optgroup label="非条件商品">{nonConditionProductCodes.map(code => <option key={`other-${code}`} value={code}>商品编码 {code}（非条件商品）</option>)}</optgroup>}
                </select>
                <button className="secondary" disabled={!quickProductCode} onClick={() => addProductByCode(quickProductCode)}><FiPlus /> 加入所选</button>
              </div>
              {hasAllProductRule && <small>当前规则适用于所有商品，因此不存在非条件商品。</small>}
              {!hasAllProductRule && !!nonConditionProductCodes.length && <small>非条件商品编码取自数据库快照中的其他真实活动。</small>}
              <div className="selected-product-adder"><input value={newProductCode} onChange={event => setNewProductCode(event.target.value)} onKeyDown={event => { if (event.key === "Enter") addSelectedItem(); }} placeholder="也可输入其他商品编码" /><button className="secondary" onClick={addSelectedItem}><FiPlus /> 添加商品</button></div>
            </div>
          </div>
          <table className="coupon-table calculator-selected-table">
            <thead><tr><th>商品属性</th><th>商品编码</th><th>商品金额</th><th>商品数量</th><th>当前毛利率</th><th>操作</th></tr></thead>
            <tbody>{form.selectedItems.map(item => <tr key={item.id}><td><span className={selectedItemKind(activity, item.code).startsWith("条件商品") ? "selected-kind condition" : "selected-kind"}>{selectedItemKind(activity, item.code)}</span></td><td><strong>{item.code}</strong></td><td><input type="number" min="0" step="0.01" value={item.amount} onChange={event => updateSelectedItem(item.id, "amount", event.target.value)} /></td><td><input type="number" min="0" step="1" value={item.qty} onChange={event => updateSelectedItem(item.id, "qty", event.target.value)} /></td><td><div className="calculator-profit-field"><input type="number" min="0" max="100" step="0.01" value={item.profit} onChange={event => updateSelectedItem(item.id, "profit", event.target.value)} /><span>%</span></div></td><td><button className="selected-product-remove" aria-label={`删除商品 ${item.code}`} onClick={() => removeSelectedItem(item.id)}><FiTrash2 /> 删除</button></td></tr>)}</tbody>
          </table>
          {!form.selectedItems.length && <p className="empty-row">尚未选择商品，请输入商品编码后添加。</p>}
          <div className="calculator-actions"><button className="primary" disabled={result.missingBenefit} onClick={runTrial}><FiActivity /> {result.missingBenefit ? "无法试算" : "开始试算"}</button><button className="secondary" onClick={() => loadScenario(true)}>恢复达标示例</button></div>
        </section>
        <aside className="panel promotion-calculator-result"><div className={`calculator-result-hero ${result.eligible ? "eligible" : "ineligible"}`}><span>{result.missingBenefit ? "活动配置不完整" : result.eligible ? "活动条件已满足" : "活动条件未满足"}</span><strong>{result.outcome}</strong><p>{result.missingBenefit ? "请先补齐或重新同步优惠商品明细" : result.eligible ? `本次演示命中 ${result.repeatTimes} 次` : "请检查未通过的条件"}</p></div><div className="calculator-checks"><h3>命中过程</h3>{result.checks.map(check => <div key={check.label}><i className={check.pass ? "pass" : "fail"}>{check.pass ? "✓" : "×"}</i><span><b>{check.label}</b><small>{check.detail}</small></span></div>)}</div><div className="calculator-benefit-preview"><h3>权益结果列表</h3>{result.benefits.length ? <ul>{result.benefits.map(benefit => <li key={benefit.key}><div><strong>{benefit.product}</strong><span>{benefit.relation}</span></div><div><b>{benefit.mode}</b><em>{benefit.value}</em></div></li>)}</ul> : <p>{result.missingBenefit ? "数据库中没有可用于计算的优惠商品明细" : "当前条件下无权益结果"}</p>}</div><p className="calculator-assumption">演示口径：所选商品自动汇总整单金额和数量；只用匹配条件编码的商品判断商品级门槛，非条件商品不参与商品级门槛。主表门槛与条件组同时满足；多条件按 plannum 的 OR/AND 配置判断；同商品、同行号的条件与权益仅标记为“结构推测”，不冒充已确认映射；重复次数按门槛最小倍数演示。resprice 的 0、2、空值及 givenum=0、99999 仍保留原值并提示待确认。</p></aside>
      </div></>}
    {toast && <div className="erp-sync-toast" role="status"><span>✓</span>{toast}</div>}
  </Frame>;
}
