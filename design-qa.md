# 交易模块 Design QA

**Comparison target**

- Source visual truth: authenticated production pages for `#/trade/manage`, `#/trade/refund`, `#/trade/returnProduct`, order detail, refund audit, and return audit. Saved source screenshots are privacy-redacted under `qa/trade-source-*.png`.
- Implementation: `http://127.0.0.1:4173/`, rendered from `src/TradeModule.jsx` and `src/trade.css`.
- Desktop viewport: 1569 × 912 CSS px, device scale factor 1. Source and implementation captures are both 1569 × 912 physical px; no density resampling was required.
- Mobile check: 390 × 844 CSS px, device scale factor 1. Both source and implementation intentionally retain a fixed 1366 px desktop canvas with horizontal overflow.
- State: order list, order detail, refund list, refund audit dialog, return list, return logistics dialog, and return audit dialog.

**Evidence**

- Full-view comparisons:
  - `qa/trade-comparison-order.png`
  - `qa/trade-comparison-refund.png`
  - `qa/trade-comparison-return.png`
  - `qa/trade-comparison-order-detail.png`
- Focused dialog comparisons:
  - `qa/trade-comparison-refund-audit.png`
  - `qa/trade-comparison-return-audit.png`
- Mobile implementation evidence: `qa/trade-prototype-mobile-return.png`.
- Browser interactions tested: tab switching, compact/expanded filters, query/reset, CSV export, seller note edit/save, order detail/back, address expansion, refund detail/audit, return detail/logistics/audit, and local audit-state update.
- Browser console: checked after the final interaction pass; no warnings or errors.

**Findings**

- No actionable P0/P1/P2 differences remain.
- [P3] Icon rendering differs slightly because the implementation uses the project React icon set while the source uses its private icon font. Placement, size, and meaning are preserved.
- [P3] Production customer, order, address, and account values were deliberately replaced with synthetic masked data. This changes row text and natural wrapping but preserves table density and hierarchy without copying sensitive data.

**Required fidelity surfaces**

- Fonts and typography: matched the source system-font stack, compact 12–14 px control/table text, hierarchy, weight, line height, truncation, and non-wrapping brand labels.
- Spacing and layout rhythm: matched the two-tier navigation, 1366 px fixed content canvas, filter grid, tab/filter attachment, table density, card gaps, modal dimensions, and footer positioning.
- Colors and visual tokens: matched the source blue primary actions/navigation, pale page background, white cards, gray borders, muted labels, and semantic status colors.
- Image quality and asset fidelity: three public product thumbnails were copied from the visible source asset bundle; crops, sizing, and transparency treatment are preserved. No source customer/order data was copied.
- Copy and content: reproduced the visible trade labels, tabs, filter names, columns, dialogs, actions, and validation copy; dynamic values are synthetic mock data.

**Comparison history**

- Initial [P1] finding: refund and return pages shared after-sales state, which could expose a refund-shaped row in the return table. Fixed by keying the after-sales page per route; post-fix return list and dialog evidence is in `qa/trade-comparison-return.png` and `qa/trade-comparison-return-audit.png`.
- Initial [P2] finding: after-sales query actions sat one row lower than the source. Fixed the filter grid/action placement; post-fix evidence is in the refund and return full-view comparisons.
- Initial [P2] finding: audit dialogs had incorrect height, field ordering, and footer placement. Fixed the modal flex layout and split refund/return field sets; post-fix evidence is in both focused audit comparisons.
- Initial [P2] finding: return quantity wrapped in the narrow table column. Fixed the column width and no-wrap behavior; post-fix evidence is in `qa/trade-comparison-return.png`.
- Initial [P2] finding: order detail inherited the list scroll position. Added scroll reset on detail entry; post-fix detail capture starts at the expected top position.
- Initial [P2] finding: after-sales rows were too sparse to match source density. Increased synthetic rows to ten; post-fix evidence is in both after-sales full-view comparisons.

**Implementation checklist**

- [x] Match order, refund, and return list composition.
- [x] Reproduce core visible interactions and modal states with mock data.
- [x] Verify desktop and source-style mobile overflow behavior.
- [x] Run production build and Sites packaging tests.
- [x] Check final browser console.

final result: passed
