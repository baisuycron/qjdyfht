import { useMemo, useState } from "react";
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
  return <PageFrame crumb="营销" section="marketing" setView={setView}><section className="marketing-guide"><div className="guide-section"><h2>平台促销</h2><div className="guide-cards"><button onClick={() => setView("coupon")}><span className="guide-icon red"><FiTag /></span><div><b>优惠券</b><p>向客户发放优惠劵</p></div></button><button onClick={() => setView("ad")}><span className="guide-icon orange"><FiGift /></span><div><b>弹窗广告</b><p>设置首页弹窗广告</p></div></button></div></div><div className="guide-section store-promotion"><h2>门店促销</h2><div className="guide-cards"><button onClick={() => setView(["erpPromotion", "满减满赠"])}><span className="guide-icon purple"><FiShoppingBag /></span><div><b>满减满赠</b><p>满额减现金或赠送指定商品</p></div></button><button onClick={() => setView(["erpPromotion", "满额+XX元换购"])}><span className="guide-icon amber"><FiGift /></span><div><b>满额+XX元换购</b><p>达到金额门槛后加价换购商品</p></div></button><button onClick={() => setView(["erpPromotion", "买X送Y"])}><span className="guide-icon green"><FiPackage /></span><div><b>买X送Y</b><p>购买指定数量后赠送商品</p></div></button><button onClick={() => setView(["storePromotion", "限时折扣"])}><span className="guide-icon teal"><FiClock /></span><div><b>限时折扣</b><p>查看门店商品的限时优惠</p></div></button><button onClick={() => setView("combinationPrice")}><span className="guide-icon indigo"><FiBox /></span><div><b>组合价</b><p>组合商品活动</p></div></button></div></div></section></PageFrame>;
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

const statusClasses = { "进行中": "status status-active", "未开始": "status status-pending", "已结束": "status status-ended" };
const discountTypeNames = { 0: "按折扣率", 1: "按促销价", 2: "减价格" };
const isAllScope = value => value === "all" || value === "全部";
const specifiedStoreCount = value => String(value).split(",").map(item => item.trim()).filter(Boolean).length;
const storeScopeText = value => isAllScope(value) ? "全部门店" : `指定门店(${specifiedStoreCount(value)}家)`;
const storeScopeSummary = storeScopeText;
const weekdayText = value => value.split("").map((enabled, index) => enabled === "1" ? `周${["一", "二", "三", "四", "五", "六", "日"][index]}` : "").filter(Boolean).join("、");
const discountSummary = activity => activity.distype === 0 ? `${(activity.itemList[0].disrate * 10).toFixed(1)}折` : activity.distype === 1 ? `促销价￥${activity.itemList[0].promprice}` : `立减￥${activity.itemList[0].promprice}`;

