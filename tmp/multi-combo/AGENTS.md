# Mobile Prototype Agent Guide

## Prototype Instructions

In ChatGPT Work Mode, run `sites-preview start "$PWD"`, open `http://terminal.local:4173/` in the cloud browser, and verify the rendered app and its primary interactions. Keep that preview open and tell the user to inspect it in the cloud browser; do not present the local URL as a user-facing chat link. In Codex Desktop, run the local server yourself, open the preview in the in-app browser, and provide the clickable local URL. Do not deploy to Sites unless the user explicitly asks to share, publish, or deploy. Do not give the user server-start instructions when you can run it.

Before planning or implementing any mobile-app change, read this `AGENTS.md` in full. It is the source of truth for the template's runtime and component guidance.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

The desktop preview currently uses a frame-less application canvas: omit the phone bezel and camera cutout while retaining the live status bar, safe-area behavior, and iPhone/Pixel viewport presets.

The frame-less preview has zoom controls from 75% to 200% beside the device picker. The scale can exceed the fitted viewport and the preview stage must remain scrollable when it does.

## Editing Boundary

- Build app-specific UI in `src/Prototype.tsx` and `src/prototype.css`.
- Treat `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/mobile/`, `public/assets/iphone/`, `public/assets/android/`, `public/assets/status/`, `vite.config.ts`, `worker/index.js`, and `scripts/prepare-sites-build.mjs` as protected runtime files. Do not edit, replace, remove, or recreate them unless the user explicitly asks to change the mobile runtime itself. For an explicit runtime change, update the affected lock hashes only after verifying the new runtime behavior.
- Run `npm run check:runtime` before preview or handoff. If it fails, restore the protected runtime instead of weakening or bypassing the check.
- `npm run build` preserves the mobile runtime and prepares the static Cloudflare Worker output required by Sites. Before a Sites handoff, confirm `dist/client/index.html`, `dist/server/index.js`, `dist/.openai/hosting.json`, and source `.openai/hosting.json` exist, then run `npm run test:sites`. Do not replace this project with a Vinext starter.

## Runtime Contract

