import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronRight, FiMinus, FiPlus, FiSearch, FiShoppingBag, FiTrash2, FiX } from "react-icons/fi";

const DATA_URL = "/data/real-promotion-activities.json";
const PRODUCT_IMAGES = ["/assets/trade-product-067053.jpg", "/assets/trade-product-alt.jpg", "/assets/trade-product-special.png"];
const PLAY_TYPE_ORDER = ["满金额赠品", "买X件送Y", "满额+XX元换购", "买X件+XX元换购", "满额减金额", "满件减金额", "第二件/多件折扣", "无明确门槛赠品", "免费赠品与加价商品混合", "无优惠商品结果"];
const toNumber = value => Number(value || 0);
const isAll = value => value === "全部" || value === "all" || value == null || value === "";
const dateTime = value => Date.parse(`${String(value).replace(" ", "T")}+08:00`);
const productName = code => `商品 ${code}`;
const imageFor = code => PRODUCT_IMAGES[Math.abs(String(code).split("").reduce((sum, digit) => sum + Number(digit || 0), 0)) % PRODUCT_IMAGES.length];
const demoPriceFor = code => Number((9.9 + (Math.abs(Number(String(code).slice(-4))) % 8000) / 100).toFixed(2));
const storeMatches = (activity, store) => isAll(activity.busnos) || String(activity.busnos).split(",").includes(store);
const calendarMatches = (activity, date) => {
  const trial = new Date(`${date}T12:00:00+08:00`);
  const trialTime = trial.getTime();
  const day = trial.getDate();
  const weekdayIndex = (trial.getDay() + 6) % 7;
  return trialTime >= dateTime(activity.starttime) && trialTime <= dateTime(activity.endtime)
    && (isAll(activity.days) || String(activity.days).split(",").includes(String(day)))
    && String(activity.weekdays || "1111111")[weekdayIndex] === "1";
};
const productCodesForActivity = activity => new Set((activity.conditionItemList || []).map(item => String(item.wareid)).filter(code => code !== "0"));
const giftMode = item => toNumber(item.priceDisc) === 1 ? "折扣" : toNumber(item.pstprice) > 0 ? "换购" : "赠品";
const giftValue = item => toNumber(item.priceDisc) === 1 ? (toNumber(item.pstprice) > 0 ? `${toNumber(item.pstprice) * 10}折` : "折扣值待确认") : toNumber(item.pstprice) > 0 ? `${item.pstprice}元换购` : `赠${toNumber(item.pstqty) || 1}件`;
const benefitRows = (activity, repeats) => {
  if (toNumber(activity.givetype) === 6) return [{ key: "reduction", code: "整单优惠", mode: "立减", value: `减${(toNumber(activity.giveprice) * repeats).toFixed(2)}元` }];
  return (activity.giftItemList || []).map(item => ({ key: item.id || `${item.rowno}-${item.pstid}`, code: productName(item.pstid), mode: giftMode(item), value: giftValue({ ...item, pstqty: toNumber(item.pstqty) * repeats }) }));
};