const erpPromotionActivities = {
  "满减满赠": [
    { promName: "夏日健康满199减20", pstplanno: "202608100001", displayType: "满减", marketingType: "整单减金额", givetype: 6, starttime: "2026-08-01 00:00:00", endtime: "2026-08-31 23:59:59", busnos: "全部", days: "全部", weekdays: "1111111", sumamt: 199, sumqty: 0, giveprice: 20, givenum: 0, plannum: 0, conditionItemList: [{ rowno: 1, wareid: 0, sumamt: 0, sumqty: 0, profitrate: 0, resprice: 0 }], giftItemList: [] },
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

const promotionModeText = activity => activity.givetype === 6 ? "整单减金额" : activity.givetype === 2 ? "条件商品价格优惠" : "赠送商品";
const promotionRuleText = activity => {
  const mainThreshold = activity.sumamt ? `满${activity.sumamt}元` : activity.sumqty ? `满${activity.sumqty}件` : "";
  if (activity.givetype === 6) return `${mainThreshold}减${activity.giveprice}元`;
  const condition = activity.conditionItemList[0]; const gift = activity.giftItemList[0];
  if (activity.givetype === 2) return `满${activity.sumamt}元，${gift.pstprice}元换购${gift.pstqty}件`;
  if (activity.displayType === "买X送Y") return `买${condition.sumqty}件送${gift.pstqty}件`;
  const threshold = mainThreshold || `满${condition.sumqty}件`;
  if (activity.givenum === 99999) return `${threshold}，按赠送份数任选赠品`;
  if (activity.givenum === 88882) return `${threshold}，赠候选品中最低售价商品`;
  if (activity.giftItemList.length > 1) return `${threshold}，候选赠品任选${activity.givenum}件`;
  return `${threshold}赠${gift.pstqty}件`;
};
const scopeItemText = item => Number(item.wareid) === 0 ? "全部商品" : item.wareid;
const requirementText = value => Number(value) > 0 ? value : "不限";

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
  const [modifiedStart, setModifiedStart] = useState(""); const [modifiedEnd, setModifiedEnd] = useState("");
  const [query, setQuery] = useState({ modifiedStart: "", modifiedEnd: "" });
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10); const [jumpPage, setJumpPage] = useState("1");
  const rows = limitedDiscountActivities.filter(activity => (!query.modifiedStart || activity.endtime >= query.modifiedStart) && (!query.modifiedEnd || activity.starttime <= query.modifiedEnd));
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const switchPage = target => { const next = Math.min(Math.max(target, 1), totalPages); setPage(next); setJumpPage(String(next)); };
  const reset = () => { setModifiedStart(""); setModifiedEnd(""); setQuery({ modifiedStart: "", modifiedEnd: "" }); switchPage(1); };
  return <PageFrame crumb="门店促销 › 限时折扣" section="marketing" setView={setView}><div className="filters panel activity-filter limited-discount-filter"><label className="modified-time">活动时间<ActivityDateRangePicker start={modifiedStart} end={modifiedEnd} onChange={(start, end) => { setModifiedStart(start); setModifiedEnd(end); }} /></label><div className="filter-actions"><button className="primary" onClick={() => { setQuery({ modifiedStart: modifiedStart ? `${modifiedStart} 00:00:00` : "", modifiedEnd: modifiedEnd ? `${modifiedEnd} 23:59:59` : "" }); switchPage(1); }}><FiSearch /> 查询</button><button className="secondary" onClick={reset}>重置</button></div></div><section className="panel coupon-table-wrap"><table className="coupon-table limited-discount-table"><thead><tr>{["活动名称", "活动编号", "促销类型", "活动时间", "适用门店", "活动状态", "最后修改时间", "操作"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{pagedRows.map(activity => <tr key={activity.promno}><td>{activity.promName}</td><td>{activity.promno}</td><td><b className="discount-rule">{discountTypeNames[activity.distype]}</b></td><td className="activity-time-cell"><span>{activity.starttime}</span><span>~ {activity.endtime}</span></td><td>{storeScopeSummary(activity.busnos)}</td><td><span className={statusClasses[activity.status]}><i className="status-dot" />{activity.status}</span></td><td>{activity.lasttime}</td><td><button className="text-btn" onClick={() => setView(["limitedDiscountDetail", activity])}>查看</button></td></tr>)}</tbody></table>{rows.length === 0 ? <p className="empty-row">暂无符合条件的限时折扣活动</p> : <div className="pagination limited-discount-pagination"><span>共{rows.length}条</span><select aria-label="每页条数" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); switchPage(1); }}><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option></select><button aria-label="上一页" disabled={currentPage === 1} onClick={() => switchPage(currentPage - 1)}><FiChevronLeft /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNo => pageNo === currentPage ? <b key={pageNo}>{pageNo}</b> : <button key={pageNo} onClick={() => switchPage(pageNo)}>{pageNo}</button>)}<button aria-label="下一页" disabled={currentPage === totalPages} onClick={() => switchPage(currentPage + 1)}><FiChevronRight /></button><span>前往</span><input aria-label="跳转页码" value={jumpPage} onChange={e => setJumpPage(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && switchPage(Number(jumpPage) || 1)} onBlur={() => switchPage(Number(jumpPage) || 1)} /><span>页</span></div>}</section></PageFrame>;
}

