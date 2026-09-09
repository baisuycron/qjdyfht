from pathlib import Path
import re
p=Path(__file__).parent/'Prototype.tsx'
s=p.read_text(encoding='utf-8')
def sub(a,b):
 global s
 assert a in s, a[:100]
 s=s.replace(a,b)
sub('comboName?: string;', 'comboUnitPrice?: number; comboQuantity?: number; comboName?: string;')
sub('detailProduct: DetailProduct };', 'detailProduct: DetailProduct; products?: DetailProduct[] };')
sub('requiredQuantity: Math.max(1, fallback?.requiredQuantity ?? 1)', 'requiredQuantity: Math.max(1, product.comboQuantity ?? fallback?.requiredQuantity ?? 1)')
pos=s.index('const invalidComboCartSample')
s=s[:pos]+'''const productComboActivities: SearchComboActivity[] = [
  { id: "ACT-COMBO-STOMACH-68", name: "参芪健胃组合", productCount: 3, price: "68.00", image: homeDetailProducts.h4.image, detailProduct: homeDetailProducts.h4,
    products: [{ ...homeDetailProducts.h4, comboUnitPrice: 28, comboQuantity: 1 }, { ...homeDetailProducts.h5, comboUnitPrice: 8, comboQuantity: 2 }, { ...homeDetailProducts.h6, comboUnitPrice: 8, comboQuantity: 3 }] },
  { id: "ACT-COMBO-STOMACH-46", name: "日常养胃组合", productCount: 2, price: "46.00", image: homeDetailProducts.h4.image, detailProduct: homeDetailProducts.h4,
    products: [{ ...homeDetailProducts.h4, comboUnitPrice: 30, comboQuantity: 1 }, { ...homeDetailProducts.h5, comboUnitPrice: 8, comboQuantity: 2 }] },
];
const allComboActivities = [...productComboActivities, ...searchComboActivities];
const comboProductsFor = (activity: SearchComboActivity) => activity.products ?? [activity.detailProduct, homeDetailProducts.h5, homeDetailProducts.h6];
const comboPricesFor = (activity: SearchComboActivity) => activity.products ? activity.products.map(item => item.comboUnitPrice ?? Number(item.price)) : allocateComboPrices(comboProductsFor(activity), Number(activity.price));
for (const activity of allComboActivities) PROMOTION_ACTIVITIES[activity.id] = { ...PROMOTION_ACTIVITIES["ACT-COMBO-68"], id: activity.id };
type ComboCartEntry = { activity: SearchComboActivity; quantity: number; selected: boolean };

'''+s[pos:]
start=s.index('  const [comboCartItemQuantity,')
end=s.index('  const [invalidComboCartPresent',start)
s=s[:start]+'''  const [comboCartEntries, setComboCartEntries] = useState<ComboCartEntry[]>([]);
  const [selectedComboId, setSelectedComboId] = useState("");
  const [comboSummaryId, setComboSummaryId] = useState("");
  const comboCartItemPresent = comboCartEntries.length > 0;
  const comboCartItemSelected = comboCartEntries.some(entry => entry.selected);
  const comboCartItemQuantity = comboCartEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const selectedComboQuantity = comboCartEntries.reduce((sum, entry) => sum + (entry.selected ? entry.quantity : 0), 0);
  const setComboCartItemSelected = (selected: boolean) => setComboCartEntries(entries => entries.map(entry => ({ ...entry, selected })));
  const setComboCartItemPresent = (_present: boolean) => setComboCartEntries(entries => entries.filter(entry => !entry.selected));
  const summaryComboEntry = comboCartEntries.find(entry => entry.activity.id === comboSummaryId) ?? comboCartEntries[0];
  const summaryComboActivity = summaryComboEntry?.activity ?? productComboActivities[0];
  const comboCartProducts = comboProductsFor(summaryComboActivity);
  const comboCartActivity = summaryComboActivity.detailProduct;
'''+s[end:]
sub('  const isDetailCombo = detailProduct.promotion === COMBO_PROMOTION;', '''  const detailAvailableCombos = allComboActivities.filter(activity => comboProductsFor(activity).some(item => item.id === detailProduct.id));
  const selectedDetailCombo = detailAvailableCombos.find(activity => activity.id === selectedComboId) ?? detailAvailableCombos[0] ?? productComboActivities[0];
  const activeDetailCombo = searchComboSheetActivity ?? selectedDetailCombo;
  const detailComboPrice = Number(activeDetailCombo.price);
  const isDetailCombo = detailAvailableCombos.length > 0;''')