- Preserve the mobile device runtime unless the user's task explicitly asks otherwise. Do not replace it with a standalone page. Visual fidelity applies to app-owned content inside the device screen, not to template-owned device chrome.
- Keep `App` composed around `PhoneFrame` -> `KeyboardProvider`, with `StatusBar`, app content, `HomeIndicator`, and `KeyboardDock` mounted inside the phone frame. `StatusBar` and the iOS home indicator are overlaid device chrome. When the Android keyboard is closed, the app viewport reserves the protected navigation-bar region instead of painting behind it. When the Android keyboard is open, preserve the current full-screen keyboard layout: its asset includes the IME navigation strip and the separate black navigation bar is hidden. iOS screens continue to paint behind the home-indicator area and own their safe-area content padding.
- Preserve the `iPhone` / `Pixel 10` device picker and both calibrated device presets. The Pixel screen is `427 x 952`; its `32 x 32` camera circle and `public/assets/android/navigation-bar.svg` bottom navigation bar are protected device chrome, not app content.
- Preserve the device picker's intentionally lightweight Codex styling in the top-right corner: its trigger wrapper is borderless and transparent, its trigger sizes to content, and its right-aligned menu uses the compact 3px inset plus the specified hairline and elevation shadow layers. Keep the prototype root and default app screen white.
- Preserve `StatusBar` as live device chrome, including its platform-specific typography, source status-icon assets, and spacing. Pixel 10 uses Roboto, Android indicators, and 32px top, left, and right padding. iPhone uses its iOS indicators, system typography, and calibrated spacing. Do not hardcode screenshot times like `9:41` into the status bar, replace its real-time clock, or move status bar content into app markup unless the user explicitly asks for a fixed/mock device time.
- `PhoneFrame` owns the calibrated device frame, screen portal, device picker, camera cutout, and custom cursor. Keep device assets in `public/assets/iphone/` and `public/assets/android/`; if an asset fails to load, repair the asset path or restore the asset instead of removing the frame, keyboard, or image render.
- Use `MobileScroll` directly for simple single-screen prototypes. Use `FlowStack` for conventional multi-screen flows whose routes can own their fixed header and footer; when using it, define each route as a `FlowScreen`: `{ id, header?, headerHeight?, footer?, footerHeight?, render }`, and use `flow.push(screen)`, `flow.pop()`, and `flow.replace(screen)` from `FlowStack` render callbacks or `useFlow()` instead of introducing another router.
- Use `Carousel` for a carousel, horizontal rail, swipeable cards, image or media strip, horizontally scrollable cards, chip rail, or other horizontal collection.
- For a layered app shell—such as a persistent composer, independently presented sheet, pushed/peek sidebar, or app-wide transition—compose directly in `Prototype.tsx` rather than forcing it through `FlowStack`. Keep app-owned fixed chrome as sibling layers outside `MobileScroll`.
- When using `FlowScreen`, put route-owned fixed headers or footers in `FlowScreen.header` or `FlowScreen.footer`. Set `headerHeight` to the visible app-toolbar height; `FlowStack` adds the device's top safe-area/status-bar inset automatically. Do not include `StatusBar` or its height in the header. Set `footerHeight` to the full app-footer height. `FlowScreen.footer` is an overlay, not reserved layout space; screens using it must add their own bottom content padding such as `padding-bottom: calc(var(--flow-footer-height) + var(--mobile-safe-area-height) + 24px)` so final content can scroll above the footer while still painting behind it.
- Render only scrollable content inside `MobileScroll`; it is for content that should move with scroll and rubber-band overscroll. Keep app-owned headers, nav bars, tabs, composers, and overlays outside it. This keeps scroll physics, safe areas, keyboard insets, scrollbars, and drag click suppression active without letting content paint under fixed chrome.
- Buttons, links, cards, and images inside `MobileScroll` should still allow drag scrolling when the pointer moves beyond tap slop. Use `data-scroll-drag="ignore"` only for rare controls that must own the drag gesture themselves.
- Do not add `var(--keyboard-height)` to ordinary screen/content padding inside `MobileScroll`; the scroll viewport already shrinks above the simulated keyboard. For custom fixed composers, search bars, or toast chrome, use `useKeyboardInsets().bottomInset`. It is relative to the app viewport: Android returns `0` while the closed-keyboard viewport already reserves navigation, then returns the keyboard height while open; iOS continues to clear the home indicator while closed and ride directly above the keyboard while open. Do not pin custom bottom chrome to `bottom: 0` or only `keyboardHeight`.
- Use `KeyboardInput`, `KeyboardTextarea`, or `MobileTextField` for every text-entry control. A raw `input` or `textarea` disconnects focus, keyboard animation, safe-area insets, and attached surfaces.
- Use `BottomSheet` for phone-scoped sheets. Its props are `open`, `onOpenChange`, `title`, optional `description`, optional `snap`, and `children`; it renders through the phone screen portal and dismisses the keyboard before opening.

## Horizontal Carousels

- Use `Carousel` for horizontally draggable cards, images, media, chips, or other horizontal collections. Do not recreate these with `overflow-x`, custom pointer handlers, or a generic div.
- `Carousel` can be nested directly inside `MobileScroll`. It owns horizontal gestures and automatically yields vertical gestures to the parent.
- Never put `data-scroll-drag="ignore"` on or around a `Carousel`; doing so prevents vertical parent scrolling when a gesture begins inside it.
- Do not add CSS scroll snapping to `Carousel`; its runtime owns momentum and release motion.
- Use `data-scroll-drag="ignore"` only when a control must prevent parent scrolling in every drag direction.

See `src/mobile/COMPONENTS.md` for the full component and gesture contract.

## Keyboard Rule

The simulated keyboard is a separate top-layer component. Before presenting anything that behaves like iOS navigation or modal UI, dismiss it first.

Call `keyboard.hide()` before:

- pushing, popping, or replacing FlowStack routes
- opening bottom sheets, action sheets, dialogs, menus, or navigation sheets
- starting transitions where the destination should not inherit text-input focus

`FlowStack` already hides the keyboard for `push`, `pop`, and `replace`. `BottomSheet` already hides it before opening. If you add new modal/sheet/navigation primitives, follow the same rule.