function LimitedDiscountDetail({ setView, activity }) {
  return <PageFrame crumb="门店促销 › 限时折扣 › 活动详情" section="marketing" setView={setView}><button className="back-btn" onClick={() => setView(["storePromotion", "限时折扣"])}>返回列表</button><section className="panel coupon-detail activity-detail"><h3>基本信息</h3><h4>活动规则</h4><div className="detail-grid"><Info label="活动名称" value={activity.promName} simple /><Info label="活动编号" value={activity.promno} simple /><Info label="优惠方式" value={discountTypeNames[activity.distype]} simple /><Info label="活动状态" value={activity.status} simple /><Info label="活动时间" value={`${activity.starttime} ~ ${activity.endtime}`} simple /><Info label="适用门店" value={storeScopeText(activity.busnos)} simple /><Info label="参与日期" value={activity.days === "all" ? "所有日期" : `每月 ${activity.days} 日`} simple /><Info label="参与星期" value={weekdayText(activity.weekdays)} simple /><Info label="最后修改时间" value={activity.lasttime} simple /></div></section><section className="panel discount-items-panel"><div className="discount-items-title"><h3>参与商品明细</h3><span>共 {activity.itemList.length} 个商品</span></div><table className="coupon-table discount-items-table"><thead><tr><th>商品编码</th><th>优惠内容</th></tr></thead><tbody>{activity.itemList.map(item => <tr key={item.wareid}><td>{item.wareid}</td><td>{activity.distype === 0 ? `${(item.disrate * 10).toFixed(1)}折` : activity.distype === 1 ? `促销价￥${item.promprice}` : `立减￥${item.promprice}`}</td></tr>)}</tbody></table></section></PageFrame>;
}

function ErpPromotionList({ setView, category }) {
  const [start, setStart] = useState(""); const [end, setEnd] = useState(""); const [query, setQuery] = useState({ start: "", end: "" });
  const [pageSize, setPageSize] = useState(10);
  const rows = erpPromotionActivities[category].filter(activity => (!query.start || activity.endtime >= `${query.start} 00:00:00`) && (!query.end || activity.starttime <= `${query.end} 23:59:59`));
  const reset = () => { setStart(""); setEnd(""); setQuery({ start: "", end: "" }); };
  return <PageFrame crumb={`门店促销 › ${category}`} section="marketing" setView={setView}><div className="filters panel activity-filter limited-discount-filter"><label className="modified-time">活动时间<ActivityDateRangePicker start={start} end={end} onChange={(nextStart, nextEnd) => { setStart(nextStart); setEnd(nextEnd); }} /></label><div className="filter-actions"><button className="primary" onClick={() => setQuery({ start, end })}><FiSearch /> 查询</button><button className="secondary" onClick={reset}>重置</button></div></div><section className="panel coupon-table-wrap"><table className="coupon-table erp-promotion-table"><thead><tr>{["活动名称", "活动单号", "活动类型", "优惠规则", "活动时间", "适用门店", "商品明细", "操作"].map(title => <th key={title}>{title}</th>)}</tr></thead><tbody>{rows.slice(0, pageSize).map(activity => <tr key={activity.pstplanno}><td>{activity.promName}</td><td>{activity.pstplanno}</td><td><b className="discount-rule">{activity.displayType}</b></td><td>{promotionRuleText(activity)}</td><td className="activity-time-cell"><span>{activity.starttime}</span><span>~ {activity.endtime}</span></td><td>{storeScopeText(activity.busnos)}</td><td><span className="item-count-summary">条件 {activity.conditionItemList.length}</span><span className="item-count-summary">优惠 {activity.giftItemList.length}</span></td><td><button className="text-btn" onClick={() => setView(["erpPromotionDetail", { category, activity }])}>查看</button></td></tr>)}</tbody></table>{rows.length === 0 ? <p className="empty-row">暂无符合条件的{category}活动</p> : <div className="pagination limited-discount-pagination"><span>共{rows.length}条</span><select aria-label="每页条数" value={pageSize} onChange={event => setPageSize(Number(event.target.value))}><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option></select><button aria-label="上一页" disabled><FiChevronLeft /></button><b>1</b><button aria-label="下一页" disabled><FiChevronRight /></button></div>}</section></PageFrame>;
}

