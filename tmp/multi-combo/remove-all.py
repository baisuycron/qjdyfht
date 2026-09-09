from pathlib import Path
import re
root=Path(__file__).parent
p=root/'Prototype.tsx'
s=p.read_text(encoding='utf-8')
s=s.replace('  const [allCombosOpen, setAllCombosOpen] = useState(false);\n','')
s=re.sub(r'\{detailAvailableCombos.length >= 2 \? <button type="button" className="detail-combo-view-all".*?</button> : null\}', '', s)
s=re.sub(r'      <BottomSheet open=\{allCombosOpen.*?</BottomSheet>\n', '', s, flags=re.S)
assert 'allCombosOpen' not in s and 'all-combos' not in s
p.write_text(s,encoding='utf-8')
p=root/'prototype.css'
s=p.read_text(encoding='utf-8')
s='\n'.join(line for line in s.split('\n') if not line.startswith(('.detail-combo-view-all ','.all-combos-')))
p.write_text(s,encoding='utf-8')
p=root/'AGENTS.md'
s=p.read_text(encoding='utf-8')
s='\n'.join(line for line in s.split('\n') if not line.startswith('商品详情关联两个及以上组合活动时'))
s+='\n商品详情优惠组合不提供“查看全部”入口或全部组合弹出列表。多个组合活动名称保持单行，超过可见宽度时使用 Carousel 横向滑动查看更多；点击活动名称切换其商品、数量、组合单价和总价，保留组合总数展示。\n'
p.write_text(s,encoding='utf-8')