sub('const detailComboProducts = [detailProduct, homeDetailProducts.h5, homeDetailProducts.h6];', 'const detailComboProducts = comboProductsFor(activeDetailCombo);')
sub('allocateComboPrices(detailComboProducts, COMBO_PURCHASE_PRICE)', 'comboPricesFor(activeDetailCombo)')
sub('[searchComboSheetActivity.detailProduct, homeDetailProducts.h5, homeDetailProducts.h6]', 'comboProductsFor(searchComboSheetActivity)')
sub('allocateComboPrices(searchComboSheetProducts, COMBO_PURCHASE_PRICE)', 'searchComboSheetActivity ? comboPricesFor(searchComboSheetActivity) : []')
sub('allocateComboPrices(comboCartProducts, COMBO_PURCHASE_PRICE)', 'comboPricesFor(summaryComboActivity)')
sub('comboCartItemQuantity * getComboComponentRequiredQuantity(item)', '(summaryComboEntry?.quantity ?? 1) * getComboComponentRequiredQuantity(item)')
sub('const comboCartSubtotal = comboCartItemSelected ? COMBO_PURCHASE_PRICE * comboCartItemQuantity : 0;', 'const comboCartSubtotal = comboCartEntries.reduce((sum, entry) => sum + (entry.selected ? Number(entry.activity.price) * entry.quantity : 0), 0);')
sub('(comboCartItemSelected ? comboCartItemQuantity : 0)', 'selectedComboQuantity')
sub('(!comboCartItemPresent || comboCartItemSelected)', 'comboCartEntries.every(entry => entry.selected)')
sub('...(comboCartItemPresent ? [{ product: { activityId: "ACT-COMBO-68", price: COMBO_PURCHASE_PRICE.toFixed(2) }, quantity: comboCartItemQuantity, selected: comboCartItemSelected }] : [])', '...comboCartEntries.map(entry => ({ product: { activityId: entry.activity.id, price: entry.activity.price }, quantity: entry.quantity, selected: entry.selected }))')
sub('const openDetail = (item: DetailProduct) => { keyboard.hide();', 'const openDetail = (item: DetailProduct) => { setSelectedComboId(""); keyboard.hide();')
start=s.index('  const decreaseComboCartItem =')
end=s.index('  const selectExchangeItem',start)
s=s[:start]+'''  const decreaseComboCartItem = (id: string) => setComboCartEntries(entries => entries.map(entry => entry.activity.id === id ? { ...entry, quantity: entry.quantity - 1 } : entry).filter(entry => entry.quantity > 0));
  const increaseComboCartItem = (id: string) => {
    const activity = allComboActivities.find(item => item.id === id);
    if (activity) syncComboToCart(activity);
  };
'''+s[end:]
start=s.index('  const syncComboToCart =')
end=s.index('  const buyComboNow',start)
s=s[:start]+'''  const syncComboToCart = (activity: SearchComboActivity = activeDetailCombo, quantity = 1) => {
    setComboCartEntries(entries => {
      const existing = entries.find(entry => entry.activity.id === activity.id);
      const nextQuantity = (existing?.quantity ?? 0) + quantity;
      const nextEntries = existing ? entries.map(entry => entry.activity.id === activity.id ? { ...entry, quantity: nextQuantity, selected: true } : entry) : [...entries, { activity, quantity, selected: true }];
      const used = new Map<string, number>();
      for (const entry of nextEntries) for (const item of comboProductsFor(entry.activity)) used.set(item.id, (used.get(item.id) ?? 0) + entry.quantity * getComboComponentRequiredQuantity(item));
      if (nextEntries.some(entry => comboProductsFor(entry.activity).some(item => (used.get(item.id) ?? 0) > getComboComponentInventory(item).stock))) return entries;
      return nextEntries;
    });
  };
'''+s[end:]
sub('syncComboToCart(detailProduct, comboPurchaseQuantity)', 'syncComboToCart(activeDetailCombo, comboPurchaseQuantity)')
sub('syncComboToCart(activity.detailProduct)', 'syncComboToCart(activity)')
sub('id: `direct-combo-${item.id}`', 'id: `direct-combo-${activeDetailCombo.id}-${item.id}`')
# Only direct checkout still uses the hard-coded activity field here.
start=s.index('  const buyComboNow'); end=s.index('  const openComboPurchase',start)
s=s[:start]+s[start:end].replace('activityId: "ACT-COMBO-68"','activityId: activeDetailCombo.id')+s[end:]
start=s.index('    if (comboCartItemPresent && comboCartItemSelected) {');end=s.index('    const exchangeItem',start)
s=s[:start]+'''    for (const entry of comboCartEntries.filter(entry => entry.selected)) {
      const prices = comboPricesFor(entry.activity);
      lines.push(...comboProductsFor(entry.activity).map((item, index) => ({ id: `cart-combo-${entry.activity.id}-${item.id}`, name: item.name, spec: item.spec, price: prices[index], image: item.image, quantity: entry.quantity * getComboComponentRequiredQuantity(item), activityId: entry.activity.id, quantityLocked: true })));
    }
'''+s[end:]
start=s.index('  const renderComboCartSample =');end=s.index('  const renderExchangeEntry',start)
s=s[:start]+'''  const renderComboCartSample = () => comboCartEntries.map(entry => (
    <section className="reference-cart-item reference-combo-price-sample" key={entry.activity.id}>
      <div className="reference-combo-product-row">
        <span className="reference-cart-promotion">组合价</span>
        {renderChoice(entry.selected, () => setComboCartEntries(entries => entries.map(item => item.activity.id === entry.activity.id ? { ...item, selected: !item.selected } : item)))}
        <button className="reference-combo-activity-image" onClick={() => { setComboSummaryId(entry.activity.id); openComboPromotionSheet(); }}><img src={entry.activity.image} alt={entry.activity.name} /></button>
        <div><button className="reference-combo-activity-name" onClick={() => { setComboSummaryId(entry.activity.id); openComboPromotionSheet(); }}><h2>{entry.activity.name}</h2></button>
        <footer><span className="reference-cart-price"><b>¥{entry.activity.price}</b></span><div className="reference-cart-stepper"><button aria-label={`减少${entry.activity.name}`} onClick={() => decreaseComboCartItem(entry.activity.id)}><MinusIcon /></button><span>{entry.quantity}</span><button aria-label={`增加${entry.activity.name}`} onClick={() => increaseComboCartItem(entry.activity.id)}>+</button></div></footer></div>
      </div>
      <button className="reference-combo-gifts" onClick={() => { setComboSummaryId(entry.activity.id); openComboPromotionSheet(); }}><span>优惠组合</span><div className="reference-combo-gift-previews">{comboProductsFor(entry.activity).map(item => <img key={item.id} src={item.image} alt={item.name} />)}</div><b>共{comboProductsFor(entry.activity).reduce((sum, item) => sum + getComboComponentRequiredQuantity(item) * entry.quantity, 0)}件</b><ChevronRightIcon /></button>
    </section>
  ));

'''+s[end:]
sub('<header><div><strong>优惠组合</strong><span>（共{detailComboProducts.length}种商品）</span></div></header>', '''<header><div><strong>优惠组合</strong><span>（共{detailAvailableCombos.length}个组合）</span></div></header>
                {detailAvailableCombos.length > 1 ? <Carousel className="detail-combo-tabs" contentClassName="detail-combo-tabs-track" ariaLabel="选择优惠组合">{detailAvailableCombos.map(activity => <button type="button" key={activity.id} aria-pressed={activity.id === selectedDetailCombo.id} onClick={() => setSelectedComboId(activity.id)}>{activity.name}</button>)}</Carousel> : null}
                <div className="detail-combo-selection"><strong>{selectedDetailCombo.name}</strong><span>共{detailComboProducts.length}种商品</span></div>''')