function ErpPromotionDetail({ setView, category, activity }) {
  const dateScope = isAllScope(activity.days) ? "所有日期" : `每月 ${activity.days} 日`;
  return <PageFrame crumb={`门店促销 › ${category} › 活动详情`} section="marketing" setView={setView}><button className="back-btn" onClick={() => setView(["erpPromotion", category])}>返回列表</button><section className="panel coupon-detail activity-detail"><div className="detail-heading"><div><h3>基本信息</h3><h4>ERP 活动规则</h4></div></div><div className="detail-grid"><Info label="活动名称" value={activity.promName} simple /><Info label="活动单号" value={activity.pstplanno} simple /><Info label="活动类型" value={activity.displayType} simple /><Info label="促销方式" value={promotionModeText(activity)} simple /><Info label="活动时间" value={`${activity.starttime} ~ ${activity.endtime}`} simple /><Info label="适用门店" value={storeScopeText(activity.busnos)} simple /><Info label="参与日期" value={dateScope} simple /><Info label="参与星期" value={weekdayText(activity.weekdays)} simple /></div></section><section className="panel promotion-rule-panel"><div className="discount-items-title"><div><h3>活动门槛与优惠</h3><p>主表门槛与条件商品要求同时满足</p></div></div><div className="promotion-rule-grid"><div><span>规则摘要</span><strong>{promotionRuleText(activity)}</strong></div><div><span>整单金额门槛</span><strong>{activity.sumamt ? `${activity.sumamt}元` : "不限"}</strong></div><div><span>整单数量门槛</span><strong>{activity.sumqty ? `${activity.sumqty}件` : "不限"}</strong></div><div><span>条件关系</span><strong>{activity.plannum === 1 ? "任一条件满足" : "全部条件满足"}</strong></div>{activity.givetype === 6 && <div className="benefit-highlight"><span>整单减金额</span><strong>{activity.giveprice}元</strong></div>}</div></section><section className="panel discount-items-panel"><div className="discount-items-title"><div><h3>条件商品明细</h3><p>商品编码为 0 表示全部商品</p></div><span>共 {activity.conditionItemList.length} 条</span></div><table className="coupon-table promotion-condition-table"><thead><tr><th>行号</th><th>条件商品</th><th>单品金额门槛</th><th>单品数量门槛</th><th>毛利率下限</th><th>恢复原价</th></tr></thead><tbody>{activity.conditionItemList.map(item => <tr key={item.rowno}><td>{item.rowno}</td><td>{scopeItemText(item)}</td><td>{requirementText(item.sumamt)}{Number(item.sumamt) > 0 && "元"}</td><td>{requirementText(item.sumqty)}{Number(item.sumqty) > 0 && "件"}</td><td>{Number(item.profitrate) > 0 ? `${item.profitrate * 100}%` : "不限"}</td><td>{item.resprice === 1 ? "是" : "否"}</td></tr>)}</tbody></table></section>{activity.givetype !== 6 && <section className="panel discount-items-panel"><div className="discount-items-title"><div><h3>{activity.givetype === 2 ? "换购商品明细" : "赠送商品明细"}</h3><p>{activity.givetype === 2 ? "展示换购商品成交价格" : "展示赠品及赠送数量"}</p></div><span>共 {activity.giftItemList.length} 个商品</span></div><table className="coupon-table promotion-gift-table"><thead><tr><th>行号</th><th>商品编码</th><th>数量</th><th>优惠计价</th><th>成交价格 / 折扣</th></tr></thead><tbody>{activity.giftItemList.map(item => <tr key={item.rowno}><td>{item.rowno}</td><td>{item.pstid}</td><td>{item.pstqty}</td><td>{item.priceDisc === 1 ? "按折扣" : "按价格"}</td><td>{item.priceDisc === 1 ? `${item.pstprice * 10}折` : `${item.pstprice}元`}</td></tr>)}</tbody></table></section>}</PageFrame>;
}