function evaluateActivity(activity, cart, prices) {
  const selected = Object.entries(cart).filter(([, qty]) => qty > 0).map(([code, qty]) => ({ code, qty, amount: (prices[code] || demoPriceFor(code)) * qty, profit: 0.2 }));
  const totals = selected.reduce((sum, item) => ({ amount: sum.amount + item.amount, qty: sum.qty + item.qty }), { amount: 0, qty: 0 });
  const conditionRows = (activity.conditionItemList || []).map(condition => {
    const candidates = selected.filter(item => Number(condition.wareid) === 0 || String(condition.wareid) === item.code);
    const evaluations = candidates.map(item => {
      const purchased = activity.playType !== "无明确门槛赠品" || item.qty > 0;
      const pass = purchased
        && (!toNumber(condition.sumamt) || item.amount >= toNumber(condition.sumamt))
        && (!toNumber(condition.sumqty) || item.qty >= toNumber(condition.sumqty))
        && (!toNumber(condition.profitrate) || item.profit > toNumber(condition.profitrate));
      const ratios = [toNumber(condition.sumamt) ? Math.floor(item.amount / toNumber(condition.sumamt)) : null, toNumber(condition.sumqty) ? Math.floor(item.qty / toNumber(condition.sumqty)) : null].filter(value => value !== null);
      return { ...item, pass, ratio: ratios.length ? Math.min(...ratios) : 1 };
    });
    const passed = evaluations.filter(item => item.pass);
    const best = passed.sort((a, b) => b.ratio - a.ratio)[0];
    return { rowno: condition.rowno, pass: Boolean(best), ratio: best?.ratio || 0, condition, candidates };
  });
  const conditionPass = !conditionRows.length || (toNumber(activity.plannum) === 1 ? conditionRows.some(row => row.pass) : conditionRows.every(row => row.pass));
  const mainAmountPass = !toNumber(activity.sumamt) || totals.amount >= toNumber(activity.sumamt);
  const mainQtyPass = !toNumber(activity.sumqty) || totals.qty >= toNumber(activity.sumqty);
  const eligible = conditionPass && mainAmountPass && mainQtyPass;
  let repeats = eligible ? 1 : 0;
  if (eligible && toNumber(activity.repeatflag) === 1) {
    const ratios = [toNumber(activity.sumamt) ? Math.floor(totals.amount / toNumber(activity.sumamt)) : null, toNumber(activity.sumqty) ? Math.floor(totals.qty / toNumber(activity.sumqty)) : null].filter(value => value !== null);
    const conditionRatios = conditionRows.filter(row => row.pass).map(row => row.ratio);
    if (conditionRatios.length) ratios.push(toNumber(activity.plannum) === 1 ? Math.max(...conditionRatios) : Math.min(...conditionRatios));
    repeats = ratios.length ? Math.max(1, Math.min(...ratios)) : 1;
  }
  const gaps = [];
  if (!mainAmountPass) gaps.push(`还差 ${(toNumber(activity.sumamt) - totals.amount).toFixed(2)} 元`);
  if (!mainQtyPass) gaps.push(`还差 ${Math.max(0, toNumber(activity.sumqty) - totals.qty)} 件`);
  if (!conditionPass) {
    const first = conditionRows.find(row => !row.pass);
    const purchased = first?.candidates?.[0];
    if (!purchased) gaps.push(Number(first?.condition?.wareid) === 0 ? "还需购买满足门槛的商品" : `还需购买商品 ${first?.condition?.wareid}`);
    else if (toNumber(first.condition.sumqty) > purchased.qty) gaps.push(`商品 ${purchased.code} 还差 ${toNumber(first.condition.sumqty) - purchased.qty} 件`);
    else if (toNumber(first.condition.sumamt) > purchased.amount) gaps.push(`商品 ${purchased.code} 还差 ${(toNumber(first.condition.sumamt) - purchased.amount).toFixed(2)} 元`);
    else gaps.push("条件商品尚未满足活动要求");
  }
  return { eligible, repeats, totals, gaps, benefits: eligible ? benefitRows(activity, repeats) : [] };
}

function QuantityStepper({ value, onChange }) {
  return <div className="mall-qty-stepper"><button aria-label="减少数量" disabled={value <= 0} onClick={() => onChange(Math.max(0, value - 1))}><FiMinus /></button><span>{value}</span><button aria-label="增加数量" onClick={() => onChange(value + 1)}><FiPlus /></button></div>;
}

