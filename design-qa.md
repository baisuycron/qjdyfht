# Design QA

## Comparison target

- Source visual truth: `qa/source-dashboard-viewport.png` — captured from the authenticated platform dashboard.
- Implementation: `qa/prototype-dashboard-revised.png` — captured from the local Vite prototype.
- Full-view comparison: `qa/dashboard-comparison.png` (source on the left, local prototype on the right).
- Viewport: 1569 x 912 CSS pixels, device scale factor 1 for both captures. Images were normalized to 1569 x 912 before combining.
- State: dashboard, near-7-day trend selected, desktop web admin shell.
- Focused regions: full view was sufficient because the dashboard has no dense data entry controls above the fold; coupon and marketing states were separately browser-tested.

## Interaction evidence

- Marketing navigation, promotion guide, coupon list, coupon filtering, coupon detail entry, modal receipt-record state, ad settings controls, link selector, radio toggles, and save feedback are implemented with local mock data.
- Local captures: `qa/prototype-marketing.png`, `qa/prototype-coupon.png`.
- Console errors after interaction checks: none.
- Narrow-screen check: the source is desktop-first; the prototype intentionally retains its fixed admin canvas and horizontal overflow behavior.

## Required fidelity surfaces

- Fonts and typography: Microsoft YaHei / PingFang-compatible system stack; dashboard hierarchy, card numerals, labels, and table density match the reference pattern.
- Spacing and layout rhythm: the two-tier dashboard navigation, card grid, pending-work panel, trend section, filters, and table column rhythm were aligned to the capture.
- Colors and visual tokens: dark navy navigation, blue active states, pale gray page canvas, white panels, blue data values, and muted borders match the captured UI.
- Image quality and asset fidelity: the advertising preview uses locally copied page assets; navigation and controls use a local open-source icon library rather than hotlinked source assets.
- Copy and content: all visible labels, sections, form text, and mock coupon records follow the captured flows. Live dashboard numbers were intentionally represented as fixed mock values.

## Findings

- [P3] Navigation glyphs are from a local open-source icon set rather than the source icon font.
  - Location: dark left navigation.
  - Evidence: outline and stroke character differ slightly while label placement, sizing, and active treatment are preserved.
  - Impact: minor visual variance only.
  - Fix: replace with a licensed local export of the original icon font if exact glyph parity is required.

- [P3] The source dashboard figures changed during capture.
  - Location: metric cards and pending-work counts.
  - Evidence: source moved from 0.01/1/233 to 0.04/4/236 while the prototype keeps stable mock data.
  - Impact: no layout or interaction impact.
  - Fix: connect an approved dashboard data API in a future backend phase.

## Comparison history

1. Initial dashboard comparison found the source-only secondary home menu missing from the prototype (P1). Fixed by adding the fixed 125px home context menu with notification badges. Re-captured `qa/prototype-dashboard-revised.png` and compared in `qa/dashboard-comparison.png`.
2. Added the user-annotated `门店促销` region beneath `平台促销`, preserving the existing cards and spacing. Browser-rendered evidence: `qa/store-promotion-guide.png` and `qa/store-promotion-full-reduction.png`. Both new entries are visible and lead to their respective activity-management state; the `新建活动` modal state was also verified.
3. Applied the follow-up annotations: removed the activity header/new-activity block and all `编辑` actions, while keeping filtering, activity rows, and `查看`. Browser-rendered evidence: `qa/store-promotion-cleanup.png`.
4. Removed the `返回营销` button per the final annotation; filtering and activity rows remain present.
5. Renamed the activity column and added the annotated activity-type filter. Default `全部` contains both `满减` and `满赠`; choosing `满减` filters the list to that type. Browser-rendered evidence: `qa/activity-type-filter.png`.
6. Aligned `查询` and `重置` to the filter bar's right edge with a 26px right inset and 10px inter-button gap. Browser-rendered evidence: `qa/filter-actions-aligned.png`.
7. Fixed activity-list columns at the annotated values: `活动名称` is 200px and `活动类型` is 150px, with the remaining columns sharing the responsive space. Browser geometry verification and capture: `qa/activity-table-fixed-columns.png`.
8. Replaced the activity-status pills with explicit dot-and-label states: green `进行中`, amber `未开始`, and gray `已结束`. Browser-rendered evidence: `qa/activity-status-dots-visible.png`.
9. Added the `年中感恩满减` completed sample, confirming all three activity states appear together. Browser-rendered evidence: `qa/activity-status-all-states.png`.
10. Implemented activity-detail navigation from each `查看` action, using the supplied two-panel detail layout and activity-specific values. The return action was also browser-verified. Evidence: `qa/activity-detail.png`.
11. Replaced the generic limited-discount activity list with an API-grounded query page: activity name, activity number, and last-modified-time filters; the list presents the documented activity fields and all three discount modes. Browser evidence: `qa/limited-discount-query-responsive.png`.
12. Added limited-discount details for store scope, date/week restrictions, update time, discount mode, and product-level item data. Query, detail entry, and return navigation were browser-verified. Evidence: `qa/limited-discount-detail.png`.
13. Renamed the list column to `促销类型` and aligned the displayed values to the API's three promotion modes: `按折扣率`、`按促销价`、`减价格`. Browser-rendered evidence: `qa/limited-discount-promotion-types.png`.
14. Updated the limited-discount list and detail annotations: list store scope hides store codes, activity time includes seconds, the time-range filter is labeled `活动时间`, and detail promotion text is type-only. Browser evidence: `qa/limited-discount-time-and-store.png`, `qa/limited-discount-detail-type.png`.
15. Removed the input-style treatment from activity name, number, and time on the limited-discount detail; expanded all-week participation to `周一、周二、周三、周四、周五、周六、周日`. Browser evidence: `qa/limited-discount-detail-plain-text.png`.
16. No remaining actionable P0/P1/P2 visual mismatches found.

## Implementation checklist

- [x] Build homepage dashboard with secondary home navigation.
- [x] Build marketing guide, coupons, coupon detail, and popup-ad configuration states.
- [x] Add local interactions and realistic mock data.
- [x] Run browser visual and interaction checks.
- [x] Run production build and Sites packaging tests.

## Follow-up polish

- Optionally export and locally license-match the source navigation icon font.
- Add data API integration and role-based authorization when moving beyond the frontend prototype.

final result: passed