const combinationPriceActivities = [
  { wareid: 84791, warecode: "0084791", warename: "日常清洁护理组合", warespec: "1组", wareunit: "组", factoryname: "可孚", marketingType: "组合价", cnt: 3, itemList: [{ wareid: 100001, warename: "棉片", wareqty: 1 }, { wareid: 100032, warename: "棉签", wareqty: 1 }, { wareid: 100035, warename: "牙科清洁器", wareqty: 1 }] },
  { wareid: 84792, warecode: "0084792", warename: "家庭常备护理组合", warespec: "1组", wareunit: "组", factoryname: "可孚", marketingType: "组合价", cnt: 2, itemList: [{ wareid: 100103, warename: "医用棉球", wareqty: 2 }, { wareid: 100115, warename: "创可贴", wareqty: 1 }] },
  { wareid: 85120, warecode: "0085120", warename: "夏日防暑护理组合", warespec: "1组", wareunit: "组", factoryname: "千金药业", marketingType: "组合价", cnt: 2, itemList: [{ wareid: 100212, warename: "藿香正气口服液", wareqty: 1 }, { wareid: 100218, warename: "清凉油", wareqty: 2 }] },
  { wareid: 85124, warecode: "0085124", warename: "儿童出行护理组合", warespec: "1组", wareunit: "组", factoryname: "千金药业", marketingType: "组合价", cnt: 3, itemList: [{ wareid: 100315, warename: "儿童退热贴", wareqty: 1 }, { wareid: 100316, warename: "儿童口罩", wareqty: 1 }, { wareid: 100319, warename: "碘伏棉签", wareqty: 1 }] },
];

function CombinationPriceList({ setView }) {
  const [modifiedStart, setModifiedStart] = useState(""); const [modifiedEnd, setModifiedEnd] = useState("");
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10); const [jumpPage, setJumpPage] = useState("1");
  const total = combinationPriceActivities.length; const totalPages = Math.max(1, Math.ceil(total / pageSize)); const currentPage = Math.min(page, totalPages);
  const rows = combinationPriceActivities.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const switchPage = target => { const next = Math.min(Math.max(target, 1), totalPages); setPage(next); setJumpPage(String(next)); };
  const query = () => switchPage(1);
  const reset = () => { setModifiedStart(""); setModifiedEnd(""); switchPage(1); };
  return <PageFrame crumb="门店促销 › 组合价" section="marketing" setView={setView}><div className="filters panel activity-filter limited-discount-filter"><label className="modified-time">最后修改时间<ActivityDateRangePicker start={modifiedStart} end={modifiedEnd} onChange={(start, end) => { setModifiedStart(start); setModifiedEnd(end); }} /></label><div className="filter-actions"><button className="primary" onClick={query}><FiSearch /> 查询</button><button className="secondary" onClick={reset}>重置</button></div></div><section className="panel coupon-table-wrap"><table className="coupon-table combination-price-table"><thead><tr>{["组合编码", "组合名称", "规格/单位", "厂家", "营销类型", "组成商品数", "操作"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(activity => <tr key={activity.wareid}><td>{activity.warecode || "—"}</td><td>{activity.warename || "—"}</td><td>{[activity.warespec, activity.wareunit].filter(Boolean).join(" / ") || "—"}</td><td>{activity.factoryname || "—"}</td><td><b className="discount-rule">{activity.marketingType || "—"}</b></td><td>{activity.cnt ?? activity.itemList?.length ?? 0}</td><td><button className="text-btn" onClick={() => setView(["combinationPriceDetail", activity])}>查看</button></td></tr>)}</tbody></table>{total === 0 ? <p className="empty-row">暂无符合条件的组合价活动</p> : <div className="pagination limited-discount-pagination"><span>共{total}条</span><select aria-label="每页条数" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); switchPage(1); }}><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option><option value="100">100条/页</option></select><button aria-label="上一页" disabled={currentPage === 1} onClick={() => switchPage(currentPage - 1)}><FiChevronLeft /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNo => pageNo === currentPage ? <b key={pageNo}>{pageNo}</b> : <button key={pageNo} onClick={() => switchPage(pageNo)}>{pageNo}</button>)}<button aria-label="下一页" disabled={currentPage === totalPages} onClick={() => switchPage(currentPage + 1)}><FiChevronRight /></button><span>前往</span><input aria-label="跳转页码" value={jumpPage} onChange={e => setJumpPage(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && switchPage(Number(jumpPage) || 1)} onBlur={() => switchPage(Number(jumpPage) || 1)} /><span>页</span></div>}</section></PageFrame>;
}