When a composer, search surface, or other keyboard-attached component closes, call `keyboard.hide()` in the same event before changing that component's open state. Position attached surfaces from `useKeyboardInsets()` rather than a separate timer or visibility flag so both dismiss together.

When any text-entry control loses focus, dismiss the simulated keyboard. If the control is custom or does not use the runtime's keyboard-aware fields, handle its blur event and call `keyboard.hide()` explicitly. Keep the keyboard open only when focus is moving directly to another text-entry control that should share the same keyboard session.

## Interaction Rules

- Do not trigger buttons or inputs after a pointer has become a drag. Preserve the drag suppression behavior in `MobileScroll`.
- Do not allow native browser image/file dragging inside the phone frame. Preserve the phone-level `dragstart` suppression and non-draggable image styles so scroll drags that begin on images still scroll the prototype.
- Use `KeyboardInput`, `KeyboardTextarea`, or `MobileTextField` for text entry so the simulated keyboard and safe-area insets stay connected.
- Fixed phone chrome should not animate with pushed screens. Screen content can animate; the status bar, camera cutout, and preview chrome should stay put.
- Keep the keyboard below the home indicator/safe area layer in z-index, and above ordinary app UI while visible.
- Keep the home indicator as the topmost safe-area layer in the z-index above everything else in the prototype.

## Confirmed Copy

- Order-detail product rows show the original unit price beneath the current unit price in smaller gray strikethrough text when the original price is higher; preserve this price in the order snapshot.

- Product-detail benefit sheets use the title “优惠详情” and separate “促销活动” from “优惠券活动” with visible section headings. Coupon claiming instructions belong only to the coupon section.