export function MallPromotionCalculator({ Frame, setView }) {
  const [state, setState] = useState({ loading: true, error: "", activities: [], meta: null });
  const [date, setDate] = useState("2026-09-10");
  const [store, setStore] = useState("7311555");
  const [query, setQuery] = useState("");
  const [activityQuery, setActivityQuery] = useState("");
  const [selectedPlayType, setSelectedPlayType] = useState("买X件送Y");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [cart, setCart] = useState({});
  const [prices, setPrices] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [benefitActivity, setBenefitActivity] = useState(null);
  const [trialNotice, setTrialNotice] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(DATA_URL).then(response => response.ok ? response.json() : Promise.reject()).then(data => { if (alive) setState({ loading: false, error: "", activities: data.activities || [], meta: data.meta }); }).catch(() => { if (alive) setState({ loading: false, error: "真实活动数据加载失败", activities: [], meta: null }); });
    return () => { alive = false; };
  }, []);

  const playTypeCounts = useMemo(() => state.activities.reduce((counts, activity) => counts.set(activity.playType, (counts.get(activity.playType) || 0) + 1), new Map()), [state.activities]);
  const playTypes = PLAY_TYPE_ORDER.filter(type => playTypeCounts.has(type));
  const activePlayType = playTypeCounts.has(selectedPlayType) ? selectedPlayType : (playTypes[0] || "");
  const playActivities = state.activities.filter(activity => activity.playType === activePlayType);
  const selectedActivity = playActivities.find(activity => String(activity.id) === String(selectedActivityId)) || playActivities[0] || null;
  // The store selector deliberately exposes one applicable store and one
  // inapplicable case, mirroring the two cases used by the back-office trial.
  const currentActivityStore = selectedActivity
    ? (isAll(selectedActivity.busnos) ? "7311555" : String(selectedActivity.busnos).split(",").find(Boolean) || "7311555")
    : "7311555";
  useEffect(() => {
    setStore(current => current === "__not-participating__" ? current : currentActivityStore);
  }, [currentActivityStore]);
  const filteredPlayActivities = playActivities.filter(activity => !activityQuery.trim() || activity.promName.includes(activityQuery.trim()) || String(activity.pstplanno).includes(activityQuery.trim()));
  const activityOptions = selectedActivity && !filteredPlayActivities.some(activity => activity.id === selectedActivity.id) ? [selectedActivity, ...filteredPlayActivities] : filteredPlayActivities;
  const catalog = useMemo(() => {
    if (!selectedActivity) return [];
    const conditionCodes = productCodesForActivity(selectedActivity);
    const appliesToAllProducts = (selectedActivity.conditionItemList || []).some(item => Number(item.wareid) === 0);
    const giftCodes = new Set();
    (selectedActivity.giftItemList || []).forEach(item => { const code = String(item.pstid); if (code !== "0") giftCodes.add(code); });
    const fallbackCodes = ["100001", "100032", "100215", "100306", "100501", "100608"];
    const codes = [...new Set([...conditionCodes, ...giftCodes, ...fallbackCodes])].slice(0, 18);
    return codes.map((code, index) => ({ code, name: productName(code), price: demoPriceFor(code), image: imageFor(code), kind: appliesToAllProducts || conditionCodes.has(code) ? "条件商品" : "非条件商品", spec: index % 2 ? "1盒" : "1件" }));
  }, [selectedActivity]);
  useEffect(() => { setPrices(Object.fromEntries(catalog.map(item => [item.code, item.price]))); }, [catalog]);

  const visibleCatalog = catalog.filter(item => !query.trim() || item.code.includes(query.trim()) || item.name.includes(query.trim()));
  const cartLines = catalog.filter(item => (cart[item.code] || 0) > 0).map(item => ({ ...item, qty: cart[item.code] }));
  const cartTotals = cartLines.reduce((sum, item) => ({ qty: sum.qty + item.qty, amount: sum.amount + item.price * item.qty }), { qty: 0, amount: 0 });
  const calculatedResult = selectedActivity ? evaluateActivity(selectedActivity, cart, prices) : null;
  const dateEligible = selectedActivity ? calendarMatches(selectedActivity, date) : false;
  const storeEligible = selectedActivity ? store !== "__not-participating__" && storeMatches(selectedActivity, store) : false;
  const selectedResult = calculatedResult ? {
    ...calculatedResult,
    eligible: calculatedResult.eligible && dateEligible && storeEligible,
    gaps: [...(!dateEligible ? ["当前交易日期不在活动适用范围"] : []), ...(!storeEligible ? ["当前履约门店不适用此活动"] : []), ...calculatedResult.gaps],
    benefits: dateEligible && storeEligible ? calculatedResult.benefits : [],
  } : null;
  const selectedHasBenefit = selectedActivity && (toNumber(selectedActivity.givetype) === 6 || (selectedActivity.giftItemList || []).length);
  const missingBenefit = Boolean(cartTotals.qty && selectedResult?.eligible && !selectedHasBenefit);
  const matched = cartTotals.qty && selectedResult?.eligible && selectedHasBenefit ? [{ activity: selectedActivity, result: selectedResult }] : [];
  const approaching = cartTotals.qty && selectedResult && !selectedResult.eligible ? [{ activity: selectedActivity, result: selectedResult }] : [];
  const configuredReduction = matched.reduce((total, item) => total + (toNumber(item.activity.givetype) === 6 ? toNumber(item.activity.giveprice) * item.result.repeats : 0), 0);
  const setQuantity = (code, quantity) => setCart(current => ({ ...current, [code]: quantity }));
  const clearCart = () => { setCart({}); setCartOpen(false); };

  return <Frame crumb="小程序商城商品试算" section="marketing" setView={setView}>
    <section className="panel mall-calculator-heading"><div><h2>小程序商城商品试算 <span>演示口径</span></h2><p>参考千金商城商品列表与购物车交互；活动配置来自数据库快照，商品名称与售价为试算展示。</p></div><button className="secondary" onClick={() => setView("realPromotionCalculator")}>返回后台试算</button></section>
    <section className="panel mall-calculator-environment"><label>交易日期<input type="date" value={date} onChange={event => { setDate(event.target.value); setCart({}); }} /></label><label>履约门店<select value={store} onChange={event => { setStore(event.target.value); setCart({}); }}><option value={currentActivityStore}>{currentActivityStore}</option><option value="__not-participating__">不适用门店（演示）</option></select></label><div><b>{state.activities.length}</b><span>个可选活动</span></div><small>快照日期 {state.meta?.snapshotDate || "—"}</small></section>
    {state.loading ? <section className="panel mall-loading">正在载入商城试算数据…</section> : state.error ? <section className="panel mall-loading error">{state.error}</section> : <div className="mall-calculator-workspace">
      <section className="mall-phone-shell" aria-label="千金商城商品试算">
        <div className="mall-phone-status"><b>10:52</b><span>千金商城</span><i>演示</i></div>
        <header className="mall-store-header"><div><small>当前门店</small><strong>千金大药房 {store} 店 <FiChevronDown /></strong></div><button aria-label="购物车" onClick={() => setCartOpen(true)}><FiShoppingBag />{cartTotals.qty > 0 && <i>{cartTotals.qty}</i>}</button></header>
        <div className="mall-search"><FiSearch /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索商品编码" />{query && <button aria-label="清空搜索" onClick={() => setQuery("")}><FiX /></button>}</div>
        <section className="mall-promo-banner"><span>{selectedActivity?.playType || "真实活动试算"}</span><strong>{selectedActivity?.promName || "暂无可选活动"}</strong><small>{selectedActivity ? `活动编号 ${selectedActivity.pstplanno}` : "请调整交易日期或履约门店"}</small></section>
        <section className="mall-activity-picker">
          <nav className="mall-play-tabs">{playTypes.map(type => <button key={type} className={activePlayType === type ? "active" : ""} onClick={() => { setSelectedPlayType(type); setSelectedActivityId(""); setActivityQuery(""); setCart({}); }}>{type}<b>{playTypeCounts.get(type)}</b></button>)}</nav>
          <div className="mall-activity-search"><FiSearch /><input value={activityQuery} onChange={event => setActivityQuery(event.target.value)} placeholder="搜索活动名称或活动编号" />{activityQuery && <button aria-label="清空活动搜索" onClick={() => setActivityQuery("")}><FiX /></button>}</div>
          <select aria-label="选择活动" value={selectedActivity?.id || ""} onChange={event => { setSelectedActivityId(event.target.value); setCart({}); }}><option value="">请选择活动</option>{activityOptions.map(activity => <option key={activity.id} value={activity.id}>{activity.promName}（{activity.pstplanno}）</option>)}</select>
        </section>
        <main className="mall-product-scroll"><div className="mall-product-grid">{visibleCatalog.map(item => { const quantity = cart[item.code] || 0; return <article key={item.code}><div className="mall-product-image"><img src={item.image} alt="" />{item.kind === "条件商品" && <em>条件</em>}</div><h3>{item.name}</h3><p>{item.spec} · 编码 {item.code}</p><small>{item.kind}</small><footer><b>¥{item.price.toFixed(2)}</b>{quantity ? <QuantityStepper value={quantity} onChange={value => setQuantity(item.code, value)} /> : <button className="mall-add" aria-label={`加购${item.name}`} onClick={() => setQuantity(item.code, 1)}><FiShoppingBag /></button>}</footer></article>; })}</div>{!visibleCatalog.length && <div className="mall-empty-products">当前活动暂无可选商品</div>}</main>
        <footer className="mall-checkout-bar"><button className="mall-cart-button" onClick={() => setCartOpen(true)}><FiShoppingBag />{cartTotals.qty > 0 && <i>{cartTotals.qty}</i>}</button><div><span>商品合计</span><b>¥{cartTotals.amount.toFixed(2)}</b><small>{matched.length ? "当前活动已达标" : `共 ${cartTotals.qty} 件`}</small></div><button className="mall-pay-button" disabled={!cartTotals.qty} onClick={() => setCartOpen(true)}>去结算</button></footer>
        {cartOpen && <div className="mall-sheet-mask" onClick={() => setCartOpen(false)}><section className="mall-cart-sheet" onClick={event => event.stopPropagation()}><header><h3>购物车</h3><button onClick={clearCart}><FiTrash2 /> 清空</button><button aria-label="关闭" onClick={() => setCartOpen(false)}><FiX /></button></header><div className="mall-cart-lines">{cartLines.map(item => <article key={item.code}><img src={item.image} alt="" /><div><h4>{item.name}</h4><p>商品编码 {item.code}</p><footer><b>¥{item.price.toFixed(2)}</b><QuantityStepper value={item.qty} onChange={value => setQuantity(item.code, value)} /></footer></div></article>)}{!cartLines.length && <p className="mall-cart-empty">购物车还是空的</p>}</div><footer><div><span>商品合计</span><b>¥{cartTotals.amount.toFixed(2)}</b><small>{missingBenefit ? "当前活动优惠明细缺失" : matched.length ? "当前活动已达标" : "当前活动未达标"}</small></div><button disabled={!cartTotals.qty} onClick={() => { setCartOpen(false); setTrialNotice(true); window.setTimeout(() => setTrialNotice(false), 2400); }}>立即支付</button></footer></section></div>}
        {benefitActivity && <div className="mall-sheet-mask" onClick={() => setBenefitActivity(null)}><section className="mall-benefit-sheet" onClick={event => event.stopPropagation()}><header><h3>{benefitActivity.activity.promName}</h3><button aria-label="关闭" onClick={() => setBenefitActivity(null)}><FiX /></button></header><p>{benefitActivity.activity.playType} · 活动编号 {benefitActivity.activity.pstplanno}</p><div>{benefitActivity.result.benefits.map(benefit => <article key={benefit.key}><span>{benefit.mode}</span><strong>{benefit.code}</strong><b>{benefit.value}</b></article>)}</div><button className="mall-benefit-confirm" onClick={() => setBenefitActivity(null)}>确认</button></section></div>}
        {trialNotice && <div className="mall-trial-toast" role="status">试算完成，本演示不创建真实订单</div>}
      </section>

      <aside className="mall-match-panel">
        <section className="panel mall-match-summary"><span>当前活动试算</span><strong>{!selectedActivity ? "请先选择活动" : !cartTotals.qty ? "请先选择商品" : missingBenefit ? "优惠明细缺失" : matched.length ? "当前活动已达标" : "当前活动未达标"}</strong><p>{selectedActivity ? `${selectedActivity.promName} · ${selectedActivity.pstplanno}` : "当前条件下暂无活动"}</p><p>商品合计 ¥{cartTotals.amount.toFixed(2)} · {cartTotals.qty} 件</p>{configuredReduction > 0 && <em>立减配置 ¥{configuredReduction.toFixed(2)}</em>}{missingBenefit && <em>禁止生成优惠结果</em>}</section>
        <section className="panel mall-match-list"><header><h3>已达标权益</h3><span>{matched.length}</span></header>{matched.map(item => <button key={item.activity.id} onClick={() => setBenefitActivity(item)}><div><em>{item.activity.playType}</em><strong>{item.activity.promName}</strong><small>{item.result.benefits.map(benefit => `${benefit.mode}：${benefit.value}`).join("；") || "活动配置待确认"}</small></div><FiChevronRight /></button>)}{!matched.length && <p className="mall-match-empty">当前活动尚未达标</p>}</section>
        <section className="panel mall-near-list"><header><h3>未达标差额</h3><span>{approaching.length}</span></header>{approaching.map(item => <article key={item.activity.id}><div><strong>{item.activity.promName}</strong><small>{item.result.gaps.join("；")}</small></div><span>{item.activity.playType}</span></article>)}{!approaching.length && <p className="mall-match-empty">选择商品后展示当前活动差额</p>}</section>
        <p className="mall-scope-note">演示口径：活动时间、门店、日期、主表门槛和条件商品共同判断；毛利率统一以20%演示。赠品任选、重复次数、混合赠品与换购等未确认规则仅展示配置，不作为生产结算结果。</p>
      </aside>
    </div>}
  </Frame>;
}