# Change only component use sites, retain global legacy fixture constants.
start=s.index('export default function Prototype()')
s=s[:start]+s[start:].replace('COMBO_PURCHASE_PRICE.toFixed(2)', 'detailComboPrice.toFixed(2)')
sub('detailProduct.comboActivityImage ?? detailProduct.image', 'activeDetailCombo.image')
sub('detailProduct.comboName ?? "夏日养胃组合"', 'activeDetailCombo.name')
sub('detailProduct.comboName ?? "组合活动"', 'activeDetailCombo.name')
# Search result controls must reference their own activity, never the aggregate quantity.
sub('{comboCartItemPresent ? <div className="reference-search-stepper reference-search-combo-stepper">', '{comboCartEntries.some(entry => entry.activity.id === activity.id) ? <div className="reference-search-stepper reference-search-combo-stepper">')
sub('decreaseComboCartItem();', 'decreaseComboCartItem(activity.id);')
sub('<span>{comboCartItemQuantity}</span><button aria-label={`增加${activity.name}`}', '<span>{comboCartEntries.find(entry => entry.activity.id === activity.id)?.quantity}</span><button aria-label={`增加${activity.name}`}')
sub('setComboCartItemQuantity((value) => Math.min(comboCartStock, value + 1));', 'increaseComboCartItem(activity.id);')
sub('disabled={comboCartItemQuantity >= comboCartStock}', 'disabled={(comboCartEntries.find(entry => entry.activity.id === activity.id)?.quantity ?? 0) >= calculateComboStock(comboProductsFor(activity))}')
p.write_text(s,encoding='utf-8')
css=Path(__file__).parent/'prototype.css'
with css.open('a',encoding='utf-8') as f:f.write('''
.detail-combo-tabs { margin-top: 12px; }
.detail-combo-tabs-track { gap: 8px; }
.detail-combo-tabs button { flex-shrink: 0; padding: 7px 12px; border: 1px solid #e8e8e8; border-radius: 16px; background: #fff; color: #666; font-size: 12px; }
.detail-combo-tabs button[aria-pressed="true"] { border-color: var(--teal); color: var(--teal); background: #effaf7; }
.detail-combo-selection { display: flex; justify-content: space-between; gap: 8px; margin-top: 12px; font-size: 12px; }
.detail-combo-selection strong { font-weight: 500; }
.detail-combo-selection span { color: #999; white-space: nowrap; }
''')
ag=Path(__file__).parent/'AGENTS.md'
with ag.open('a',encoding='utf-8') as f:f.write('''
- 同一商品允许参加多个组合价活动；商品详情的优惠组合按商品关联的活动集合展示，显示组合数量，并通过活动名称切换商品、数量、组合单价和总价。每个购买入口绑定当前选择的活动。不同活动的购物车组合行分别保存，不能因包含相同商品合并或覆盖；共用商品库存按各组合购买数量累加校验。组合商品行金额直接按配置的组合单价和数量计算，不按门店原价分摊。新增多组合样例为本地演示数据，并非生产后台同步。
''')