- Cart promotion scope is limited to 满减、满额赠品、买X送Y、满额换购、限时折扣、限时特价、限时直减、组合价. Only the first four render cart threshold rows; limited-time price promotions and combination purchase do not.
- Generate one cart threshold row per promotion activity ID. Only checked eligible products from that activity group contribute to its amount or quantity threshold; unchecked products remain in the group but contribute zero.
- Only render a product-level threshold caption when that checked product has an unmet specified-product threshold; do not show a caption for unchecked or fulfilled products.
- For activity conditions, display the whole-order amount/quantity threshold in the activity row and a specified product's amount/quantity threshold beneath that product. Join simultaneous gaps with `+`, such as `整单还差1件+140.80元` and `本品还差1件+60.20元`.
- Until the interface's `plannum` scope is clarified, do not infer alternate OR behavior from it; qualify a prototype activity only after every configured whole-order and specified-product threshold is met.
- When a checked product participates in a threshold activity whose whole-order or specified-product condition is unmet, disable checkout and payment. The control must remain unavailable until every applicable promotion activity qualifies.
- In both full-screen and half-screen carts, display products grouped by promotion activity ID. Show threshold rows only for the four threshold activities; ordinary products have no group-title row, and complete combination sets show no extra “组合价” group-title row beyond their own product marker.
- In cart, groups with quantity or amount thresholds sort ahead of non-threshold promotions, ordinary products, and combination-price sets; preserve the original relative order within each tier.
- Style cart activity-title rows like the threshold prompt rows: white background, neutral gray text, and regular font weight.
- 满减 is an order-level reduction within its activity group: aggregate checked eligible products for that activity ID and apply the reduction once when the group threshold is reached. Products from other promotion groups do not contribute.
- Use “满减满赠” as the activity badge and activity label for all full-reduction, full-gift, buy-X-get-Y, and full-exchange samples; internal promotion behavior remains distinct by activity type.
- Limited-time percentage-off promotions use “限时X折”; do not include “打”.
- In cart, limited-time price, percentage-off, and direct-reduction products retain their product-level promotion badge but do not render an activity-title row.
- In the cart amount-detail sheet, combine limited-time price, percentage-off, and direct-reduction savings into one “限时折扣” line; sum their discount amounts.
- In the Buy-X-get-Y gift picker, a selected gift uses the action label “取消赠品”; cancelling clears that selection and restores the other gift choices.
- For a one-item full-gift activity, tapping another “选赠品” after a gift is selected keeps the current choice and shows “赠品已达上限”; users must cancel the selected gift before choosing another.
- Promotion-picker limit toasts stay visible for 2 seconds.
- On cart checkout, show one aggregate “赠品未选择” confirmation only when at least one gift activity is qualified and no gift has been selected. Selecting any gift suppresses the prompt; an unselected exchange activity never triggers it.
- In both the full-screen and half-screen carts, clicking “立即支付” shows the payment-success page. Product “立即购买” continues through confirmation order, then “去支付” shows the same success page.
- On the payment-success page, “查看订单” opens an order-detail page in the “待商家发货” state, with the reference order summary and “申请退款 / 联系门店” actions.
- In the order-detail amount summary, “商品小计” uses original prices before promotional reductions. Render “活动优惠” directly between “商品小计” and “优惠券抵扣”, including both product price savings and activity-level reductions exactly once.
- On the confirmation-order page, group promotional products by activity and display that activity's threshold or activity label directly above its products; ordinary products do not show a promotion row.
- On the confirmation-order page, use the same qualification, selection, cancellation, and quantity-cap rules as the cart for 满额赠品、买X送Y and 满额换购. Selected benefits are order lines; remove them automatically when the applicable threshold or gift quota is no longer met.
- On cart benefit lines, show the benefit marker before the product name on the same name row.
- On confirmation-order benefit lines, reuse the cart's green marker before the product name: “赠送商品” for 满额赠品, “买赠商品” for 买X送Y, and “换购商品” for 满额换购.
- On the confirmation-order page, clicking 去支付 when a gift activity is qualified but no gift is selected shows the same aggregate “赠品未选择” prompt as cart checkout; users can continue without a gift or open the eligible gift picker.
- In the cart amount-detail sheet, clicking the amount on the right of “优惠合计” expands the individual promotion-activity discounts below that row; clicking it again collapses them. Keep coupons as a separate summary row, and align every amount (including expanded activity amounts) to the right edge of the “优惠合计” amount while reserving its arrow column.
- Product detail pages for items participating in a promotion show an “优惠” row between “规格” and “送至”, populated with that product's corresponding promotion; non-promotional items omit the row.
- Tapping a product-detail “优惠” row opens a bottom sheet that shows the product's eligible promotion activity and available coupons. Coupon rows expose a “领取” action and switch to “已领取” after collection.
- Combination-price products omit the product-detail “优惠” row and instead use only their dedicated “优惠组合” section. In cart, confirmation, and payment flows, show the “组合价” marker only for a complete combination set; standalone products never inherit that marker. Omit explanatory purchase-condition and final-price copy from promotion cards.
- On the 组合商品列表 page, every click on “加入购物车” adds exactly one complete combination set. Repeated clicks increment the combination-set quantity and the cart badge by one each time; they do not merely preserve an existing quantity.
- Compute a combination set's sellable stock from its child products and required quantities: take the minimum of `floor(child sellable stock / required quantity per set)` across all children. Display each child's stock with its unit, show the computed result as the set stock, and cap purchase and cart quantities at that result.
- Combination-price activities are excluded from 商品分类 and appear only as their own searchable result cards. When a component product supports standalone purchase, return the standalone product and the combination activity as separate results; the activity card shows its name, component count, and combination price and opens the combination-product page.

- 同一商品允许参加多个组合价活动；商品详情的优惠组合按商品关联的活动集合展示，显示组合数量，并通过活动名称切换商品、数量、组合单价和总价。每个购买入口绑定当前选择的活动。不同活动的购物车组合行分别保存，不能因包含相同商品合并或覆盖；共用商品库存按各组合购买数量累加校验。组合商品行金额直接按配置的组合单价和数量计算，不按门店原价分摊。新增多组合样例为本地演示数据，并非生产后台同步。

商品详情优惠组合不提供“查看全部”入口或全部组合弹出列表。多个组合活动名称保持单行，超过可见宽度时使用 Carousel 横向滑动查看更多；点击活动名称切换其商品、数量、组合单价和总价，保留组合总数展示。
