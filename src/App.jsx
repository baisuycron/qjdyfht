import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiBox,
  FiCalendar,
  FiClipboard,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCreditCard,
  FiGift,
  FiHome,
  FiLogOut,
  FiMapPin,
  FiMenu,
  FiPackage,
  FiPercent,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiShoppingBag,
  FiSliders,
  FiTag,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { TradeModule } from "./TradeModule.jsx";

const navItems = [
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

const coupons = [
  ["金额券", "2-10214-MRE", "测试金额券-全渠道4-商品不限", "¥9.90", "绝对有效期", "2026-07-23 ~ 2026-07-31", "无门槛"],
  ["金额券", "2-10213-HGX", "测试金额券-全渠道-不限网点", "¥9.90", "绝对有效期", "2026-07-23 ~ 2026-07-31", "满99元可用"],
  ["金额券", "2-10209-MMY", "金额券-仅私域商城3", "¥9.90", "绝对有效期", "2026-07-23 ~ 2026-07-31", "无门槛"],
  ["金额券", "2-10216-KBB", "测试金额券-全渠道5-限制", "¥19.90", "相对有效期", "获券后7天内有效", "满159元可用"],
  ["金额券", "2-10219-YXP", "测试金额券-全渠道6-排除商品", "¥19.90", "相对有效期", "获券后7天内有效", "无门槛"],
  ["折扣券", "2-10221-PSX", "折扣券-全部渠道1-不限", "9折", "绝对有效期", "2026-07-23 ~ 2026-07-31", "满88元可用"],
  ["礼品券", "2-10225-JJT", "礼品券-全部渠道1-不限", "可兑换指定礼品", "绝对有效期", "2026-07-23 ~ 2026-07-31", "无门槛"],
  ["金额券", "2-10246-JPW", "测试金额券-全渠道5-商品不限", "¥9.90", "绝对有效期", "2026-07-24 ~ 2026-07-31", "满99元可用"],
  ["金额券", "2-10220-TBA", "测试金额券-全渠道6-排除商品", "¥29.90", "相对有效期", "获券后1个自然月内有效", "满299元可用"],
  ["折扣券", "2-10222-QDA", "折扣券-全部渠道2-限制网点/商品", "8.8折", "相对有效期", "获券后9天内有效", "满199元可用"],
];

function Sidebar({ section, onSection }) {
  return <aside className="sidebar">
    <div className="brand"><strong>千金健康商城</strong><span>运营平台</span></div>
    <nav>{navItems.map(([label, Icon, target]) => <button key={label} className={section === target ? "nav-item active" : "nav-item"} onClick={() => target && onSection(target)}><Icon /><span>{label}</span></button>)}</nav>
    <button className="collapse"><FiMenu /></button>
  </aside>;
}

function Topbar({ crumb }) {
  return <><header className="topbar"><span>{crumb}</span><div className="account"><button><FiClipboard /> 导出记录</button><span className="account-name"><FiUser /> admin⌄</span></div></header></>;
}

const promotionTypeLabel = type => type === "满额+XX元换购" ? "满额换购" : type;
const promotionListView = type => type === "限时折扣" ? ["storePromotion", type] : type === "组合价" ? "combinationPrice" : ["erpPromotion", type];
function MarketingDetailCrumb({ type, setView, listView }) {
  return <><button className="breadcrumb-link" onClick={() => setView(listView || promotionListView(type))}>{promotionTypeLabel(type)}</button><span> › 活动详情</span></>;
}

function Dashboard({ setView }) {
  const [range, setRange] = useState("近7日");
  const cards = [["今日有效销售总额", "0.01", "统计范围：所有运营中门店，支付成功订单实付金额合计"], ["今日有效订单数", "1", "支付成功订单计入统计，每日统计一次；点击跳转订单列表"], ["今日新增会员数", "0", "当日新注册会员数，每日统计一次；点击跳转会员管理"]];
  return <PageFrame crumb="控制台" section="dashboard" setView={setView} homeNav>
    <div className="metric-row">{cards.map((card, i) => <button className="metric-card" key={card[0]} onClick={() => i === 1 ? setView("coupon") : null}><h3>{card[0]}</h3><strong>{card[1]}</strong><p>{card[2]}</p></button>)}</div>
    <section className="panel pending"><h2>待处理事项</h2><div className="pending-grid">{[["233", "待发货订单"], ["0", "待处理退款"], ["0", "待处理退货"], ["0", "待处理投诉"]].map(([n, l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}</div></section>
    <section className="panel trend"><div className="section-title"><h2>经营趋势</h2><div className="periods">{["近7日", "近30日", "本月"].map(x => <button className={range === x ? "selected" : ""} onClick={() => setRange(x)} key={x}>{x}</button>)}</div></div><div className="legend"><i className="blue" />支付金额 <i className="green" />新增会员数 <i className="yellow" />支付件数</div><TrendChart range={range} /></section>
  </PageFrame>;
}

function TrendChart({ range }) {
  const labels = range === "近7日" ? ["2026-07-29", "2026-07-30", "2026-07-31", "2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04"] : ["第1天", "第5天", "第10天", "第15天", "第20天", "第25天", "今天"];
  return <div className="chart-wrap"><div className="ylabels"><span>1,200</span><span>1,000</span><span>800</span><span>600</span><span>400</span><span>200</span><span>0</span></div><svg className="trend-svg" viewBox="0 0 1100 330" preserveAspectRatio="none" aria-label="经营趋势图"><g className="grid">{[15, 67, 119, 171, 223, 275, 327].map(y => <line key={y} x1="0" x2="1100" y1={y} y2={y} />)}</g><polyline className="line blue-line" points="70,327 240,326 410,327 580,327 750,327 920,327 1080,327" /><polyline className="line green-line" points="70,327 240,275 410,327 580,327 750,327 920,67 1080,327" />{[70,240,410,580,750,920,1080].map((x, i) => <g key={x}><circle className="dot green-dot" cx={x} cy={[327,275,327,327,327,67,327][i]} r="4" /><circle className="dot yellow-dot" cx={x} cy="327" r="3" /></g>)}</svg><div className="xlabels">{labels.map(x => <span key={x}>{x}</span>)}</div></div>;
}

function MarketingGuide({ setView }) {
  return <PageFrame crumb="营销" section="marketing" setView={setView}><section className="marketing-guide"><div className="guide-section"><h2>平台促销</h2><div className="guide-cards platform-promotion-cards"><button onClick={() => setView("coupon")}><span className="guide-icon red"><FiTag /></span><div><b>优惠券</b><p>向客户发放优惠劵</p></div></button><button onClick={() => setView("ad")}><span className="guide-icon orange"><FiGift /></span><div><b>弹窗广告</b><p>设置首页弹窗广告</p></div></button><button onClick={() => setView("memberPriceRules")}><span className="guide-icon blue"><FiPercent /></span><div><b>固定会员价规则</b><p>查看固定折扣并进行规则试算</p></div></button><button onClick={() => setView(["erpPromotion", "满减满赠"])}><span className="guide-icon purple"><FiShoppingBag /></span><div><b>满减满赠</b><p>满额减现金或赠送指定商品</p></div></button><button onClick={() => setView(["erpPromotion", "满额+XX元换购"])}><span className="guide-icon amber"><FiGift /></span><div><b>满额换购</b><p>达到金额门槛后加价换购商品</p></div></button><button onClick={() => setView(["erpPromotion", "买X送Y"])}><span className="guide-icon green"><FiPackage /></span><div><b>买X送Y</b><p>购买指定数量后赠送商品</p></div></button><button onClick={() => setView(["storePromotion", "限时折扣"])}><span className="guide-icon teal"><FiClock /></span><div><b>限时折扣</b><p>查看门店商品的限时优惠</p></div></button><button onClick={() => setView("combinationPrice")}><span className="guide-icon indigo"><FiBox /></span><div><b>组合价</b><p>组合商品活动</p></div></button></div></div><div className="guide-section interface-model-guide"><h2>接口演示</h2><div className="guide-cards"><button onClick={() => setView("fourInOneModel")}><span className="guide-icon slate"><FiClipboard /></span><div><b>四合一营销活动接口</b><p>按最后修改时间查询四类活动响应</p></div></button><button onClick={() => setView("fourInOneCalculator")}><span className="guide-icon cyan"><FiActivity /></span><div><b>四合一促销试算</b><p>输入订单条件，演示优惠命中过程</p></div></button></div></div></section></PageFrame>;
}

const storeActivities = {
  "满减满赠": [["夏日满299减30", "满减", "2026-08-01 ~ 2026-08-15", "全部门店", "进行中"], ["健康好礼满赠", "满赠", "2026-08-05 ~ 2026-08-20", "指定门店", "未开始"], ["年中感恩满减", "满减", "2026-07-01 ~ 2026-07-31", "全部门店", "已结束"]],
  "限时折扣": [["会员专享8.8折", "限时折扣", "2026-08-01 ~ 2026-08-10", "全部门店", "进行中"], ["夏季清凉专场", "限时折扣", "2026-08-08 ~ 2026-08-12", "指定门店", "未开始"]],
};

const limitedDiscountActivities = [
  { promName: "夏季清凉专场", promno: "PROM202608001", distype: 0, starttime: "2026-08-01 00:00:00", endtime: "2026-08-10 23:59:59", busnos: "all", days: "all", weekdays: "1111111", lasttime: "2026-08-03 10:15:20", status: "进行中", itemList: [{ wareid: "100001", disrate: 0.88 }, { wareid: "100032", disrate: 0.88 }] },
  { promName: "会员专享8.8折", promno: "PROM202608002", distype: 1, starttime: "2026-08-08 00:00:00", endtime: "2026-08-12 23:59:59", busnos: "001,002", days: "all", weekdays: "1111100", lasttime: "2026-08-03 15:30:12", status: "未开始", itemList: [{ wareid: "100215", promprice: 28.5 }, { wareid: "100306", promprice: 49.9 }] },
  { promName: "年中健康专场", promno: "PROM202607018", distype: 2, starttime: "2026-07-01 00:00:00", endtime: "2026-07-31 23:59:59", busnos: "all", days: "8,18,28", weekdays: "0000111", lasttime: "2026-07-30 18:20:04", status: "已结束", itemList: [{ wareid: "100501", promprice: 20 }] },
  { promName: "秋日焕新专场", promno: "PROM202609003", distype: 0, starttime: "2026-09-01 00:00:00", endtime: "2026-09-10 23:59:59", busnos: "all", days: "all", weekdays: "1111111", lasttime: "2026-08-04 09:20:18", status: "未开始", itemList: [{ wareid: "100608", disrate: 0.9 }] },
  { promName: "周末会员专享", promno: "PROM202608009", distype: 1, starttime: "2026-08-08 09:00:00", endtime: "2026-08-09 22:00:00", busnos: "003,005", days: "all", weekdays: "0000011", lasttime: "2026-08-04 11:05:36", status: "未开始", itemList: [{ wareid: "100719", promprice: 39.9 }] },
  { promName: "夏末清仓特惠", promno: "PROM202608010", distype: 2, starttime: "2026-08-01 00:00:00", endtime: "2026-08-31 23:59:59", busnos: "all", days: "all", weekdays: "1111111", lasttime: "2026-08-04 13:42:09", status: "进行中", itemList: [{ wareid: "100824", promprice: 15 }] },
  { promName: "营养健康周", promno: "PROM202608011", distype: 0, starttime: "2026-08-11 00:00:00", endtime: "2026-08-17 23:59:59", busnos: "006", days: "all", weekdays: "1111111", lasttime: "2026-08-04 15:16:44", status: "未开始", itemList: [{ wareid: "100935", disrate: 0.85 }] },
  { promName: "家庭常备药专场", promno: "PROM202608012", distype: 1, starttime: "2026-08-15 00:00:00", endtime: "2026-08-20 23:59:59", busnos: "all", days: "all", weekdays: "1111111", lasttime: "2026-08-04 16:08:27", status: "未开始", itemList: [{ wareid: "101043", promprice: 18.8 }] },
  { promName: "暑期防暑特惠", promno: "PROM202607025", distype: 2, starttime: "2026-07-15 00:00:00", endtime: "2026-07-25 23:59:59", busnos: "002,004", days: "all", weekdays: "1111111", lasttime: "2026-07-25 18:00:11", status: "已结束", itemList: [{ wareid: "101154", promprice: 12 }] },
  { promName: "会员回馈日", promno: "PROM202607030", distype: 0, starttime: "2026-07-28 00:00:00", endtime: "2026-07-30 23:59:59", busnos: "all", days: "all", weekdays: "1110000", lasttime: "2026-07-30 23:30:00", status: "已结束", itemList: [{ wareid: "101266", disrate: 0.95 }] },
  { promName: "夏日养护计划", promno: "PROM202608015", distype: 1, starttime: "2026-08-20 00:00:00", endtime: "2026-08-25 23:59:59", busnos: "001,008", days: "all", weekdays: "1111111", lasttime: "2026-08-05 08:30:42", status: "未开始", itemList: [{ wareid: "101378", promprice: 56.8 }] },
];

const limitedDiscountProductDetails = {
  "100001": { name: "蒲地蓝消炎片", specification: "0.3g*24片" }, "100032": { name: "藿香正气水", specification: "10ml*10支" },
  "100215": { name: "维生素C泡腾片", specification: "1g*20片" }, "100306": { name: "钙尔奇碳酸钙D3片", specification: "60片/瓶" },
  "100501": { name: "蛋白粉", specification: "400g/罐" }, "100608": { name: "医用外科口罩", specification: "10只/袋" },
  "100719": { name: "复方板蓝根颗粒", specification: "15g*20袋" }, "100824": { name: "清凉油", specification: "3g/盒" },
  "100935": { name: "医用口罩", specification: "10只/袋" }, "101043": { name: "小儿氨酚烷胺颗粒", specification: "6g*15袋" },
  "101154": { name: "风油精", specification: "9ml/瓶" }, "101266": { name: "维生素D滴剂", specification: "400IU*30粒" },
  "101378": { name: "阿胶糕", specification: "250g/盒" },
};

const promotionProductDetails = {
  ...limitedDiscountProductDetails,
  "100502": { name: "乳清蛋白粉", specification: "400g/罐" },
  "200001": { name: "维C泡腾片", specification: "1g*20片" },
  "200018": { name: "旅行装洗护套装", specification: "3件/套" },
  "200101": { name: "抽纸", specification: "3层*100抽" },
  "200102": { name: "湿巾", specification: "10片/包" },
  "200103": { name: "牙膏旅行装", specification: "30g/支" },
  "200105": { name: "护手霜", specification: "50g/支" },
  "200201": { name: "保温杯", specification: "350ml/个" },
  "200202": { name: "毛巾", specification: "1条/袋" },
  "200203": { name: "洗手液", specification: "250ml/瓶" },
  "200204": { name: "收纳袋", specification: "1个" },
  "200208": { name: "家庭药箱", specification: "1个" },
  "200301": { name: "便携药盒", specification: "1个" },
  "200302": { name: "旅行水杯", specification: "300ml/个" },
  "200303": { name: "棉签", specification: "50支/袋" },
  "200319": { name: "牙线", specification: "50支/盒" },
  "200401": { name: "营养杯", specification: "1个" },
  "200402": { name: "量勺", specification: "1个" },
  "200403": { name: "密封夹", specification: "2个/袋" },
  "200501": { name: "收纳包", specification: "1个" },
  "200508": { name: "清凉油", specification: "3g/盒" },
  "200601": { name: "漱口杯", specification: "1个" },
};

const statusClasses = { "进行中": "status status-active", "未开始": "status status-pending", "已结束": "status status-ended" };
const activityStatusOptions = ["全部", "未开始", "进行中", "已结束"];
const discountTypeNames = { 0: "按折扣率", 1: "按促销价", 2: "减价格" };
const parseBusinessDateTime = value => Date.parse(`${value.replace(" ", "T")}+08:00`);
const formatBusinessDateTime = (value = Date.now()) => {
  const parts = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(value);
  const part = type => parts.find(item => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}:${part("second")}`;
};
const getActivityStatus = (activity, now = Date.now()) => {
  if (activity.terminatedAt || activity.autoEndedAt) return "已结束";
  const start = parseBusinessDateTime(activity.starttime);
  const end = parseBusinessDateTime(activity.endtime);
  const currentSecond = Math.floor(now / 1000) * 1000;
  if (currentSecond < start) return "未开始";
  if (currentSecond > end) return "已结束";
  return "进行中";
};
const useCurrentTime = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
};
const isAllScope = value => value === "all" || value === "全部";
const specifiedStoreCount = value => String(value).split(",").map(item => item.trim()).filter(Boolean).length;
const storeScopeText = value => isAllScope(value) ? "全部门店" : `指定门店(${specifiedStoreCount(value)}家)`;
const storeScopeSummary = storeScopeText;
const storeNamesByCode = {
  "001": "千金大药房株洲演示店", "002": "千金大药房车站北路演示店", "003": "千金大药房芙蓉路演示店", "004": "千金大药房河西演示店",
  "005": "千金大药房中心广场演示店", "006": "千金大药房云龙演示店", "008": "千金大药房天元演示店",
  "101001": "千金大药房株洲演示店", "101002": "千金大药房车站北路演示店", "101003": "千金大药房芙蓉路演示店", "101004": "千金大药房河西演示店",
  "101005": "千金大药房中心广场演示店", "101006": "千金大药房云龙演示店", "101007": "千金大药房天元演示店", "101008": "千金大药房荷塘演示店",
  "101009": "千金大药房石峰演示店", "101010": "千金大药房红旗广场演示店", "101012": "千金大药房醴陵演示店",
};
const storeNamesText = value => isAllScope(value) ? "全部门店" : String(value).split(",").map(code => storeNamesByCode[code.trim()] || code.trim()).filter(Boolean).join("、");
const matchesStoreName = (busnos, keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  return !normalizedKeyword || isAllScope(busnos) || storeNamesText(busnos).toLowerCase().includes(normalizedKeyword);
};
const storeRecordsForScope = busnos => String(busnos).split(",").map(code => code.trim()).filter(Boolean).map(code => {
  const name = storeNamesByCode[code] || `千金大药房${code}店`;
  const region = name.includes("醴陵") ? "株洲醴陵区域" : "株洲市区区域";
  return { code, name, nature: ["101002", "101005", "101009"].includes(code) ? "加盟店" : "直营店", phone: String(Number(code.slice(-6)) + 28000000).slice(-8), region, address: `湖南省${region.replace("区域", "")}` };
});
const weekdayText = value => value.split("").map((enabled, index) => enabled === "1" ? `周${["一", "二", "三", "四", "五", "六", "日"][index]}` : "").filter(Boolean).join("、");
const discountSummary = activity => activity.distype === 0 ? `${(activity.itemList[0].disrate * 10).toFixed(1)}折` : activity.distype === 1 ? `促销价￥${activity.itemList[0].promprice}` : `立减￥${activity.itemList[0].promprice}`;

const memberPriceDays = [8, 18, 28];
const memberPriceRules = [
  { priority: 1, ruleName: "会员价禁用商品不打折", memcardflag: 1, classcode: null, memberDay: null, cardlevels: null, profitRateLower: null, profitRateLowerInclusive: null, profitRateUpper: null, profitRateUpperInclusive: null, discountRate: 1 },
  { priority: 2, ruleName: "指定分类商品统一九八折", memcardflag: null, classcode: "01011301", memberDay: null, cardlevels: [1, 2, 3, 4, 5, 6], profitRateLower: 0.15, profitRateLowerInclusive: false, profitRateUpper: null, profitRateUpperInclusive: null, discountRate: 0.98 },
  { priority: 3, ruleName: "会员日高毛利商品八五折", memcardflag: null, classcode: null, memberDay: true, cardlevels: [1, 2, 3, 4, 5, 6], profitRateLower: 0.15, profitRateLowerInclusive: false, profitRateUpper: null, profitRateUpperInclusive: null, discountRate: 0.85 },
  { priority: 4, ruleName: "会员日普通毛利商品九八折", memcardflag: null, classcode: null, memberDay: true, cardlevels: [1, 2, 3, 4, 5, 6], profitRateLower: 0.02, profitRateLowerInclusive: false, profitRateUpper: 0.15, profitRateUpperInclusive: false, discountRate: 0.98 },
  { priority: 5, ruleName: "六级会员非会员日八五折", memcardflag: null, classcode: null, memberDay: false, cardlevels: [6], profitRateLower: 0.3, profitRateLowerInclusive: false, profitRateUpper: null, profitRateUpperInclusive: null, discountRate: 0.85 },
  { priority: 6, ruleName: "五级会员非会员日九折", memcardflag: null, classcode: null, memberDay: false, cardlevels: [5], profitRateLower: 0.3, profitRateLowerInclusive: false, profitRateUpper: null, profitRateUpperInclusive: null, discountRate: 0.9 },
  { priority: 7, ruleName: "一至四级会员非会员日九八折", memcardflag: null, classcode: null, memberDay: false, cardlevels: [1, 2, 3, 4], profitRateLower: 0.3, profitRateLowerInclusive: false, profitRateUpper: null, profitRateUpperInclusive: null, discountRate: 0.98 },
  { priority: 8, ruleName: "非会员日普通毛利商品九八折", memcardflag: null, classcode: null, memberDay: false, cardlevels: [1, 2, 3, 4, 5, 6], profitRateLower: 0.15, profitRateLowerInclusive: false, profitRateUpper: 0.3, profitRateUpperInclusive: true, discountRate: 0.98 },
  { priority: 999, ruleName: "其他情况不打折", memcardflag: null, classcode: null, memberDay: null, cardlevels: null, profitRateLower: null, profitRateLowerInclusive: null, profitRateUpper: null, profitRateUpperInclusive: null, discountRate: 1 },
];

const memberPriceDefaultTrial = { date: "2026-08-18", cardlevel: "3", memcardflag: "0", classcode: "01011302", profitRate: "22" };
const memberPriceRuleSamples = {
  1: { date: "2026-08-18", cardlevel: "6", memcardflag: "1", classcode: "01011301", profitRate: "40" },
  2: { date: "2026-08-17", cardlevel: "3", memcardflag: "0", classcode: "01011301", profitRate: "20" },
  3: { date: "2026-08-18", cardlevel: "3", memcardflag: "0", classcode: "01011302", profitRate: "22" },
  4: { date: "2026-08-18", cardlevel: "3", memcardflag: "0", classcode: "01011302", profitRate: "10" },
  5: { date: "2026-08-17", cardlevel: "6", memcardflag: "0", classcode: "01011302", profitRate: "35" },
  6: { date: "2026-08-17", cardlevel: "5", memcardflag: "0", classcode: "01011302", profitRate: "35" },
  7: { date: "2026-08-17", cardlevel: "3", memcardflag: "0", classcode: "01011302", profitRate: "35" },
  8: { date: "2026-08-17", cardlevel: "3", memcardflag: "0", classcode: "01011302", profitRate: "22" },
  999: { date: "2026-08-17", cardlevel: "3", memcardflag: "0", classcode: "01011302", profitRate: "10" },
};
const memberPriceDiscountText = value => value === 1 ? "不打折" : `${Number((value * 10).toFixed(2))}折`;
const memberPriceProfitText = rule => {
  const lower = rule.profitRateLower === null ? "" : `${rule.profitRateLowerInclusive ? "≥" : ">"}${Number((rule.profitRateLower * 100).toFixed(2))}%`;
  const upper = rule.profitRateUpper === null ? "" : `${rule.profitRateUpperInclusive ? "≤" : "<"}${Number((rule.profitRateUpper * 100).toFixed(2))}%`;
  return [lower, upper].filter(Boolean).join(" 且 ") || "不限";
};
const memberPriceConditionSummary = rule => {
  const conditions = [];
  if (rule.memcardflag !== null) conditions.push("会员价标识为 1");
  if (rule.classcode !== null) conditions.push(`分类为 ${rule.classcode}`);
  if (rule.memberDay !== null) conditions.push(rule.memberDay ? "会员日" : "非会员日");
  if (rule.cardlevels) conditions.push(`会员等级 ${rule.cardlevels.join("、")}`);
  if (rule.profitRateLower !== null || rule.profitRateUpper !== null) conditions.push(`毛利率 ${memberPriceProfitText(rule)}`);
  return conditions.join("；") || "无附加条件，作为最终兜底";
};
const isMemberPriceDay = date => memberPriceDays.includes(Number(String(date).slice(-2)));
const memberPriceRuleMatches = (rule, values) => {
  const profitRate = Number(values.profitRate) / 100;
  if (rule.memcardflag !== null && Number(values.memcardflag) !== rule.memcardflag) return false;
  if (rule.classcode !== null && values.classcode.trim() !== rule.classcode) return false;
  if (rule.memberDay !== null && isMemberPriceDay(values.date) !== rule.memberDay) return false;
  if (rule.cardlevels && !rule.cardlevels.includes(Number(values.cardlevel))) return false;
  if (rule.profitRateLower !== null && (rule.profitRateLowerInclusive ? profitRate < rule.profitRateLower : profitRate <= rule.profitRateLower)) return false;
  if (rule.profitRateUpper !== null && (rule.profitRateUpperInclusive ? profitRate > rule.profitRateUpper : profitRate >= rule.profitRateUpper)) return false;
  return true;
};

function MemberPriceRules({ setView }) {
  const [form, setForm] = useState(memberPriceDefaultTrial);
  const [trial, setTrial] = useState(memberPriceDefaultTrial);
  const [lastRefreshTime, setLastRefreshTime] = useState("2026-08-25 08:30:00");
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState("");
  const matchedRule = useMemo(() => memberPriceRules.find(rule => memberPriceRuleMatches(rule, trial)) || memberPriceRules.at(-1), [trial]);
  useEffect(() => {
    if (!refreshing) return;
    const timer = window.setTimeout(() => { setRefreshing(false); setLastRefreshTime(formatBusinessDateTime()); setToast("固定会员价规则已刷新"); }, 800);
    return () => window.clearTimeout(timer);
  }, [refreshing]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const updateForm = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const runTrial = () => { setTrial({ ...form }); setToast("规则试算完成"); };
  const resetTrial = () => { setForm(memberPriceDefaultTrial); setTrial(memberPriceDefaultTrial); };
  const loadRuleSample = rule => { const sample = memberPriceRuleSamples[rule.priority]; setForm(sample); setTrial(sample); setToast(`已带入优先级 ${rule.priority} 的演示条件`); };
  return <PageFrame crumb="固定会员价规则" section="marketing" setView={setView}>
    <section className="panel member-price-overview">
      <div className="member-price-heading"><div><h2>固定会员价规则</h2><p>规则按优先级从小到大依次判断，命中第一条后停止。</p></div><div className="member-price-refresh"><span>规则刷新时间：{lastRefreshTime}</span><button type="button" className={`secondary erp-sync-button${refreshing ? " syncing" : ""}`} disabled={refreshing} onClick={() => setRefreshing(true)}><FiRefreshCw />{refreshing ? "刷新中..." : "刷新规则"}</button></div></div>
      <div className="member-price-summary"><div><span>执行方式</span><strong>首条命中即停止</strong></div><div><span>固定会员日</span><strong>每月 8、18、28 日</strong></div><div><span>规则数量</span><strong>9 条</strong></div><div><span>未命中折扣</span><strong>不打折</strong></div></div>
    </section>
    <div className="member-price-workspace">
      <section className="panel member-price-rules-panel">
        <div className="member-price-panel-title"><div><h3>规则明细</h3><p>空白条件表示不限制，毛利率按百分比展示。</p></div><span>当前命中：优先级 {matchedRule.priority}</span></div>
        <table className="coupon-table member-price-rule-table"><thead><tr><th>优先级</th><th>规则名称</th><th>匹配条件</th><th>折扣结果</th><th>操作</th></tr></thead><tbody>{memberPriceRules.map(rule => <tr key={rule.priority} className={matchedRule.priority === rule.priority ? "matched" : ""}><td><b>{rule.priority}</b></td><td>{rule.ruleName}</td><td>{memberPriceConditionSummary(rule)}</td><td><strong className={rule.discountRate === 1 ? "member-price-no-discount" : "member-price-discount"}>{memberPriceDiscountText(rule.discountRate)}</strong></td><td><button className="text-btn" type="button" onClick={() => loadRuleSample(rule)}>带入试算</button></td></tr>)}</tbody></table>
      </section>
      <aside className="panel member-price-simulator">
        <div className="member-price-panel-title"><div><h3>规则试算</h3><p>输入商品与会员条件，查看首条命中结果。</p></div></div>
        <div className="member-price-form"><label>交易日期<input type="date" value={form.date} onChange={event => updateForm("date", event.target.value)} /></label><label>会员等级<select value={form.cardlevel} onChange={event => updateForm("cardlevel", event.target.value)}>{[1, 2, 3, 4, 5, 6].map(level => <option key={level} value={level}>{level} 级会员</option>)}</select></label><label>商品会员价标识<select value={form.memcardflag} onChange={event => updateForm("memcardflag", event.target.value)}><option value="0">普通商品</option><option value="1">禁用会员价商品</option></select></label><label>商品分类编码<input value={form.classcode} maxLength={20} onChange={event => updateForm("classcode", event.target.value)} /></label><label>商品毛利率<div className="member-price-profit-input"><input type="number" min="0" max="100" step="0.01" value={form.profitRate} onChange={event => updateForm("profitRate", event.target.value)} /><span>%</span></div></label></div>
        <div className="member-price-form-actions"><button className="primary" type="button" onClick={runTrial}>开始试算</button><button className="secondary" type="button" onClick={resetTrial}>恢复示例</button></div>
        <div className="member-price-result"><div className="member-price-result-top"><span>试算结果</span><b>{isMemberPriceDay(trial.date) ? "会员日" : "非会员日"}</b></div><strong>{memberPriceDiscountText(matchedRule.discountRate)}</strong><h4>命中优先级 {matchedRule.priority}</h4><p>{matchedRule.ruleName}</p><small>已停止后续规则判断</small></div>
      </aside>
    </div>
    {toast && <div className="erp-sync-toast" role="status"><span aria-hidden="true">✓</span>{toast}</div>}
  </PageFrame>;
}

const erpPromotionActivities = {
  "满减满赠": [
    { promName: "夏日健康满199减20", pstplanno: "202608100001", displayType: "满减", marketingType: "整单减金额", givetype: 6, starttime: "2026-08-01 00:00:00", endtime: "2026-08-31 23:59:59", busnos: "全部", days: "全部", weekdays: "1111111", sumamt: 199, sumqty: 0, giveprice: 20, givenum: 0, plannum: 0, repeatflag: 1, conditionItemList: [{ rowno: 1, wareid: 0, sumamt: 0, sumqty: 0, profitrate: 0, resprice: 0 }], giftItemList: [] },
    { promName: "会员满99元赠维C泡腾片", pstplanno: "202608100002", displayType: "满赠", marketingType: "满减满赠", givetype: 1, starttime: "2026-08-05 00:00:00", endtime: "2026-08-20 23:59:59", busnos: "101001,101002,101006", days: "全部", weekdays: "1111111", sumamt: 99, sumqty: 0, giveprice: 0, givenum: 1, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 0, sumamt: 0, sumqty: 0, profitrate: 0, resprice: 0 }], giftItemList: [{ rowno: 1, pstid: 200001, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
    { promName: "指定商品满2件赠旅行装", pstplanno: "202608100003", displayType: "满赠", marketingType: "满减满赠", givetype: 1, starttime: "2026-08-10 00:00:00", endtime: "2026-08-25 23:59:59", busnos: "101003,101005", days: "10,15,20,25", weekdays: "1111100", sumamt: 0, sumqty: 0, giveprice: 0, givenum: 1, plannum: 1, conditionItemList: [{ rowno: 1, wareid: 100215, sumamt: 0, sumqty: 2, profitrate: 0.2, resprice: 1 }, { rowno: 2, wareid: 100306, sumamt: 0, sumqty: 2, profitrate: 0.2, resprice: 1 }], giftItemList: [{ rowno: 1, pstid: 200018, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
    { promName: "满299元候选赠品任选1件", pstplanno: "202608100004", displayType: "满赠", marketingType: "满减满赠", givetype: 1, starttime: "2026-08-01 00:00:00", endtime: "2026-08-31 23:59:59", busnos: "全部", days: "全部", weekdays: "1111111", sumamt: 299, sumqty: 0, giveprice: 0, givenum: 1, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 0, sumamt: 0, sumqty: 0, profitrate: 0, resprice: 0 }], giftItemList: [{ rowno: 1, pstid: 200101, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 2, pstid: 200102, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 3, pstid: 200103, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
    { promName: "满399元候选赠品任选2件", pstplanno: "202608100005", displayType: "满赠", marketingType: "满减满赠", givetype: 1, starttime: "2026-08-08 00:00:00", endtime: "2026-08-30 23:59:59", busnos: "101001,101002,101003,101004,101005,101006", days: "全部", weekdays: "1111111", sumamt: 399, sumqty: 0, giveprice: 0, givenum: 2, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 0, sumamt: 0, sumqty: 0, profitrate: 0, resprice: 0 }], giftItemList: [{ rowno: 1, pstid: 200201, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 2, pstid: 200202, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 3, pstid: 200203, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 4, pstid: 200204, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
    { promName: "满150元赠最低售价赠品", pstplanno: "202608100006", displayType: "满赠", marketingType: "满减满赠", givetype: 1, starttime: "2026-08-12 00:00:00", endtime: "2026-08-31 23:59:59", busnos: "101007,101008", days: "12,18,24,30", weekdays: "1111111", sumamt: 150, sumqty: 0, giveprice: 0, givenum: 88882, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 0, sumamt: 0, sumqty: 0, profitrate: 0, resprice: 0 }], giftItemList: [{ rowno: 1, pstid: 200301, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 2, pstid: 200302, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 3, pstid: 200303, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
    { promName: "营养品满2件按份数任选赠品", pstplanno: "202608100007", displayType: "满赠", marketingType: "满减满赠", givetype: 1, starttime: "2026-08-10 00:00:00", endtime: "2026-08-28 23:59:59", busnos: "101002,101006,101010", days: "全部", weekdays: "1111100", sumamt: 0, sumqty: 0, giveprice: 0, givenum: 99999, plannum: 1, conditionItemList: [{ rowno: 1, wareid: 100501, sumamt: 0, sumqty: 2, profitrate: 0.25, resprice: 1 }, { rowno: 2, wareid: 100502, sumamt: 0, sumqty: 2, profitrate: 0.25, resprice: 1 }], giftItemList: [{ rowno: 1, pstid: 200401, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 2, pstid: 200402, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 3, pstid: 200403, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
    { promName: "家庭常备品各1件赠收纳包", pstplanno: "202608100008", displayType: "满赠", marketingType: "满减满赠", givetype: 1, starttime: "2026-08-15 00:00:00", endtime: "2026-08-31 23:59:59", busnos: "全部", days: "全部", weekdays: "1111111", sumamt: 0, sumqty: 0, giveprice: 0, givenum: 1, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 100608, sumamt: 0, sumqty: 1, profitrate: 0.1, resprice: 0 }, { rowno: 2, wareid: 100719, sumamt: 0, sumqty: 1, profitrate: 0.1, resprice: 0 }, { rowno: 3, wareid: 100824, sumamt: 0, sumqty: 1, profitrate: 0.1, resprice: 0 }], giftItemList: [{ rowno: 1, pstid: 200501, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
    { promName: "满300元且口腔护理满2件赠漱口杯", pstplanno: "202608100009", displayType: "满赠", marketingType: "满减满赠", givetype: 1, starttime: "2026-08-05 00:00:00", endtime: "2026-08-26 23:59:59", busnos: "101003,101005,101007,101009", days: "全部", weekdays: "1111111", sumamt: 300, sumqty: 0, giveprice: 0, givenum: 1, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 100935, sumamt: 0, sumqty: 2, profitrate: 0.18, resprice: 1 }], giftItemList: [{ rowno: 1, pstid: 200601, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
    { promName: "整单满5件减30元", pstplanno: "202608100010", displayType: "满减", marketingType: "整单减金额", givetype: 6, starttime: "2026-08-18 00:00:00", endtime: "2026-08-31 23:59:59", busnos: "101001,101004,101008,101012", days: "18,20,22,24,26,28,30", weekdays: "1111111", sumamt: 0, sumqty: 5, giveprice: 30, givenum: 0, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 0, sumamt: 0, sumqty: 0, profitrate: 0, resprice: 0 }], giftItemList: [] },
  ],
  "满额+XX元换购": [
    { promName: "满88元9.9元换购护手霜", pstplanno: "202608110001", displayType: "满额换购", marketingType: "满额+xx元换购/买x送y/x元y件（任选）", givetype: 2, starttime: "2026-08-01 00:00:00", endtime: "2026-08-31 23:59:59", busnos: "全部", days: "全部", weekdays: "1111111", sumamt: 88, sumqty: 0, giveprice: 0, givenum: 1, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 0, sumamt: 0, sumqty: 0, profitrate: 0, resprice: 0 }], giftItemList: [{ rowno: 1, pstid: 200105, pstqty: 1, priceDisc: 0, pstprice: 9.9 }] },
    { promName: "满199元19.9元换购家庭药箱", pstplanno: "202608110002", displayType: "满额换购", marketingType: "满额+xx元换购/买x送y/x元y件（任选）", givetype: 2, starttime: "2026-08-08 00:00:00", endtime: "2026-08-28 23:59:59", busnos: "101001,101002,101008,101010", days: "全部", weekdays: "1111111", sumamt: 199, sumqty: 0, giveprice: 0, givenum: 1, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 0, sumamt: 0, sumqty: 0, profitrate: 0, resprice: 0 }], giftItemList: [{ rowno: 1, pstid: 200208, pstqty: 1, priceDisc: 0, pstprice: 19.9 }] },
    { promName: "口腔护理满59元5元换购牙线", pstplanno: "202608110003", displayType: "满额换购", marketingType: "满额+xx元换购/买x送y/x元y件（任选）", givetype: 2, starttime: "2026-08-15 00:00:00", endtime: "2026-08-30 23:59:59", busnos: "101004,101007", days: "15,20,25,30", weekdays: "1111111", sumamt: 59, sumqty: 0, giveprice: 0, givenum: 1, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 100824, sumamt: 59, sumqty: 0, profitrate: 0.15, resprice: 1 }], giftItemList: [{ rowno: 1, pstid: 200319, pstqty: 1, priceDisc: 0, pstprice: 5 }] },
  ],
  "买X送Y": [
    { promName: "医用口罩买2盒送1盒", pstplanno: "202608120001", displayType: "买X送Y", marketingType: "满额+xx元换购/买x送y/x元y件（任选）", givetype: 1, starttime: "2026-08-01 00:00:00", endtime: "2026-08-20 23:59:59", busnos: "全部", days: "全部", weekdays: "1111111", sumamt: 0, sumqty: 0, giveprice: 0, givenum: 1, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 100935, sumamt: 0, sumqty: 2, profitrate: 0.1, resprice: 1 }], giftItemList: [{ rowno: 1, pstid: 100935, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
    { promName: "儿童退热贴买3盒送1盒", pstplanno: "202608120002", displayType: "买X送Y", marketingType: "满额+xx元换购/买x送y/x元y件（任选）", givetype: 1, starttime: "2026-08-08 00:00:00", endtime: "2026-08-25 23:59:59", busnos: "101001,101003,101009", days: "全部", weekdays: "1111100", sumamt: 0, sumqty: 0, giveprice: 0, givenum: 1, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 101043, sumamt: 0, sumqty: 3, profitrate: 0.12, resprice: 1 }], giftItemList: [{ rowno: 1, pstid: 101043, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
    { promName: "防暑用品任选2件送清凉油", pstplanno: "202608120003", displayType: "买X送Y", marketingType: "满额+xx元换购/买x送y/x元y件（任选）", givetype: 1, starttime: "2026-08-10 00:00:00", endtime: "2026-08-31 23:59:59", busnos: "101002,101004,101006,101008,101012", days: "全部", weekdays: "1111111", sumamt: 0, sumqty: 0, giveprice: 0, givenum: 1, plannum: 1, conditionItemList: [{ rowno: 1, wareid: 100608, sumamt: 0, sumqty: 2, profitrate: 0.1, resprice: 0 }, { rowno: 2, wareid: 100719, sumamt: 0, sumqty: 2, profitrate: 0.1, resprice: 0 }], giftItemList: [{ rowno: 1, pstid: 200508, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
  ],
};

const optionalPriceActivities = [
  { promName: "家庭护理39.9元任选2件", pstplanno: "202608130001", displayType: "X元Y件（任选）", marketingType: "满额+xx元换购/买x送y/x元y件（任选）", givetype: 2, starttime: "2026-08-20 00:00:00", endtime: "2026-09-15 23:59:59", busnos: "全部", days: "全部", weekdays: "1111111", sumamt: 0, sumqty: 0, giveprice: 39.9, givenum: 2, plannum: 1, repeatflag: 0, conditionItemList: [{ rowno: 1, wareid: 0, sumamt: 0, sumqty: 0, profitrate: 0, resprice: 1 }], giftItemList: [{ rowno: 1, pstid: 200201, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 2, pstid: 200202, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 3, pstid: 200203, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 4, pstid: 200204, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
  { promName: "出行好物100元任选3件", pstplanno: "202608130002", displayType: "X元Y件（任选）", marketingType: "满额+xx元换购/买x送y/x元y件（任选）", givetype: 2, starttime: "2026-09-01 00:00:00", endtime: "2026-09-30 23:59:59", busnos: "101001,101003,101006,101008", days: "全部", weekdays: "1111111", sumamt: 0, sumqty: 0, giveprice: 100, givenum: 3, plannum: 1, repeatflag: 0, conditionItemList: [{ rowno: 1, wareid: 0, sumamt: 0, sumqty: 0, profitrate: 0, resprice: 1 }], giftItemList: [{ rowno: 1, pstid: 200101, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 2, pstid: 200102, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 3, pstid: 200103, pstqty: 1, priceDisc: 0, pstprice: 0 }, { rowno: 4, pstid: 200301, pstqty: 1, priceDisc: 0, pstprice: 0 }] },
];
const fourInOneActivityType = activity => activity.displayType === "满额换购" ? "满额+XX元换购" : activity.displayType === "买X送Y" ? "买X送Y" : activity.displayType === "X元Y件（任选）" ? "X元Y件（任选）" : "满减满赠";
const fourInOneActivities = [...erpPromotionActivities["满减满赠"], ...erpPromotionActivities["满额+XX元换购"], ...erpPromotionActivities["买X送Y"], ...optionalPriceActivities];

const erpPromotionLastModifiedTimes = {
  "202608100001": "2026-08-03 10:15:20", "202608100002": "2026-08-03 15:30:12", "202608100003": "2026-08-04 09:20:18", "202608100004": "2026-08-04 11:05:36", "202608100005": "2026-08-04 13:42:09", "202608100006": "2026-08-04 15:16:44", "202608100007": "2026-08-04 16:08:27", "202608100008": "2026-08-05 08:30:42", "202608100009": "2026-08-05 10:20:16", "202608100010": "2026-08-05 14:45:00",
  "202608110001": "2026-08-03 10:05:24", "202608110002": "2026-08-04 09:32:18", "202608110003": "2026-08-05 11:18:36",
  "202608120001": "2026-08-03 14:20:10", "202608120002": "2026-08-04 10:46:28", "202608120003": "2026-08-05 16:12:50",
  "202608130001": "2026-08-06 09:35:18", "202608130002": "2026-08-06 14:28:46",
};

const promotionModeText = activity => activity.givetype === 6 ? "整单减金额" : activity.givetype === 2 ? "条件商品价格优惠" : "赠送商品";
const promotionRuleText = activity => {
  const mainThreshold = activity.sumamt ? `满${activity.sumamt}元` : activity.sumqty ? `满${activity.sumqty}件` : "";
  if (activity.givetype === 6) return `${mainThreshold}减${activity.giveprice}元`;
  if (activity.displayType === "X元Y件（任选）") return `${activity.giveprice}元任选${activity.givenum}件`;
  const condition = activity.conditionItemList[0]; const gift = activity.giftItemList[0];
  if (activity.givetype === 2) return `满${activity.sumamt}元，${gift.pstprice}元换购${gift.pstqty}件`;
  if (activity.displayType === "买X送Y") return `买${condition.sumqty}件送${gift.pstqty}件`;
  const threshold = mainThreshold || `满${condition.sumqty}件`;
  if (activity.givenum === 99999) return `${threshold}，按赠送份数任选赠品`;
  if (activity.givenum === 88882) return `${threshold}，赠候选品中最低售价商品`;
  if (activity.giftItemList.length > 1) return `${threshold}，候选赠品任选${activity.givenum}件`;
  return `${threshold}赠${gift.pstqty}件`;
};
const giftSelectionText = activity => {
  if (activity.givetype === 6) return "不涉及赠品";
  if (activity.displayType === "X元Y件（任选）") return `候选商品任选 ${activity.givenum} 件`;
  if (activity.givetype === 2) return "固定换购商品";
  if (activity.givenum === 99999) return "按赠送份数任选";
  if (activity.givenum === 88882) return "系统赠最低售价商品";
  if (activity.giftItemList.length > 1) return `候选赠品任选 ${activity.givenum} 件`;
  return "固定赠品";
};
const scopeItemText = item => Number(item.wareid) === 0 ? "全部商品" : item.wareid;
const requirementText = value => Number(value) > 0 ? value : "不限";

function PromotionProductIdentityCells({ code }) {
  const product = promotionProductDetails[String(code)] || { name: Number(code) === 0 ? "—" : `商品${code}`, specification: "—" };
  return <><td title={product.name}>{product.name}</td><td>{product.specification}</td></>;
}

function ErpActivitySyncButton({ onSyncComplete }) {
  const [phase, setPhase] = useState("idle");
  useEffect(() => {
    if (phase === "syncing") {
      const timer = window.setTimeout(() => {
        onSyncComplete?.(formatBusinessDateTime());
        setPhase("success");
      }, 800);
      return () => window.clearTimeout(timer);
    }
    if (phase === "success") {
      const timer = window.setTimeout(() => setPhase("idle"), 1800);
      return () => window.clearTimeout(timer);
    }
  }, [phase]);
  const syncing = phase === "syncing";
  return <><button type="button" className={`secondary erp-sync-button${syncing ? " syncing" : ""}`} disabled={syncing} onClick={() => setPhase("syncing")}><FiRefreshCw />{syncing ? "同步中..." : "同步ERP活动"}</button>{phase === "success" && <div className="erp-sync-toast" role="status"><span aria-hidden="true">✓</span>ERP活动同步成功</div>}</>;
}

const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dateFromKey = value => { const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day); };
const monthLabel = month => `${month.getFullYear()} 年 ${month.getMonth() + 1} 月`;
const calendarDays = month => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
};

function CalendarMonth({ month, start, end, onSelect }) {
  return <div className="calendar-month"><h4>{monthLabel(month)}</h4><div className="calendar-weekdays">{["日", "一", "二", "三", "四", "五", "六"].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-days">{calendarDays(month).map(day => { const value = dateKey(day); const outside = day.getMonth() !== month.getMonth(); const selected = value === start || value === end; const inRange = start && end && value > start && value < end; return <button type="button" key={value} className={`${outside ? "outside" : ""} ${selected ? "selected" : ""} ${inRange ? "in-range" : ""}`} onClick={() => onSelect(value)}>{day.getDate()}</button>; })}</div></div>;
}

function ActivityDateRangePicker({ start, end, onChange }) {
  const [open, setOpen] = useState(false); const [visibleMonth, setVisibleMonth] = useState(() => new Date(2026, 7, 1));
  const secondMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  const selectDate = value => {
    if (!start || end || value < start) onChange(value, "");
    else { onChange(start, value); setOpen(false); }
  };
  const shiftMonth = offset => setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  return <div className="date-range-picker"><button type="button" className="date-range-trigger" aria-expanded={open} onClick={() => setOpen(value => !value)}><FiCalendar /><span className={start ? "" : "placeholder"}>{start || "开始日期"}</span><i>—</i><span className={end ? "" : "placeholder"}>{end || "结束日期"}</span></button>{open && <div className="date-range-popover"><div className="calendar-nav calendar-nav-left"><button type="button" aria-label="上两个月" onClick={() => shiftMonth(-2)}><FiChevronLeft /><FiChevronLeft /></button><button type="button" aria-label="上个月" onClick={() => shiftMonth(-1)}><FiChevronLeft /></button></div><div className="calendar-nav calendar-nav-right"><button type="button" aria-label="下个月" onClick={() => shiftMonth(1)}><FiChevronRight /></button><button type="button" aria-label="下两个月" onClick={() => shiftMonth(2)}><FiChevronRight /><FiChevronRight /></button></div><CalendarMonth month={visibleMonth} start={start} end={end} onSelect={selectDate} /><CalendarMonth month={secondMonth} start={start} end={end} onSelect={selectDate} /></div>}</div>;
}

function LimitedDiscountList({ setView }) {
  const now = useCurrentTime();
  const [modifiedStart, setModifiedStart] = useState(""); const [modifiedEnd, setModifiedEnd] = useState("");
  const [activityName, setActivityName] = useState(""); const [activityNo, setActivityNo] = useState(""); const [activityStatus, setActivityStatus] = useState(""); const [storeName, setStoreName] = useState(""); const [discountType, setDiscountType] = useState("");
  const [query, setQuery] = useState({ modifiedStart: "", modifiedEnd: "", activityName: "", activityNo: "", activityStatus: "", storeName: "", discountType: "" });
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10); const [jumpPage, setJumpPage] = useState("1");
  const [activitySyncTime, setActivitySyncTime] = useState("2026-08-25 08:30:00");
  const rows = limitedDiscountActivities.filter(activity => (!query.modifiedStart || activity.endtime >= query.modifiedStart) && (!query.modifiedEnd || activity.starttime <= query.modifiedEnd) && (!query.activityName || activity.promName.includes(query.activityName)) && (!query.activityNo || activity.promno === query.activityNo) && (!query.activityStatus || query.activityStatus === "全部" || getActivityStatus(activity, now) === query.activityStatus) && matchesStoreName(activity.busnos, query.storeName) && (!query.discountType || query.discountType === "全部" || activity.distype === Number(query.discountType)));
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const switchPage = target => { const next = Math.min(Math.max(target, 1), totalPages); setPage(next); setJumpPage(String(next)); };
  const reset = () => { setModifiedStart(""); setModifiedEnd(""); setActivityName(""); setActivityNo(""); setActivityStatus(""); setStoreName(""); setDiscountType(""); setQuery({ modifiedStart: "", modifiedEnd: "", activityName: "", activityNo: "", activityStatus: "", storeName: "", discountType: "" }); switchPage(1); };
  const runQuery = () => { setQuery({ modifiedStart: modifiedStart ? `${modifiedStart} 00:00:00` : "", modifiedEnd: modifiedEnd ? `${modifiedEnd} 23:59:59` : "", activityName, activityNo, activityStatus, storeName: storeName.trim(), discountType }); switchPage(1); };
  return <PageFrame crumb="限时折扣" section="marketing" setView={setView}><div className="filters panel activity-filter limited-discount-filter"><label className="modified-time">活动时间<ActivityDateRangePicker start={modifiedStart} end={modifiedEnd} onChange={(start, end) => { setModifiedStart(start); setModifiedEnd(end); }} /></label><label>活动名称<input aria-label="活动名称" maxLength={100} value={activityName} onChange={event => setActivityName(event.target.value)} placeholder="请输入活动名称" /></label><label>活动编号<input aria-label="活动编号" maxLength={50} value={activityNo} onChange={event => setActivityNo(event.target.value)} placeholder="请输入活动编号" /></label><label>活动状态<select aria-label="活动状态" value={activityStatus} onChange={event => setActivityStatus(event.target.value)}><option value="" disabled hidden>请选择</option>{activityStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}</select></label><label>门店名称<input aria-label="门店名称" maxLength={100} value={storeName} onChange={event => setStoreName(event.target.value)} placeholder="请输入门店名称" /></label><label>优惠方式<select aria-label="优惠方式" value={discountType} onChange={event => setDiscountType(event.target.value)}><option value="" disabled hidden>请选择</option><option value="全部">全部</option><option value="0">按折扣率</option><option value="1">按促销价</option><option value="2">减价格</option></select></label><div className="filter-actions"><button className="primary" onClick={runQuery}><FiSearch /> 查询</button><button className="secondary" onClick={reset}>重置</button></div></div><section className="panel coupon-table-wrap"><div className="erp-promotion-list-actions"><span className="erp-sync-time">活动同步时间：{activitySyncTime}</span><ErpActivitySyncButton onSyncComplete={setActivitySyncTime} /></div><table className="coupon-table limited-discount-table"><thead><tr>{["活动名称", "活动编号", "优惠方式", "活动时间", "适用门店", "活动状态", "最后修改时间", "操作"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{pagedRows.map(activity => { const status = getActivityStatus(activity, now); return <tr key={activity.promno}><td>{activity.promName}</td><td>{activity.promno}</td><td><b className="discount-rule">{discountTypeNames[activity.distype]}</b></td><td className="activity-time-cell"><span>{activity.starttime}</span><span>~ {activity.endtime}</span></td><td>{storeScopeSummary(activity.busnos)}</td><td><span className={statusClasses[status]}><i className="status-dot" />{status}</span></td><td>{activity.lasttime}</td><td><button className="text-btn" onClick={() => setView(["limitedDiscountDetail", activity])}>查看</button></td></tr>; })}</tbody></table>{rows.length === 0 ? <p className="empty-row">暂无符合条件的限时折扣活动</p> : <div className="pagination limited-discount-pagination"><span>共{rows.length}条</span><select aria-label="每页条数" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); switchPage(1); }}><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option></select><button aria-label="上一页" disabled={currentPage === 1} onClick={() => switchPage(currentPage - 1)}><FiChevronLeft /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNo => pageNo === currentPage ? <b key={pageNo}>{pageNo}</b> : <button key={pageNo} onClick={() => switchPage(pageNo)}>{pageNo}</button>)}<button aria-label="下一页" disabled={currentPage === totalPages} onClick={() => switchPage(currentPage + 1)}><FiChevronRight /></button><span>前往</span><input aria-label="跳转页码" value={jumpPage} onChange={e => setJumpPage(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && switchPage(Number(jumpPage) || 1)} onBlur={() => switchPage(Number(jumpPage) || 1)} /><span>页</span></div>}</section></PageFrame>;
}

function StoreListModal({ busnos, onClose }) {
  const stores = storeRecordsForScope(busnos);
  const [pageSize, setPageSize] = useState(20); const [page, setPage] = useState(1);
  const [storeName, setStoreName] = useState(""); const [storeCode, setStoreCode] = useState("");
  const [query, setQuery] = useState({ name: "", code: "" });
  const filteredStores = stores.filter(store => (!query.name || store.name.toLowerCase().includes(query.name.toLowerCase())) && (!query.code || String(store.code).includes(query.code)));
  const totalPages = Math.max(1, Math.ceil(filteredStores.length / pageSize)); const currentPage = Math.min(page, totalPages);
  const rows = filteredStores.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const runQuery = () => { setQuery({ name: storeName.trim(), code: storeCode.trim() }); setPage(1); };
  const reset = () => { setStoreName(""); setStoreCode(""); setQuery({ name: "", code: "" }); setPage(1); };
  return <div className="modal-backdrop store-list-backdrop"><section className="modal store-list-modal" role="dialog" aria-modal="true" aria-label="适用门店"><header><b>适用门店</b><button aria-label="关闭适用门店" onClick={onClose}><FiX /></button></header><div className="store-list-content"><div className="store-list-filters"><label>门店名称<input aria-label="适用门店名称" maxLength={100} value={storeName} onChange={event => setStoreName(event.target.value)} onKeyDown={event => event.key === "Enter" && runQuery()} placeholder="请输入门店名称" /></label><label>门店编码<input aria-label="适用门店编码" maxLength={50} value={storeCode} onChange={event => setStoreCode(event.target.value)} onKeyDown={event => event.key === "Enter" && runQuery()} placeholder="请输入门店编码" /></label><div><button className="primary" onClick={runQuery}><FiSearch /> 查询</button><button className="secondary" onClick={reset}>重置</button></div></div><div className="store-list-scroll"><table className="store-list-table"><thead><tr>{["门店", "门店名称", "门店性质", "门店电话", "区域"].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{rows.map(store => <tr key={store.code}><td><div className="store-list-identity"><span>名称：{store.name}</span><span>编码：{store.code}</span><span>地址：{store.address}</span></div></td><td title={store.name}>{store.name}</td><td>{store.nature}</td><td>{store.phone}</td><td>{store.region}</td></tr>)}{rows.length === 0 && <tr className="store-list-empty"><td colSpan="5">暂无符合条件的门店</td></tr>}</tbody></table></div></div><div className="store-list-pagination"><span>共 {filteredStores.length} 条</span><div><select aria-label="适用门店每页条数" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option></select><button aria-label="适用门店上一页" disabled={currentPage === 1} onClick={() => setPage(value => Math.max(1, value - 1))}><FiChevronLeft /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNo => <button key={pageNo} className={pageNo === currentPage ? "active" : ""} onClick={() => setPage(pageNo)}>{pageNo}</button>)}<button aria-label="适用门店下一页" disabled={currentPage === totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))}><FiChevronRight /></button><span>前往</span><input aria-label="适用门店跳转页码" value={currentPage} readOnly /><span>页</span></div></div><footer><button className="secondary" onClick={onClose}>关闭</button></footer></section></div>;
}

function StoreScopeInfo({ busnos }) {
  const [storeListOpen, setStoreListOpen] = useState(false);
  const specified = !isAllScope(busnos);
  return <><Info label="适用门店" value={<span className="store-scope-value">{storeScopeText(busnos)}{specified && <button className="text-btn store-scope-view" onClick={() => setStoreListOpen(true)}>查看</button>}</span>} simple />{storeListOpen && <StoreListModal busnos={busnos} onClose={() => setStoreListOpen(false)} />}</>;
}

function LimitedDiscountDetail({ setView, activity }) {
  const now = useCurrentTime();
  const status = getActivityStatus(activity, now);
  return <PageFrame crumb={<MarketingDetailCrumb type="限时折扣" setView={setView} />} section="marketing" setView={setView}><section className="panel coupon-detail activity-detail"><h3>基本信息</h3><div className="detail-grid"><Info label="活动名称" value={activity.promName} simple /><Info label="活动编号" value={activity.promno} simple /><Info label="优惠方式" value={discountTypeNames[activity.distype]} simple /><Info label="活动状态" value={status} simple /><Info label="活动时间" value={`${activity.starttime} ~ ${activity.endtime}`} simple /><StoreScopeInfo busnos={activity.busnos} /><Info label="参与日期" value={activity.days === "all" ? "所有日期" : `每月 ${activity.days} 日`} simple /><Info label="参与星期" value={weekdayText(activity.weekdays)} simple /><Info label="最后修改时间" value={activity.lasttime} simple /></div></section><section className="panel discount-items-panel"><div className="discount-items-title"><h3>参与商品明细</h3><span>共 {activity.itemList.length} 个商品</span></div><table className="coupon-table discount-items-table"><thead><tr>{["商品编码", "商品名称", "规格信息", "优惠内容"].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{activity.itemList.map(item => { const product = limitedDiscountProductDetails[item.wareid] || { name: `商品${item.wareid}`, specification: "—" }; return <tr key={item.wareid}><td>{item.wareid}</td><td>{product.name}</td><td>{product.specification}</td><td>{activity.distype === 0 ? `${(item.disrate * 10).toFixed(1)}折` : activity.distype === 1 ? `促销价￥${item.promprice}` : `立减￥${item.promprice}`}</td></tr>; })}</tbody></table></section></PageFrame>;
}

function ErpPromotionList({ setView, category }) {
  const now = useCurrentTime();
  const [start, setStart] = useState(""); const [end, setEnd] = useState("");
  const [activityName, setActivityName] = useState(""); const [activityNo, setActivityNo] = useState(""); const [activityStatus, setActivityStatus] = useState(""); const [storeName, setStoreName] = useState(""); const [activityType, setActivityType] = useState("");
  const [query, setQuery] = useState({ start: "", end: "", activityName: "", activityNo: "", activityStatus: "", storeName: "", activityType: "" });
  const [pageSize, setPageSize] = useState(10);
  const [activitySyncTime, setActivitySyncTime] = useState("2026-08-25 08:30:00");
  const supportsActivityType = category === "满减满赠";
  const activityTypeOptions = [...new Set(erpPromotionActivities[category].map(activity => activity.displayType))];
  const rows = erpPromotionActivities[category].filter(activity => (!query.start || activity.endtime >= `${query.start} 00:00:00`) && (!query.end || activity.starttime <= `${query.end} 23:59:59`) && (!query.activityName || activity.promName.toLowerCase().includes(query.activityName.toLowerCase())) && (!query.activityNo || activity.pstplanno === query.activityNo) && (!query.activityStatus || query.activityStatus === "全部" || getActivityStatus(activity, now) === query.activityStatus) && matchesStoreName(activity.busnos, query.storeName) && (!supportsActivityType || !query.activityType || activity.displayType === query.activityType));
  const runQuery = () => setQuery({ start, end, activityName: activityName.trim(), activityNo: activityNo.trim(), activityStatus, storeName: storeName.trim(), activityType: supportsActivityType ? activityType : "" });
  const reset = () => { setStart(""); setEnd(""); setActivityName(""); setActivityNo(""); setActivityStatus(""); setStoreName(""); setActivityType(""); setQuery({ start: "", end: "", activityName: "", activityNo: "", activityStatus: "", storeName: "", activityType: "" }); };
  return <PageFrame crumb={promotionTypeLabel(category)} section="marketing" setView={setView}><div className="filters panel activity-filter limited-discount-filter"><label className="modified-time">活动时间<ActivityDateRangePicker start={start} end={end} onChange={(nextStart, nextEnd) => { setStart(nextStart); setEnd(nextEnd); }} /></label><label>活动名称<input aria-label="活动名称" maxLength={100} value={activityName} onChange={event => setActivityName(event.target.value)} placeholder="请输入活动名称" /></label><label>活动编号<input aria-label="活动编号" maxLength={50} value={activityNo} onChange={event => setActivityNo(event.target.value)} placeholder="请输入活动编号" /></label><label>活动状态<select aria-label="活动状态" value={activityStatus} onChange={event => setActivityStatus(event.target.value)}><option value="" disabled hidden>请选择</option>{activityStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}</select></label><label>门店名称<input aria-label="门店名称" maxLength={100} value={storeName} onChange={event => setStoreName(event.target.value)} placeholder="请输入门店名称" /></label>{supportsActivityType && <label>活动类型<select aria-label="活动类型" value={activityType} onChange={event => setActivityType(event.target.value)}><option value="">全部</option>{activityTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}</select></label>}<div className="filter-actions"><button className="primary" onClick={runQuery}><FiSearch /> 查询</button><button className="secondary" onClick={reset}>重置</button></div></div><section className="panel coupon-table-wrap"><div className="erp-promotion-list-actions"><span className="erp-sync-time">活动同步时间：{activitySyncTime}</span><ErpActivitySyncButton onSyncComplete={setActivitySyncTime} /></div><table className="coupon-table erp-promotion-table erp-promotion-table--status"><thead><tr>{["活动名称", "活动编号", "活动时间", "活动状态", "适用门店", "最后修改时间", "操作"].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{rows.slice(0, pageSize).map(activity => { const status = getActivityStatus(activity, now); return <tr key={activity.pstplanno}><td>{activity.promName}</td><td>{activity.pstplanno}</td><td className="activity-time-cell"><span>{activity.starttime}</span><span>~ {activity.endtime}</span></td><td><span className={statusClasses[status]}><i className="status-dot" />{status}</span></td><td>{storeScopeText(activity.busnos)}</td><td>{erpPromotionLastModifiedTimes[activity.pstplanno]}</td><td><button className="text-btn" onClick={() => setView(["erpPromotionDetail", { category, activity }])}>查看</button></td></tr>; })}</tbody></table>{rows.length === 0 ? <p className="empty-row">暂无符合条件的{category}活动</p> : <div className="pagination limited-discount-pagination"><span>共{rows.length}条</span><select aria-label="每页条数" value={pageSize} onChange={event => setPageSize(Number(event.target.value))}><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option></select><button aria-label="上一页" disabled><FiChevronLeft /></button><b>1</b><button aria-label="下一页" disabled><FiChevronRight /></button></div>}</section></PageFrame>;
}

const fourInOneTypes = ["全部", "满减满赠", "满额+XX元换购", "买X送Y", "X元Y件（任选）"];
const fourInOneDefaultQuery = { startTime: "2026-08-01T00:00:00", endTime: "2026-09-01T00:00:00", pageNo: "1", pageSize: "10" };
const localDateTimeToBusiness = value => value ? value.replace("T", " ") : "";

function FourInOneModel({ setView }) {
  const now = useCurrentTime();
  const [form, setForm] = useState(fourInOneDefaultQuery);
  const [query, setQuery] = useState(fourInOneDefaultQuery);
  const [activeType, setActiveType] = useState("全部");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [queriedAt, setQueriedAt] = useState("2026-08-30 21:45:00");
  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => { setLoading(false); setToast("查询成功，已返回完整活动及商品明细"); setQueriedAt(formatBusinessDateTime()); }, 650);
    return () => window.clearTimeout(timer);
  }, [loading]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1900);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const startTime = localDateTimeToBusiness(query.startTime); const endTime = localDateTimeToBusiness(query.endTime);
  const timeRows = fourInOneActivities.filter(activity => { const lasttime = erpPromotionLastModifiedTimes[activity.pstplanno]; return (!startTime || lasttime >= startTime) && (!endTime || lasttime < endTime); }).sort((left, right) => erpPromotionLastModifiedTimes[left.pstplanno].localeCompare(erpPromotionLastModifiedTimes[right.pstplanno]) || left.pstplanno.localeCompare(right.pstplanno));
  const filteredRows = activeType === "全部" ? timeRows : timeRows.filter(activity => fourInOneActivityType(activity) === activeType);
  const pageSize = Number(query.pageSize); const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize)); const currentPage = Math.min(page, totalPages);
  const rows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const typeCount = type => type === "全部" ? timeRows.length : timeRows.filter(activity => fourInOneActivityType(activity) === type).length;
  const updateForm = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const runQuery = () => { const nextPage = Math.max(1, Number(form.pageNo) || 1); setQuery({ ...form, pageNo: String(nextPage) }); setPage(nextPage); setLoading(true); };
  const resetQuery = () => { setForm(fourInOneDefaultQuery); setQuery(fourInOneDefaultQuery); setActiveType("全部"); setPage(1); };
  const switchType = type => { setActiveType(type); setPage(1); };
  return <PageFrame crumb="四合一营销活动接口" section="marketing" setView={setView}>
    <section className="panel four-in-one-overview"><div className="four-in-one-heading"><div><div className="four-in-one-title-line"><h2>四合一营销活动接口模型</h2><span>只读接口演示</span></div><p>按主活动最后修改时间查询，一次返回活动基本信息、条件商品和优惠商品明细。</p></div><div className="four-in-one-heading-actions"><div className="four-in-one-query-time">最近查询时间：{queriedAt}</div><button className="secondary" type="button" onClick={() => setView("fourInOneCalculator")}><FiActivity /> 打开试算模型</button></div></div><div className="four-in-one-capabilities"><span>开始时间包含</span><span>结束时间不包含</span><span>主活动分页</span><span>商品明细完整返回</span></div></section>
    <section className="panel four-in-one-query"><label>开始时间（包含）<input type="datetime-local" step="1" value={form.startTime} onChange={event => updateForm("startTime", event.target.value)} /></label><label>结束时间（不包含）<input type="datetime-local" step="1" value={form.endTime} onChange={event => updateForm("endTime", event.target.value)} /></label><label>页码<input type="number" min="1" value={form.pageNo} onChange={event => updateForm("pageNo", event.target.value)} /></label><label>每页活动数<select value={form.pageSize} onChange={event => updateForm("pageSize", event.target.value)}>{[10, 20, 50, 100, 500].map(size => <option key={size} value={size}>{size} 条</option>)}</select></label><div className="four-in-one-query-actions"><button className="primary" type="button" disabled={loading} onClick={runQuery}>{loading ? <FiRefreshCw /> : <FiSearch />}{loading ? "查询中..." : "查询"}</button><button className="secondary" type="button" onClick={resetQuery}>重置</button></div></section>
    <section className="panel four-in-one-results"><div className="four-in-one-tabs" role="tablist" aria-label="活动类型">{fourInOneTypes.map(type => <button key={type} type="button" role="tab" aria-selected={activeType === type} className={activeType === type ? "active" : ""} onClick={() => switchType(type)}><span>{type}</span><b>{typeCount(type)}</b></button>)}</div><div className="four-in-one-result-meta"><span>共 {filteredRows.length} 条主活动</span><span>排序：最后修改时间、活动编号升序</span></div><table className="coupon-table erp-promotion-table erp-promotion-table--status four-in-one-table"><thead><tr>{["活动名称", "活动编号", "活动时间", "活动状态", "适用门店", "最后修改时间", "操作"].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{rows.map(activity => { const status = getActivityStatus(activity, now); return <tr key={activity.pstplanno}><td>{activity.promName}</td><td>{activity.pstplanno}</td><td className="activity-time-cell"><span>{activity.starttime}</span><span>~ {activity.endtime}</span></td><td><span className={statusClasses[status]}><i className="status-dot" />{status}</span></td><td>{storeScopeText(activity.busnos)}</td><td>{erpPromotionLastModifiedTimes[activity.pstplanno]}</td><td><button className="text-btn" type="button" onClick={() => setView(["fourInOneDetail", activity])}>查看响应</button></td></tr>; })}</tbody></table>{rows.length === 0 ? <p className="empty-row">当前查询窗口暂无活动数据</p> : <div className="pagination limited-discount-pagination"><span>第 {currentPage} / {totalPages} 页</span><select aria-label="每页活动数" value={pageSize} onChange={event => { const value = event.target.value; setQuery(current => ({ ...current, pageSize: value })); setForm(current => ({ ...current, pageSize: value })); setPage(1); }}><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option></select><button aria-label="上一页" disabled={currentPage <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}><FiChevronLeft /></button><b>{currentPage}</b><button aria-label="下一页" disabled={currentPage >= totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))}><FiChevronRight /></button></div>}</section>
    {toast && <div className="erp-sync-toast" role="status"><span aria-hidden="true">✓</span>{toast}</div>}
  </PageFrame>;
}

const activityTrialDate = activity => {
  const start = new Date(`${activity.starttime.slice(0, 10)}T12:00:00`); const end = new Date(`${activity.endtime.slice(0, 10)}T12:00:00`);
  for (let offset = 0; offset < 93; offset += 1) {
    const date = new Date(start); date.setDate(start.getDate() + offset);
    if (date > end) break;
    const day = date.getDate(); const weekdayIndex = (date.getDay() + 6) % 7;
    const dayAllowed = isAllScope(activity.days) || String(activity.days).split(",").includes(String(day));
    const weekdayAllowed = String(activity.weekdays || "1111111")[weekdayIndex] === "1";
    if (dayAllowed && weekdayAllowed) return dateKey(date);
  }
  return activity.starttime.slice(0, 10);
};
const buildPromotionScenario = (activity, passing = true) => {
  const validStore = isAllScope(activity.busnos) ? "101001" : String(activity.busnos).split(",")[0];
  const endDate = new Date(`${activity.endtime.slice(0, 10)}T12:00:00`); endDate.setDate(endDate.getDate() + 1);
  const items = Object.fromEntries(activity.conditionItemList.map(item => [item.rowno, { amount: passing ? String(item.sumamt || 120) : "0", qty: passing ? String(item.sumqty || 3) : "0", profit: passing ? String(Math.max(10, Number(((item.profitrate || 0) + 0.05) * 100).toFixed(2))) : "0" }]));
  return { date: passing ? activityTrialDate(activity) : dateKey(endDate), store: validStore, orderAmount: passing ? String(activity.sumamt || 300) : "0", orderQty: passing ? String(activity.sumqty || 5) : "0", items };
};
const calculatePromotionTrial = (activity, values) => {
  const trialTime = `${values.date} 12:00:00`; const date = new Date(`${values.date}T12:00:00`); const weekdayIndex = (date.getDay() + 6) % 7;
  const timePass = trialTime >= activity.starttime && trialTime <= activity.endtime;
  const storePass = isAllScope(activity.busnos) || String(activity.busnos).split(",").includes(values.store);
  const dayPass = isAllScope(activity.days) || String(activity.days).split(",").includes(String(date.getDate()));
  const weekdayPass = String(activity.weekdays || "1111111")[weekdayIndex] === "1";
  const amountPass = !Number(activity.sumamt) || Number(values.orderAmount) >= Number(activity.sumamt);
  const quantityPass = !Number(activity.sumqty) || Number(values.orderQty) >= Number(activity.sumqty);
  const conditionRows = activity.conditionItemList.map(item => {
    const entered = values.items[item.rowno] || { amount: "0", qty: "0", profit: "0" };
    const amount = Number(item.wareid) === 0 ? Number(values.orderAmount) : Number(entered.amount);
    const qty = Number(item.wareid) === 0 ? Number(values.orderQty) : Number(entered.qty);
    const profitRate = Number(entered.profit) / 100;
    const pass = (!Number(item.sumamt) || amount >= Number(item.sumamt)) && (!Number(item.sumqty) || qty >= Number(item.sumqty)) && (!Number(item.profitrate) || profitRate > Number(item.profitrate));
    const ratios = [Number(item.sumamt) ? Math.floor(amount / Number(item.sumamt)) : null, Number(item.sumqty) ? Math.floor(qty / Number(item.sumqty)) : null].filter(value => value !== null);
    return { rowno: item.rowno, pass, ratio: ratios.length ? Math.min(...ratios) : 1 };
  });
  const conditionPass = activity.plannum === 1 ? conditionRows.some(row => row.pass) : conditionRows.every(row => row.pass);
  const eligible = timePass && storePass && dayPass && weekdayPass && amountPass && quantityPass && conditionPass;
  let repeatTimes = eligible ? 1 : 0;
  if (eligible && activity.repeatflag === 1) {
    const mainRatios = [Number(activity.sumamt) ? Math.floor(Number(values.orderAmount) / Number(activity.sumamt)) : null, Number(activity.sumqty) ? Math.floor(Number(values.orderQty) / Number(activity.sumqty)) : null].filter(value => value !== null);
    const conditionRatios = conditionRows.filter(row => row.pass).map(row => row.ratio);
    const conditionRatio = conditionRatios.length ? (activity.plannum === 1 ? Math.max(...conditionRatios) : Math.min(...conditionRatios)) : null;
    repeatTimes = Math.max(1, Math.min(...[...mainRatios, conditionRatio].filter(value => value !== null)));
  }
  const firstBenefit = activity.giftItemList[0];
  const firstBenefitName = firstBenefit ? promotionProductDetails[String(firstBenefit.pstid)]?.name || `商品${firstBenefit.pstid}` : "";
  let outcome = "未达到活动条件，不产生优惠";
  if (eligible && activity.givetype === 6) outcome = `整单减 ${Number((activity.giveprice * repeatTimes).toFixed(2))} 元`;
  else if (eligible && activity.displayType === "X元Y件（任选）") outcome = `${activity.giveprice} 元任选 ${activity.givenum * repeatTimes} 件候选商品`;
  else if (eligible && activity.givetype === 2) outcome = `${firstBenefit.pstprice} 元换购 ${firstBenefitName} × ${firstBenefit.pstqty * repeatTimes}`;
  else if (eligible && activity.givenum === 88882) outcome = `赠送候选商品中门店最低售价商品 × ${repeatTimes}`;
  else if (eligible && activity.givenum === 99999) outcome = `按赠送份数从候选赠品中选择，共 ${repeatTimes} 份`;
  else if (eligible && activity.giftItemList.length > 1) outcome = `从 ${activity.giftItemList.length} 种候选赠品中任选 ${activity.givenum * repeatTimes} 件`;
  else if (eligible && firstBenefit) outcome = `赠送 ${firstBenefitName} × ${firstBenefit.pstqty * repeatTimes}`;
  return { eligible, repeatTimes, outcome, conditionRows, checks: [{ label: "活动时间", pass: timePass, detail: `${activity.starttime} 至 ${activity.endtime}` }, { label: "适用门店", pass: storePass, detail: storeScopeText(activity.busnos) }, { label: "参与日期", pass: dayPass && weekdayPass, detail: `${isAllScope(activity.days) ? "所有日期" : `每月${activity.days}日`}，${weekdayText(activity.weekdays)}` }, { label: "整单金额", pass: amountPass, detail: activity.sumamt ? `满 ${activity.sumamt} 元` : "不限" }, { label: "整单数量", pass: quantityPass, detail: activity.sumqty ? `满 ${activity.sumqty} 件` : "不限" }, { label: "条件商品", pass: conditionPass, detail: activity.plannum === 1 ? "任一条件满足" : "全部条件满足" }] };
};

function FourInOneCalculator({ setView }) {
  const [activeType, setActiveType] = useState("满减满赠");
  const initialActivity = fourInOneActivities.find(activity => fourInOneActivityType(activity) === "满减满赠");
  const [activityNo, setActivityNo] = useState(initialActivity.pstplanno);
  const [form, setForm] = useState(() => buildPromotionScenario(initialActivity));
  const [trial, setTrial] = useState(() => buildPromotionScenario(initialActivity));
  const [toast, setToast] = useState("");
  const typeActivities = fourInOneActivities.filter(activity => fourInOneActivityType(activity) === activeType);
  const activity = fourInOneActivities.find(item => item.pstplanno === activityNo) || typeActivities[0];
  const result = useMemo(() => calculatePromotionTrial(activity, trial), [activity, trial]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const loadActivity = nextActivity => { const scenario = buildPromotionScenario(nextActivity); setActivityNo(nextActivity.pstplanno); setForm(scenario); setTrial(scenario); };
  const switchType = type => { const nextActivity = fourInOneActivities.find(item => fourInOneActivityType(item) === type); setActiveType(type); loadActivity(nextActivity); };
  const updateForm = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const updateItem = (rowno, key, value) => setForm(current => ({ ...current, items: { ...current.items, [rowno]: { ...current.items[rowno], [key]: value } } }));
  const runTrial = () => { setTrial({ ...form, items: Object.fromEntries(Object.entries(form.items).map(([key, value]) => [key, { ...value }])) }); setToast("促销试算完成"); };
  const loadScenario = passing => { const scenario = buildPromotionScenario(activity, passing); setForm(scenario); setTrial(scenario); setToast(passing ? "已带入达标示例" : "已带入未达标示例"); };
  const storeOptions = isAllScope(activity.busnos) ? ["101001", "101002", "101003"] : String(activity.busnos).split(",");
  return <PageFrame crumb="四合一促销试算" section="marketing" setView={setView}>
    <section className="panel promotion-calculator-overview"><div><div className="four-in-one-title-line"><h2>四合一促销试算模型</h2><span className="calculator-scope-badge">演示口径</span></div><p>用于验证接口字段组合、活动门槛和优惠结果，不作为生产订单结算依据。</p></div><button className="secondary" type="button" onClick={() => setView("fourInOneModel")}><FiClipboard /> 返回接口模型</button></section>
    <section className="panel promotion-calculator-selector"><div className="four-in-one-tabs calculator-type-tabs" role="tablist">{fourInOneTypes.slice(1).map(type => <button key={type} type="button" role="tab" aria-selected={activeType === type} className={activeType === type ? "active" : ""} onClick={() => switchType(type)}>{type}</button>)}</div><label>选择活动<select value={activity.pstplanno} onChange={event => loadActivity(fourInOneActivities.find(item => item.pstplanno === event.target.value))}>{typeActivities.map(item => <option key={item.pstplanno} value={item.pstplanno}>{item.promName}（{item.pstplanno}）</option>)}</select></label><div className="calculator-rule-summary"><span>当前规则</span><strong>{promotionRuleText(activity)}</strong><em>{activity.plannum === 1 ? "条件商品任一满足" : "条件商品全部满足"} · {activity.repeatflag === 1 ? "允许重复优惠" : "仅优惠一次"}</em></div></section>
    <div className="promotion-calculator-workspace"><section className="panel promotion-calculator-input"><div className="calculator-section-title"><div><h3>订单与履约条件</h3><p>修改条件后点击“开始试算”更新右侧结果。</p></div><div><button className="text-btn" type="button" onClick={() => loadScenario(true)}>带入达标示例</button><button className="text-btn" type="button" onClick={() => loadScenario(false)}>带入未达标示例</button></div></div><div className="calculator-order-grid"><label>交易日期<input type="date" value={form.date} onChange={event => updateForm("date", event.target.value)} /></label><label>履约门店<select value={form.store} onChange={event => updateForm("store", event.target.value)}>{storeOptions.map(code => <option key={code} value={code}>{storeNamesByCode[code] || code}</option>)}<option value="999999">不适用门店（演示）</option></select></label><label>订单商品金额<div><input type="number" min="0" step="0.01" value={form.orderAmount} onChange={event => updateForm("orderAmount", event.target.value)} /><span>元</span></div></label><label>订单商品数量<div><input type="number" min="0" step="1" value={form.orderQty} onChange={event => updateForm("orderQty", event.target.value)} /><span>件</span></div></label></div><div className="calculator-section-title condition-input-title"><div><h3>条件商品输入</h3><p>“全部商品”行自动使用上方订单金额和数量。</p></div></div><table className="coupon-table calculator-condition-table"><thead><tr><th>条件商品</th><th>规则要求</th><th>本单金额</th><th>本单数量</th><th>当前毛利率</th><th>判断</th></tr></thead><tbody>{activity.conditionItemList.map(item => { const product = promotionProductDetails[String(item.wareid)] || { name: Number(item.wareid) === 0 ? "全部商品" : `商品${item.wareid}` }; const rowResult = result.conditionRows.find(row => row.rowno === item.rowno); const values = form.items[item.rowno]; const requirements = [Number(item.sumamt) ? `满${item.sumamt}元` : "", Number(item.sumqty) ? `满${item.sumqty}件` : "", Number(item.profitrate) ? `毛利率>${item.profitrate * 100}%` : ""].filter(Boolean).join("、") || "无额外门槛"; return <tr key={item.rowno}><td><strong>{product.name}</strong><span>{Number(item.wareid) === 0 ? "商品编码 0" : item.wareid}</span></td><td>{requirements}</td><td>{Number(item.wareid) === 0 ? `${form.orderAmount || 0}元（取整单）` : <input type="number" min="0" step="0.01" value={values.amount} onChange={event => updateItem(item.rowno, "amount", event.target.value)} />}</td><td>{Number(item.wareid) === 0 ? `${form.orderQty || 0}件（取整单）` : <input type="number" min="0" step="1" value={values.qty} onChange={event => updateItem(item.rowno, "qty", event.target.value)} />}</td><td><div className="calculator-profit-field"><input type="number" min="0" max="100" step="0.01" value={values.profit} onChange={event => updateItem(item.rowno, "profit", event.target.value)} /><span>%</span></div></td><td><span className={rowResult?.pass ? "calculator-pass" : "calculator-fail"}>{rowResult?.pass ? "满足" : "不满足"}</span></td></tr>; })}</tbody></table><div className="calculator-actions"><button className="primary" type="button" onClick={runTrial}><FiActivity /> 开始试算</button><button className="secondary" type="button" onClick={() => loadScenario(true)}>恢复达标示例</button></div></section><aside className="panel promotion-calculator-result"><div className={`calculator-result-hero ${result.eligible ? "eligible" : "ineligible"}`}><span>{result.eligible ? "活动条件已满足" : "活动条件未满足"}</span><strong>{result.eligible ? result.outcome : "不产生优惠"}</strong><p>{result.eligible ? `本次命中 ${result.repeatTimes} 次优惠` : "请检查未通过的条件"}</p></div><div className="calculator-checks"><h3>命中过程</h3>{result.checks.map(check => <div key={check.label}><i className={check.pass ? "pass" : "fail"}>{check.pass ? "✓" : "×"}</i><span><b>{check.label}</b><small>{check.detail}</small></span></div>)}</div><div className="calculator-benefit-preview"><h3>{activity.displayType === "X元Y件（任选）" ? "候选商品" : activity.givetype === 2 ? "换购商品" : "赠送商品"}</h3>{activity.givetype === 6 ? <p>整单优惠金额：{activity.giveprice} 元 × {Math.max(result.repeatTimes, 1)} 次</p> : <ul>{activity.giftItemList.map(item => <li key={item.rowno}><span>{promotionProductDetails[String(item.pstid)]?.name || item.pstid}</span><b>{activity.displayType === "X元Y件（任选）" ? "候选" : `${item.pstqty}件`}</b></li>)}</ul>}</div><p className="calculator-assumption">演示口径：同一条件行内金额、数量和毛利率同时满足；多条件行按活动的“任一／全部”配置判断。重复次数按可满足门槛的最小倍数计算。</p></aside></div>
    {toast && <div className="erp-sync-toast" role="status"><span aria-hidden="true">✓</span>{toast}</div>}
  </PageFrame>;
}

function ErpPromotionDetail({ setView, category, activity, listView }) {
  const dateScope = isAllScope(activity.days) ? "所有日期" : `每月 ${activity.days} 日`;
  const optionalPrice = activity.displayType === "X元Y件（任选）";
  return <PageFrame crumb={<MarketingDetailCrumb type={category} setView={setView} listView={listView} />} section="marketing" setView={setView}><section className="panel coupon-detail activity-detail"><div className="detail-heading"><div><h3>基本信息</h3></div></div><div className="detail-grid"><Info label="活动名称" value={activity.promName} simple /><Info label="活动编号" value={activity.pstplanno} simple /><Info label="活动类型" value={activity.displayType} simple /><Info label="促销方式" value={promotionModeText(activity)} simple /><Info label="活动时间" value={`${activity.starttime} ~ ${activity.endtime}`} simple /><StoreScopeInfo busnos={activity.busnos} /><Info label="参与日期" value={dateScope} simple /><Info label="参与星期" value={weekdayText(activity.weekdays)} simple /></div></section><section className="panel promotion-rule-panel"><div className="discount-items-title"><div><h3>活动门槛与优惠</h3><p>主表门槛与条件商品要求同时满足</p></div></div><div className="promotion-rule-grid"><div><span>规则摘要</span><strong>{promotionRuleText(activity)}</strong></div><div><span>整单金额门槛</span><strong>{activity.sumamt ? `${activity.sumamt}元` : "不限"}</strong></div><div><span>整单数量门槛</span><strong>{activity.sumqty ? `${activity.sumqty}件` : "不限"}</strong></div><div><span>条件关系</span><strong>{activity.plannum === 1 ? "任一条件满足" : "全部条件满足"}</strong></div><div><span>重复优惠</span><strong>{activity.repeatflag === 1 ? "允许按门槛倍数重复" : "仅优惠一次"}</strong></div><div><span>{optionalPrice ? "候选商品选择" : "赠品选择方式"}</span><strong>{giftSelectionText(activity)}</strong></div>{activity.givetype === 6 && <div className="benefit-highlight"><span>整单减金额</span><strong>{activity.giveprice}元</strong></div>}{optionalPrice && <div className="benefit-highlight"><span>任选组合价格</span><strong>{activity.giveprice}元 / {activity.givenum}件</strong></div>}</div></section><section className="panel discount-items-panel"><div className="discount-items-title"><div><h3>条件商品明细</h3><p>商品编码为 0 表示全部商品</p></div><span>共 {activity.conditionItemList.length} 条</span></div><table className="coupon-table promotion-condition-table"><thead><tr><th>行号</th><th>条件商品</th><th>商品名称</th><th>规格信息</th><th>单品金额门槛</th><th>单品数量门槛</th><th>毛利率下限</th><th>恢复原价</th></tr></thead><tbody>{activity.conditionItemList.map(item => <tr key={item.rowno}><td>{item.rowno}</td><td>{scopeItemText(item)}</td><PromotionProductIdentityCells code={item.wareid} /><td>{requirementText(item.sumamt)}{Number(item.sumamt) > 0 && "元"}</td><td>{requirementText(item.sumqty)}{Number(item.sumqty) > 0 && "件"}</td><td>{Number(item.profitrate) > 0 ? `${item.profitrate * 100}%` : "不限"}</td><td>{item.resprice === 1 ? "是" : "否"}</td></tr>)}</tbody></table></section>{activity.givetype !== 6 && <section className="panel discount-items-panel"><div className="discount-items-title"><div><h3>{optionalPrice ? "候选商品明细" : activity.givetype === 2 ? "换购商品明细" : "赠送商品明细"}</h3><p>{optionalPrice ? `从以下商品中任选 ${activity.givenum} 件，组合成交价 ${activity.giveprice} 元` : activity.givetype === 2 ? "展示换购商品成交价格" : "展示赠品及赠送数量"}</p></div><span>共 {activity.giftItemList.length} 个商品</span></div><table className="coupon-table promotion-gift-table"><thead><tr><th>行号</th><th>商品编码</th><th>商品名称</th><th>规格信息</th><th>数量</th><th>优惠计价</th><th>成交价格 / 折扣</th></tr></thead><tbody>{activity.giftItemList.map(item => <tr key={item.rowno}><td>{item.rowno}</td><td>{item.pstid}</td><PromotionProductIdentityCells code={item.pstid} /><td>{item.pstqty}</td><td>{optionalPrice ? "计入候选" : item.priceDisc === 1 ? "按折扣" : "按价格"}</td><td>{optionalPrice ? "按任选组合计价" : item.priceDisc === 1 ? `${item.pstprice * 10}折` : `${item.pstprice}元`}</td></tr>)}</tbody></table></section>}</PageFrame>;
}

const combinationProductBases = [
  { wareid: 6947, warecode: "6947", warename: "小柴胡颗粒/ZQ/A", category: "感冒用药", stock: 5846, price: 0.01, specification: "10g*10袋", image: "/assets/trade-product-special.png" },
  { wareid: 8520, warecode: "8520", warename: "古汉养生精口服液/ZQ/D", category: "滋补保健", stock: 6762, price: 79.8, specification: "10ml*30支", image: "/assets/trade-product-alt.jpg" },
  { wareid: 32961, warecode: "32961", warename: "小儿氨酚黄那敏颗粒/XK/DZ/A", category: "儿科用药", stock: 4371, price: 0.1, specification: "6g*15袋", image: "/assets/trade-product-067053.jpg" },
  { wareid: 37848, warecode: "37848", warename: "西瓜霜润喉片/ZQ/YL/C", category: "咽喉用药", stock: 6183, price: 7.8, specification: "0.6g*12片", image: "/assets/trade-product-special.png" },
  { wareid: 37692, warecode: "37692", warename: "蒲公英颗粒/ZQ/A", category: "感冒用药", stock: 552, price: 28, specification: "15g*9袋", image: "/assets/trade-product-alt.jpg" },
  { wareid: 25216, warecode: "25216", warename: "益母草颗粒/ZQ/YL/A", category: "妇科用药", stock: 568, price: 23.8, specification: "15g*10袋", image: "/assets/trade-product-special.png" },
  { wareid: 48488, warecode: "48488", warename: "维生素AD滴剂/SXYJ/A", category: "儿科用药", stock: 4813, price: 98, specification: "30粒", image: "/assets/trade-product-067053.jpg" },
  { wareid: 23001, warecode: "23001", warename: "乌鸡白凤丸/YP/B", category: "妇科用药", stock: 627, price: 0.01, specification: "6g*10袋", image: "/assets/trade-product-alt.jpg" },
  { wareid: 100212, warecode: "100212", warename: "藿香正气口服液/ZQ/A", category: "感冒用药", stock: 2360, price: 19.9, specification: "10ml*10支", image: "/assets/trade-product-special.png" },
  { wareid: 100315, warecode: "100315", warename: "儿童退热贴/ZQ/B", category: "儿科用药", stock: 1894, price: 12.5, specification: "4贴", image: "/assets/trade-product-067053.jpg" },
  { wareid: 100316, warecode: "100316", warename: "医用棉签/ZQ/A", category: "日常护理", stock: 3452, price: 6.8, specification: "50支", image: "/assets/trade-product-alt.jpg" },
  { wareid: 100319, warecode: "100319", warename: "碘伏棉签/ZQ/A", category: "日常护理", stock: 2086, price: 15.6, specification: "20支", image: "/assets/trade-product-special.png" },
];

const combinationActivityImageLibrary = combinationProductBases.map((product, index) => ({ id: `activity-image-${product.wareid}`, name: product.warename, src: product.image, category: ["商品主图", "活动素材", "banner"][index % 3] }));

const combinationActivityProduct = (wareid, wareqty = 1, combinationUnitPrice) => {
  const product = combinationProductBases.find(item => item.wareid === wareid);
  return { ...product, wareqty, combinationUnitPrice: combinationUnitPrice ?? product.price };
};
const combinationPriceActivities = [
  { wareid: 84791, warecode: "0084791", warename: "日常清洁护理组合", enabled: false, combinationPrice: 29.8, activityImage: "/assets/trade-product-special.png", marketingType: "组合价", description: "日常清洁与咽喉护理用品组合。", cnt: 3, itemList: [combinationActivityProduct(6947, 1, 0.01), combinationActivityProduct(37692, 1, 22), combinationActivityProduct(37848, 1, 7.79)] },
  { wareid: 84792, warecode: "0084792", warename: "家庭常备护理组合", enabled: true, combinationPrice: 89.9, activityImage: "/assets/trade-product-alt.jpg", marketingType: "组合价", description: "家庭常备滋补与护理商品组合。", cnt: 2, itemList: [combinationActivityProduct(8520, 1, 70), combinationActivityProduct(25216, 1, 19.9)] },
  { wareid: 85120, warecode: "0085120", warename: "夏日防暑护理组合", enabled: false, combinationPrice: 29.9, activityImage: "/assets/trade-product-special.png", marketingType: "组合价", description: "适用于夏季防暑与咽喉日常护理。", cnt: 2, itemList: [combinationActivityProduct(100212, 1, 15), combinationActivityProduct(37848, 2, 7.45)] },
  { wareid: 85124, warecode: "0085124", warename: "儿童出行护理组合", enabled: true, combinationPrice: 29.8, activityImage: "/assets/trade-product-067053.jpg", marketingType: "组合价", description: "儿童出行常备用品组合。", cnt: 3, itemList: [combinationActivityProduct(100315, 1, 10), combinationActivityProduct(100316, 1, 5.8), combinationActivityProduct(100319, 1, 14)] },
  { wareid: 85125, warecode: "0085125", warename: "春季营养关爱组合", enabled: false, combinationPrice: 79.9, activityImage: "/assets/trade-product-alt.jpg", marketingType: "组合价", description: "春季营养与日常关爱商品组合。", cnt: 2, itemList: [combinationActivityProduct(48488, 1, 79.88), combinationActivityProduct(23001, 2, 0.01)] },
];
const getCombinationActivityStatus = activity => activity.enabled ? "启用" : "停用";

const combinationProductCatalog = Array.from({ length: 51 }, (_, index) => {
  const base = combinationProductBases[index % combinationProductBases.length];
  const batch = Math.floor(index / combinationProductBases.length);
  return { ...base, wareid: base.wareid + batch * 100000, warecode: String(base.wareid + batch * 100000), warename: batch ? `${base.warename}（${batch + 1}）` : base.warename, stock: base.stock + batch * 137, price: Number((base.price + batch * 0.5).toFixed(2)) };
});
const otherPromotionProductIds = new Set([32961]);
const nextCombinationActivityNo = activities => {
  const largestNumber = activities.reduce((largest, activity) => /^\d+$/.test(activity.warecode || "") ? Math.max(largest, Number(activity.warecode)) : largest, 0);
  return String(largestNumber + 1).padStart(7, "0");
};

const productCategoryTree = [
  { name: "感冒用药", children: ["病毒性感冒", "风热感冒", "普通感冒/流行性感冒", "胃肠型感冒"] },
  { name: "肝胆用药", children: ["护肝利胆", "胆囊炎", "胆结石"] },
  { name: "测试一级", children: ["测试二级"] },
  { name: "111111", children: ["测试分类"] },
  { name: "清热药", children: ["清热泻火药", "清热解毒药"] },
  { name: "呼吸系统", children: ["咳嗽用药", "哮喘用药"] },
  { name: "心脑血管", children: ["高血压用药", "心脏病用药"] },
  { name: "滋补保健", children: ["滋补调养", "维矿保健"] },
  { name: "儿科用药", children: ["儿童感冒", "儿童退热"] },
  { name: "咽喉用药", children: ["咽炎用药", "口腔护理"] },
  { name: "妇科用药", children: ["妇科炎症", "调经养血"] },
  { name: "日常护理", children: ["消毒护理", "家庭护理"] },
];

function CombinationPriceList({ setView, activities = combinationPriceActivities, onToggleStatus, onDelete }) {
  const [activityName, setActivityName] = useState(""); const [activityStatus, setActivityStatus] = useState(""); const [productName, setProductName] = useState(""); const [productCode, setProductCode] = useState("");
  const [query, setQuery] = useState({ activityName: "", activityStatus: "", productName: "", productCode: "" });
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10); const [jumpPage, setJumpPage] = useState("1");
  const [toastMessage, setToastMessage] = useState(""); const [deleteTarget, setDeleteTarget] = useState(null);
  const filteredActivities = activities.filter(activity => (!query.activityName || activity.warename.includes(query.activityName)) && (!query.activityStatus || query.activityStatus === "全部" || getCombinationActivityStatus(activity) === query.activityStatus) && (!query.productName || (activity.itemList || []).some(item => item.warename.includes(query.productName))) && (!query.productCode || (activity.itemList || []).some(item => item.warecode === query.productCode)));
  const total = filteredActivities.length; const totalPages = Math.max(1, Math.ceil(total / pageSize)); const currentPage = Math.min(page, totalPages);
  const rows = filteredActivities.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const switchPage = target => { const next = Math.min(Math.max(target, 1), totalPages); setPage(next); setJumpPage(String(next)); };
  const runQuery = () => { setQuery({ activityName, activityStatus, productName, productCode }); switchPage(1); };
  const reset = () => { setActivityName(""); setActivityStatus(""); setProductName(""); setProductCode(""); setQuery({ activityName: "", activityStatus: "", productName: "", productCode: "" }); switchPage(1); };
  const toggleStatus = activity => {
    const enabled = !activity.enabled;
    onToggleStatus(activity.wareid, enabled);
    setToastMessage(enabled ? "活动已启用" : "活动已停用");
    window.setTimeout(() => setToastMessage(""), 1800);
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    onDelete(deleteTarget.wareid);
    setDeleteTarget(null);
    setToastMessage("活动已删除");
    window.setTimeout(() => setToastMessage(""), 1800);
  };
  return <PageFrame crumb="组合价" section="marketing" setView={setView}>
    <div className="filters panel activity-filter limited-discount-filter combination-price-filter"><label>活动名称<input aria-label="活动名称" maxLength={100} value={activityName} onChange={event => setActivityName(event.target.value)} placeholder="请输入活动名称" /></label><label>活动状态<select aria-label="活动状态" value={activityStatus} onChange={event => setActivityStatus(event.target.value)}><option value="" disabled hidden>请选择</option><option value="全部">全部</option><option value="启用">启用</option><option value="停用">停用</option></select></label><label>商品名称<input aria-label="商品名称" maxLength={100} value={productName} onChange={event => setProductName(event.target.value)} placeholder="请输入商品名称" /></label><label>商品编码<input aria-label="商品编码" maxLength={50} value={productCode} onChange={event => setProductCode(event.target.value)} placeholder="请输入商品编码" /></label><div className="filter-actions"><button className="primary" onClick={runQuery}><FiSearch /> 查询</button><button className="secondary" onClick={reset}>重置</button></div></div>
    <section className="panel coupon-table-wrap"><div className="combination-list-actions"><button className="primary" onClick={() => setView("combinationPriceCreate")}><FiPlus /> 新增组合价</button></div><table className="coupon-table combination-price-table"><thead><tr>{["活动名称", "组合价格", "活动状态", "操作"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(activity => { const status = getCombinationActivityStatus(activity); return <tr key={activity.wareid}><td>{activity.warename || "—"}</td><td>{typeof activity.combinationPrice === "number" ? activity.combinationPrice.toFixed(2) : "—"}</td><td><span className={activity.enabled ? "status status-active" : "status status-ended"}><i className="status-dot" />{status}</span></td><td><div className="combination-row-actions"><button className="text-btn" onClick={() => setView(["combinationPriceDetail", activity])}>查看</button><button className="text-btn" onClick={() => setView(["combinationPriceEdit", activity])}>编辑</button><button className="text-btn" onClick={() => toggleStatus(activity)}>{activity.enabled ? "停用" : "启用"}</button><button className="text-btn danger-link" onClick={() => setDeleteTarget(activity)}>删除</button></div></td></tr>; })}</tbody></table>{total === 0 ? <p className="empty-row">暂无符合条件的组合价活动</p> : <div className="pagination limited-discount-pagination"><span>共{total}条</span><select aria-label="每页条数" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); switchPage(1); }}><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option><option value="100">100条/页</option></select><button aria-label="上一页" disabled={currentPage === 1} onClick={() => switchPage(currentPage - 1)}><FiChevronLeft /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNo => pageNo === currentPage ? <b key={pageNo}>{pageNo}</b> : <button key={pageNo} onClick={() => switchPage(pageNo)}>{pageNo}</button>)}<button aria-label="下一页" disabled={currentPage === totalPages} onClick={() => switchPage(currentPage + 1)}><FiChevronRight /></button><span>前往</span><input aria-label="跳转页码" value={jumpPage} onChange={e => setJumpPage(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && switchPage(Number(jumpPage) || 1)} onBlur={() => switchPage(Number(jumpPage) || 1)} /><span>页</span></div>}</section>
    {deleteTarget && <div className="modal-backdrop"><section className="modal combination-delete-modal" role="dialog" aria-modal="true" aria-label="删除组合价活动"><header><b>删除组合价活动</b><button aria-label="关闭删除确认" onClick={() => setDeleteTarget(null)}><FiX /></button></header><div className="combination-delete-content"><strong>确认删除“{deleteTarget.warename}”吗？</strong><p>删除后不可恢复。</p></div><footer><button className="secondary" onClick={() => setDeleteTarget(null)}>取消</button><button className="danger-primary" onClick={confirmDelete}>删除</button></footer></section></div>}
    {toastMessage && <div className="combination-form-toast success" role="status"><span aria-hidden="true">✓</span>{toastMessage}</div>}
  </PageFrame>;
}

function CombinationImagePicker({ selectedImage, onConfirm, onClose }) {
  const [tab, setTab] = useState("library"); const [category, setCategory] = useState("全部图片"); const [pendingImage, setPendingImage] = useState(selectedImage); const [fileError, setFileError] = useState("");
  const categories = ["全部图片", "未分组", "商品主图", "活动素材", "banner"];
  const images = combinationActivityImageLibrary.filter(image => category === "全部图片" || image.category === category);
  const selectLocalImage = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const supportedImage = ["image/jpeg", "image/png"].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!supportedImage) { setFileError("请上传 JPG、JPEG 或 PNG 格式图片"); event.target.value = ""; return; }
    if (file.size > 2 * 1024 * 1024) { setFileError("图片大小不能超过 2M"); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { setPendingImage(String(reader.result || "")); setFileError(""); };
    reader.onerror = () => setFileError("图片读取失败，请重新上传");
    reader.readAsDataURL(file);
  };
  return <div className="modal-backdrop product-select-backdrop"><section className="modal combination-image-picker-modal" role="dialog" aria-modal="true" aria-label="选择活动图片"><header><b>选择活动图片</b><button aria-label="关闭图片选择" onClick={onClose}><FiX /></button></header><div className="combination-image-picker-tabs"><button className={tab === "library" ? "active" : ""} onClick={() => setTab("library")}>我的图库</button><button className={tab === "upload" ? "active" : ""} onClick={() => setTab("upload")}>本地上传</button></div>{tab === "library" ? <div className="combination-image-library"><aside>{categories.map(item => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</aside><div className="combination-image-grid">{images.map(image => <button key={image.id} className={pendingImage === image.src ? "selected" : ""} onClick={() => setPendingImage(image.src)}><img src={image.src} alt={image.name} /><span>{image.name}</span></button>)}</div></div> : <div className="combination-image-local-upload"><label><FiPlus /><span>点击上传图片</span><input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={selectLocalImage} /></label><p>支持 JPG/PNG 格式，单张最大 2M</p>{pendingImage && <div><img src={pendingImage} alt="待使用活动图片" /><span>已选择图片</span></div>}{fileError && <em>{fileError}</em>}</div>}<footer><button className="secondary" onClick={onClose}>取消</button><button className="primary" disabled={!pendingImage} onClick={() => onConfirm(pendingImage)}>使用选中的图片</button></footer></section></div>;
}

function CombinationProductPicker({ selectedProducts, blockedProductReasons = {}, onConfirm, onClose }) {
  const [category, setCategory] = useState(""); const [categoryLabel, setCategoryLabel] = useState(""); const [categoryMenuOpen, setCategoryMenuOpen] = useState(false); const [activeCategory, setActiveCategory] = useState(productCategoryTree[0].name); const [keyword, setKeyword] = useState(""); const [query, setQuery] = useState({ category: "", keyword: "" }); const [pendingIds, setPendingIds] = useState(() => selectedProducts.map(product => product.wareid)); const [limitToast, setLimitToast] = useState(false); const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10); const [jumpPage, setJumpPage] = useState("1");
  const filteredProducts = combinationProductCatalog.filter(product => (!query.category || product.category === query.category) && (!query.keyword || product.warename.includes(query.keyword) || product.warecode.includes(query.keyword)));
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize)); const currentPage = Math.min(page, totalPages); const rows = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const switchPage = target => { const next = Math.min(Math.max(target, 1), totalPages); setPage(next); setJumpPage(String(next)); };
  const runSearch = () => { setQuery({ category, keyword: keyword.trim() }); switchPage(1); };
  const reset = () => { setCategory(""); setCategoryLabel(""); setKeyword(""); setQuery({ category: "", keyword: "" }); switchPage(1); };
  const visiblePages = totalPages <= 6 ? Array.from({ length: totalPages }, (_, index) => index + 1) : currentPage <= 4 ? [1, 2, 3, 4, "ellipsis", totalPages] : currentPage >= totalPages - 2 ? [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages] : [1, "ellipsis-left", currentPage - 1, currentPage, currentPage + 1, "ellipsis-right", totalPages];
  const toggleProduct = product => {
    if (pendingIds.includes(product.wareid)) { setPendingIds(current => current.filter(id => id !== product.wareid)); return; }
    if (pendingIds.length >= 9) { setLimitToast(true); window.setTimeout(() => setLimitToast(false), 1800); return; }
    setPendingIds(current => [...current, product.wareid]);
  };
  const pendingProducts = pendingIds.map(id => combinationProductCatalog.find(product => product.wareid === id)).filter(Boolean); const selectionChanged = pendingIds.length !== selectedProducts.length || pendingIds.some(id => !selectedProducts.some(product => product.wareid === id));
  const activeCategoryItem = productCategoryTree.find(item => item.name === activeCategory) || productCategoryTree[0];
  const selectCategory = (parent, child) => { setCategory(parent); setCategoryLabel(`${parent} / ${child}`); setCategoryMenuOpen(false); };
  return <div className="modal-backdrop product-select-backdrop">
    <section className="modal combination-product-modal" aria-label="商品选择">
      <header><b>商品选择</b><button aria-label="关闭商品选择" onClick={onClose}><FiX /></button></header>
      <div className="product-select-filters">
        <div className="category-cascader">
          <button type="button" className={categoryMenuOpen ? "category-cascader-trigger open" : "category-cascader-trigger"} aria-label="商品分类" aria-expanded={categoryMenuOpen} onClick={() => setCategoryMenuOpen(open => !open)}>{categoryLabel || "请选择商品分类"}<FiChevronRight /></button>
          {categoryMenuOpen && <div className="category-cascader-menu" role="menu" aria-label="商品分类选项"><div className="category-cascader-primary">{productCategoryTree.map(item => <button type="button" role="menuitem" key={item.name} className={activeCategory === item.name ? "active" : ""} onMouseEnter={() => setActiveCategory(item.name)} onFocus={() => setActiveCategory(item.name)} onClick={() => setActiveCategory(item.name)}>{item.name}<FiChevronRight /></button>)}</div><div className="category-cascader-secondary">{activeCategoryItem.children.map(child => <button type="button" role="menuitem" key={child} onClick={() => selectCategory(activeCategoryItem.name, child)}>{child}</button>)}</div></div>}
        </div>
        <input aria-label="商品名称或商品编码" value={keyword} onChange={event => setKeyword(event.target.value)} onKeyDown={event => event.key === "Enter" && runSearch()} placeholder="请输入商品名称/商品编码" /><button className="primary" onClick={runSearch}><FiSearch /> 搜索</button><button className="secondary" onClick={reset}>重置</button>
      </div>
      <div className="product-select-table-wrap"><table className="product-select-table"><thead><tr><th>商品编码</th><th>商品名称</th><th>最新售价</th></tr></thead><tbody>{rows.map(product => { const checked = pendingIds.includes(product.wareid); const blockedReason = blockedProductReasons[product.wareid]; const blocked = Boolean(blockedReason) && !checked; return <tr key={product.wareid} className={`${checked ? "selected" : ""}${blocked ? " promotion-blocked" : ""}`}><td><div className="product-code-cell"><input type="checkbox" aria-label={`选择${product.warename}${blocked ? `，${blockedReason}` : ""}`} checked={checked} disabled={blocked} onChange={() => toggleProduct(product)} /><span>{product.warecode}</span></div></td><td><div className="product-name-cell"><img src={product.image} alt="" /><span>{product.warename}</span>{blocked && <em>{blockedReason}</em>}</div></td><td>{product.price.toFixed(product.price % 1 === 0 ? 1 : 2)}</td></tr>; })}</tbody></table>{rows.length === 0 && <p className="product-select-empty">暂无符合条件的商品</p>}</div>{limitToast && <div className="product-select-limit-toast" role="alert"><span aria-hidden="true">×</span>组合商品最多只能选择9个~</div>}
      <div className="product-select-pagination"><span>共 {filteredProducts.length} 条</span><select aria-label="商品每页条数" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); setJumpPage("1"); }}><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option></select><button aria-label="商品上一页" disabled={currentPage === 1} onClick={() => switchPage(currentPage - 1)}><FiChevronLeft /></button>{visiblePages.map((pageNo, index) => typeof pageNo === "number" ? pageNo === currentPage ? <b key={pageNo}>{pageNo}</b> : <button key={pageNo} onClick={() => switchPage(pageNo)}>{pageNo}</button> : <span key={`${pageNo}-${index}`}>•••</span>)}<button aria-label="商品下一页" disabled={currentPage === totalPages} onClick={() => switchPage(currentPage + 1)}><FiChevronRight /></button><span>前往</span><input aria-label="商品跳转页码" value={jumpPage} onChange={event => setJumpPage(event.target.value.replace(/\D/g, ""))} onKeyDown={event => event.key === "Enter" && switchPage(Number(jumpPage) || 1)} onBlur={() => switchPage(Number(jumpPage) || 1)} /><span>页</span></div>
      <footer><span className="product-select-summary">已选择 {pendingProducts.length} 个，还可选择 {9 - pendingProducts.length} 个</span><div className="product-select-footer-actions"><button className="secondary" onClick={onClose}>取消</button><button className="primary" disabled={!selectionChanged} onClick={() => onConfirm(pendingProducts)}>确认</button></div></footer>
    </section>
  </div>;
}

function SelectedCombinationProducts({ products, onUpdate, onRemove, readOnly = false }) {
  return <div className="combination-selected-table-wrap"><table className={readOnly ? "combination-selected-table readonly" : "combination-selected-table"}><thead><tr>{["商品图片", "商品编码", "商品名称", "最新售价", "组合单价", "商品规格", "数量", "操作"].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{products.map(product => {
    const combinationUnitPrice = product.combinationUnitPrice ?? product.price;
    const invalidUnitPrice = !readOnly && (combinationUnitPrice === "" || Number(combinationUnitPrice) <= 0 || Number(combinationUnitPrice) > Number(product.price));
    return <tr key={product.wareid}><td><img src={product.image} alt={product.warename} /></td><td>{product.warecode}</td><td title={product.warename}>{product.warename}</td><td>{Number(product.price ?? 0).toFixed(2)}</td><td>{readOnly ? <span>{Number(combinationUnitPrice || 0).toFixed(2)}</span> : <div className="combination-unit-price-control"><input className="combination-unit-price-input" aria-label={`${product.warename}组合单价`} aria-invalid={invalidUnitPrice} type="number" min="0.01" max={product.price} step="0.01" inputMode="decimal" value={combinationUnitPrice} onChange={event => onUpdate(product.wareid, { combinationUnitPrice: event.target.value })} />{invalidUnitPrice && <span>需大于0且不超过最新售价</span>}</div>}</td><td>{product.specification || "—"}</td><td><input className="combination-quantity-input" aria-label={`${product.warename}数量`} aria-readonly={readOnly} readOnly={readOnly} type="number" min="1" step="1" value={product.wareqty ?? 1} onChange={readOnly ? undefined : event => onUpdate(product.wareid, { wareqty: Math.max(1, Number(event.target.value) || 1) })} /></td><td>{readOnly ? <span className="combination-readonly-operation">—</span> : <button className="combination-delete-btn" onClick={() => onRemove(product)}>删除</button>}</td></tr>;
  })}</tbody></table></div>;
}

function CombinationPriceForm({ setView, onSave, existingActivities = [], activity = null, mode = "create" }) {
  const readOnly = mode === "view"; const isEdit = mode === "edit";
  const initialProducts = (activity?.itemList || []).map(item => {
    const product = { ...(combinationProductCatalog.find(catalogProduct => catalogProduct.wareid === item.wareid) || {}), ...item };
    return { ...product, combinationUnitPrice: product.combinationUnitPrice ?? product.price };
  });
  const [title, setTitle] = useState(activity?.warename || ""); const [activityImage, setActivityImage] = useState(activity?.activityImage || ""); const [imagePickerOpen, setImagePickerOpen] = useState(false); const [selectedProducts, setSelectedProducts] = useState(initialProducts); const [pickerOpen, setPickerOpen] = useState(false); const [message, setMessage] = useState(""); const [validationAttempted, setValidationAttempted] = useState(false); const [formToastMessage, setFormToastMessage] = useState("");
  const combinationPrice = selectedProducts.reduce((total, product) => total + Number(product.combinationUnitPrice || 0) * Math.max(1, Number(product.wareqty) || 1), 0);
  const blockedProductReasons = useMemo(() => {
    const reasons = {};
    existingActivities.filter(item => item.wareid !== activity?.wareid && item.enabled).forEach(item => (item.itemList || []).forEach(product => { reasons[product.wareid] = "已参与其他组合价"; }));
    otherPromotionProductIds.forEach(productId => { reasons[productId] = "已参与其他促销"; });
    return reasons;
  }, [existingActivities, activity?.wareid]);
  const removeProduct = product => { setMessage(""); setSelectedProducts(current => current.filter(item => item.wareid !== product.wareid)); };
  const updateProduct = (wareid, changes) => { setMessage(""); setSelectedProducts(current => current.map(product => product.wareid === wareid ? { ...product, ...changes } : product)); };
  const addProducts = products => { setMessage(""); setSelectedProducts(current => products.map(product => current.find(item => item.wareid === product.wareid) || { ...product, wareqty: 1, combinationUnitPrice: product.price })); setPickerOpen(false); };
  const showFormToast = text => { setFormToastMessage(text); window.setTimeout(() => setFormToastMessage(""), 1800); };
  const clearActivityImage = () => setActivityImage("");
  const save = () => {
    setValidationAttempted(true);
    if (!title.trim()) { setMessage(""); return; }
    if (!activityImage) { showFormToast("请上传活动图片"); return; }
    if (existingActivities.some(item => item.wareid !== activity?.wareid && item.warename.trim() === title.trim())) { showFormToast("活动名称已存在"); return; }
    if (selectedProducts.length === 0) { showFormToast("请添加组合商品"); return; }
    if (selectedProducts.length < 2) { showFormToast("组合商品至少需要2个"); return; }
    const conflictedProduct = selectedProducts.find(product => blockedProductReasons[product.wareid]);
    if (conflictedProduct) { showFormToast(`${conflictedProduct.warename}${blockedProductReasons[conflictedProduct.wareid]}`); return; }
    const invalidUnitPriceProduct = selectedProducts.find(product => product.combinationUnitPrice === "" || Number(product.combinationUnitPrice) <= 0 || Number(product.combinationUnitPrice) > Number(product.price));
    if (invalidUnitPriceProduct) { showFormToast(`${invalidUnitPriceProduct.warename}的组合单价必须大于0且不能超过最新售价`); return; }
    const { description: _description, starttime: _starttime, endtime: _endtime, terminatedAt: _terminatedAt, terminatedBy: _terminatedBy, ...activityWithoutLegacyFields } = activity || {};
    onSave({ ...activityWithoutLegacyFields, wareid: activity?.wareid ?? Date.now(), warecode: activity?.warecode || nextCombinationActivityNo(existingActivities), warename: title.trim(), activityImage, enabled: activity?.enabled ?? false, combinationPrice: Number(combinationPrice.toFixed(2)), marketingType: "组合价", cnt: selectedProducts.length, itemList: selectedProducts.map(item => ({ ...item, wareqty: item.wareqty ?? 1, combinationUnitPrice: Number(item.combinationUnitPrice) })) });
  };
  const titleInvalid = validationAttempted && !title.trim(); const imageInvalid = validationAttempted && !activityImage; const priceInvalid = validationAttempted && selectedProducts.length === 0;
  const pageTitle = readOnly ? "查看组合价" : isEdit ? "编辑组合价" : "新增组合价";
  const requiredClass = readOnly ? "" : "required-label";
  const crumb = <><button className="breadcrumb-link" onClick={() => setView("combinationPrice")}>组合价</button><span> › {pageTitle}</span></>;
  return <PageFrame crumb={crumb} section="marketing" setView={setView}>
    <section className={readOnly ? "panel combination-create-panel combination-view-panel" : "panel combination-create-panel"}><div className="combination-create-form">
      <div className="combination-form-row"><label className={requiredClass} htmlFor="combination-title">活动名称：</label><div className="combination-field-control"><input id="combination-title" maxLength={100} value={title} readOnly={readOnly} aria-required={!readOnly} aria-invalid={titleInvalid} onChange={readOnly ? undefined : event => { setTitle(event.target.value); setMessage(""); }} placeholder="请输入活动名称" />{titleInvalid && <span className="combination-field-error">请输入活动名称</span>}</div></div>
      <div className="combination-form-row combination-image-row"><label className={requiredClass}>活动图片：</label><div className="combination-image-field">{activityImage ? <div className="combination-image-preview"><img src={activityImage} alt="活动图片" />{!readOnly && <button type="button" aria-label="删除活动图片" onClick={clearActivityImage}><FiX /></button>}</div> : readOnly ? <span className="combination-image-empty">未上传活动图片</span> : <button type="button" className={imageInvalid ? "combination-image-upload invalid" : "combination-image-upload"} aria-label="选择活动图片" onClick={() => setImagePickerOpen(true)}><FiPlus /></button>}{!readOnly && <span className="combination-image-guidance">支持 JPG/PNG 格式，最大 2M</span>}{imageInvalid && <span className="combination-field-error">请上传活动图片</span>}</div></div>
      <div className="combination-form-row"><label className={requiredClass} htmlFor="combination-price">组合价格：</label><div className="combination-field-control"><input id="combination-price" className="combination-price-input" type="text" readOnly aria-required={!readOnly} aria-invalid={priceInvalid} value={selectedProducts.length > 0 ? combinationPrice.toFixed(2) : ""} placeholder="添加商品后自动计算" />{priceInvalid && <span className="combination-field-error">请添加组合商品</span>}</div></div>
      <div className="combination-form-row product-row"><label className={requiredClass}>组合商品：</label><div className="combination-products-field">{!readOnly && <button className="secondary product-picker-btn" onClick={() => setPickerOpen(true)}>添加组合商品</button>}{selectedProducts.length > 0 && <SelectedCombinationProducts products={selectedProducts} onUpdate={updateProduct} onRemove={removeProduct} readOnly={readOnly} />}{!readOnly && <p>组合商品最多可添加9个</p>}</div></div>
      <div className="combination-form-actions">{readOnly ? <button className="secondary" onClick={() => setView("combinationPrice")}>返回</button> : <><button className="primary" onClick={save}>保存</button><button className="secondary" onClick={() => setView("combinationPrice")}>取消</button></>}{message && <span className="combination-form-message">{message}</span>}</div>
    </div></section>{formToastMessage && <div className="combination-form-toast" role="alert"><span aria-hidden="true">×</span>{formToastMessage}</div>}{imagePickerOpen && <CombinationImagePicker selectedImage={activityImage} onConfirm={image => { setActivityImage(image); setImagePickerOpen(false); }} onClose={() => setImagePickerOpen(false)} />}{pickerOpen && <CombinationProductPicker selectedProducts={selectedProducts} blockedProductReasons={blockedProductReasons} onConfirm={addProducts} onClose={() => setPickerOpen(false)} />}
  </PageFrame>;
}

function CombinationPriceCreate({ setView, onSave, activities }) { return <CombinationPriceForm setView={setView} onSave={onSave} existingActivities={activities} />; }
function CombinationPriceEdit({ setView, activity, onSave, activities }) { return <CombinationPriceForm setView={setView} onSave={onSave} existingActivities={activities} activity={activity} mode="edit" />; }
function CombinationPriceDetail({ setView, activity }) { return <CombinationPriceForm setView={setView} activity={activity} mode="view" />; }

function StorePromotion({ setView, type }) {
  const [keyword, setKeyword] = useState(""); const [activityType, setActivityType] = useState("全部");
  const activityTypeOptions = type === "满减满赠" ? ["全部", "满减", "满赠"] : ["全部", "限时折扣"];
  const activityStatusClass = { "进行中": "status status-active", "未开始": "status status-pending", "已结束": "status status-ended" };
  const activities = storeActivities[type].filter(x => (!keyword || x[0].includes(keyword)) && (activityType === "全部" || x[1] === activityType));
  return <PageFrame crumb={promotionTypeLabel(type)} section="marketing" setView={setView}><div className="filters panel activity-filter"><label>活动名称<input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="请输入活动名称" /></label><label>活动类型<select value={activityType} onChange={e => setActivityType(e.target.value)}>{activityTypeOptions.map(option => <option key={option}>{option}</option>)}</select></label><div className="filter-actions"><button className="primary"><FiSearch /> 查询</button><button className="secondary" onClick={() => { setKeyword(""); setActivityType("全部"); }}>重置</button></div></div><section className="panel coupon-table-wrap"><table className="coupon-table activity-table"><colgroup><col className="activity-name-col" /><col className="activity-type-col" /><col /><col /><col /><col /></colgroup><thead><tr>{["活动名称", "活动类型", "活动时间", "适用门店", "活动状态", "操作"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{activities.map(a => <tr key={a[0]}><td>{a[0]}</td><td>{a[1]}</td><td>{a[2]}</td><td>{a[3]}</td><td><span className={activityStatusClass[a[4]] || "status"}><i className="status-dot" />{a[4]}</span></td><td><button className="text-btn" onClick={() => setView(["storePromotionDetail", { type, activity: a }])}>查看</button></td></tr>)}</tbody></table></section></PageFrame>;
}

function StorePromotionDetail({ setView, type, activity }) {
  const [name, activityType, period, storeScope, status] = activity;
  const promotionRule = activityType === "满赠" ? "订单满199元赠维C泡腾片" : activityType === "限时折扣" ? "指定商品限时享8.8折" : name === "年中感恩满减" ? "订单满159元减20元" : "订单满299元减30元";
  const threshold = activityType === "满赠" ? "满199元" : activityType === "限时折扣" ? "指定商品" : name === "年中感恩满减" ? "满159元" : "满299元";
  return <PageFrame crumb={<MarketingDetailCrumb type={type} listView={["storePromotion", type]} setView={setView} />} section="marketing" setView={setView}><section className="panel coupon-detail activity-detail"><h3>基本信息</h3><h4>基础规则</h4><div className="detail-grid"><Info label="活动名称" value={name} /><Info label="活动类型" value={activityType} simple /><Info label="活动状态" value={status} simple /><Info label="活动时间" value={period} /><Info label="适用门店" value={storeScope} simple /></div></section><section className="panel coupon-detail rules activity-detail-rules"><h3>活动规则</h3><p>门店促销配置：活动规则将在结算时自动生效，满足条件的订单可享受相应优惠。</p><div className="rule-list"><Info label="促销规则" value={promotionRule} simple /><Info label="活动门槛" value={threshold} simple /><Info label="适用门店范围" value={storeScope} simple /><Info label="优惠叠加" value="不可与其他门店促销活动叠加" simple /></div></section></PageFrame>;
}

function CouponList({ setView }) {
  const [code, setCode] = useState(""); const [name, setName] = useState(""); const [query, setQuery] = useState({ code: "", name: "" }); const [type, setType] = useState("全部"); const [recordModal, setRecordModal] = useState(false);
  const rows = useMemo(() => coupons.filter(c => (!query.code || c[1].includes(query.code)) && (!query.name || c[2].includes(query.name)) && (type === "全部" || c[0] === type)), [query, type]);
  return <PageFrame crumb="优惠券" section="marketing" setView={setView}><div className="filters panel"><label>券类型<select value={type} onChange={e => setType(e.target.value)}><option>全部</option><option>金额券</option><option>折扣券</option><option>礼品券</option></select></label><label>券型编号<input value={code} onChange={e => setCode(e.target.value)} placeholder="请输入券型编号" /></label><label>券名称<input value={name} onChange={e => setName(e.target.value)} placeholder="请输入券名称" /></label><button className="primary" onClick={() => setQuery({ code, name })}><FiSearch /> 查询</button><button className="secondary" onClick={() => { setCode(""); setName(""); setQuery({ code: "", name: "" }); setType("全部"); }}>重置</button></div><section className="panel coupon-table-wrap"><table className="coupon-table"><thead><tr>{["券类型", "券型编号", "券名称", "券权益", "券使用有效期", "操作"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map((c) => <tr key={c[1]}><td>{c[0]}</td><td>{c[1]}</td><td>{c[2]}</td><td>{c[3]}</td><td><span>{c[4]}</span><em>{c[5]}</em></td><td><button className="text-btn" onClick={() => setView(["couponDetail", c])}>查看</button><button className="text-btn" onClick={() => setRecordModal(true)}>领取记录</button></td></tr>)}</tbody></table><div className="pagination"><span>共 29 条</span><select><option>10条/页</option></select><button disabled>‹</button><b>1</b><button>2</button><button>3</button><button>›</button><span>前往</span><input defaultValue="1" /><span>页</span></div></section>{recordModal && <Modal onClose={() => setRecordModal(false)} title="领取记录"><p className="empty-record"><FiUsers /> 暂无领取记录</p></Modal>}</PageFrame>;
}

function CouponDetail({ setView, coupon }) {
  const c = coupon || coupons[0];
  return <PageFrame crumb="优惠券 › 金额券查看" section="marketing" setView={setView}><button className="back-btn" onClick={() => setView("coupon")}>返回列表</button><section className="panel coupon-detail"><h3>基本信息</h3><h4>基础规则</h4><div className="detail-grid"><Info label="券类型" value={c[0]} simple /><Info label="券型编号" value={c[1]} /><Info label="券名称" value={c[2]} /><Info label="面额" value={c[3].replace("¥", "")} suffix="元" /><Info label="券使用有效期" value={c[4] === "绝对有效期" ? "◉ 绝对有效期　○ 相对有效期" : "○ 绝对有效期　◉ 相对有效期"} simple /><Info label="" value="2026-07-23　-　2026-07-31" /><Info label="可发券时段" value="2026-07-23　-　2026-07-31" /></div></section><section className="panel coupon-detail rules"><h3>券渠道及规则</h3><p>私域商城配置：配置规则将传输给私域商城，由私域商城负责用券判断。</p><div className="rule-list"><Info label="使用门槛" value={c[6]} simple /><Info label="适用门店范围" value="◉ 全部门店　○ 限定门店" simple /><Info label="适用商品范围" value="◉ 全部商品　○ 限定商品　○ 排除商品" simple /></div></section></PageFrame>;
}

function Info({ label, value, suffix, simple }) { return <div className={simple ? "info simple" : "info"}><label>{label}</label>{simple ? <span>{value}</span> : <div className="readonly">{value}{suffix && <i>{suffix}</i>}</div>}</div>; }

function AdManager({ setView }) {
  const [enabled, setEnabled] = useState(true); const [repeat, setRepeat] = useState(true); const [saved, setSaved] = useState(false); const [linkPicker, setLinkPicker] = useState(false); const [link, setLink] = useState("限时购列表");
  return <PageFrame crumb="弹窗广告" section="marketing" setView={setView}><section className="panel ad-panel"><div className="preview-column"><h2>预览效果</h2><div className="mobile-preview"><img src="/assets/popup-preview.jpg" alt="商城首页预览" /><div className="preview-mask" /><img className="popup-ad" src="/assets/popup-ad.png" alt="广告预览" /></div></div><div className="ad-form"><fieldset><legend>* 是否开启活动：</legend><Radio label="是" checked={enabled} onChange={() => setEnabled(true)} /><Radio label="否" checked={!enabled} onChange={() => setEnabled(false)} /><p>开启后，消费者在进入小程序的时候会显示弹窗广告</p></fieldset><fieldset><legend>* 上传广告图片：</legend><div className="upload-line"><div className="image-thumb"><img src="/assets/popup-ad.png" alt="广告素材" /><FiX /></div><span>上传 800*1000 以上比例的 PNG 图片</span></div></fieldset><div className="link-row">链接到：<b>{link}</b><button onClick={() => setLinkPicker(!linkPicker)}>修改⌄</button>{linkPicker && <div className="link-menu">{["限时购列表", "商品详情", "优惠券中心"].map(x => <button key={x} onClick={() => { setLink(x); setLinkPicker(false); }}>{x}</button>)}</div>}</div><label className="time-label">* 开始投放日期：<input type="text" defaultValue="2026-08-03 00:00:00" /></label><label className="time-label">* 结束投放日期：<input type="text" defaultValue="2026-08-03 00:00:00" /></label><fieldset><legend>* 重复显示设置：</legend><Radio label="开启" checked={repeat} onChange={() => setRepeat(true)} /><Radio label="关闭" checked={!repeat} onChange={() => setRepeat(false)} /><p>广告只会在用户每天第一次进入商城首页时弹出。若开启重复显示，用户每一次重新进入商城首页都会弹出广告，直到用户点击进入弹窗链接之后，当天不再显示广告。</p></fieldset><button className="primary save-btn" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }}>保存</button>{saved && <span className="toast">保存成功（演示）</span>}</div></section></PageFrame>;
}

function Radio({ label, checked, onChange }) { return <label className="radio"><input type="radio" checked={checked} onChange={onChange} /><span />{label}</label>; }
function Modal({ title, children, onClose }) { return <div className="modal-backdrop"><section className="modal"><header><b>{title}</b><button onClick={onClose}><FiX /></button></header>{children}<footer><button className="primary" onClick={onClose}>关闭</button></footer></section></div>; }
function PageFrame({ children, crumb, section, setView, homeNav = false }) { return <div className="app-shell"><Sidebar section={section} onSection={setView} />{homeNav && <aside className="home-context"><div>首页</div><button className="context-active">控制台</button><button>系统通知 <b>99+</b></button><button>意见反馈 <b>6</b></button><button>投诉举报</button></aside>}<main className={homeNav ? "content-area with-context" : "content-area"}><Topbar crumb={crumb} /><div className="page-content">{children}</div></main></div>; }
const initialPrototypeView = () => {
  const preview = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("preview");
  if (preview === "member-price") return "memberPriceRules";
  if (preview === "full-reduction") return ["erpPromotion", "满减满赠"];
  if (preview === "four-in-one") return "fourInOneModel";
  if (preview === "four-in-one-calculator") return "fourInOneCalculator";
  return "dashboard";
};

export function App() {
  const [view, setView] = useState(initialPrototypeView);
  const [combinationActivities, setCombinationActivities] = useState(combinationPriceActivities);
  const saveCombinationActivity = activity => { setCombinationActivities(current => [activity, ...current]); setView("combinationPrice"); };
  const updateCombinationActivity = activity => { setCombinationActivities(current => current.map(item => item.wareid === activity.wareid ? activity : item)); setView("combinationPrice"); };
  const deleteCombinationActivity = wareid => setCombinationActivities(current => current.filter(activity => activity.wareid !== wareid));
  const toggleCombinationActivityStatus = (wareid, enabled) => setCombinationActivities(current => current.map(activity => {
    if (activity.wareid !== wareid) return activity;
    const operatedAt = formatBusinessDateTime();
    return { ...activity, enabled, statusChangedAt: operatedAt, statusChangedBy: "admin", operationLogs: [...(activity.operationLogs || []), { operation: enabled ? "ENABLE" : "DISABLE", operator: "admin", operatedAt }] };
  }));
  const show = view === "dashboard" ? <Dashboard setView={setView} /> : view === "trade" ? <TradeModule onNavigate={setView} /> : view === "marketing" ? <MarketingGuide setView={setView} /> : view === "coupon" ? <CouponList setView={setView} /> : view === "ad" ? <AdManager setView={setView} /> : view === "memberPriceRules" ? <MemberPriceRules setView={setView} /> : view === "fourInOneModel" ? <FourInOneModel setView={setView} /> : view === "fourInOneCalculator" ? <FourInOneCalculator setView={setView} /> : view === "combinationPrice" ? <CombinationPriceList setView={setView} activities={combinationActivities} onToggleStatus={toggleCombinationActivityStatus} onDelete={deleteCombinationActivity} /> : view === "combinationPriceCreate" ? <CombinationPriceCreate setView={setView} activities={combinationActivities} onSave={saveCombinationActivity} /> : view[0] === "combinationPriceEdit" ? <CombinationPriceEdit setView={setView} activity={view[1]} activities={combinationActivities} onSave={updateCombinationActivity} /> : view[0] === "combinationPriceDetail" ? <CombinationPriceDetail setView={setView} activity={view[1]} /> : view[0] === "erpPromotion" ? <ErpPromotionList setView={setView} category={view[1]} /> : view[0] === "erpPromotionDetail" ? <ErpPromotionDetail setView={setView} category={view[1].category} activity={view[1].activity} /> : view[0] === "fourInOneDetail" ? <ErpPromotionDetail setView={setView} category="四合一营销活动接口" activity={view[1]} listView="fourInOneModel" /> : view[0] === "storePromotion" ? view[1] === "限时折扣" ? <LimitedDiscountList setView={setView} /> : <StorePromotion setView={setView} type={view[1]} /> : view[0] === "limitedDiscountDetail" ? <LimitedDiscountDetail setView={setView} activity={view[1]} /> : view[0] === "storePromotionDetail" ? <StorePromotionDetail setView={setView} type={view[1].type} activity={view[1].activity} /> : <CouponDetail setView={setView} coupon={view[1]} />;
  return show;
}