function CombinationPriceDetail({ setView, activity }) {
  const itemList = activity.itemList || []; const itemCount = activity.cnt ?? itemList.length;
  return <PageFrame crumb="门店促销 › 组合价 › 活动详情" section="marketing" setView={setView}><button className="back-btn" onClick={() => setView("combinationPrice")}>返回列表</button><section className="panel coupon-detail activity-detail"><div className="detail-heading"><div><h3>基本信息</h3><h4>组合商品</h4></div></div><div className="detail-grid"><Info label="组合名称" value={activity.warename || "—"} simple /><Info label="组合编码" value={activity.warecode || "—"} simple /><Info label="组合ID" value={activity.wareid ?? "—"} simple /><Info label="营销类型" value={activity.marketingType || "—"} simple /><Info label="组合规格" value={activity.warespec || "—"} simple /><Info label="组合单位" value={activity.wareunit || "—"} simple /><Info label="组合厂家" value={activity.factoryname || "—"} simple /><Info label="组成商品数" value={itemCount} simple /></div></section><section className="panel discount-items-panel"><div className="discount-items-title"><div><h3>组合商品明细</h3><p>按每组组合商品所需数量展示</p></div><span>共 {itemCount} 个商品</span></div><table className="coupon-table combination-item-table"><thead><tr><th>商品ID</th><th>商品名称</th><th>每组数量</th></tr></thead><tbody>{itemList.map(item => <tr key={item.wareid}><td>{item.wareid ?? "—"}</td><td>{item.warename || "—"}</td><td>{item.wareqty ?? "—"}</td></tr>)}</tbody></table>{itemList.length === 0 && <p className="empty-row">暂无组合商品明细</p>}</section></PageFrame>;
}

function StorePromotion({ setView, type }) {
  const [keyword, setKeyword] = useState(""); const [activityType, setActivityType] = useState("全部");
  const activityTypeOptions = type === "满减满赠" ? ["全部", "满减", "满赠"] : ["全部", "限时折扣"];
  const activityStatusClass = { "进行中": "status status-active", "未开始": "status status-pending", "已结束": "status status-ended" };
  const activities = storeActivities[type].filter(x => (!keyword || x[0].includes(keyword)) && (activityType === "全部" || x[1] === activityType));
  return <PageFrame crumb={`门店促销 › ${type}`} section="marketing" setView={setView}><div className="filters panel activity-filter"><label>活动名称<input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="请输入活动名称" /></label><label>活动类型<select value={activityType} onChange={e => setActivityType(e.target.value)}>{activityTypeOptions.map(option => <option key={option}>{option}</option>)}</select></label><div className="filter-actions"><button className="primary"><FiSearch /> 查询</button><button className="secondary" onClick={() => { setKeyword(""); setActivityType("全部"); }}>重置</button></div></div><section className="panel coupon-table-wrap"><table className="coupon-table activity-table"><colgroup><col className="activity-name-col" /><col className="activity-type-col" /><col /><col /><col /><col /></colgroup><thead><tr>{["活动名称", "活动类型", "活动时间", "适用门店", "活动状态", "操作"].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{activities.map(a => <tr key={a[0]}><td>{a[0]}</td><td>{a[1]}</td><td>{a[2]}</td><td>{a[3]}</td><td><span className={activityStatusClass[a[4]] || "status"}><i className="status-dot" />{a[4]}</span></td><td><button className="text-btn" onClick={() => setView(["storePromotionDetail", { type, activity: a }])}>查看</button></td></tr>)}</tbody></table></section></PageFrame>;
}

function StorePromotionDetail({ setView, type, activity }) {
  const [name, activityType, period, storeScope, status] = activity;
  const promotionRule = activityType === "满赠" ? "订单满199元赠维C泡腾片" : activityType === "限时折扣" ? "指定商品限时享8.8折" : name === "年中感恩满减" ? "订单满159元减20元" : "订单满299元减30元";
  const threshold = activityType === "满赠" ? "满199元" : activityType === "限时折扣" ? "指定商品" : name === "年中感恩满减" ? "满159元" : "满299元";
  return <PageFrame crumb={`门店促销 › ${type} › 活动详情`} section="marketing" setView={setView}><button className="back-btn" onClick={() => setView(["storePromotion", type])}>返回列表</button><section className="panel coupon-detail activity-detail"><h3>基本信息</h3><h4>基础规则</h4><div className="detail-grid"><Info label="活动名称" value={name} /><Info label="活动类型" value={activityType} simple /><Info label="活动状态" value={status} simple /><Info label="活动时间" value={period} /><Info label="适用门店" value={storeScope} simple /></div></section><section className="panel coupon-detail rules activity-detail-rules"><h3>活动规则</h3><p>门店促销配置：活动规则将在结算时自动生效，满足条件的订单可享受相应优惠。</p><div className="rule-list"><Info label="促销规则" value={promotionRule} simple /><Info label="活动门槛" value={threshold} simple /><Info label="适用门店范围" value={storeScope} simple /><Info label="优惠叠加" value="不可与其他门店促销活动叠加" simple /></div></section></PageFrame>;
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

export function App() {
  const [view, setView] = useState("dashboard");
  const show = view === "dashboard" ? <Dashboard setView={setView} /> : view === "trade" ? <TradeModule onNavigate={setView} /> : view === "marketing" ? <MarketingGuide setView={setView} /> : view === "coupon" ? <CouponList setView={setView} /> : view === "ad" ? <AdManager setView={setView} /> : view === "combinationPrice" ? <CombinationPriceList setView={setView} /> : view[0] === "combinationPriceDetail" ? <CombinationPriceDetail setView={setView} activity={view[1]} /> : view[0] === "erpPromotion" ? <ErpPromotionList setView={setView} category={view[1]} /> : view[0] === "erpPromotionDetail" ? <ErpPromotionDetail setView={setView} category={view[1].category} activity={view[1].activity} /> : view[0] === "storePromotion" ? view[1] === "限时折扣" ? <LimitedDiscountList setView={setView} /> : <StorePromotion setView={setView} type={view[1]} /> : view[0] === "limitedDiscountDetail" ? <LimitedDiscountDetail setView={setView} activity={view[1]} /> : view[0] === "storePromotionDetail" ? <StorePromotionDetail setView={setView} type={view[1].type} activity={view[1].activity} /> : <CouponDetail setView={setView} coupon={view[1]} />;
  return show;
}
