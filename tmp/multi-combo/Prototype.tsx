import { Fragment, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowLeftIcon,
  BackpackIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  ChevronRightIcon,
  ClockIcon,
  DotsHorizontalIcon,
  EnvelopeClosedIcon,
  FileTextIcon,
  HeartIcon,
  HomeIcon,
  IdCardIcon,
  MagnifyingGlassIcon,
  MobileIcon,
  ExclamationTriangleIcon,
  MinusIcon,
  PersonIcon,
  PlusIcon,
  RowsIcon,
  Share1Icon,
  SewingPinFilledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, Carousel, MobileScroll, useKeyboard } from "./mobile";

type View = "home" | "category" | "cart" | "profile" | "detail" | "combo-list" | "confirm-order" | "order-detail" | "payment-success";
type Product = { id: string; name: string; spec: string; price: number; tag: string; tone: string };
type PromotionActivityType = "full-reduction" | "full-gift" | "buy-x-get-y" | "full-exchange" | "limited-discount" | "limited-special" | "limited-reduction" | "combo";
type PromotionActivity = {
  id: string;
  type: PromotionActivityType;
  label: string;
  threshold?: number;
  reductionAmount?: number;
  orderAmountThreshold?: number;
  orderQuantityThreshold?: number;
};
type PromotionProduct = { id?: string; activityId?: string; price: string; itemAmountThreshold?: number; itemQuantityThreshold?: number };
type DetailProduct = { id: string; name: string; spec: string; price: string; tag: string; promotion: string; activityId?: string; image: string; comboUnitPrice?: number; comboQuantity?: number; comboName?: string; comboActivityImage?: string; stock?: number; stockUnit?: string; itemAmountThreshold?: number; itemQuantityThreshold?: number };
type SearchComboActivity = { id: string; name: string; productCount: number; price: string; image: string; detailProduct: DetailProduct; products?: DetailProduct[] };
type CartPromotionGroup = {
  activity: PromotionActivity;
  totalAmount: number;
  totalQuantity: number;
  selectedAmount: number;
  selectedQuantity: number;
  lines: Array<{ product: PromotionProduct; quantity: number; selected: boolean }>;
};
type CartProductLine = { product: DetailProduct; quantity: number; selected: boolean };
type CartDisplayGroup = {
  key: string;
  activity: PromotionActivity | null;
  lines: CartProductLine[];
  includesCombo: boolean;
};
type ConfirmOrderBenefitType = "gift" | "exchange";
type ConfirmOrderLine = { id: string; name: string; spec: string; price: number; originalPrice?: string | null; image: string; quantity: number; activityId?: string; itemAmountThreshold?: number; itemQuantityThreshold?: number; benefitType?: ConfirmOrderBenefitType; quantityLocked?: boolean };
type ConfirmOrderPromotionGroup = { key: string; activity: PromotionActivity | null; lines: ConfirmOrderLine[] };
type PaidOrderSnapshot = { lines: ConfirmOrderLine[]; subtotal: number; promotionSaving: number; couponSaving: number; total: number; itemCount: number };
type OrderCoupon = {
  id: string;
  name: string;
  discount: number;
  discountLabel: string;
  threshold: string;
  dateRange: string;
  unavailableReason?: string;
};
type DetailCoupon = {
  id: string;
  value: number;
  name: string;
  scope: string;
  expiry: string;
  preclaimed?: boolean;
};
type DetailInfo = {
  code: string;
  genericName: string;
  manufacturer: string;
  approval: string;
  indication: string;
  dosage: string;
  form: string;
  unit: string;
};
type FloatingPosition = { left: number; top: number };
type FloatingDragSession = FloatingPosition & { pointerId: number; scaleX: number; scaleY: number };

const COMBO_PROMOTION = "\u7ec4\u5408\u4ef7";
const COMBO_PROMOTION_LABEL = "组合价";
const COMBO_PURCHASE_PRICE = 68;
const PROMOTION_TOAST_DURATION = 2000;
const COMBO_COMPONENT_INVENTORY: Record<string, { stock: number; unit: string; requiredQuantity: number }> = {
  h4: { stock: 2340, unit: "盒", requiredQuantity: 1 },
  h5: { stock: 1170, unit: "盒", requiredQuantity: 2 },
  h6: { stock: 1850, unit: "盒", requiredQuantity: 3 },
  "combo-pudi-68": { stock: 2340, unit: "盒", requiredQuantity: 1 },
};
const PROMOTION_ACTIVITIES: Record<string, PromotionActivity> = {
  "ACT-FR-200-20": { id: "ACT-FR-200-20", type: "full-reduction", label: "满减满赠", threshold: 200, reductionAmount: 20, orderAmountThreshold: 200, orderQuantityThreshold: 4 },
  "ACT-FG-200": { id: "ACT-FG-200", type: "full-gift", label: "满减满赠", threshold: 200, orderAmountThreshold: 200, orderQuantityThreshold: 3 },
  "ACT-BXGY-2": { id: "ACT-BXGY-2", type: "buy-x-get-y", label: "满减满赠", threshold: 2, orderAmountThreshold: 80, orderQuantityThreshold: 2 },
  "ACT-FE-300": { id: "ACT-FE-300", type: "full-exchange", label: "满减满赠", threshold: 300, orderAmountThreshold: 300, orderQuantityThreshold: 5 },
  "ACT-LD-9": { id: "ACT-LD-9", type: "limited-discount", label: "限时9折" },
  "ACT-LS-1": { id: "ACT-LS-1", type: "limited-special", label: "限时特价" },
  "ACT-LR-3.88": { id: "ACT-LR-3.88", type: "limited-reduction", label: "限时减3.88" },
  "ACT-COMBO-68": { id: "ACT-COMBO-68", type: "combo", label: COMBO_PROMOTION_LABEL },
};
const getPromotionActivity = (product: { activityId?: string }) => product.activityId ? PROMOTION_ACTIVITIES[product.activityId] ?? null : null;
const isComboPromotion = (product: { activityId?: string }) => getPromotionActivity(product)?.type === "combo";
const getOrderAmountThreshold = (activity: PromotionActivity) => activity.orderAmountThreshold ?? (activity.type === "buy-x-get-y" ? 0 : activity.threshold ?? 0);
const getOrderQuantityThreshold = (activity: PromotionActivity) => activity.orderQuantityThreshold ?? (activity.type === "buy-x-get-y" ? activity.threshold ?? 0 : 0);
type PromotionRequirementState = {
  orderAmountThreshold: number;
  orderQuantityThreshold: number;
  orderAmountRemaining: number;
  orderQuantityRemaining: number;
  itemRequirements: Array<{ id: string; amountRemaining: number; quantityRemaining: number }>;
  qualified: boolean;
};
const isThresholdPromotionActivity = (activity: PromotionActivity) => (
  activity.type === "full-reduction"
  || activity.type === "full-gift"
  || activity.type === "buy-x-get-y"
  || activity.type === "full-exchange"
);
const getPromotionRequirementState = (
  activity: PromotionActivity,
  selectedAmount: number,
  selectedQuantity: number,
  lines: Array<{ product: PromotionProduct; quantity: number; selected: boolean }>,
): PromotionRequirementState => {
  const orderAmountThreshold = getOrderAmountThreshold(activity);
  const orderQuantityThreshold = getOrderQuantityThreshold(activity);
  const itemRequirements = lines
    .filter(({ product }) => (product.itemAmountThreshold ?? 0) > 0 || (product.itemQuantityThreshold ?? 0) > 0)
    .map(({ product, quantity, selected }, index) => {
      const selectedQuantity = selected ? quantity : 0;
      const selectedAmount = selected ? Number(product.price) * quantity : 0;
      return {
        id: product.id ?? `${activity.id}-${index}`,
        amountRemaining: Math.max(0, (product.itemAmountThreshold ?? 0) - selectedAmount),
        quantityRemaining: Math.max(0, (product.itemQuantityThreshold ?? 0) - selectedQuantity),
      };
    });
  const orderAmountRemaining = Math.max(0, orderAmountThreshold - selectedAmount);
  const orderQuantityRemaining = Math.max(0, orderQuantityThreshold - selectedQuantity);
  return {
    orderAmountThreshold,
    orderQuantityThreshold,
    orderAmountRemaining,
    orderQuantityRemaining,
    itemRequirements,
    qualified: orderAmountRemaining === 0
      && orderQuantityRemaining === 0
      && itemRequirements.every((item) => item.amountRemaining === 0 && item.quantityRemaining === 0),
  };
};
const formatThreshold = (amount: number, quantity: number, prefix = "满") => {
  const parts = [amount > 0 ? `${amount}元` : "", quantity > 0 ? `${quantity}件` : ""].filter(Boolean);
  return parts.length ? `${prefix}${parts.join("+")}` : "";
};
const formatRemaining = (quantity: number, amount: number) => [quantity > 0 ? `${quantity}件` : "", amount > 0 ? `${amount.toFixed(2)}元` : ""].filter(Boolean).join("+");
const getOrderRequirementProgress = (state: PromotionRequirementState) => {
  const remaining = formatRemaining(state.orderQuantityRemaining, state.orderAmountRemaining);
  if (remaining) return `整单还差${remaining}`;
  return state.qualified ? "活动条件已满足" : "整单条件已满足";
};
const getRequirementBlockerProgress = (state: PromotionRequirementState) => {
  const orderRemaining = formatRemaining(state.orderQuantityRemaining, state.orderAmountRemaining);
  const itemRemaining = state.itemRequirements
    .map((item) => formatRemaining(item.quantityRemaining, item.amountRemaining))
    .filter(Boolean)
    .map((remaining) => `本品还差${remaining}`);
  return [orderRemaining ? `整单还差${orderRemaining}` : "", ...itemRemaining].filter(Boolean).join("；") || "活动门槛未满足";
};
const groupCartPromotions = (sources: Array<{ product: PromotionProduct; quantity: number; selected: boolean }>) => {
  const groups = new Map<string, CartPromotionGroup>();
  sources.forEach(({ product, quantity, selected }) => {
    const activity = getPromotionActivity(product);
    if (!activity || quantity <= 0) return;
    const amount = Number(product.price) * quantity;
    const group = groups.get(activity.id) ?? {
      activity,
      totalAmount: 0,
      totalQuantity: 0,
      selectedAmount: 0,
      selectedQuantity: 0,
      lines: [],
    };
    group.totalAmount += amount;
    group.totalQuantity += quantity;
    if (selected) {
      group.selectedAmount += amount;
      group.selectedQuantity += quantity;
    }
    group.lines.push({ product, quantity, selected });
    groups.set(activity.id, group);
  });
  return Array.from(groups.values());
};
const groupConfirmOrderPromotions = (lines: ConfirmOrderLine[]) => {
  const groups = new Map<string, ConfirmOrderPromotionGroup>();
  lines.forEach((line) => {
    const activity = getPromotionActivity(line);
    const key = activity?.id ?? "ordinary";
    const group = groups.get(key) ?? { key, activity, lines: [] };
    group.lines.push(line);
    groups.set(key, group);
  });
  return Array.from(groups.values());
};
const getConfirmOrderPromotionMetrics = (group: ConfirmOrderPromotionGroup) => {
  const triggerLines = group.lines.filter((line) => !line.benefitType);
  return {
    triggerLines,
    triggerAmount: triggerLines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    triggerQuantity: triggerLines.reduce((sum, line) => sum + line.quantity, 0),
    selectedGiftCount: group.lines.filter((line) => line.benefitType === "gift").reduce((sum, line) => sum + line.quantity, 0),
    selectedExchangeCount: group.lines.filter((line) => line.benefitType === "exchange").reduce((sum, line) => sum + line.quantity, 0),
  };
};
const getCartPromotionRequirementState = (group: CartPromotionGroup) => getPromotionRequirementState(
  group.activity,
  group.selectedAmount,
  group.selectedQuantity,
  group.lines,
);
const getConfirmOrderPromotionRequirementState = (group: ConfirmOrderPromotionGroup) => {
  const metrics = getConfirmOrderPromotionMetrics(group);
  if (!group.activity) return null;
  return getPromotionRequirementState(
    group.activity,
    metrics.triggerAmount,
    metrics.triggerQuantity,
    metrics.triggerLines.map((line) => ({
      product: {
        id: line.id,
        price: line.price.toFixed(2),
        itemAmountThreshold: line.itemAmountThreshold,
        itemQuantityThreshold: line.itemQuantityThreshold,
      },
      quantity: line.quantity,
      selected: true,
    })),
  );
};
const getConfirmOrderBenefitLabel = (line: ConfirmOrderLine) => {
  if (line.benefitType === "exchange") return "换购商品";
  return "赠送商品";
};
const getOrderDetailProductLabel = (line: ConfirmOrderLine) => {
  if (line.benefitType) return getConfirmOrderBenefitLabel(line);
  return getPromotionActivity(line)?.type === "combo" && line.quantityLocked ? "组合" : null;
};
const allocateComboPrices = (items: DetailProduct[], comboPrice: number) => {
  const storePriceCents = items.map((item) => Math.round(Number(item.price) * 100));
  const requiredQuantities = items.map(getComboComponentRequiredQuantity);
  const storePriceTotal = storePriceCents.reduce((sum, price, index) => sum + price * requiredQuantities[index], 0);
  const comboPriceCents = Math.round(comboPrice * 100);
  if (!storePriceTotal) return items.map(() => 0);

  const allocatedCents = storePriceCents.map((price) => Math.round(comboPriceCents * price / storePriceTotal));
  const roundingDifference = comboPriceCents - allocatedCents.reduce((sum, price, index) => sum + price * requiredQuantities[index], 0);
  const singleQuantityIndex = requiredQuantities.findIndex((quantity) => quantity === 1);
  if (singleQuantityIndex >= 0) allocatedCents[singleQuantityIndex] += roundingDifference;
  return allocatedCents.map((price) => price / 100);
};
const displayPromotion = (promotion: string) => promotion === COMBO_PROMOTION ? COMBO_PROMOTION_LABEL : promotion;
const getComboComponentInventory = (product: DetailProduct) => {
  const fallback = COMBO_COMPONENT_INVENTORY[product.id];
  return {
    stock: product.stock ?? fallback?.stock ?? 0,
    unit: product.stockUnit ?? fallback?.unit ?? "",
    requiredQuantity: Math.max(1, product.comboQuantity ?? fallback?.requiredQuantity ?? 1),
  };
};
const getComboComponentInventoryLabel = (product: DetailProduct) => {
  const { stock, unit } = getComboComponentInventory(product);
  return unit ? `库存${stock}${unit}` : "";
};
const getComboComponentRequiredQuantity = (product: DetailProduct) => getComboComponentInventory(product).requiredQuantity;
const calculateComboStock = (products: DetailProduct[]) => products.length
  ? Math.min(...products.map((product) => {
    const { stock, requiredQuantity } = getComboComponentInventory(product);
    return Math.floor(stock / requiredQuantity);
  }))
  : 0;

const copy = {
  store: "\u5343\u91d1\u5927\u836f\u623f\u81ea\u8425\u5546\u57ce",
  search: "\u641c\u7d22",
  home: "\u9996\u9875",
  category: "\u5546\u54c1\u5206\u7c7b",
  cart: "\u8d2d\u7269\u8f66",
  profile: "\u4f1a\u5458\u4e2d\u5fc3",
  qualification: "\u8d44\u8d28\u89c4\u5219",
  service: "\u5ba2\u670d",
  all: "\u5168\u90e8",
  defaultSort: "\u9ed8\u8ba4",
  sales: "\u9500\u91cf",
  price: "\u4ef7\u683c",
  tip: "\u5904\u65b9\u836f\u987b\u51ed\u5904\u65b9\u5728\u836f\u5e08\u6307\u5bfc\u4e0b\u8d2d\u4e70\u548c\u4f7f\u7528",
  total: "\u5408\u8ba1",
  checkout: "\u53bb\u4e0b\u5355",
  delivery: "\u9a91\u624b",
  express: "\u5feb\u9012",
  pickup: "\u81ea\u63d0",
  invalid: "\u4ee5\u4e0b\u4e3a\u5931\u6548\u5546\u54c1",
  clear: "\u6e05\u7a7a",
  coupons: "\u4f18\u60e0\u5238",
  invoice: "\u53d1\u7968",
  payment: "\u652f\u4ed8\u65b9\u5f0f",
  remark: "\u5907\u6ce8",
  unused: "\u672a\u4f7f\u7528",
  noInvoice: "\u4e0d\u5f00\u53d1\u7968",
  wechatPay: "\u5fae\u4fe1\u652f\u4ed8",
  fillRemark: "\u8bf7\u586b\u5199\u5907\u6ce8",
  addCart: "\u52a0\u5165\u8d2d\u7269\u8f66",
  emptyCart: "\u8d2d\u7269\u8f66\u8fd8\u662f\u7a7a\u7684",
  chooseGoods: "\u53bb\u9009\u8d2d",
  medicine: "\u836f",
  member: "\u5343\u91d1\u4f1a\u5458",
  memberNote: "\u767b\u5f55\u540e\u4eab\u53d7\u4f1a\u5458\u4e13\u5c5e\u670d\u52a1",
  myOrders: "\u6211\u7684\u8ba2\u5355",
  allOrders: "\u67e5\u770b\u5168\u90e8",
  commonServices: "\u5e38\u7528\u670d\u52a1",
  allSelected: "\u5168\u9009",
  payNow: "\u7acb\u5373\u652f\u4ed8",
  viewCart: "\u67e5\u770b\u8d2d\u7269\u8f66",
  pieces: "\u4ef6\u5546\u54c1",
  totalPieces: "\u5171",
  detail: "\u5546\u54c1\u8be6\u60c5",
  antiviral: "\u56db\u5b63\u6297\u75c5\u6bd2\u80f6\u56ca/ZQ/A",
  specification: "\u89c4\u683c",
  discount: "\u4f18\u60e0",
  dosage: "2\u677f*12\u7c92",
  sendTo: "\u9001\u81f3",
  chooseAddress: "\u8bf7\u9009\u62e9\u5730\u5740",
  deliveryText: "\u914d\u9001",
  expressDelivery: "\u5feb\u9012\u9001",
  serviceText: "\u670d\u52a1",
  chainStores: "\u8fde\u9501\u95e8\u5e97",
  genuine: "\u6b63\u54c1\u4fdd\u8bc1",
  complete: "\u54c1\u79cd\u66f4\u5168",
  share: "\u5206\u4eab",
  joinCart: "\u52a0\u5165\u8d2d\u7269\u8f66",
  buyNow: "\u7acb\u5373\u8d2d\u4e70",
  promotion: "\u6ee1200\u4eab\u8d60\u54c1",
  addAddress: "\u8bf7\u6dfb\u52a0\u6536\u8d27\u5730\u5740",
};

const categories = [
  "\u611f\u5192\u7528\u836f",
  "\u80a0\u80c3\u7528\u836f",
  "\u8425\u517b\u4fdd\u5065",
  "\u8ba1\u751f\u7528\u54c1",
  "\u5fc3\u8111\u8840\u7ba1",
  "\u513f\u79d1\u7528\u836f",
  "\u5987\u79d1\u7528\u836f",
  "\u836f\u6750\u996e\u7247",
  "\u53e3\u7f69\u7528\u54c1",
  "\u89e3\u70ed\u9547\u75db",
];

const homeProducts = [
  { id: "h1", name: "\u56db\u5b63\u6297\u75c5\u6bd2\u80f6\u56ca...", price: "38", image: "/assets/home-reference/product-1.png" },
  { id: "h2", name: "\u8fde\u82b1\u6e05\u761f\u80f6\u56ca/...", price: "29.8", image: "/assets/home-reference/product-2.png" },
  { id: "h3", name: "\u590d\u65b9\u91d1\u94f6\u82b1\u9897\u7c92", price: "39.8", image: "/assets/home-reference/product-3.png" },
  { id: "h4", name: "\u53c2\u82aa\u5065\u80c3\u9897\u7c92", price: "46", image: "/assets/home-reference/product-4.png" },
  { id: "h5", name: "\u4e73\u9178\u83cc\u7d20\u7247", price: "25", image: "/assets/home-reference/product-5.png" },
  { id: "h6", name: "\u6e29\u80c3\u8212\u9897\u7c92", price: "35", image: "/assets/home-reference/product-6.png" },
  { id: "h7", name: "\u84b2\u5730\u84dd\u6d88\u708e\u53e3\u670d\u6db2", price: "38", image: "/assets/home-reference/product-1.png" },
  { id: "h8", name: "\u5c0f\u513f\u611f\u5192\u9897\u7c92", price: "16.8", image: "/assets/home-reference/product-2.png" },
  { id: "h9", name: "\u8499\u8131\u77f3\u6563", price: "21.5", image: "/assets/home-reference/product-3.png" },
  { id: "h10", name: "\u964d\u706b\u6e05\u80c3\u9897\u7c92", price: "25.8", image: "/assets/home-reference/product-4.png" },
  { id: "h11", name: "\u7ef4\u751f\u7d20C\u542b\u7247", price: "12.9", image: "/assets/home-reference/product-5.png" },
  { id: "h12", name: "\u68c0\u9ec4\u9178\u94dd\u7247", price: "19.9", image: "/assets/home-reference/product-6.png" },
];

const homePromotions: Record<string, string> = {
  h1: "\u9650\u65f69\u6298",
  h2: "\u6ee1\u51cf\u6ee1\u8d60",
  h3: "\u6ee1\u51cf\u6ee1\u8d60",
  h5: "\u6ee1\u51cf\u6ee1\u8d60",
  h6: "\u9650\u65f69\u6298",
  h7: "\u6ee1\u51cf\u6ee1\u8d60",
  h8: "\u6ee1\u51cf\u6ee1\u8d60",
  h10: "\u9650\u65f6\u7279\u4ef7",
  h11: "\u9650\u65f6\u51cf3.88",
};

const homeDetailProducts: Record<string, DetailProduct> = {
  h1: { id: "h1", name: "\u56db\u5b63\u6297\u75c5\u6bd2\u80f6\u56ca/ZQ/A", spec: "2\u677f*12\u7c92", price: "38.00", tag: "OTC", promotion: "\u9650\u65f69\u6298", activityId: "ACT-LD-9", image: "/assets/home-reference/detail-antiviral.png" },
  h2: { id: "h2", name: "\u8fde\u82b1\u6e05\u761f\u80f6\u56ca/ZQ/A", spec: "0.4g*24\u7c92", price: "29.80", tag: "OTC", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-BXGY-2", itemQuantityThreshold: 3, itemAmountThreshold: 90, image: "/assets/home-reference/product-2.png" },
  h3: { id: "h3", name: "\u590d\u65b9\u91d1\u94f6\u82b1\u9897\u7c92", spec: "10g*10\u888b", price: "39.80", tag: "OTC", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-FE-300", itemQuantityThreshold: 5, itemAmountThreshold: 220, image: "/assets/home-reference/product-3.png" },
  h4: { id: "h4", name: "\u53c2\u82aa\u5065\u80c3\u9897\u7c92", comboName: "\u53c2\u82aa\u5065\u80c3\u7ec4\u5408", comboActivityImage: "/assets/home-reference/product-4.png", spec: "10g*6\u888b", price: "46.00", tag: "OTC", promotion: "\u7ec4\u5408\u4ef7", activityId: "ACT-COMBO-68", stock: 2340, stockUnit: "盒", image: "/assets/home-reference/product-4.png" },
  h5: { id: "h5", name: "\u4e73\u9178\u83cc\u7d20\u7247", spec: "0.4g*24\u7247", price: "25.00", tag: "OTC", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-FR-200-20", stock: 1170, stockUnit: "盒", itemQuantityThreshold: 4, itemAmountThreshold: 100, image: "/assets/home-reference/product-5.png" },
  h6: { id: "h6", name: "\u6e29\u80c3\u8212\u9897\u7c92", spec: "5g*6\u888b", price: "35.00", tag: "OTC", promotion: "\u9650\u65f69\u6298", activityId: "ACT-LD-9", stock: 1850, stockUnit: "盒", image: "/assets/home-reference/product-6.png" },
  h7: { id: "h7", name: "\u84b2\u5730\u84dd\u6d88\u708e\u53e3\u670d\u6db2", spec: "10ml*10\u652f", price: "38.00", tag: "OTC", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-FE-300", image: "/assets/home-reference/product-1.png" },
  h8: { id: "h8", name: "\u5c0f\u513f\u611f\u5192\u9897\u7c92", spec: "6g*10\u888b", price: "16.80", tag: "OTC", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-BXGY-2", itemQuantityThreshold: 3, itemAmountThreshold: 50, image: "/assets/home-reference/product-2.png" },
  h9: { id: "h9", name: "\u8499\u8131\u77f3\u6563", spec: "3g*10\u888b", price: "21.50", tag: "OTC", promotion: "", image: "/assets/home-reference/product-3.png" },
  h10: { id: "h10", name: "\u964d\u706b\u6e05\u80c3\u9897\u7c92", spec: "10g*6\u888b", price: "25.80", tag: "OTC", promotion: "\u9650\u65f6\u7279\u4ef7", activityId: "ACT-LS-1", image: "/assets/home-reference/product-4.png" },
  h11: { id: "h11", name: "\u7ef4\u751f\u7d20C\u542b\u7247", spec: "1g*30\u7247", price: "12.90", tag: "OTC", promotion: "\u9650\u65f6\u51cf3.88", activityId: "ACT-LR-3.88", image: "/assets/home-reference/product-5.png" },
  h12: { id: "h12", name: "\u68c0\u9ec4\u9178\u94dd\u7247", spec: "0.5g*36\u7247", price: "19.90", tag: "OTC", promotion: "", image: "/assets/home-reference/product-6.png" },
};

const defaultDetailInfo = (product: DetailProduct): DetailInfo => ({
  code: `QJ-${product.id.toUpperCase()}`,
  genericName: product.name.split("/")[0],
  manufacturer: "以商品包装标示为准",
  approval: "以商品包装标示为准",
  indication: "请仔细阅读药品说明书，并在医师或药师指导下购买和使用。",
  dosage: "请按药品说明书或遵医嘱使用。",
  form: "以商品包装标示为准",
  unit: "盒",
});

const detailInfoById: Record<string, DetailInfo> = {
  h1: {
    code: "065566",
    genericName: "四季抗病毒胶囊",
    manufacturer: "陕西海天制药有限公司",
    approval: "国药准字Z20050328",
    indication: "具有清热解毒、消炎退热的功效。用于上呼吸道感染、病毒性感冒、流感等病毒性感染疾患。",
    dosage: "口服。成人一次3～6粒，一日3次；儿童用量请遵医嘱。",
    form: "胶囊剂",
    unit: "盒",
  },
};

const orderCoupons: OrderCoupon[] = [
  { id: "pos-discount", name: "POS+ 商城渠道测试专用折扣券-刘信", discount: 0.8, discountLabel: "9折", threshold: "满1可用", dateRange: "2026-08-19-2026-08-31" },
  { id: "mall-discount", name: "测试-商城专用折扣券-刘信", discount: 0.8, discountLabel: "9折", threshold: "满1可用", dateRange: "2026-08-21-2026-08-31" },
  { id: "pos-amount", name: "POS+ 商城渠道测试专用金额券-刘信", discount: 2, discountLabel: "¥2", threshold: "满100可用", dateRange: "2026-08-19-2026-08-31", unavailableReason: "适用商品金额未达到使用门槛" },
  { id: "mall-amount", name: "商城渠道测试专用金额券-刘信", discount: 1, discountLabel: "¥1", threshold: "满100可用", dateRange: "2026-08-19-2026-08-31", unavailableReason: "当前优惠券不可用" },
];
const detailCoupons: DetailCoupon[] = [
  { id: "detail-5", value: 5, name: "满50减5元", scope: "全场非特价商品可用", expiry: "2026-12-31" },
  { id: "detail-new-10", value: 10, name: "新人专享10元", scope: "限本商品使用", expiry: "2026-06-30" },
  { id: "detail-15", value: 15, name: "满100减15元", scope: "指定品类可用", expiry: "2026-08-31", preclaimed: true },
];

const catalogTabs = [
  "\u611f\u5192\u7528\u836f",
  "\u809d\u80c6\u7528\u836f",
  "\u6e05\u70ed\u836f",
  "\u547c\u5438\u7cfb\u7edf",
  "\u5fc3\u8111\u8840\u7ba1",
  "\u86cb\u767d\u8d28",
  "\u89e3\u70ed\u9547\u75db",
  "\u513f\u79d1\u7528\u836f",
  "\u6297\u83cc\u6d88\u708e",
];

const illness = ["\u5168\u90e8", "\u75c5\u6bd2\u6027\u611f\u5192", "\u98ce\u70ed\u611f\u5192", "\u666e\u901a\u611f\u5192/\u6d41\u611f"];

const referenceCategoryTabs = [
  "\u611f\u5192\u7528\u836f", "\u80c3\u80a0\u7528\u836f", "\u5fc3\u8111\u8840\u7ba1", "\u547c\u5438\u7cfb\u7edf",
  "\u513f\u79d1\u7528\u836f", "\u5987\u79d1\u7528\u836f", "\u89e3\u70ed\u9547\u75db", "\u98ce\u6e7f\u9aa8\u4f24",
  "\u8f85\u52a9\u7406\u7597", "\u6539\u5584\u7761\u7720", "\u809d\u80c6\u7528\u836f", "\u9aa8\u9abc\u5065\u5eb7",
  "\u6d77\u6d0b\u751f\u7269\u63d0\u53d6\u7269", "\u86cb\u767d\u8d28", "\u5065\u5eb7\u4eea\u5668", "\u5c45\u5bb6\u62a4\u7406",
];

const referenceCategoryProducts = [
  { id: "cold-1", name: "\u98ce\u5bd2\u611f\u5192\u9897\u7c92/SXYJ/B", price: "8.00", promotion: "\u9650\u65f69\u6298", activityId: "ACT-LD-9", image: "/assets/category-reference/cold-1.png" },
  { id: "cold-2", name: "\u5c0f\u67f4\u80e1\u9897\u7c92/ZQ/B", price: "10.74", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-FG-200", itemQuantityThreshold: 5, itemAmountThreshold: 60, image: "/assets/category-reference/cold-2.png" },
  { id: "cold-3", name: "\u5348\u65f6\u8336\u9897\u7c92/ZQ/C", price: "12.50", promotion: "\u9650\u65f69\u6298", activityId: "ACT-LD-9", image: "/assets/category-reference/cold-3.png" },
  { id: "cold-4", name: "\u590d\u65b9\u6c28\u916a\u70f7\u80fa\u80f6\u56ca/ZQ/A", price: "12.50", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-FE-300", itemQuantityThreshold: 4, itemAmountThreshold: 50, image: "/assets/category-reference/cold-4.png" },
  { id: "cold-5", name: "\u590d\u65b9\u6c28\u916a\u70f7\u80fa\u7247/ZQ/A", price: "15.00", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-FR-200-20", itemQuantityThreshold: 4, itemAmountThreshold: 60, image: "/assets/category-reference/cold-5.png" },
  { id: "cold-6", name: "\u611f\u5192\u6e05\u70ed\u9897\u7c92/ZQ/A", price: "9.90", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-BXGY-2", itemQuantityThreshold: 4, itemAmountThreshold: 40, image: "/assets/category-reference/cold-1.png" },
  { id: "cold-8", name: "\u677f\u84dd\u6839\u9897\u7c92/ZQ/C", price: "14.80", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-FE-300", itemQuantityThreshold: 4, itemAmountThreshold: 60, image: "/assets/category-reference/cold-3.png" },
  { id: "cold-9", name: "\u5c0f\u513f\u6c28\u916a\u70f7\u80fa\u9897\u7c92/ZQ/A", price: "22.00", promotion: "\u9650\u65f6\u51cf3.88", activityId: "ACT-LR-3.88", image: "/assets/category-reference/cold-4.png" },
  { id: "cold-10", name: "\u590d\u65b9\u611f\u5192\u7075\u9897\u7c92/ZQ/A", price: "17.60", promotion: "\u9650\u65f6\u7279\u4ef7", activityId: "ACT-LS-1", image: "/assets/category-reference/cold-5.png" },
];

const exchangeProducts = [
  { id: "exchange-1", name: "\u98ce\u5bd2\u611f\u5192\u9897\u7c92/SXYJ/B", spec: "8g*9\u888b", price: "4.70", original: "8.00", image: "/assets/category-reference/cold-1.png" },
  { id: "exchange-2", name: "\u5c0f\u67f4\u80e1\u9897\u7c92/ZQ/B", spec: "10g*10\u888b", price: "6.90", original: "10.74", image: "/assets/category-reference/cold-2.png" },
  { id: "exchange-3", name: "\u5348\u65f6\u8336\u9897\u7c92/ZQ/C", spec: "8g*9\u888b", price: "8.80", original: "12.50", image: "/assets/category-reference/cold-3.png" },
  { id: "exchange-4", name: "\u590d\u65b9\u6c28\u916a\u70f7\u80fa\u80f6\u56ca/ZQ/A", spec: "12\u7c92*2\u677f", price: "8.90", original: "12.50", image: "/assets/category-reference/cold-4.png" },
  { id: "exchange-5", name: "\u590d\u65b9\u6c28\u916a\u70f7\u80fa\u7247/ZQ/A", spec: "12\u7247", price: "10.50", original: "15.00", image: "/assets/category-reference/cold-5.png" },
];

const giftProducts = [
  { id: "gift-1", name: homeDetailProducts.h2.name, spec: homeDetailProducts.h2.spec, price: "0.00", image: homeDetailProducts.h2.image },
  { id: "gift-2", name: homeDetailProducts.h5.name, spec: homeDetailProducts.h5.spec, price: "0.00", image: homeDetailProducts.h5.image },
  { id: "gift-3", name: homeDetailProducts.h6.name, spec: homeDetailProducts.h6.spec, price: "0.00", image: homeDetailProducts.h6.image },
];

const searchProducts = [
  { id: "pudi-1", name: "\u84b2\u5730\u84dd\u6d88\u708e\u53e3\u670d\u6db2(OTC)/ZQ/YL/C", price: "38.00", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-FR-200-20", itemQuantityThreshold: 3, itemAmountThreshold: 120, image: "/assets/category-reference/cold-1.png" },
  { id: "pudi-2", name: "\u84b2\u5730\u84dd\u6d88\u708e\u7247/ZQ/A", price: "18.00", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-FG-200", itemQuantityThreshold: 3, itemAmountThreshold: 54, image: "/assets/category-reference/cold-2.png" },
  { id: "pudi-3", name: "\u84b2\u5730\u84dd\u6d88\u708e\u7247/YP/A", price: "19.00", promotion: "\u9650\u65f69\u6298", activityId: "ACT-LD-9", image: "/assets/category-reference/cold-3.png" },
  { id: "pudi-4", name: "\u84b2\u5730\u84dd\u6d88\u708e\u7247/SXYJ/DZ/A", price: "21.00", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-FE-300", itemQuantityThreshold: 4, itemAmountThreshold: 80, image: "/assets/category-reference/cold-4.png" },
  { id: "pudi-5", name: "\u84b2\u5730\u84dd\u6d88\u708e\u7247/ZQ/A", price: "22.00", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-FR-200-20", itemQuantityThreshold: 4, itemAmountThreshold: 88, image: "/assets/category-reference/cold-5.png" },
  { id: "pudi-7", name: "\u84b2\u5730\u84dd\u6d88\u708e\u7247/ZQ/B", price: "20.80", promotion: "\u6ee1\u51cf\u6ee1\u8d60", activityId: "ACT-BXGY-2", itemQuantityThreshold: 3, itemAmountThreshold: 60, image: "/assets/category-reference/cold-3.png" },
];

const searchComboActivities: SearchComboActivity[] = [
  {
    id: "ACT-COMBO-68",
    name: "蒲地蓝清热组合",
    productCount: 3,
    price: COMBO_PURCHASE_PRICE.toFixed(2),
    image: "/assets/category-reference/cold-2.png",
    detailProduct: {
      id: "combo-pudi-68",
      name: "蒲地蓝清热组合",
      comboName: "蒲地蓝清热组合",
      spec: "3件组合装",
      price: COMBO_PURCHASE_PRICE.toFixed(2),
      tag: "OTC",
      promotion: COMBO_PROMOTION,
      activityId: "ACT-COMBO-68",
      stock: 2340,
      stockUnit: "盒",
      image: "/assets/category-reference/cold-2.png",
    },
  },
];

const productComboActivities: SearchComboActivity[] = [
  { id: "ACT-COMBO-STOMACH-68", name: "参芪健胃组合", productCount: 3, price: "68.00", image: homeDetailProducts.h4.image, detailProduct: homeDetailProducts.h4,
    products: [{ ...homeDetailProducts.h4, comboUnitPrice: 28, comboQuantity: 1 }, { ...homeDetailProducts.h5, comboUnitPrice: 8, comboQuantity: 2 }, { ...homeDetailProducts.h6, comboUnitPrice: 8, comboQuantity: 3 }] },
  { id: "ACT-COMBO-STOMACH-46", name: "日常养胃组合", productCount: 2, price: "46.00", image: homeDetailProducts.h4.image, detailProduct: homeDetailProducts.h4,
    products: [{ ...homeDetailProducts.h4, comboUnitPrice: 30, comboQuantity: 1 }, { ...homeDetailProducts.h5, comboUnitPrice: 8, comboQuantity: 2 }] },
];
productComboActivities.push(
  { id: "ACT-COMBO-STOMACH-48", name: "双品便携组合", productCount: 2, price: "48.00", image: homeDetailProducts.h4.image, detailProduct: homeDetailProducts.h4,
    products: [{ ...homeDetailProducts.h4, comboUnitPrice: 30, comboQuantity: 1 }, { ...homeDetailProducts.h6, comboUnitPrice: 18, comboQuantity: 1 }] },
  { id: "ACT-COMBO-STOMACH-76", name: "家庭常备组合", productCount: 3, price: "76.00", image: homeDetailProducts.h4.image, detailProduct: homeDetailProducts.h4,
    products: [{ ...homeDetailProducts.h4, comboUnitPrice: 24, comboQuantity: 2 }, { ...homeDetailProducts.h5, comboUnitPrice: 10, comboQuantity: 1 }, { ...homeDetailProducts.h6, comboUnitPrice: 18, comboQuantity: 1 }] },
  { id: "ACT-COMBO-STOMACH-60", name: "双品实惠组合", productCount: 2, price: "60.00", image: homeDetailProducts.h4.image, detailProduct: homeDetailProducts.h4,
    products: [{ ...homeDetailProducts.h4, comboUnitPrice: 25, comboQuantity: 2 }, { ...homeDetailProducts.h5, comboUnitPrice: 10, comboQuantity: 1 }] },
  { id: "ACT-COMBO-STOMACH-88", name: "三品分享组合", productCount: 3, price: "88.00", image: homeDetailProducts.h4.image, detailProduct: homeDetailProducts.h4,
    products: [{ ...homeDetailProducts.h4, comboUnitPrice: 25, comboQuantity: 2 }, { ...homeDetailProducts.h5, comboUnitPrice: 9, comboQuantity: 2 }, { ...homeDetailProducts.h6, comboUnitPrice: 10, comboQuantity: 2 }] },
);
const allComboActivities = [...productComboActivities, ...searchComboActivities];
const comboProductsFor = (activity: SearchComboActivity) => activity.products ?? [{ ...activity.detailProduct, comboUnitPrice: 28, comboQuantity: 1 }, { ...homeDetailProducts.h5, comboUnitPrice: 8, comboQuantity: 2 }, { ...homeDetailProducts.h6, comboUnitPrice: 8, comboQuantity: 3 }];
const comboPricesFor = (activity: SearchComboActivity) => comboProductsFor(activity).map(item => item.comboUnitPrice ?? Number(item.price));
for (const activity of allComboActivities) PROMOTION_ACTIVITIES[activity.id] = { ...PROMOTION_ACTIVITIES["ACT-COMBO-68"], id: activity.id };
type ComboCartEntry = { activity: SearchComboActivity; quantity: number; selected: boolean };

const invalidComboCartSample = {
  name: "参芪健胃组合",
  price: COMBO_PURCHASE_PRICE.toFixed(2),
  image: "/assets/home-reference/product-4.png",
};

const categoryCartProducts = [...referenceCategoryProducts, ...searchProducts];

const originalPriceForPromotion = (price: string, promotion: string) => {
  if (!promotion.startsWith("\u9650\u65f6")) return null;
  const reduction = promotion.match(/\u51cf(\d+(?:\.\d+)?)/);
  const original = reduction ? Number(price) + Number(reduction[1]) : Number(price) / 0.9;
  return original.toFixed(2);
};

const categoryDetailProduct = (item: (typeof referenceCategoryProducts)[number]): DetailProduct => ({ ...item, spec: "8g*9\u888b", tag: "OTC" });
const searchDetailProduct = (item: (typeof searchProducts)[number]): DetailProduct => ({ ...item, spec: "10\u652f/\u76d2", tag: "OTC" });

const products: Product[] = [
  { id: "p1", name: "\u5c0f\u513f\u6c28\u916a\u70f7\u80fa\u9897\u7c92 /ZQ/A", spec: "\u89c4\u683c 6g*15\u888b", price: 0.01, tag: "OTC", tone: "blue" },
  { id: "p2", name: "\u53cc\u9ec4\u8fde\u9897\u7c92 /ZQ/A/TT", spec: "\u89c4\u683c 5g*9\u888b", price: 33, tag: "OTC", tone: "yellow" },
  { id: "p3", name: "\u6c28\u5496\u9ec4\u654f\u80f6\u56ca\uff08\u66ff\u4ee3 070841\uff09/A", spec: "\u89c4\u683c 12\u7c92*2\u677f", price: 90, tag: "OTC", tone: "purple" },
  { id: "p4", name: "\u78f7\u9178\u5965\u53f8\u4ed6\u97e6\u80f6\u56ca /ZQ/B", spec: "\u89c4\u683c 75mg*10\u7c92", price: 13.96, tag: "\u5904\u65b9\u836f", tone: "orange" },
  { id: "p5", name: "\u590d\u65b9\u6c28\u916a\u70f7\u80fa\u7247\uff08\u611f\u5192\u8212\uff09/ZQ/YL/B", spec: "\u89c4\u683c 12\u7247", price: 16, tag: "OTC", tone: "white" },
];

function useFloatingButtonDrag(minTop: number, bottomBoundarySelector: string) {
  const [position, setPosition] = useState<FloatingPosition | null>(null);
  const [dragging, setDragging] = useState(false);
  const sessionRef = useRef<FloatingDragSession | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanupRef.current?.(), []);

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    cleanupRef.current?.();
    const button = event.currentTarget;
    const container = button.closest<HTMLElement>(".source-app");
    if (!container) return;
    const buttonRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const scaleX = container.clientWidth / containerRect.width;
    const scaleY = container.clientHeight / containerRect.height;
    const session = {
      pointerId: event.pointerId,
      left: (event.clientX - buttonRect.left) * scaleX,
      top: (event.clientY - buttonRect.top) * scaleY,
      scaleX,
      scaleY,
    };
    sessionRef.current = session;
    setPosition((current) => current ?? {
      left: (buttonRect.left - containerRect.left) * scaleX,
      top: (buttonRect.top - containerRect.top) * scaleY,
    });
    setDragging(true);

    const updatePosition = (clientX: number, clientY: number) => {
      if (sessionRef.current !== session) return;
      const currentContainerRect = container.getBoundingClientRect();
      const boundaryRect = container.querySelector<HTMLElement>(bottomBoundarySelector)?.getBoundingClientRect();
      const left = Math.min(
        Math.max(8, (clientX - currentContainerRect.left) * session.scaleX - session.left),
        container.clientWidth - button.offsetWidth - 8,
      );
      const boundaryTop = boundaryRect
        ? (boundaryRect.top - currentContainerRect.top) * session.scaleY
        : container.clientHeight;
      const maxTop = Math.max(minTop, boundaryTop - button.offsetHeight - 8);
      const top = Math.min(
        Math.max(minTop, (clientY - currentContainerRect.top) * session.scaleY - session.top),
        maxTop,
      );
      setPosition({ left, top });
    };
    const onPointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== session.pointerId) return;
      moveEvent.preventDefault();
      updatePosition(moveEvent.clientX, moveEvent.clientY);
    };
    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      updatePosition(moveEvent.clientX, moveEvent.clientY);
    };
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      window.removeEventListener("mouseup", finish);
      if (sessionRef.current === session) sessionRef.current = null;
      if (cleanupRef.current === finish) cleanupRef.current = null;
      setDragging(false);
      try {
        if (button.hasPointerCapture(session.pointerId)) button.releasePointerCapture(session.pointerId);
      } catch {
        // Pointer capture can already be gone after a browser-level cancel.
      }
    };
    cleanupRef.current = finish;
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("mousemove", onMouseMove, { passive: false });
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    window.addEventListener("mouseup", finish);
    event.preventDefault();
    try {
      button.setPointerCapture(event.pointerId);
    } catch {
      // Window listeners still keep desktop and touch dragging active.
    }
  };

  return { position, dragging, onPointerDown };
}

function Pack({ item, compact = false }: { item: Product; compact?: boolean }) {
  return (
    <div className={`pack pack-${item.tone} ${compact ? "pack-compact" : ""}`}>
      <b>{item.tag}</b><span>{copy.store}</span><em>{compact ? "" : "HEALTH"}</em>
    </div>
  );
}

export default function Prototype() {
  const keyboard = useKeyboard();
  const [view, setView] = useState<View>("home");
  const [activeTag, setActiveTag] = useState(copy.all);
  const [activeSide, setActiveSide] = useState(catalogTabs[0]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [categoryCart, setCategoryCart] = useState<Record<string, number>>({});
  const [cartItemQuantity, setCartItemQuantity] = useState(1);
  const [cartItemSelected, setCartItemSelected] = useState(true);
  const [cartItemSelections, setCartItemSelections] = useState<Record<string, boolean>>({});
  const [comboCartEntries, setComboCartEntries] = useState<ComboCartEntry[]>([]);
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
  const [invalidComboCartPresent, setInvalidComboCartPresent] = useState(true);
  const [comboGiftsOpen, setComboGiftsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchComboSheetActivity, setSearchComboSheetActivity] = useState<SearchComboActivity | null>(null);
  const [searchComboSheetOpen, setSearchComboSheetOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [discountDetailOpen, setDiscountDetailOpen] = useState(false);
  const [discountPromotionExpanded, setDiscountPromotionExpanded] = useState(false);
  const [couponClaimed, setCouponClaimed] = useState(false);
  const [detailBenefitsOpen, setDetailBenefitsOpen] = useState(false);
  const [detailCouponClaimIds, setDetailCouponClaimIds] = useState<Record<string, boolean>>({});
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [exchangeSelected, setExchangeSelected] = useState<Record<string, boolean>>({});
  const [exchangeCartSelected, setExchangeCartSelected] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftSelectedId, setGiftSelectedId] = useState("");
  const [giftCartSelected, setGiftCartSelected] = useState(true);
  const [pieceGiftOpen, setPieceGiftOpen] = useState(false);
  const [pieceGiftSelections, setPieceGiftSelections] = useState<Record<string, number>>({});
  const [giftCheckoutPromptOpen, setGiftCheckoutPromptOpen] = useState(false);
  const [exchangeToast, setExchangeToast] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [detailPurchaseOpen, setDetailPurchaseOpen] = useState(false);
  const [detailPurchaseMode, setDetailPurchaseMode] = useState<"cart" | "buy">("cart");
  const [detailPurchaseQuantity, setDetailPurchaseQuantity] = useState(1);
  const [comboPurchaseOpen, setComboPurchaseOpen] = useState(false);
  const [comboPurchaseMode, setComboPurchaseMode] = useState<"cart" | "buy">("cart");
  const [comboPurchaseQuantity, setComboPurchaseQuantity] = useState(1);
  const [confirmOrderLines, setConfirmOrderLines] = useState<ConfirmOrderLine[]>([{ id: homeDetailProducts.h1.id, name: homeDetailProducts.h1.name, spec: homeDetailProducts.h1.spec, price: Number(homeDetailProducts.h1.price), originalPrice: originalPriceForPromotion(homeDetailProducts.h1.price, homeDetailProducts.h1.promotion), image: homeDetailProducts.h1.image, quantity: 1, activityId: homeDetailProducts.h1.activityId }]);
  const [confirmOrderDiscount, setConfirmOrderDiscount] = useState(0);
  const [couponPickerOpen, setCouponPickerOpen] = useState(false);
  const [confirmBenefitPickerActivityId, setConfirmBenefitPickerActivityId] = useState("");
  const [selectedConfirmCouponId, setSelectedConfirmCouponId] = useState("");
  const [pendingConfirmCouponId, setPendingConfirmCouponId] = useState("");
  const [confirmOrderFrom, setConfirmOrderFrom] = useState<View>("detail");
  const [delivery, setDelivery] = useState(copy.express);
  const [detailFrom, setDetailFrom] = useState<View>("home");
  const [detailProduct, setDetailProduct] = useState<DetailProduct>(homeDetailProducts.h1);
  const [singleCartItem, setSingleCartItem] = useState<DetailProduct | null>(null);
  const [orderCanceled, setOrderCanceled] = useState(false);
  const [orderDetailFrom, setOrderDetailFrom] = useState<View>("profile");
  const [paidOrder, setPaidOrder] = useState<PaidOrderSnapshot | null>(null);
  const detailEvaluationRef = useRef<HTMLElement>(null);
  const detailProductRef = useRef<HTMLElement>(null);
  const homeServiceDrag = useFloatingButtonDrag(137, ".source-nav");
  const detailServiceDrag = useFloatingButtonDrag(112, ".detail-actionbar");
  const notifyProfileAction = (label: string) => {
    if (label === "待支付") {
      keyboard.hide();
      setSheet(false);
      setSearchOpen(false);
      setOrderCanceled(false);
      setOrderDetailFrom("profile");
      setView("order-detail");
      return;
    }
    setExchangeToast(`${label}功能开发中`);
    window.setTimeout(() => setExchangeToast(""), 1600);
  };
  const dismissKeyboard = () => {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) activeElement.blur();
    keyboard.hide();
  };
  useEffect(() => {
    if (keyboard.visible) dismissKeyboard();
  }, [keyboard.visible]);
  useEffect(() => {
    if (!detailPurchaseOpen && !comboPurchaseOpen) return;
    dismissKeyboard();
    const frame = window.requestAnimationFrame(dismissKeyboard);
    return () => window.cancelAnimationFrame(frame);
  }, [detailPurchaseOpen, comboPurchaseOpen]);
  const canonicalDetailPrice = homeDetailProducts[detailProduct.id]?.price
    ?? referenceCategoryProducts.find((item) => item.id === detailProduct.id)?.price
    ?? searchProducts.find((item) => item.id === detailProduct.id)?.price
    ?? searchComboActivities.find((activity) => activity.detailProduct.id === detailProduct.id)?.price;
  useEffect(() => {
    if (!canonicalDetailPrice || detailProduct.price === canonicalDetailPrice) return;
    setDetailProduct((current) => current.id === detailProduct.id ? { ...current, price: canonicalDetailPrice } : current);
  }, [canonicalDetailPrice, detailProduct.id, detailProduct.price]);
  const detailAvailableCombos = allComboActivities.filter(activity => comboProductsFor(activity).some(item => item.id === detailProduct.id));
  const selectedDetailCombo = detailAvailableCombos.find(activity => activity.id === selectedComboId) ?? detailAvailableCombos[0] ?? productComboActivities[0];
  const activeDetailCombo = searchComboSheetActivity ?? selectedDetailCombo;
  const detailComboPrice = Number(activeDetailCombo.price);
  const isDetailCombo = detailAvailableCombos.length > 0;
  const detailInfo = detailInfoById[detailProduct.id] ?? defaultDetailInfo(detailProduct);
  const detailOriginalPrice = originalPriceForPromotion(detailProduct.price, detailProduct.promotion);
  const detailPromotionActivity = getPromotionActivity(detailProduct);
  const detailPromotionThreshold = detailPromotionActivity
    ? formatThreshold(getOrderAmountThreshold(detailPromotionActivity), getOrderQuantityThreshold(detailPromotionActivity))
    : "";
  const detailPromotionTitle = !detailPromotionActivity
    ? displayPromotion(detailProduct.promotion)
    : detailPromotionActivity.type === "full-reduction"
      ? `${detailPromotionThreshold}减${detailPromotionActivity.reductionAmount ?? 0}元`
      : detailPromotionActivity.type === "full-gift"
        ? `${detailPromotionThreshold}可选1件赠品`
        : detailPromotionActivity.type === "buy-x-get-y"
          ? `${detailPromotionThreshold}享赠品`
          : detailPromotionActivity.type === "full-exchange"
            ? `${detailPromotionThreshold}可换购指定商品`
            : displayPromotion(detailProduct.promotion);
  const detailComboProducts = comboProductsFor(activeDetailCombo);
  const detailComboAllocatedPrices = comboPricesFor(activeDetailCombo);
  const detailComboStock = calculateComboStock(detailComboProducts);
  const searchComboSheetProducts = searchComboSheetActivity
    ? comboProductsFor(searchComboSheetActivity)
    : [];
  const searchComboSheetAllocatedPrices = searchComboSheetActivity ? comboPricesFor(searchComboSheetActivity) : [];
  const currentCartItem = singleCartItem ?? homeDetailProducts.h1;
  const homeCartLines = Object.values(homeDetailProducts)
    .filter((product) => (cart[product.id] || 0) > 0)
    .map((product) => ({ product, quantity: cart[product.id] || 0, selected: cartItemSelections[product.id] ?? true }));
  const categoryCartLines = categoryCartProducts
    .filter((product) => (categoryCart[product.id] || 0) > 0)
    .map((product) => ({
      product: product.id.startsWith("pudi-") ? searchDetailProduct(product) : categoryDetailProduct(product),
      quantity: categoryCart[product.id] || 0,
      selected: cartItemSelections[product.id] ?? true,
    }));
  const mappedCartLines = [...homeCartLines, ...categoryCartLines];
  const normalCartLines: CartProductLine[] = mappedCartLines.length
    ? mappedCartLines
    : cartItemQuantity > 0
      ? [{ product: currentCartItem, quantity: cartItemQuantity, selected: cartItemSelected }]
      : [];
  const comboCartItem = comboCartProducts[0] ?? homeDetailProducts.h4;
  const comboCartActivityName = comboCartActivity.comboName ?? comboCartActivity.name;
  const comboCartAllocatedPrices = comboPricesFor(summaryComboActivity);
  const comboCartStock = calculateComboStock(comboCartProducts);
  const comboChildTotalQuantity = comboCartProducts.reduce((sum, item) => sum + (summaryComboEntry?.quantity ?? 1) * getComboComponentRequiredQuantity(item), 0);
  const primaryCartSubtotal = normalCartLines.reduce((sum, line) => sum + (line.selected ? Number(line.product.price) * line.quantity : 0), 0);
  const comboCartSubtotal = comboCartEntries.reduce((sum, entry) => sum + (entry.selected ? Number(entry.activity.price) * entry.quantity : 0), 0);
  const confirmOrderSubtotal = confirmOrderLines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const confirmOrderHasCombo = confirmOrderLines.some((item) => item.id.startsWith("direct-combo-") || item.id.startsWith("cart-combo-"));
  const confirmOrderCoupons = confirmOrderHasCombo
    ? orderCoupons.map((coupon) => ({ ...coupon, unavailableReason: "组合价商品不参与优惠券活动" }))
    : orderCoupons;
  const availableConfirmOrderCoupons = confirmOrderCoupons.filter((coupon) => !coupon.unavailableReason);
  const unavailableConfirmOrderCoupons = confirmOrderCoupons.filter((coupon) => coupon.unavailableReason);
  const selectedConfirmCoupon = orderCoupons.find((coupon) => coupon.id === selectedConfirmCouponId);
  const confirmOrderCouponDiscount = selectedConfirmCoupon?.discount ?? 0;
  const confirmOrderTotal = Math.max(0, confirmOrderSubtotal - confirmOrderDiscount - confirmOrderCouponDiscount);
  const confirmOrderItemCount = confirmOrderLines.reduce((sum, item) => sum + item.quantity, 0);
  const confirmOrderSavings = confirmOrderDiscount + confirmOrderCouponDiscount;
  const confirmOrderPromotionGroups = groupConfirmOrderPromotions(confirmOrderLines);
  const isPaidOrderDetail = orderDetailFrom === "payment-success";
  const orderDetailLines = isPaidOrderDetail ? paidOrder?.lines ?? confirmOrderLines : confirmOrderLines;
  const orderDetailSubtotal = orderDetailLines.reduce((sum, item) => sum + Math.max(item.price, Number(item.originalPrice ?? item.price)) * item.quantity, 0);
  const confirmOrderPriceSaving = confirmOrderLines.reduce((sum, item) => sum + Math.max(0, Number(item.originalPrice ?? item.price) - item.price) * item.quantity, 0);
  const orderDetailPromotionSaving = isPaidOrderDetail ? paidOrder?.promotionSaving ?? (confirmOrderDiscount + confirmOrderPriceSaving) : confirmOrderDiscount + confirmOrderPriceSaving;
  const orderDetailCouponSaving = isPaidOrderDetail ? paidOrder?.couponSaving ?? confirmOrderCouponDiscount : confirmOrderCouponDiscount;
  const orderDetailTotal = isPaidOrderDetail ? paidOrder?.total ?? confirmOrderTotal : confirmOrderTotal;
  const orderDetailItemCount = isPaidOrderDetail ? paidOrder?.itemCount ?? confirmOrderItemCount : confirmOrderItemCount;
  const shouldPromptConfirmUnselectedGift = confirmOrderPromotionGroups.some((group) => {
    const { activity } = group;
    if (!activity || (activity.type !== "full-gift" && activity.type !== "buy-x-get-y")) return false;
    return getConfirmOrderPromotionRequirementState(group)?.qualified ?? false;
  }) && !confirmOrderPromotionGroups.some((group) => getConfirmOrderPromotionMetrics(group).selectedGiftCount > 0);
  const confirmPaymentBlocker = confirmOrderPromotionGroups.find((group) => {
    if (!group.activity || !isThresholdPromotionActivity(group.activity)) return false;
    return !(getConfirmOrderPromotionRequirementState(group)?.qualified ?? true);
  });
  const confirmPaymentBlockMessage = confirmPaymentBlocker?.activity
    ? `${confirmPaymentBlocker.activity.label}：${getRequirementBlockerProgress(getConfirmOrderPromotionRequirementState(confirmPaymentBlocker)!)}`
    : "";
  const confirmBenefitPickerActivity = PROMOTION_ACTIVITIES[confirmBenefitPickerActivityId] ?? null;
  const confirmBenefitPickerGroup = confirmBenefitPickerActivity
    ? confirmOrderPromotionGroups.find((group) => group.activity?.id === confirmBenefitPickerActivity.id) ?? null
    : null;
  const confirmBenefitPickerMetrics = confirmBenefitPickerGroup ? getConfirmOrderPromotionMetrics(confirmBenefitPickerGroup) : null;
  const confirmBenefitPickerRequirement = confirmBenefitPickerGroup ? getConfirmOrderPromotionRequirementState(confirmBenefitPickerGroup) : null;
  const confirmBenefitPickerQuantityThreshold = confirmBenefitPickerActivity ? getOrderQuantityThreshold(confirmBenefitPickerActivity) : 0;
  const confirmBenefitPickerQuota = confirmBenefitPickerActivity?.type === "buy-x-get-y" && confirmBenefitPickerMetrics
    ? confirmBenefitPickerRequirement?.qualified && confirmBenefitPickerQuantityThreshold > 0
      ? Math.floor(confirmBenefitPickerMetrics.triggerQuantity / confirmBenefitPickerQuantityThreshold)
      : 0
    : 1;
  const confirmBenefitPickerQualified = confirmBenefitPickerRequirement?.qualified ?? false;
  const confirmBenefitPickerThresholdText = confirmBenefitPickerRequirement
    ? formatThreshold(confirmBenefitPickerRequirement.orderAmountThreshold, confirmBenefitPickerRequirement.orderQuantityThreshold)
    : "";
  const confirmBenefitPickerStatusLabel = !confirmBenefitPickerActivity || !confirmBenefitPickerRequirement
    ? ""
    : confirmBenefitPickerQualified
      ? confirmBenefitPickerActivity.type === "buy-x-get-y"
        ? `${confirmBenefitPickerThresholdText}\uff0c\u53ef\u9009${confirmBenefitPickerQuota}\u4ef6\u8d60\u54c1`
        : `${confirmBenefitPickerThresholdText}\uff0c\u53ef${confirmBenefitPickerActivity.type === "full-exchange" ? "\u6362\u8d2d1\u4ef6\u5546\u54c1" : "\u90091\u4ef6\u8d60\u54c1"}`
      : `${confirmBenefitPickerThresholdText}\uff0c${getOrderRequirementProgress(confirmBenefitPickerRequirement)}`;
  const activeSubtotal = primaryCartSubtotal + comboCartSubtotal;
  const cartPromotionGroups = groupCartPromotions([
    ...normalCartLines.map((line) => ({ product: isComboPromotion(line.product) ? { ...line.product, activityId: undefined } : line.product, quantity: line.quantity, selected: line.selected })),
    ...comboCartEntries.map(entry => ({ product: { activityId: entry.activity.id, price: entry.activity.price }, quantity: entry.quantity, selected: entry.selected })),
  ]);
  const thresholdPromotionGroups = cartPromotionGroups.filter(({ activity }) => isThresholdPromotionActivity(activity));
  const cartPromotionGroupsById = new Map(cartPromotionGroups.map((group) => [group.activity.id, group]));
  const cartDisplayGroupMap = new Map<string, CartDisplayGroup>();
  normalCartLines.forEach((line) => {
    const activity = isComboPromotion(line.product) ? null : getPromotionActivity(line.product);
    const key = activity?.id ?? "NO_PROMOTION";
    const group = cartDisplayGroupMap.get(key) ?? { key, activity, lines: [], includesCombo: false };
    group.lines.push(line);
    cartDisplayGroupMap.set(key, group);
  });
  if (comboCartItemPresent) {
    const activity = PROMOTION_ACTIVITIES["ACT-COMBO-68"];
    const group = cartDisplayGroupMap.get(activity.id) ?? { key: activity.id, activity, lines: [], includesCombo: false };
    group.includesCombo = true;
    cartDisplayGroupMap.set(activity.id, group);
  }
  const cartDisplayGroups = Array.from(cartDisplayGroupMap.values()).sort((left, right) => {
    const leftHasThreshold = Boolean(left.activity && isThresholdPromotionActivity(left.activity));
    const rightHasThreshold = Boolean(right.activity && isThresholdPromotionActivity(right.activity));
    return Number(rightHasThreshold) - Number(leftHasThreshold);
  });
  const fullGiftGroup = thresholdPromotionGroups.find(({ activity }) => activity.type === "full-gift");
  const buyXGetYGroup = thresholdPromotionGroups.find(({ activity }) => activity.type === "buy-x-get-y");
  const fullExchangeGroup = thresholdPromotionGroups.find(({ activity }) => activity.type === "full-exchange");
  const cartCheckoutBlocker = thresholdPromotionGroups.find((group) => (
    group.selectedQuantity > 0 && !getCartPromotionRequirementState(group).qualified
  ));
  const cartCheckoutBlockMessage = cartCheckoutBlocker
    ? `${cartCheckoutBlocker.activity.label}：${getRequirementBlockerProgress(getCartPromotionRequirementState(cartCheckoutBlocker))}`
    : "";
  const limitedPromotionDiscounts = normalCartLines.reduce((discounts, line) => {
    if (!line.selected) return discounts;
    const originalPrice = originalPriceForPromotion(line.product.price, line.product.promotion);
    const activity = getPromotionActivity(line.product);
    if (!originalPrice || !activity) return discounts;
    const amount = (Number(originalPrice) - Number(line.product.price)) * line.quantity;
    const current = discounts.get(activity.id) ?? { id: activity.id, label: activity.label, amount: 0 };
    current.amount += amount;
    discounts.set(activity.id, current);
    return discounts;
  }, new Map<string, { id: string; label: string; amount: number }>());
  const activePromotionSaving = Array.from(limitedPromotionDiscounts.values()).reduce((sum, detail) => sum + detail.amount, 0);
  const fullReductionSaving = thresholdPromotionGroups.reduce((sum, group) => {
    if (group.activity.type !== "full-reduction") return sum;
    return sum + (getCartPromotionRequirementState(group).qualified ? group.activity.reductionAmount ?? 0 : 0);
  }, 0);
  const limitedPromotionDiscountSaving = Array.from(limitedPromotionDiscounts.values()).reduce((sum, detail) => sum + detail.amount, 0);
  const promotionDiscountDetails = [
    ...(limitedPromotionDiscountSaving > 0 ? [{ id: "limited-discount", label: "限时折扣", amount: limitedPromotionDiscountSaving }] : []),
    ...thresholdPromotionGroups
      .filter((group) => group.activity.type === "full-reduction"
        && getCartPromotionRequirementState(group).qualified
        && (group.activity.reductionAmount ?? 0) > 0)
      .map((group) => ({ id: group.activity.id, label: group.activity.label, amount: group.activity.reductionAmount ?? 0 })),
  ];
  const couponSaving = comboCartItemSelected ? 0 : 3.3;
  const activePayable = Math.max(0, activeSubtotal - couponSaving - fullReductionSaving);
  const exchangeCount = Object.values(exchangeSelected).filter(Boolean).length;
  const selectedExchangeQuantity = exchangeCount && exchangeCartSelected ? 1 : 0;
  const selectedGiftQuantity = giftSelectedId && giftCartSelected ? 1 : 0;
  const fullGiftRequirement = fullGiftGroup ? getCartPromotionRequirementState(fullGiftGroup) : null;
  const buyXGetYRequirement = buyXGetYGroup ? getCartPromotionRequirementState(buyXGetYGroup) : null;
  const fullExchangeRequirement = fullExchangeGroup ? getCartPromotionRequirementState(fullExchangeGroup) : null;
  const giftThreshold = fullGiftGroup ? getOrderAmountThreshold(fullGiftGroup.activity) : 0;
  const pieceGiftThreshold = buyXGetYGroup ? getOrderQuantityThreshold(buyXGetYGroup.activity) : 0;
  const exchangeThreshold = fullExchangeGroup ? getOrderAmountThreshold(fullExchangeGroup.activity) : 0;
  const selectedNormalCartQuantity = normalCartLines.reduce((sum, line) => sum + (line.selected ? line.quantity : 0), 0);
  const selectedBaseCartQuantity = selectedNormalCartQuantity + selectedComboQuantity;
  const promotionProductQuantity = buyXGetYGroup?.selectedQuantity ?? 0;
  const pieceGiftQuota = buyXGetYRequirement?.qualified && pieceGiftThreshold > 0 ? Math.floor(promotionProductQuantity / pieceGiftThreshold) : 0;
  const pieceGiftSelectedCount = Object.values(pieceGiftSelections).reduce((sum, quantity) => sum + quantity, 0);
  const hasSelectedAnyGift = selectedGiftQuantity > 0 || pieceGiftSelectedCount > 0;
  const selectedDeleteQuantity = selectedNormalCartQuantity
    + selectedComboQuantity
    + (exchangeCartSelected ? exchangeCount : 0)
    + (giftCartSelected && giftSelectedId ? 1 : 0)
    + pieceGiftSelectedCount;
  const activeCartHasItems = normalCartLines.length > 0 || comboCartItemPresent || exchangeCount > 0 || Boolean(giftSelectedId) || pieceGiftSelectedCount > 0;
  const cartHasItems = activeCartHasItems || invalidComboCartPresent;
  const allCartItemsSelected = activeCartHasItems
    && normalCartLines.every((line) => line.selected)
    && comboCartEntries.every(entry => entry.selected)
    && (!exchangeCount || exchangeCartSelected)
    && (!giftSelectedId || giftCartSelected);
  const selectedCartQuantity = selectedBaseCartQuantity + selectedExchangeQuantity + selectedGiftQuantity + pieceGiftSelectedCount;
  const exchangePayableTotal = exchangeProducts.reduce((sum, item) => sum + (exchangeSelected[item.id] && exchangeCartSelected ? Number(item.price) : 0), 0);
  const cartPayableTotal = activePayable + exchangePayableTotal;

  const selected = useMemo(() => products.filter((item) => (cart[item.id] || 0) > 0), [cart]);
  const count = selected.reduce((sum, item) => sum + (cart[item.id] || 0), 0);
  const total = selected.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0);
  const adjust = (id: string, delta: number) => setCart((state) => ({ ...state, [id]: Math.max(0, (state[id] || 0) + delta) }));
  const adjustHomeProduct = (id: string, delta: number, selectItem = true) => {
    const nextQuantity = Math.max(0, (cart[id] || 0) + delta);
    adjust(id, delta);
    const product = homeDetailProducts[id];
    if (!product) return;
    if (nextQuantity > 0) {
      setSingleCartItem(product);
      setCartItemQuantity(nextQuantity);
      if (selectItem) {
        setCartItemSelected(true);
        setCartItemSelections((current) => ({ ...current, [id]: true }));
      }
      setComboCartItemSelected(false);
      return;
    }
    if (singleCartItem?.id === id) {
      setCartItemQuantity(0);
      setCartItemSelected(false);
    }
  };
  const homeCartCount = homeProducts.reduce((sum, item) => sum + (cart[item.id] || 0), 0);
  const homeCartTotal = homeProducts.reduce((sum, item) => sum + Number(item.price) * (cart[item.id] || 0), 0);
  const categoryCount = Object.values(categoryCart).reduce((sum, value) => sum + value, 0);
  const categoryTotal = categoryCartProducts.reduce((sum, item) => sum + Number(item.price) * (categoryCart[item.id] || 0), 0);
  const shoppingCount = count + homeCartCount + categoryCount;
  const shoppingTotal = total + homeCartTotal + categoryTotal;
  const exchangeCartAmount = fullExchangeGroup?.selectedAmount ?? 0;
  const exchangeRemaining = fullExchangeRequirement?.orderAmountRemaining ?? Math.max(0, exchangeThreshold - exchangeCartAmount);
  const exchangeRemainingText = fullExchangeRequirement ? formatRemaining(fullExchangeRequirement.orderQuantityRemaining, fullExchangeRequirement.orderAmountRemaining) : "";
  const exchangeOrderProgress = fullExchangeRequirement ? getOrderRequirementProgress(fullExchangeRequirement) : exchangeRemainingText ? `\u6574\u5355\u8fd8\u5dee${exchangeRemainingText}` : "\u6574\u5355\u6761\u4ef6\u5df2\u6ee1\u8db3";
  const exchangeQualified = fullExchangeRequirement?.qualified ?? false;
  const exchangeGroupThresholdText = fullExchangeRequirement ? formatThreshold(fullExchangeRequirement.orderAmountThreshold, fullExchangeRequirement.orderQuantityThreshold) : formatThreshold(exchangeThreshold, 0);
  const exchangeEntryLabel = exchangeQualified
    ? `${exchangeGroupThresholdText}\uff0c\u53ef\u6362\u8d2d1\u4ef6\u5546\u54c1${exchangeCount ? "\uff0c\u5df2\u90091\u4ef6" : ""}`
    : `${exchangeGroupThresholdText}\u4eab\u8d85\u503c\u6362\u8d2d\uff0c${exchangeOrderProgress}`;
  const exchangeQualifiedLabel = exchangeQualified
    ? `${exchangeGroupThresholdText}\uff0c\u53ef\u6362\u8d2d1\u4ef6`
    : `\u6574\u5355\u8fd8\u5dee${exchangeRemainingText}\uff0c${exchangeGroupThresholdText}\u53ef\u6362\u8d2d1\u4ef6`;
  const giftCartAmount = fullGiftGroup?.selectedAmount ?? 0;
  const giftRemaining = fullGiftRequirement?.orderAmountRemaining ?? Math.max(0, giftThreshold - giftCartAmount);
  const giftRemainingText = fullGiftRequirement ? formatRemaining(fullGiftRequirement.orderQuantityRemaining, fullGiftRequirement.orderAmountRemaining) : "";
  const giftOrderProgress = fullGiftRequirement ? getOrderRequirementProgress(fullGiftRequirement) : giftRemainingText ? `\u6574\u5355\u8fd8\u5dee${giftRemainingText}` : "\u6574\u5355\u6761\u4ef6\u5df2\u6ee1\u8db3";
  const giftQualified = fullGiftRequirement?.qualified ?? false;
  const giftGroupThresholdText = fullGiftRequirement ? formatThreshold(fullGiftRequirement.orderAmountThreshold, fullGiftRequirement.orderQuantityThreshold) : formatThreshold(giftThreshold, 0);
  const shouldPromptUnselectedGift = (giftQualified || pieceGiftQuota > 0) && !hasSelectedAnyGift;
  const giftEntryLabel = giftQualified
    ? `${giftGroupThresholdText}\uff0c\u53ef\u90091\u4ef6\u8d60\u54c1${giftSelectedId ? "\uff0c\u5df2\u90091\u4ef6" : ""}`
    : `${giftGroupThresholdText}\u4eab\u8d60\u54c1\uff0c${giftOrderProgress}`;
  const pieceGiftGroupThresholdText = buyXGetYRequirement
    ? formatThreshold(
        buyXGetYRequirement.orderAmountThreshold,
        buyXGetYRequirement.orderQuantityThreshold,
      )
    : formatThreshold(0, pieceGiftThreshold);
  const pieceGiftOrderProgress = buyXGetYRequirement
    ? getOrderRequirementProgress(buyXGetYRequirement)
    : `\u6574\u5355\u8fd8\u5dee${Math.max(0, pieceGiftThreshold - promotionProductQuantity)}\u4ef6`;
  const pieceGiftEntryLabel = pieceGiftQuota
    ? `\u5df2\u6ee1${pieceGiftQuota * pieceGiftThreshold}\u4ef6\uff0c\u53ef\u9009${pieceGiftQuota}\u4ef6\u8d60\u54c1${pieceGiftSelectedCount ? `\uff0c\u5df2\u9009${pieceGiftSelectedCount}\u4ef6` : ""}`
    : `${pieceGiftGroupThresholdText}\u4eab\u8d60\u54c1\uff0c${pieceGiftOrderProgress}`;
  useEffect(() => {
    if (!exchangeQualified && exchangeCount > 0) {
      setExchangeSelected({});
      setExchangeCartSelected(false);
    }
  }, [exchangeQualified, exchangeCount]);
  useEffect(() => {
    if (!giftQualified && giftSelectedId) {
      setGiftSelectedId("");
      setGiftCartSelected(false);
    }
  }, [giftQualified, giftSelectedId]);
  useEffect(() => {
    if (pieceGiftSelectedCount <= pieceGiftQuota) return;
    setPieceGiftSelections((current) => {
      let remaining = pieceGiftQuota;
      const next: Record<string, number> = {};
      for (const item of giftProducts) {
        const quantity = Math.min(current[item.id] || 0, remaining);
        if (quantity) next[item.id] = quantity;
        remaining -= quantity;
      }
      return next;
    });
  }, [pieceGiftQuota]);
  useEffect(() => {
    setConfirmOrderLines((current) => {
      const benefitLineIdsToRemove = new Set<string>();
      groupConfirmOrderPromotions(current).forEach((group) => {
        const { activity } = group;
        if (!activity) return;
        const benefitLines = group.lines.filter((line) => line.benefitType);
        if (!benefitLines.length) return;
        const { triggerQuantity } = getConfirmOrderPromotionMetrics(group);
        const requirements = getConfirmOrderPromotionRequirementState(group);
        const availableBenefitCount = activity.type === "buy-x-get-y"
          ? requirements?.qualified && getOrderQuantityThreshold(activity) > 0
            ? Math.floor(triggerQuantity / getOrderQuantityThreshold(activity))
            : 0
          : (activity.type === "full-gift" || activity.type === "full-exchange") && requirements?.qualified
            ? 1
            : 0;
        let remaining = availableBenefitCount;
        benefitLines.forEach((line) => {
          if (remaining >= line.quantity) {
            remaining -= line.quantity;
            return;
          }
          benefitLineIdsToRemove.add(line.id);
        });
      });
      return benefitLineIdsToRemove.size
        ? current.filter((line) => !benefitLineIdsToRemove.has(line.id))
        : current;
    });
  }, [confirmOrderLines]);
  const navCartCount = shoppingCount + (comboCartItemPresent ? comboCartItemQuantity : 0);
  const adjustCategory = (id: string, delta: number) => setCategoryCart((state) => ({ ...state, [id]: Math.max(0, (state[id] || 0) + delta) }));
  const adjustCategoryProduct = (item: (typeof categoryCartProducts)[number], delta: number, selectItem = true) => {
    const nextQuantity = Math.max(0, (categoryCart[item.id] || 0) + delta);
    adjustCategory(item.id, delta);
    if (nextQuantity > 0) {
      const product = item.id.startsWith("pudi-") ? searchDetailProduct(item) : categoryDetailProduct(item);
      setSingleCartItem(product);
      setCartItemQuantity(nextQuantity);
      if (selectItem) {
        setCartItemSelected(true);
        setCartItemSelections((current) => ({ ...current, [item.id]: true }));
      }
      setComboCartItemSelected(false);
      return;
    }
    if (singleCartItem?.id === item.id) {
      setCartItemQuantity(0);
      setCartItemSelected(false);
    }
  };
  const adjustNormalCartLine = (product: DetailProduct, quantity: number, delta: number) => {
    if ((cart[product.id] || 0) > 0) {
      adjustHomeProduct(product.id, delta, false);
      return;
    }
    const categoryProduct = categoryCartProducts.find((item) => item.id === product.id);
    if (categoryProduct && (categoryCart[product.id] || 0) > 0) {
      adjustCategoryProduct(categoryProduct, delta, false);
      return;
    }
    if (quantity <= 1 && delta < 0) setSheet(false);
    setCartItemQuantity((value) => Math.max(0, value + delta));
  };
  const setNormalCartLineSelected = (id: string, selected: boolean) => {
    if (mappedCartLines.some((line) => line.product.id === id)) {
      setCartItemSelections((current) => ({ ...current, [id]: selected }));
      return;
    }
    setCartItemSelected(selected);
  };
  const decreaseComboCartItem = (id: string) => setComboCartEntries(entries => entries.map(entry => entry.activity.id === id ? { ...entry, quantity: entry.quantity - 1 } : entry).filter(entry => entry.quantity > 0));
  const increaseComboCartItem = (id: string) => {
    const activity = allComboActivities.find(item => item.id === id);
    if (activity) syncComboToCart(activity);
  };
  const selectExchangeItem = (id: string) => {
    if (!exchangeQualified) {
      setExchangeToast(`${exchangeRemainingText ? `\u6574\u5355\u8fd8\u5dee${exchangeRemainingText}` : "\u6307\u5b9a\u5546\u54c1\u6761\u4ef6\u672a\u6ee1\u8db3"}\u53ef\u53c2\u4e0e\u6362\u8d2d`);
      window.setTimeout(() => setExchangeToast(""), PROMOTION_TOAST_DURATION);
      return;
    }
    if (exchangeSelected[id]) {
      setExchangeSelected({});
      setExchangeCartSelected(false);
      return;
    }
    if (exchangeCount >= 1) {
      setExchangeToast("\u6362\u8d2d\u5546\u54c1\u5df2\u8fbe\u4e0a\u9650");
      window.setTimeout(() => setExchangeToast(""), PROMOTION_TOAST_DURATION);
      return;
    }
    setExchangeSelected({ [id]: true });
    setExchangeCartSelected(true);
  };
  const selectGiftItem = (id: string) => {
    if (!giftQualified) {
      setExchangeToast(`${giftRemainingText ? `\u6574\u5355\u8fd8\u5dee${giftRemainingText}` : "\u6307\u5b9a\u5546\u54c1\u6761\u4ef6\u672a\u6ee1\u8db3"}\u53ef\u9009\u8d60\u54c1`);
      window.setTimeout(() => setExchangeToast(""), PROMOTION_TOAST_DURATION);
      return;
    }
    if (giftSelectedId === id) {
      setGiftSelectedId("");
      setGiftCartSelected(false);
      return;
    }
    if (giftSelectedId) {
      setExchangeToast("赠品已达上限");
      window.setTimeout(() => setExchangeToast(""), PROMOTION_TOAST_DURATION);
      return;
    }
    setGiftSelectedId(id);
    setGiftCartSelected(true);
  };
  const selectPieceGiftItem = (id: string) => {
    if (!pieceGiftQuota) {
      setExchangeToast(`${pieceGiftOrderProgress}\uff0c\u6682\u4e0d\u53ef\u9009\u8d60\u54c1`);
      window.setTimeout(() => setExchangeToast(""), PROMOTION_TOAST_DURATION);
      return;
    }
    if (pieceGiftSelections[id]) {
      setPieceGiftSelections((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return;
    }
    if (pieceGiftSelectedCount >= pieceGiftQuota) {
      setExchangeToast("赠品已达上限");
      window.setTimeout(() => setExchangeToast(""), PROMOTION_TOAST_DURATION);
      return;
    }
    setPieceGiftSelections((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  };
  const openDeleteSelectedConfirm = () => {
    if (!selectedDeleteQuantity) {
      setExchangeToast("请选择要删除的商品");
      window.setTimeout(() => setExchangeToast(""), 1600);
      return;
    }
    setDeleteConfirmOpen(true);
  };
  const deleteSelectedCartItems = () => {
    const selectedNormalIds = new Set(normalCartLines.filter((line) => line.selected).map((line) => line.product.id));
    if (selectedNormalIds.size) {
      setCart((current) => Object.fromEntries(Object.entries(current).map(([id, quantity]) => [id, selectedNormalIds.has(id) || id === "p1" ? 0 : quantity])));
      setCategoryCart((current) => Object.fromEntries(Object.entries(current).map(([id, quantity]) => [id, selectedNormalIds.has(id) ? 0 : quantity])));
      setCartItemSelections((current) => ({ ...current, ...Object.fromEntries(Array.from(selectedNormalIds).map((id) => [id, false])) }));
      if (!normalCartLines.some((line) => !line.selected)) {
        setCartItemQuantity(0);
        setCartItemSelected(false);
        setSingleCartItem(null);
      }
    }
    if (comboCartItemSelected) {
      setComboCartItemPresent(false);
      setComboCartItemSelected(false);
    }
    if (exchangeCartSelected) {
      setExchangeSelected({});
      setExchangeCartSelected(false);
    }
    if (giftCartSelected && giftSelectedId) {
      setGiftSelectedId("");
      setGiftCartSelected(false);
    }
    if (pieceGiftSelectedCount) {
      setPieceGiftSelections({});
    }
    setDeleteConfirmOpen(false);
  };
  const goto = (next: View) => { keyboard.hide(); setSheet(false); setDetailPurchaseOpen(false); setComboPurchaseOpen(false); setCouponPickerOpen(false); setDetailBenefitsOpen(false); setConfirmBenefitPickerActivityId(""); setGiftCheckoutPromptOpen(false); setSearchOpen(false); setSearchComboSheetOpen(false); setSearchComboSheetActivity(null); setView(next); };
  const openDetail = (item: DetailProduct) => { setSelectedComboId(""); keyboard.hide(); setSheet(false); setDetailBenefitsOpen(false); setSearchOpen(false); setSearchComboSheetOpen(false); setSearchComboSheetActivity(null); setDetailProduct(item); setDetailFrom(view); setView("detail"); };
  const openComboPromotionSheet = () => {
    keyboard.hide();
    setComboGiftsOpen(true);
  };
  const openSearchComboSheet = (activity: SearchComboActivity) => { keyboard.hide(); setDetailProduct(activity.detailProduct); setDetailFrom(view); setSearchComboSheetActivity(activity); setSearchComboSheetOpen(true); };
  const renderSearchProductCard = (item: (typeof searchProducts)[number]) => {
    const amount = categoryCart[item.id] || 0;
    return <article key={item.id} onClick={() => openDetail(searchDetailProduct(item))}>
      <span className="reference-search-promotion">{displayPromotion(item.promotion)}</span>
      <img src={item.image} alt="" />
      <div>
        <h2><em>OTC</em>{item.name}</h2>
        <footer><b>{"\u00a5"}{item.price}</b>{amount ? <div className="reference-search-stepper"><button aria-label={"\u51cf\u5c11"} onClick={(event) => { event.stopPropagation(); adjustCategoryProduct(item, -1); }}><MinusIcon /></button><span>{amount}</span><button aria-label={"\u589e\u52a0"} onClick={(event) => { event.stopPropagation(); adjustCategoryProduct(item, 1); }}>+</button></div> : <button aria-label={copy.addCart} onClick={(event) => { event.stopPropagation(); adjustCategoryProduct(item, 1); }}><BackpackIcon /></button>}</footer>
      </div>
    </article>;
  };
  const syncComboToCart = (activity: SearchComboActivity = activeDetailCombo, quantity = 1) => {
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
  const buyComboNow = (quantity = 1) => {
    if (detailComboStock <= 0) return;
    const safeQuantity = Math.min(detailComboStock, Math.max(1, quantity));
    setConfirmBenefitPickerActivityId("");
    setConfirmOrderLines(detailComboProducts.map((item, index) => ({
      id: `direct-combo-${activeDetailCombo.id}-${item.id}`,
      name: item.name,
      spec: item.spec,
      price: detailComboAllocatedPrices[index],
      image: item.image,
      quantity: safeQuantity * getComboComponentRequiredQuantity(item),
      activityId: activeDetailCombo.id,
      quantityLocked: true,
    })));
    setConfirmOrderDiscount(0);
    setSelectedConfirmCouponId("");
    setConfirmOrderFrom("combo-list");
    goto("confirm-order");
  };
  const openComboPurchase = (mode: "cart" | "buy") => {
    dismissKeyboard();
    if (mode === "cart") { syncComboToCart(activeDetailCombo); return; }
    setComboPurchaseMode(mode);
    setComboPurchaseQuantity(1);
    setComboPurchaseOpen(true);
  };
  const closeComboPurchase = () => {
    dismissKeyboard();
    setComboPurchaseOpen(false);
  };
  const confirmComboPurchase = () => {
    dismissKeyboard();
    setComboPurchaseOpen(false);
    if (comboPurchaseMode === "cart") {
      syncComboToCart(activeDetailCombo, comboPurchaseQuantity);
      return;
    }
    buyComboNow(comboPurchaseQuantity);
  };
  const addCurrentDetailToCart = (quantity = 1) => {
    const safeQuantity = Math.max(1, quantity);
    const addingSameItem = singleCartItem?.id === detailProduct.id;
    setSingleCartItem(detailProduct);
    setCartItemSelected(true);
    setCartItemSelections((current) => ({ ...current, [detailProduct.id]: true }));
    setCartItemQuantity((currentQuantity) => addingSameItem ? currentQuantity + safeQuantity : safeQuantity);
    setComboCartItemSelected(false);
    if (categoryCartProducts.some((item) => item.id === detailProduct.id)) {
      adjustCategory(detailProduct.id, safeQuantity);
      return;
    }
    if (homeProducts.some((item) => item.id === detailProduct.id)) {
      adjust(detailProduct.id, safeQuantity);
      return;
    }
    adjust("p1", safeQuantity);
  };
  const openDetailPurchase = (mode: "cart" | "buy") => {
    dismissKeyboard();
    setDetailPurchaseMode(mode);
    setDetailPurchaseQuantity(1);
    setDetailPurchaseOpen(true);
  };
  const closeDetailPurchase = () => {
    dismissKeyboard();
    setDetailPurchaseOpen(false);
  };
  const confirmDetailPurchase = () => {
    dismissKeyboard();
    setDetailPurchaseOpen(false);
    if (detailPurchaseMode === "cart") {
      addCurrentDetailToCart(detailPurchaseQuantity);
      return;
    }
    setConfirmBenefitPickerActivityId("");
    setConfirmOrderLines([{ id: detailProduct.id, name: detailProduct.name, spec: detailProduct.spec, price: Number(detailProduct.price), originalPrice: originalPriceForPromotion(detailProduct.price, detailProduct.promotion), image: detailProduct.image, quantity: detailPurchaseQuantity, activityId: isComboPromotion(detailProduct) ? undefined : detailProduct.activityId, itemAmountThreshold: detailProduct.itemAmountThreshold, itemQuantityThreshold: detailProduct.itemQuantityThreshold }]);
    setConfirmOrderDiscount(0);
    setSelectedConfirmCouponId("");
    setConfirmOrderFrom("detail");
    goto("confirm-order");
  };
  const proceedCartCheckout = (completePayment = false) => {
    if (!selectedCartQuantity) return;
    const lines: ConfirmOrderLine[] = [];
    lines.push(...normalCartLines
      .filter((line) => line.selected)
      .map((line) => ({ id: line.product.id, name: line.product.name, spec: line.product.spec, price: Number(line.product.price), originalPrice: originalPriceForPromotion(line.product.price, line.product.promotion), image: line.product.image, quantity: line.quantity, activityId: isComboPromotion(line.product) ? undefined : line.product.activityId, itemAmountThreshold: line.product.itemAmountThreshold, itemQuantityThreshold: line.product.itemQuantityThreshold })));
    for (const entry of comboCartEntries.filter(entry => entry.selected)) {
      const prices = comboPricesFor(entry.activity);
      lines.push(...comboProductsFor(entry.activity).map((item, index) => ({ id: `cart-combo-${entry.activity.id}-${item.id}`, name: item.name, spec: item.spec, price: prices[index], image: item.image, quantity: entry.quantity * getComboComponentRequiredQuantity(item), activityId: entry.activity.id, quantityLocked: true })));
    }
    const exchangeItem = exchangeProducts.find((item) => exchangeSelected[item.id]);
    if (exchangeCartSelected && exchangeItem) {
      lines.push({ id: exchangeItem.id, name: exchangeItem.name, spec: exchangeItem.spec, price: Number(exchangeItem.price), image: exchangeItem.image, quantity: 1, activityId: fullExchangeGroup?.activity.id, benefitType: "exchange", quantityLocked: true });
    }
    const giftItem = giftProducts.find((item) => item.id === giftSelectedId);
    if (giftCartSelected && giftItem) {
      lines.push({ id: giftItem.id, name: giftItem.name, spec: giftItem.spec, price: 0, image: giftItem.image, quantity: 1, activityId: fullGiftGroup?.activity.id, benefitType: "gift", quantityLocked: true });
    }
    giftProducts.forEach((item) => {
      const quantity = pieceGiftSelections[item.id] || 0;
      if (quantity) lines.push({ id: `piece-${item.id}`, name: item.name, spec: item.spec, price: 0, image: item.image, quantity, activityId: buyXGetYGroup?.activity.id, benefitType: "gift", quantityLocked: true });
    });
    if (!lines.length) return;
    setConfirmBenefitPickerActivityId("");
    setConfirmOrderLines(lines);
    setConfirmOrderDiscount(fullReductionSaving);
    setSelectedConfirmCouponId("");
    setConfirmOrderFrom("cart");
    if (completePayment) {
      const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
      setPaidOrder({
        lines: lines.map((line) => ({ ...line })),
        subtotal,
        promotionSaving: activePromotionSaving + fullReductionSaving,
        couponSaving,
        total: cartPayableTotal,
        itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      });
      goto("payment-success");
      return;
    }
    goto("confirm-order");
  };
  const showPromotionCheckoutBlocked = (message: string) => {
    setExchangeToast(`${message}，暂不可提交订单或支付`);
    window.setTimeout(() => setExchangeToast(""), PROMOTION_TOAST_DURATION);
  };
  const openCartCheckout = () => {
    if (!selectedCartQuantity) return;
    if (cartCheckoutBlockMessage) {
      showPromotionCheckoutBlocked(cartCheckoutBlockMessage);
      return;
    }
    if (shouldPromptUnselectedGift) {
      keyboard.hide();
      setGiftCheckoutPromptOpen(true);
      return;
    }
    proceedCartCheckout(true);
  };
  const openGiftFromCheckoutPrompt = () => {
    setGiftCheckoutPromptOpen(false);
    if (view === "confirm-order") {
      const eligibleGiftGroup = confirmOrderPromotionGroups.find((group) => {
        const { activity } = group;
        if (!activity || (activity.type !== "full-gift" && activity.type !== "buy-x-get-y")) return false;
        return getConfirmOrderPromotionRequirementState(group)?.qualified ?? false;
      });
      setConfirmBenefitPickerActivityId(eligibleGiftGroup?.activity?.id ?? "");
      return;
    }
    if (giftQualified) {
      setGiftOpen(true);
      return;
    }
    setPieceGiftOpen(true);
  };
  const adjustConfirmOrderLine = (id: string, delta: number) => {
    setConfirmOrderLines((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };
  const showConfirmBenefitToast = (message: string) => {
    setExchangeToast(message);
    window.setTimeout(() => setExchangeToast(""), PROMOTION_TOAST_DURATION);
  };
  const selectConfirmExchangeItem = (activityId: string, id: string) => {
    const item = exchangeProducts.find((product) => product.id === id);
    const activity = PROMOTION_ACTIVITIES[activityId];
    if (!item || !activity) return;
    const existingId = `confirm-exchange-${activityId}-${item.id}`;
    if (confirmOrderLines.some((line) => line.id === existingId)) {
      setConfirmOrderLines((current) => current.filter((line) => line.id !== existingId));
      return;
    }
    if (!confirmBenefitPickerQualified) {
      showConfirmBenefitToast(`${getOrderRequirementProgress(confirmBenefitPickerRequirement!)}，暂不可参与换购`);
      return;
    }
    if ((confirmBenefitPickerMetrics?.selectedExchangeCount ?? 0) >= 1) {
      showConfirmBenefitToast("换购商品已达上限");
      return;
    }
    setConfirmOrderLines((current) => {
      const group = groupConfirmOrderPromotions(current).find((candidate) => candidate.activity?.id === activityId);
      if (!group || getConfirmOrderPromotionMetrics(group).selectedExchangeCount >= 1) return current;
      return [...current, { id: existingId, name: item.name, spec: item.spec, price: Number(item.price), image: item.image, quantity: 1, activityId, benefitType: "exchange", quantityLocked: true }];
    });
  };
  const selectConfirmGiftItem = (activityId: string, id: string) => {
    const item = giftProducts.find((product) => product.id === id);
    const activity = PROMOTION_ACTIVITIES[activityId];
    if (!item || !activity) return;
    const existingId = `confirm-gift-${activityId}-${item.id}`;
    if (confirmOrderLines.some((line) => line.id === existingId)) {
      setConfirmOrderLines((current) => current.filter((line) => line.id !== existingId));
      return;
    }
    if (!confirmBenefitPickerQualified) {
      showConfirmBenefitToast(`${getOrderRequirementProgress(confirmBenefitPickerRequirement!)}，暂不可选赠品`);
      return;
    }
    if ((confirmBenefitPickerMetrics?.selectedGiftCount ?? 0) >= 1) {
      showConfirmBenefitToast("赠品已达上限");
      return;
    }
    setConfirmOrderLines((current) => {
      const existingId = `confirm-gift-${activityId}-${item.id}`;
      if (current.some((line) => line.id === existingId)) return current.filter((line) => line.id !== existingId);
      const group = groupConfirmOrderPromotions(current).find((candidate) => candidate.activity?.id === activityId);
      if (!group || getConfirmOrderPromotionMetrics(group).selectedGiftCount >= 1) return current;
      return [...current, { id: existingId, name: item.name, spec: item.spec, price: 0, image: item.image, quantity: 1, activityId, benefitType: "gift", quantityLocked: true }];
    });
  };
  const selectConfirmPieceGiftItem = (activityId: string, id: string) => {
    const item = giftProducts.find((product) => product.id === id);
    const activity = PROMOTION_ACTIVITIES[activityId];
    if (!item || !activity) return;
    const existingId = `confirm-piece-gift-${activityId}-${item.id}`;
    if (confirmOrderLines.some((line) => line.id === existingId)) {
      setConfirmOrderLines((current) => current.filter((line) => line.id !== existingId));
      return;
    }
    if (!confirmBenefitPickerQualified || !confirmBenefitPickerQuota) {
      showConfirmBenefitToast(`${getOrderRequirementProgress(confirmBenefitPickerRequirement!)}，暂不可选赠品`);
      return;
    }
    setConfirmOrderLines((current) => {
      const group = groupConfirmOrderPromotions(current).find((candidate) => candidate.activity?.id === activityId);
      if (!group) return current;
      const { triggerQuantity, selectedGiftCount } = getConfirmOrderPromotionMetrics(group);
      const threshold = getOrderQuantityThreshold(activity);
      const quota = threshold ? Math.floor(triggerQuantity / threshold) : 0;
      if (current.some((line) => line.id === existingId)) return current.filter((line) => line.id !== existingId);
      if (!quota || selectedGiftCount >= quota) return current;
      return [...current, { id: existingId, name: item.name, spec: item.spec, price: 0, image: item.image, quantity: 1, activityId, benefitType: "gift", quantityLocked: true }];
    });
  };
  const openCouponPicker = () => {
    dismissKeyboard();
    setPendingConfirmCouponId(selectedConfirmCouponId);
    setCouponPickerOpen(true);
  };
  const confirmCouponSelection = () => {
    setSelectedConfirmCouponId(pendingConfirmCouponId);
    setCouponPickerOpen(false);
  };
  const proceedPaymentOrder = () => {
    setPaidOrder({
      lines: confirmOrderLines.map((line) => ({ ...line })),
      subtotal: confirmOrderSubtotal,
      promotionSaving: confirmOrderDiscount + confirmOrderPriceSaving,
      couponSaving: confirmOrderCouponDiscount,
      total: confirmOrderTotal,
      itemCount: confirmOrderItemCount,
    });
    goto("payment-success");
  };
  const openPaymentOrder = () => {
    if (confirmPaymentBlockMessage) {
      showPromotionCheckoutBlocked(confirmPaymentBlockMessage);
      return;
    }
    if (shouldPromptConfirmUnselectedGift) {
      keyboard.hide();
      setGiftCheckoutPromptOpen(true);
      return;
    }
    proceedPaymentOrder();
  };
  const renderDeliveryInfo = () => {
    if (delivery === copy.delivery) {
      return (
        <>
          <section className="reference-delivery-info rider">
            <div className="reference-delivery-contact">
              <SewingPinFilledIcon />
              <div>
                <div><strong>王勇</strong><span>18812345678</span></div>
                <p>湖南省长沙市芙蓉区朝阳街街道韶山北路139号<br />湖南文化大厦湖南文化大厦B座1915</p>
              </div>
              <ChevronRightIcon />
            </div>
            <div className="reference-delivery-row reference-store-row">
              <HomeIcon />
              <div><strong>长沙海商网络</strong><span>韶山路139号湖南文化大厦B座1915</span></div>
            </div>
            <div className="reference-delivery-row">
              <ClockIcon />
              <div><span>营业时间</span><strong>周一至周日（8:00-22:00）</strong></div>
            </div>
            <button className="reference-delivery-row reference-delivery-time">
              <BackpackIcon />
              <span>选择送达时间</span>
              <b>预计11:00送达</b>
              <ChevronRightIcon />
            </button>
          </section>
          <p className="reference-prescription-tip"><ExclamationTriangleIcon />{copy.tip}</p>
        </>
      );
    }
    if (delivery === copy.pickup) {
      return (
        <>
          <section className="reference-delivery-info pickup">
            <div className="reference-delivery-row reference-store-row">
              <HomeIcon />
              <div><strong>长沙海商网络</strong><span>韶山路139号湖南文化大厦B座1915</span></div>
            </div>
            <div className="reference-delivery-row">
              <ClockIcon />
              <div><span>营业时间</span><strong>周一至周日（8:00-22:00）</strong></div>
            </div>
            <div className="reference-delivery-row reference-phone-row">
              <MobileIcon />
              <span>预留电话</span>
              <b>18088888888</b>
            </div>
          </section>
          <p className="reference-prescription-tip"><ExclamationTriangleIcon />{copy.tip}</p>
        </>
      );
    }
    return <button className="reference-address"><SewingPinFilledIcon /><span>{copy.addAddress}</span><ChevronRightIcon /></button>;
  };
  const renderCartOptions = () => (
    <>
      <section className="reference-cart-benefits">
        <button><span>{"\u4f18\u60e0\u5238"}</span><b>{"-\u00a5"}{couponSaving.toFixed(2)}<ChevronRightIcon /></b></button>
        <button onClick={() => setDiscountDetailOpen(true)}><span>{"\u5171\u4f18\u60e0"}</span><b className="discount-value">{"-\u00a5"}{(activePromotionSaving + fullReductionSaving + couponSaving).toFixed(2)}<ChevronRightIcon /></b></button>
        <button><span>{copy.invoice}</span><b>{copy.noInvoice}<ChevronRightIcon /></b></button>
      </section>
      <section className="reference-cart-settings"><button><span>{copy.payment}</span><b>{copy.wechatPay}</b></button><button><span>{copy.remark}</span><b>{copy.fillRemark}<ChevronRightIcon /></b></button></section>
      <button className="reference-claim-coupon" onClick={() => setCouponClaimed(true)}><span><i>{"\u00d7"}</i>{couponClaimed ? "\u4f18\u60e0\u5238\u5df2\u9886\u53d6" : "\u9886\u53d6\u4f18\u60e0\u5238"}</span><b>{couponClaimed ? "\u5df2\u9886\u53d6" : "\u53bb\u9886\u53d6"}<ChevronRightIcon /></b></button>
    </>
  );

  const renderComboGiftSummary = () => (
    <button className="reference-combo-gifts" onClick={() => setComboGiftsOpen(true)}>
      <span>{"\u4f18\u60e0\u7ec4\u5408"}</span>
      <div className="reference-combo-gift-previews">
        {comboCartProducts.map((item) => <img key={item.id} src={item.image} alt="" />)}
      </div>
      <b>{"\u5171"}{comboChildTotalQuantity}{"\u4ef6"}</b>
      <ChevronRightIcon />
    </button>
  );

  const renderComboCartSample = () => comboCartEntries.map(entry => (
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

  const renderExchangeEntry = (activityId?: string) => (
      <button className="reference-exchange-entry" data-activity-id={activityId} onClick={() => {
      if (!exchangeQualified) {
        setExchangeToast(`${exchangeRemainingText ? `\u6574\u5355\u8fd8\u5dee${exchangeRemainingText}` : "\u6307\u5b9a\u5546\u54c1\u6761\u4ef6\u672a\u6ee1\u8db3"}\u53ef\u53c2\u4e0e\u6362\u8d2d`);
        window.setTimeout(() => setExchangeToast(""), PROMOTION_TOAST_DURATION);
        return;
      }
      setExchangeOpen(true);
      }}><span>{exchangeEntryLabel}</span><b>{exchangeCount ? "\u66f4\u591a\u6362\u8d2d" : "\u53bb\u6362\u8d2d"}<ChevronRightIcon /></b></button>
  );

  const renderPromotionGroupHeader = (group: CartPromotionGroup) => {
    const { activity } = group;
    if (!isThresholdPromotionActivity(activity)) return null;
    const requirements = getCartPromotionRequirementState(group);
    const groupThreshold = formatThreshold(requirements.orderAmountThreshold, requirements.orderQuantityThreshold);
    const orderProgress = getOrderRequirementProgress(requirements);
    if (activity.type === "full-reduction") {
      const reductionAmount = activity.reductionAmount ?? 0;
      const label = requirements.qualified
        ? `${groupThreshold}\u51cf${reductionAmount}\u5143\uff0c\u5df2\u4f18\u60e0${reductionAmount}\u5143`
        : `${groupThreshold}\u51cf${reductionAmount}\u5143\uff0c${orderProgress}`;
      return <div className="reference-exchange-entry reference-full-reduction-entry" data-activity-id={activity.id}><span>{label}</span></div>;
    }
    if (activity.type === "full-gift") {
      return <button className="reference-exchange-entry reference-gift-entry" data-activity-id={activity.id} onClick={() => setGiftOpen(true)}><span>{giftEntryLabel}</span><b>{giftSelectedId ? "\u66f4\u591a\u8d60\u54c1" : "\u9009\u8d60\u54c1"}<ChevronRightIcon /></b></button>;
    }
    if (activity.type === "buy-x-get-y") {
      return <button className="reference-exchange-entry reference-gift-entry" data-activity-id={activity.id} onClick={() => setPieceGiftOpen(true)}><span>{pieceGiftEntryLabel}</span><b>{pieceGiftSelectedCount ? "\u66f4\u591a\u8d60\u54c1" : "\u9009\u8d60\u54c1"}<ChevronRightIcon /></b></button>;
    }
    if (activity.type === "full-exchange") {
      return renderExchangeEntry(activity.id);
    }
    return <div className="reference-cart-promotion-group-title" data-activity-id={activity.id}><span>{activity.label}</span></div>;
  };

  const renderGiftCartItem = () => {
    const item = giftProducts.find((product) => product.id === giftSelectedId);
    if (!item) return null;
    return (
      <section className="reference-cart-item reference-exchange-cart-item reference-gift-cart-item">
        {renderChoice(giftCartSelected, () => setGiftCartSelected((value) => !value))}
        <img src={item.image} alt={item.name} />
        <div>
          <h2><span className="reference-cart-benefit-tag">赠送商品</span><span className="reference-cart-benefit-name">{item.name}</span></h2>
          <p>{copy.specification}:{item.spec}</p>
          <footer><span className="reference-cart-price"><b>{"\u00a5"}{item.price}</b></span><span className="reference-exchange-cart-quantity">1</span></footer>
        </div>
      </section>
    );
  };

  const renderPieceGiftCartItems = () => giftProducts
    .filter((item) => (pieceGiftSelections[item.id] || 0) > 0)
    .map((item) => {
    const quantity = pieceGiftSelections[item.id] || 0;
    return <section className="reference-cart-item reference-exchange-cart-item reference-gift-cart-item reference-piece-gift-cart-item" key={item.id}>
      {renderChoice(true, () => setPieceGiftSelections((current) => { const next = { ...current }; delete next[item.id]; return next; }))}
      <img src={item.image} alt={item.name} />
      <div>
          <h2><span className="reference-cart-benefit-tag">赠送商品</span><span className="reference-cart-benefit-name">{item.name}</span></h2>
        <p>{copy.specification}:{item.spec}</p>
        <footer><span className="reference-cart-price"><b>{"\u00a5"}{item.price}</b></span><span className="reference-exchange-cart-quantity">{quantity}</span></footer>
      </div>
    </section>;
  });

  const renderExchangeCartItems = () => {
    const item = exchangeProducts.find((product) => exchangeSelected[product.id]);
    if (!item) return null;
    return (
      <section className="reference-cart-item reference-exchange-cart-item">
        {renderChoice(exchangeCartSelected, () => setExchangeCartSelected((value) => !value))}
        <img src={item.image} alt={item.name} />
        <div>
          <h2><span className="reference-cart-benefit-tag">换购商品</span><span className="reference-cart-benefit-name">{item.name}</span></h2>
          <p>{copy.specification}:{item.spec}</p>
          <footer>
            <span className="reference-cart-price"><b>{"\u00a5"}{item.price}</b><small>{"\u00a5"}{item.original}</small></span>
            <span className="reference-exchange-cart-quantity">1</span>
          </footer>
        </div>
      </section>
    );
  };

  const renderChoice = (selected: boolean, onClick: () => void) => (
    <button className={`reference-choice${selected ? " selected" : ""}`} aria-label={copy.allSelected} onClick={onClick}>{selected ? <span className="reference-choice-check" aria-hidden="true" /> : null}</button>
  );

  const renderNormalCartItems = (sheetMode = false, lines = normalCartLines) => lines.map((line) => {
    const { product, quantity, selected } = line;
    const showPromotion = !isComboPromotion(product) && Boolean(product.promotion);
    const originalPrice = originalPriceForPromotion(product.price, product.promotion);
    const itemAmountRemaining = Math.max(0, (product.itemAmountThreshold ?? 0) - (selected ? Number(product.price) * quantity : 0));
    const itemQuantityRemaining = Math.max(0, (product.itemQuantityThreshold ?? 0) - (selected ? quantity : 0));
    const hasItemRequirement = (product.itemAmountThreshold ?? 0) > 0 || (product.itemQuantityThreshold ?? 0) > 0;
    const itemRequirementLabel =
      hasItemRequirement && selected && (itemAmountRemaining || itemQuantityRemaining)
        ? `本品还差${formatRemaining(itemQuantityRemaining, itemAmountRemaining)}`
        : "";
    return <section className={`reference-cart-item${sheetMode ? " reference-sheet-item" : ""}`} key={product.id} data-activity-id={product.activityId}>
      {showPromotion ? <span className={sheetMode ? "reference-sheet-promotion" : "reference-cart-promotion"}>{displayPromotion(product.promotion)}</span> : null}
      {renderChoice(selected, () => setNormalCartLineSelected(product.id, !selected))}
      {sheetMode
        ? <img src={product.image} alt={product.name} />
        : <button type="button" className="reference-cart-product-image" aria-label={`查看${product.name}详情`} onClick={() => openDetail(product)}><img src={product.image} alt={product.name} /></button>}
      <div>
        {sheetMode
          ? <><h2>{product.name}</h2><p>{copy.specification}:{product.spec}</p></>
          : <button type="button" className="reference-cart-product-info" onClick={() => openDetail(product)}><h2>{product.name}</h2><p>{copy.specification}:{product.spec}</p></button>}
        <footer>
          <span className="reference-cart-price"><b>{"\u00a5"}{product.price}</b>{originalPrice ? <small>{"\u00a5"}{originalPrice}</small> : null}</span>
          <div className="reference-cart-stepper"><button aria-label={"\u51cf\u5c11"} onClick={() => adjustNormalCartLine(product, quantity, -1)}><MinusIcon /></button><span>{quantity}</span><button aria-label={"\u589e\u52a0"} onClick={() => adjustNormalCartLine(product, quantity, 1)}>+</button></div>
        </footer>
        {itemRequirementLabel ? <small className="reference-cart-item-threshold">{itemRequirementLabel}</small> : null}
      </div>
    </section>;
  });

  const renderPromotionGroupExtras = (activity: PromotionActivity) => {
    if (activity.type === "full-gift") return renderGiftCartItem();
    if (activity.type === "buy-x-get-y") return renderPieceGiftCartItems();
    if (activity.type === "full-exchange") return renderExchangeCartItems();
    return null;
  };

  const getConfirmOrderPromotionThreshold = (group: ConfirmOrderPromotionGroup) => {
    const { activity } = group;
    if (!activity) return "";
    const { triggerQuantity, selectedGiftCount, selectedExchangeCount } = getConfirmOrderPromotionMetrics(group);
    const requirements = getConfirmOrderPromotionRequirementState(group)!;
    const groupThreshold = formatThreshold(requirements.orderAmountThreshold, requirements.orderQuantityThreshold);
    const orderProgress = getOrderRequirementProgress(requirements);
    if (activity.type === "full-reduction") {
      const reductionAmount = activity.reductionAmount ?? 0;
      return requirements.qualified
        ? `${groupThreshold}减${reductionAmount}元，已优惠${reductionAmount}元`
        : `${groupThreshold}减${reductionAmount}元，${orderProgress}`;
    }
    if (activity.type === "full-gift") {
      return requirements.qualified
        ? `${groupThreshold}，可选1件赠品${selectedGiftCount ? `，已选${selectedGiftCount}件` : ""}`
        : `${groupThreshold}享赠品，${orderProgress}`;
    }
    if (activity.type === "full-exchange") {
      return requirements.qualified
        ? `${groupThreshold}，可换购1件商品${selectedExchangeCount ? `，已选${selectedExchangeCount}件` : ""}`
        : `${groupThreshold}享超值换购，${orderProgress}`;
    }
    if (activity.type === "buy-x-get-y") {
      const threshold = getOrderQuantityThreshold(activity);
      const quota = requirements.qualified && threshold > 0 ? Math.floor(triggerQuantity / threshold) : 0;
      return quota
        ? `已满${quota * threshold}件，可选${quota}件赠品${selectedGiftCount ? `，已选${selectedGiftCount}件` : ""}`
        : `${groupThreshold}享赠品，${orderProgress}`;
    }
    return activity.label;
  };

  const getConfirmOrderPromotionAction = (group: ConfirmOrderPromotionGroup) => {
    const { activity } = group;
    if (!activity) return null;
    const { selectedGiftCount, selectedExchangeCount } = getConfirmOrderPromotionMetrics(group);
    if (activity.type === "full-gift" || activity.type === "buy-x-get-y") return selectedGiftCount ? "更多赠品" : "选赠品";
    if (activity.type === "full-exchange") return selectedExchangeCount ? "更多换购" : "去换购";
    return null;
  };

  const renderConfirmOrderPromotionThreshold = (group: ConfirmOrderPromotionGroup) => {
    const action = getConfirmOrderPromotionAction(group);
    if (!action) return <div className="confirm-order-promotion-threshold"><span>{getConfirmOrderPromotionThreshold(group)}</span></div>;
    return <button type="button" className="confirm-order-promotion-threshold confirm-order-promotion-action" onClick={() => { dismissKeyboard(); setConfirmBenefitPickerActivityId(group.activity?.id ?? ""); }}>
      <span>{getConfirmOrderPromotionThreshold(group)}</span><b>{action}<ChevronRightIcon /></b>
    </button>;
  };

  const renderCartProductGroups = (sheetMode = false) => cartDisplayGroups.map((displayGroup) => {
    const promotionGroup = displayGroup.activity ? cartPromotionGroupsById.get(displayGroup.activity.id) : null;
    return <section className="reference-cart-promotion-group" data-cart-group-id={displayGroup.key} key={displayGroup.key}>
      {promotionGroup ? renderPromotionGroupHeader(promotionGroup) : null}
      {renderNormalCartItems(sheetMode, displayGroup.lines)}
      {displayGroup.includesCombo ? renderComboCartSample() : null}
      {displayGroup.activity ? renderPromotionGroupExtras(displayGroup.activity) : null}
    </section>;
  });

  const renderInvalidComboCartSample = () => invalidComboCartPresent ? (
    <section className="reference-invalid-cart-group" aria-label="以下为失效商品">
      <header><span>以下为失效商品</span><button type="button" aria-label="清空失效商品" onClick={(event) => { event.stopPropagation(); setInvalidComboCartPresent(false); }}><TrashIcon />清空</button></header>
      <section className="reference-cart-item reference-invalid-combo-item" role="button" tabIndex={0} aria-label={`查看${invalidComboCartSample.name}优惠组合`} onClick={openComboPromotionSheet} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openComboPromotionSheet(); } }}>
        <div className="reference-invalid-combo-image"><img src={invalidComboCartSample.image} alt={invalidComboCartSample.name} /><span>已下架</span></div>
        <div>
          <h2>{invalidComboCartSample.name}</h2>
          <footer><span className="reference-cart-price"><b>{"\u00a5"}{invalidComboCartSample.price}</b></span></footer>
        </div>
      </section>
    </section>
  ) : null;

  const toggleCartSelection = () => {
    const next = !allCartItemsSelected;
    if (mappedCartLines.length) {
      setCartItemSelections((current) => ({ ...current, ...Object.fromEntries(normalCartLines.map((line) => [line.product.id, next])) }));
    } else if (cartItemQuantity > 0) {
      setCartItemSelected(next);
    }
    if (comboCartItemPresent) setComboCartItemSelected(next);
    if (exchangeCount) setExchangeCartSelected(next);
    if (giftSelectedId) setGiftCartSelected(next);
  };

  useEffect(() => {
    if (view !== "home") return;
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLDivElement>(".reference-home-scroll .mobile-scroll")?.scrollTo({ top: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [view]);

  const nav = (
    <nav className="source-nav">
      <button onClick={() => goto("home")} className={view === "home" ? "active" : ""}><HomeIcon /><span>{copy.home}</span></button>
      <button onClick={() => goto("category")} className={view === "category" ? "active" : ""}><RowsIcon /><span>{copy.category}</span></button>
      <button onClick={() => goto("cart")} className={view === "cart" ? "active" : ""}><BackpackIcon />{navCartCount ? <i>{navCartCount}</i> : null}<span>{copy.cart}</span></button>
      <button onClick={() => goto("profile")} className={view === "profile" ? "active" : ""}><PersonIcon /><span>{copy.profile}</span></button>
    </nav>
  );

  const compactHeader = (
    <header className="source-header">
      <div className="source-store"><SewingPinFilledIcon />{copy.store}<ChevronRightIcon /><div className="source-tools"><DotsHorizontalIcon /><b /></div></div>
      <button className="source-search" onClick={() => goto("category")}><MagnifyingGlassIcon /><span>{copy.search}</span></button>
    </header>
  );

  return (
    <div className={`source-app ${view === "detail" ? "detail-page" : ""}${view === "combo-list" ? " combo-list-page" : ""}${view === "confirm-order" ? " confirm-order-page" : ""}${view === "order-detail" ? " order-detail-page" : ""}${view === "payment-success" ? " payment-success-page" : ""}`}>
      {view === "home" ? (
        <>
          <header className="reference-home-header">
            <div className="reference-store"><SewingPinFilledIcon /><span>{copy.store}</span><ChevronRightIcon /><div className="reference-tools"><DotsHorizontalIcon /><b /></div></div>
            <div className="reference-search"><button className="search-pill" onClick={() => goto("category")}>{copy.search}</button></div>
          </header>
          <MobileScroll key="home-scroll" className={`reference-home-scroll${shoppingCount ? " has-home-checkout" : ""}`}>
            <main className="reference-home">
              <img className="reference-hero" src="/assets/home-reference/hero-cordyceps.png" alt={"\u9c9c\u866b\u8349\u6d3b\u52a8"} />
              <section className="reference-categories">
                {categories.map((name, index) => (
                  <button key={name} onClick={() => { setActiveSide(index === 0 ? catalogTabs[0] : name); goto("category"); }}>
                    <img src={`/assets/home-reference/category-${index + 1}.png`} alt="" /><span>{name}</span>
                  </button>
                ))}
              </section>
              <section className="reference-products">
                {homeProducts.map((item) => {
                  const amount = cart[item.id] || 0;
                  return <article key={item.id} onClick={() => openDetail(homeDetailProducts[item.id])}>
                    <img src={item.image} alt="" />
                    {homePromotions[item.id] ? <span className="product-promotion">{homePromotions[item.id]}</span> : null}
                    <h2>{item.name}</h2>
                    <footer>
                      <b>{"\u00a5"}{item.price}</b>
                      {amount ? <div className="reference-stepper reference-home-stepper" aria-label={`${item.name}数量`}>
                        <button aria-label="减少" onClick={(event) => { event.stopPropagation(); adjustHomeProduct(item.id, -1); }}><MinusIcon /></button>
                        <span>{amount}</span>
                        <button aria-label="增加" onClick={(event) => { event.stopPropagation(); adjustHomeProduct(item.id, 1); }}>+</button>
                      </div> : <button aria-label={copy.addCart} onClick={(event) => { event.stopPropagation(); adjustHomeProduct(item.id, 1); }}><BackpackIcon /><PlusIcon /></button>}
                    </footer>
                  </article>;
                })}
              </section>
            </main>
          </MobileScroll>
          <button className="qualification-tab">{copy.qualification}</button>
          <button
            className={`service-float${homeServiceDrag.dragging ? " is-dragging" : ""}`}
            style={homeServiceDrag.position ?? undefined}
            aria-label={`${copy.service}（可拖拽调整位置）`}
            onPointerDown={homeServiceDrag.onPointerDown}
          ><ChatBubbleIcon /><span>{copy.service}</span></button>
          {shoppingCount ? <div className="reference-category-checkout reference-home-checkout">
            <button className="reference-checkout-cart" aria-label="查看购物车" onClick={() => goto("cart")}><BackpackIcon /><i>{shoppingCount}</i></button>
            <div><span>{copy.total}{"："}</span><b>{"\u00a5"}{shoppingTotal.toFixed(2)}</b><small>{copy.totalPieces}{shoppingCount}{copy.pieces}</small></div>
            <button className="reference-checkout-button" onClick={() => goto("cart")}>{copy.checkout}</button>
          </div> : null}
        </>
      ) : view !== "detail" && view !== "combo-list" && view !== "confirm-order" && view !== "order-detail" && view !== "payment-success" && view !== "category" && view !== "cart" && view !== "profile" ? compactHeader : null}

      {view === "detail" ? (
        <>
          <header className="detail-header">
            <button className="detail-back" aria-label={"\u8fd4\u56de"} onClick={() => goto(detailFrom)}><ArrowLeftIcon /></button>
            <h1>{copy.detail}</h1>
            <div className="detail-tools"><DotsHorizontalIcon /><b /></div>
          </header>
          <button className="detail-vconsole">vConsole<i>WEBVIEW</i></button>
          <MobileScroll key="detail-scroll" className="detail-scroll">
            <main className="detail-content">
              <section className="detail-gallery"><img src={detailProduct.image} alt={detailProduct.name} /><span>1/4</span></section>
              <section className="detail-summary"><div><b>{"\u00a5"}{detailProduct.price}</b>{detailOriginalPrice ? <span className="detail-original-price">{"\u00a5"}{detailOriginalPrice}</span> : null}{detailProduct.promotion ? <span className="detail-promotion">{displayPromotion(detailProduct.promotion)}</span> : null}<HeartIcon /></div><h2><em>{detailProduct.tag}</em>{detailProduct.name}</h2></section>
              <section className="detail-spec"><span>{copy.specification}</span><b>{detailProduct.spec}</b></section>
              {detailProduct.promotion && !isDetailCombo ? <button type="button" className="detail-discount" aria-label={`${copy.discount}\uff1a${displayPromotion(detailProduct.promotion)}`} onClick={() => setDetailBenefitsOpen(true)}><span>{copy.discount}</span><div><em>{displayPromotion(detailProduct.promotion)}</em><small>{"1\u9879\u4f18\u60e0"}</small><ChevronRightIcon /></div></button> : null}
              <section className="detail-delivery">
                <div><span>{copy.sendTo}</span><b>{copy.chooseAddress}</b><ChevronRightIcon /></div>
                <div><span>门店</span><b>湖南千金大药房连锁有限公司株洲武广高铁店</b><ChevronRightIcon /></div>
                <div><span>{copy.deliveryText}</span><b className="delivery-green"><BackpackIcon />{copy.expressDelivery}</b></div>
              </section>
              <section className="detail-service-strip"><span>{copy.serviceText}</span><b><i><CheckCircledIcon /></i>{copy.chainStores}</b><b><i><CheckCircledIcon /></i>{copy.genuine}</b><b><i><CheckCircledIcon /></i>{copy.complete}</b></section>
              {isDetailCombo ? <section className="detail-combo" aria-label="优惠组合">
                <header><div><strong>优惠组合</strong><span>（共{detailAvailableCombos.length}个组合）</span></div></header>
                {detailAvailableCombos.length > 1 ? <Carousel className="detail-combo-tabs" contentClassName="detail-combo-tabs-track" ariaLabel="选择优惠组合">{detailAvailableCombos.map(activity => <button type="button" key={activity.id} aria-pressed={activity.id === selectedDetailCombo.id} onClick={() => setSelectedComboId(activity.id)}>{activity.name}</button>)}</Carousel> : null}
                <div className="detail-combo-selection"><strong>{selectedDetailCombo.name}</strong><span>共{detailComboProducts.length}种商品</span></div>
                <Carousel className="detail-combo-products" contentClassName="detail-combo-products-track" ariaLabel="组合商品">
                  {detailComboProducts.map((item, index) => <div className="detail-combo-item" key={item.id}>
                    <img src={item.image} alt={item.name} />
                    <h3>{item.name}</h3>
                    <footer><b>{"\u00a5"}{detailComboAllocatedPrices[index].toFixed(2)}</b><span>×{getComboComponentRequiredQuantity(item)}</span></footer>
                    {index < detailComboProducts.length - 1 ? <i>+</i> : null}
                  </div>)}
                </Carousel>
                <footer className="detail-combo-price-panel" aria-label={`组合价：¥${detailComboPrice.toFixed(2)}`}><div><span>组合价</span><b>{"\u00a5"}{detailComboPrice.toFixed(2)}</b></div><button onClick={() => goto("combo-list")}>去购买组合套装</button></footer>
              </section> : null}

              <nav className="detail-section-tabs" aria-label="商品详情栏目">
                <button onClick={() => detailEvaluationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>评价服务(0)</button>
                <button onClick={() => detailProductRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>商品详情</button>
              </nav>

              <section className="detail-evaluation" ref={detailEvaluationRef}>
                <p>以下为用户对购药服务的评价，不代表药品疗效</p>
                <div>
                  <span><b>0%</b>满意</span>
                  <span><b>0%</b>一般</span>
                  <span><b>0%</b>不满意</span>
                </div>
                <small>暂无服务评价</small>
              </section>

              <section className="detail-product-sections" ref={detailProductRef}>
                <article className="detail-parameter-card">
                  <h2>商品参数</h2>
                  <dl>
                    <div><dt>商品名称</dt><dd>{detailProduct.name}</dd></div>
                    <div><dt>商品编号</dt><dd>{detailInfo.code}</dd></div>
                    <div><dt>通用名</dt><dd>{detailInfo.genericName}</dd></div>
                    <div><dt>规格</dt><dd>{detailProduct.spec}</dd></div>
                    <div><dt>生产企业</dt><dd>{detailInfo.manufacturer}</dd></div>
                    <div><dt>批准文号</dt><dd>{detailInfo.approval}</dd></div>
                    <div className="detail-parameter-long"><dt>适应症/功能主治</dt><dd>{detailInfo.indication}</dd></div>
                    <div className="detail-parameter-long"><dt>用法用量</dt><dd>{detailInfo.dosage}</dd></div>
                    <div><dt>剂型</dt><dd>{detailInfo.form}</dd></div>
                    <div><dt>单位</dt><dd>{detailInfo.unit}</dd></div>
                  </dl>
                  <aside><b>温馨提示</b><p>药品属于特殊商品，除药品质量原因外，药品一经售出，不得退换。处方药须凭处方在药师指导下购买和使用；商品包装、批号和有效期以收到的实物为准。</p></aside>
                </article>

                <article className="detail-after-sale">
                  <h2>售后服务</h2>
                  <div><ClockIcon /><p><b>营业时间</b><span>门店营业时间以具体门店为准；平台客服服务时间 9:00～21:00。</span></p></div>
                  <div><BackpackIcon /><p><b>物流运费说明</b><span>运费以订单结算页显示为准，不同门店的运费和优惠可能存在差异。</span></p></div>
                  <div><CheckCircledIcon /><p><b>退换货规则</b><span>除药品质量原因外，药品一经出售，不得退换。</span></p></div>
                  <div><FileTextIcon /><p><b>温馨提示</b><span>商品包装和说明书可能更新，请以实际收到的商品及厂家最新说明书为准。</span></p></div>
                </article>
              </section>
            </main>
          </MobileScroll>
          <button
            className={`detail-service${detailServiceDrag.dragging ? " is-dragging" : ""}`}
            style={detailServiceDrag.position ?? undefined}
            aria-label={`${copy.service}（可拖拽调整位置）`}
            onPointerDown={detailServiceDrag.onPointerDown}
          ><ChatBubbleIcon /><span>{copy.service}</span></button>
          <footer className="detail-actionbar"><button><Share1Icon /><span>{copy.share}</span></button><button onClick={() => goto("cart")}><BackpackIcon /><span>{copy.cart}</span></button><button className="detail-add" onClick={() => openDetailPurchase("cart")}>{copy.joinCart}</button><button className="detail-forward" onClick={() => openDetailPurchase("buy")}><span>{copy.buyNow}</span></button></footer>
        </>
      ) : null}

      <BottomSheet open={detailBenefitsOpen && !isDetailCombo} onOpenChange={setDetailBenefitsOpen} title="优惠详情" snap={0.76}>
        <div className="detail-benefits-sheet">
          {detailProduct.promotion ? <section aria-label="促销活动">
            <h3 className="detail-benefits-section-title">促销活动</h3>
            <div className="detail-benefit-promotion">
            <div><span>{displayPromotion(detailProduct.promotion)}</span><h2>{detailPromotionTitle}</h2></div>
            {!isDetailCombo ? <p>活动时间：2026-08-01 00:00 至 2026-12-31 23:59</p> : null}
            </div>
          </section> : null}
          <section className="detail-benefit-coupons" aria-label="可领取优惠券">
            <h3 className="detail-benefits-section-title">优惠券活动</h3>
            <p className="detail-benefits-note">领取后可在下单时使用，具体以结算页为准</p>
            {detailCoupons.map((coupon) => {
              const claimKey = `${detailProduct.id}-${coupon.id}`;
              const claimed = coupon.preclaimed || Boolean(detailCouponClaimIds[claimKey]);
              return <article key={coupon.id}>
                <strong><b>{coupon.value}</b>元</strong>
                <div><h2>{coupon.name}</h2><p>{coupon.scope}</p><small>有效期至 {coupon.expiry}</small></div>
                <button type="button" disabled={claimed} onClick={() => setDetailCouponClaimIds((current) => ({ ...current, [claimKey]: true }))}>{claimed ? "已领取" : "领取"}</button>
              </article>;
            })}
          </section>
        </div>
      </BottomSheet>

      {view === "combo-list" ? (
        <>
          <header className="combo-list-header">
            <button className="combo-list-back" aria-label={detailFrom === "cart" ? "返回购物车" : "返回商品详情"} onClick={() => goto(detailFrom === "cart" ? "cart" : "detail")}><ArrowLeftIcon /></button>
            <h1>组合商品列表</h1>
            <div className="combo-list-tools"><DotsHorizontalIcon /><b /></div>
          </header>
          <MobileScroll key="combo-list-scroll" className="combo-list-scroll">
            <main className="combo-list-content">
              <section className="combo-list-summary">
                <img className="combo-list-activity-image" src={activeDetailCombo.image} alt={`${activeDetailCombo.name}活动图片`} />
                <div><strong>{activeDetailCombo.name}</strong><span>共{detailComboProducts.length}种商品</span></div>
                <p><span>组合价</span><b>{"\u00a5"}{detailComboPrice.toFixed(2)}</b></p>
              </section>
              <section className="combo-list-products" aria-label="组合商品">
                {detailComboProducts.map((item, index) => <article className="combo-list-item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div><h2><em>{item.tag}</em>{item.name}</h2><p>{copy.specification}：{item.spec}</p><small className="combo-list-stock">{getComboComponentInventoryLabel(item)}</small><footer><b>{"\u00a5"}{detailComboAllocatedPrices[index].toFixed(2)}</b><span>×{getComboComponentRequiredQuantity(item)}</span></footer></div>
                </article>)}
              </section>
            </main>
          </MobileScroll>
          <footer className="combo-list-actionbar">
            <button type="button" className="combo-list-cart" aria-label="查看购物车" onClick={() => { keyboard.hide(); setSheet(true); }}>
              <BackpackIcon />
              <span>{copy.cart}</span>
              {navCartCount ? <i>{navCartCount}</i> : null}
            </button>
            <button className="combo-list-add" onClick={() => openComboPurchase("cart")}>{copy.joinCart}</button>
            <button className="combo-list-buy" onClick={() => openComboPurchase("buy")}>{copy.buyNow}</button>
          </footer>
        </>
      ) : null}

      {view === "confirm-order" ? (
        <>
          <header className="confirm-order-header">
            <button type="button" className="confirm-order-back" aria-label="返回上一页" onClick={() => goto(confirmOrderFrom)}><ArrowLeftIcon /></button>
            <h1>确认订单</h1>
            <div className="confirm-order-tools"><DotsHorizontalIcon /><b /></div>
          </header>
          <MobileScroll key="confirm-order-scroll" className="confirm-order-scroll">
            <main className="confirm-order-content">
              <section className="confirm-order-delivery">
                <div className="reference-delivery-tabs">{[copy.delivery, copy.express, copy.pickup].map((item) => <button type="button" className={delivery === item ? "selected" : ""} key={item} onClick={() => setDelivery(item)}>{item}</button>)}</div>
                <button type="button" className="confirm-order-address"><SewingPinFilledIcon /><span>{copy.chooseAddress}</span><ChevronRightIcon /></button>
              </section>

              {confirmOrderPromotionGroups.map((group) => <section className="confirm-order-promotion-group" key={group.key} data-activity-id={group.activity?.id}>
                {group.activity ? renderConfirmOrderPromotionThreshold(group) : null}
                {group.lines.map((item) => <section className="confirm-order-product" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h2>{item.benefitType ? <span className="reference-cart-benefit-tag">{getConfirmOrderBenefitLabel(item)}</span> : null}<span className="confirm-order-product-name">{item.name}</span></h2>
                    <p>{copy.specification}:{item.spec}</p>
                    <footer>
                      <b>{"\u00a5"}{item.price.toFixed(2)}</b>
                      {item.quantityLocked ? <span className="confirm-order-fixed-quantity">×{item.quantity}</span> : <div className="confirm-order-stepper">
                        <button type="button" aria-label={`减少${item.name}购买数量`} disabled={item.quantity <= 1} onClick={() => adjustConfirmOrderLine(item.id, -1)}><MinusIcon /></button>
                        <span>{item.quantity}</span>
                        <button type="button" aria-label={`增加${item.name}购买数量`} onClick={() => adjustConfirmOrderLine(item.id, 1)}>+</button>
                      </div>}
                    </footer>
                  </div>
                </section>)}
              </section>)}

              <section className="confirm-order-summary">
                <div><span>支付方式</span><b>微信支付</b></div>
                <div><span>配送费</span><b className="confirm-order-teal">{"\u00a5"}0.00</b></div>
                <div><span>小计</span><b className="confirm-order-teal">{"\u00a5"}{confirmOrderSubtotal.toFixed(2)}</b></div>
                <button type="button" onClick={openCouponPicker}><span>优惠券</span><b>{confirmOrderCouponDiscount ? `-\u00a5${confirmOrderCouponDiscount.toFixed(2)}` : "未使用"}<ChevronRightIcon /></b></button>
                <button type="button"><span>发票</span><b>不开发票<ChevronRightIcon /></b></button>
                <button type="button"><span>备注</span><b>请填写备注<ChevronRightIcon /></b></button>
              </section>
            </main>
          </MobileScroll>
          <footer className="confirm-order-actionbar"><button type="button" disabled={Boolean(confirmPaymentBlockMessage)} title={confirmPaymentBlockMessage || undefined} onClick={openPaymentOrder}><b>{"\u00a5"} {confirmOrderTotal.toFixed(2)}</b>去支付</button></footer>
        </>
      ) : null}

      {couponPickerOpen ? (
        <div className="coupon-picker-mask" role="presentation" onClick={() => setCouponPickerOpen(false)}>
          <section className="coupon-picker" role="dialog" aria-modal="true" aria-labelledby="coupon-picker-title" onClick={(event) => event.stopPropagation()}>
            <header className="coupon-picker-header">
              <h2 id="coupon-picker-title">优惠券</h2>
              <button type="button" aria-label="关闭优惠券" onClick={() => setCouponPickerOpen(false)}>×</button>
            </header>
            <div className="coupon-picker-content">
              <div className="coupon-picker-available-row">
                <p className="coupon-picker-section-label">可用优惠券（{availableConfirmOrderCoupons.length}）</p>
                <button type="button" className={`coupon-picker-none ${pendingConfirmCouponId ? "" : "selected"}`} onClick={() => setPendingConfirmCouponId("")}>
                  <span>不使用优惠券</span><i aria-hidden="true" />
                </button>
              </div>
              {availableConfirmOrderCoupons.map((coupon) => (
                <button type="button" className={`order-coupon ${pendingConfirmCouponId === coupon.id ? "selected" : ""}`} key={coupon.id} onClick={() => setPendingConfirmCouponId(coupon.id)}>
                  <span className="order-coupon-value"><b>{coupon.discountLabel}</b><em>{coupon.threshold}</em></span>
                  <span className="order-coupon-details"><strong>{coupon.name}</strong><small>预计优惠 ¥{coupon.discount.toFixed(2)}</small><small>{coupon.dateRange}</small></span>
                  <i aria-hidden="true" />
                </button>
              ))}
              <p className="coupon-picker-section-label unavailable">不可用优惠券（{unavailableConfirmOrderCoupons.length}）</p>
              {unavailableConfirmOrderCoupons.map((coupon) => (
                <article className="order-coupon unavailable" key={coupon.id} aria-disabled="true">
                  <span className="order-coupon-value"><b>{coupon.discountLabel}</b><em>{coupon.threshold}</em></span>
                  <span className="order-coupon-details"><strong>{coupon.name}</strong><small>{coupon.unavailableReason}</small><small>{coupon.dateRange}</small></span>
                </article>
              ))}
            </div>
            <footer className="coupon-picker-action"><button type="button" onClick={confirmCouponSelection}>确定</button></footer>
          </section>
        </div>
      ) : null}

      {view === "order-detail" ? (
        <>
          <header className="order-detail-header">
            <button className="order-detail-back" aria-label="返回首页" onClick={() => goto(isPaidOrderDetail ? "home" : orderDetailFrom)}>{isPaidOrderDetail ? <HomeIcon /> : <ArrowLeftIcon />}</button>
            <h1>订单详情</h1>
            <div className="order-detail-tools"><DotsHorizontalIcon /><b /></div>
          </header>
          <MobileScroll key="order-detail-scroll" className="order-detail-scroll">
            <main className="order-detail-content">
              <section className="order-status-card">
                <div><h2>{isPaidOrderDetail ? "待商家发货" : orderCanceled ? "订单已取消" : "待支付"}</h2>{!isPaidOrderDetail && !orderCanceled ? <span>剩余 <b>29:33</b></span> : null}</div>
                <p>{isPaidOrderDetail ? "商家正在备货，请耐心等待" : orderCanceled ? "订单已取消，相关商品将不再保留。" : "超时未支付，订单将自动取消"}</p>
              </section>

              <section className="order-goods-card">
                {orderDetailLines.map((item) => {
                  const label = getOrderDetailProductLabel(item);
                  return <article className="order-goods-row" key={item.id}>
                    <img src={item.image} alt={item.name} />
                    <div className="order-goods-info"><h2>{label ? <em>{label}</em> : null}{item.name}</h2><p>{item.spec}</p></div>
                    <div className="order-goods-price"><div className="order-goods-unit-price"><b>¥{item.price.toFixed(2)}</b>{item.originalPrice && Number(item.originalPrice) > item.price ? <del aria-label={`原价 ¥${item.originalPrice}`}>¥{item.originalPrice}</del> : null}</div><span>×{item.quantity}</span></div>
                  </article>;
                })}
                <dl className="order-summary">
                  <div><dt>商品总量</dt><dd>{orderDetailItemCount}</dd></div>
                  <div><dt>商品小计</dt><dd>¥{orderDetailSubtotal.toFixed(2)}</dd></div>
                  <div><dt>活动优惠</dt><dd className="order-discount">-¥{orderDetailPromotionSaving.toFixed(2)}</dd></div>
                  <div><dt>优惠券抵扣</dt><dd className="order-discount">-¥{orderDetailCouponSaving.toFixed(2)}</dd></div>
                  <div><dt>配送费</dt><dd>¥0.00</dd></div>
                  <div className="order-total"><dt>合计金额</dt><dd>¥{orderDetailTotal.toFixed(2)}</dd></div>
                </dl>
              </section>

              <section className="order-address-card">
                <div><b>现在</b><span>18011031203</span></div>
                <p>湖南省 长沙市 芙蓉区 湖南省长沙市芙蓉区韶山北路155-1号芙蓉区湖南文化大厦西19</p>
              </section>

              <section className="order-info-card">
                <h2>订单信息</h2>
                <div><span>订单号</span><b>MOCK20260806001</b><button onClick={() => { setExchangeToast("订单号已复制"); window.setTimeout(() => setExchangeToast(""), 1600); }}>复制</button></div>
                <div><span>下单时间</span><b>2026-08-06 17:55</b></div>
                <div><span>配送方式</span><b>快递配送</b></div>
              </section>
            </main>
          </MobileScroll>
          <footer className="order-detail-actionbar">
            {isPaidOrderDetail ? <>
              <button onClick={() => { setExchangeToast("退款申请功能开发中"); window.setTimeout(() => setExchangeToast(""), 1600); }}>申请退款</button>
              <button className="order-detail-primary" onClick={() => { setExchangeToast("已联系门店"); window.setTimeout(() => setExchangeToast(""), 1600); }}>联系门店</button>
            </> : <>
              <button disabled={orderCanceled} onClick={() => { setOrderCanceled(true); setExchangeToast("订单已取消"); window.setTimeout(() => setExchangeToast(""), 1600); }}>取消订单</button>
              <button className="order-detail-primary" disabled={orderCanceled} onClick={() => { setExchangeToast("支付功能开发中"); window.setTimeout(() => setExchangeToast(""), 1600); }}>{orderCanceled ? "订单已取消" : "去支付"}</button>
            </>}
          </footer>
        </>
      ) : null}

      {view === "payment-success" ? (
        <>
          <header className="payment-success-header" aria-label="支付结果">
            <div className="payment-success-tools"><DotsHorizontalIcon /><i /><span /></div>
          </header>
          <main className="payment-success-content">
            <div className="payment-success-icon" aria-hidden="true">✓</div>
            <h1>支付成功</h1>
            <p>感谢您的购买，订单正在处理中</p>
          </main>
          <footer className="payment-success-actions">
            <button type="button" onClick={() => goto("home")}>返回首页</button>
            <button type="button" onClick={() => { setOrderCanceled(false); setOrderDetailFrom("payment-success"); goto("order-detail"); }}>查看订单</button>
          </footer>
        </>
      ) : null}

      {view === "category" && !searchOpen ? (
        <>
          <header className="reference-category-header">
            <button className="reference-category-search" onClick={() => { keyboard.hide(); setSearchOpen(true); }}><MagnifyingGlassIcon /><span>{"999\u611f\u5192\u7075"}</span></button>
            <div className="reference-category-tools"><DotsHorizontalIcon /><b /></div>
          </header>
          <main className={`reference-category ${shoppingCount ? "has-category-checkout" : ""}`}>
            <aside className="reference-category-sidebar">
              {referenceCategoryTabs.map((item) => <button key={item} className={activeSide === item ? "side-active" : ""} onClick={() => setActiveSide(item)}>{item}</button>)}
            </aside>
            <section className="reference-category-main">
              <div className="reference-illness-tabs">{illness.map((item) => <button key={item} onClick={() => setActiveTag(item)} className={activeTag === item ? "selected" : ""}>{item}</button>)}</div>
              <div className="reference-sort-row"><b>{copy.defaultSort}</b><span>{copy.sales} <i>\u25b2\u25bc</i></span><span>{copy.price} <i>\u25b2\u25bc</i></span></div>
              <MobileScroll key="reference-category-products" className="reference-product-scroll">
                <div className="reference-product-list">
                  {referenceCategoryProducts.map((item) => {
                    const amount = categoryCart[item.id] || 0;
                    return <article key={item.id}>
                      <span className="reference-product-promotion">{displayPromotion(item.promotion)}</span>
                      <button className="reference-product-main" onClick={() => openDetail(categoryDetailProduct(item))}><img src={item.image} alt="" /><div><h2><em>OTC</em>{item.name}</h2><b>{"\u00a5"}{item.price}</b></div></button>
                      {amount ? <div className="reference-stepper"><button aria-label={"\u51cf\u5c11"} onClick={() => adjustCategoryProduct(item, -1)}><MinusIcon /></button><span>{amount}</span><button aria-label={"\u589e\u52a0"} onClick={() => adjustCategoryProduct(item, 1)}>+</button></div> : <button className="reference-add" aria-label={copy.addCart} onClick={() => adjustCategoryProduct(item, 1)}><BackpackIcon /></button>}
                    </article>;
                  })}
                </div>
              </MobileScroll>
            </section>
          </main>
          {shoppingCount ? <div className="reference-category-checkout"><button className="reference-checkout-cart" onClick={() => { keyboard.hide(); setSheet(true); }}><BackpackIcon /><i>{shoppingCount}</i></button><div><span>{copy.total}{"\uff1a"}</span><b>{"\u00a5"}{shoppingTotal.toFixed(2)}</b><small>{copy.totalPieces}{shoppingCount}{copy.pieces}</small></div><button className="reference-checkout-button" onClick={() => goto("cart")}>{copy.checkout}</button></div> : null}
        </>
      ) : null}

      {view === "category" && searchOpen ? (
        <section className="reference-search-page">
          <header className="reference-search-header"><button className="reference-search-back" aria-label={"\u8fd4\u56de"} onClick={() => setSearchOpen(false)}><ArrowLeftIcon /></button><div className="reference-search-field"><MagnifyingGlassIcon /><span>{"\u84b2\u5730"}</span><button aria-label={"\u6e05\u9664"}>{"\u00d7"}</button><button className="reference-search-submit">{copy.search}</button></div><div className="reference-search-tools"><DotsHorizontalIcon /><b /></div></header>
          <div className="reference-search-sort"><b>{copy.defaultSort}</b><span>{copy.sales}<i>\u25b2\u25bc</i></span><span>{copy.price}<i>\u25b2\u25bc</i></span></div>
          <MobileScroll key="search-results" className="reference-search-scroll"><main className="reference-search-list">{renderSearchProductCard(searchProducts[0])}{searchComboActivities.map((activity) => <article className="reference-search-combo" key={activity.id} onClick={() => openSearchComboSheet(activity)}><span className="reference-search-promotion">组合价</span><img src={activity.image} alt="" /><div><h2>{activity.name}</h2><p>{activity.productCount}种组合商品</p><footer><b>{"\u00a5"}{activity.price}</b>{comboCartEntries.some(entry => entry.activity.id === activity.id) ? <div className="reference-search-stepper reference-search-combo-stepper"><button aria-label={`减少${activity.name}`} onClick={(event) => { event.stopPropagation(); decreaseComboCartItem(activity.id); }}><MinusIcon /></button><span>{comboCartEntries.find(entry => entry.activity.id === activity.id)?.quantity}</span><button aria-label={`增加${activity.name}`} disabled={(comboCartEntries.find(entry => entry.activity.id === activity.id)?.quantity ?? 0) >= calculateComboStock(comboProductsFor(activity))} onClick={(event) => { event.stopPropagation(); increaseComboCartItem(activity.id); }}>+</button></div> : <button className="reference-search-combo-add" aria-label={`加购${activity.name}`} onClick={(event) => { event.stopPropagation(); syncComboToCart(activity); }}><BackpackIcon /></button>}</footer></div></article>)}{searchProducts.slice(1).map(renderSearchProductCard)}</main></MobileScroll>
          <footer className="reference-search-checkout"><button onClick={() => { keyboard.hide(); setSheet(true); }}><BackpackIcon /><i>{shoppingCount || 1}</i></button><div><span>{copy.total}{"\uff1a"}</span><b>{"\u00a5"}{shoppingTotal.toFixed(2)}</b><small>{copy.totalPieces}{shoppingCount}{copy.pieces}</small></div><button>{copy.checkout}</button></footer>
        </section>
      ) : null}

      {view === "cart" ? (
        <>
          <header className="reference-cart-header"><button type="button" className="reference-cart-delete" aria-label="删除选中商品" onClick={openDeleteSelectedConfirm}><TrashIcon /></button><h1>{copy.cart}</h1><div className="reference-cart-tools"><DotsHorizontalIcon /><b /></div></header>
          {cartHasItems ? <><MobileScroll key="cart-scroll" className="reference-cart-scroll"><main className="reference-cart">
            <section className="reference-delivery-tabs">{[copy.delivery, copy.express, copy.pickup].map((item) => <button className={delivery === item ? "selected" : ""} key={item} onClick={() => setDelivery(item)}>{item}</button>)}</section>
            {renderDeliveryInfo()}
            {renderCartProductGroups()}
            {renderInvalidComboCartSample()}
            {renderCartOptions()}
          </main></MobileScroll>
          <footer className="reference-cart-checkout">{renderChoice(allCartItemsSelected, toggleCartSelection)}<span>{"\u5df2\u9009"}{selectedCartQuantity}{copy.pieces}</span><div className="reference-cart-total"><b>{copy.total}{"\uff1a"}<em>{"\u00a5"}{cartPayableTotal.toFixed(2)}</em></b><button className="reference-cart-discount-trigger" onClick={() => { setDiscountPromotionExpanded(false); setDiscountDetailOpen(true); }}>{"\u5171\u4f18\u60e0"}{(activePromotionSaving + fullReductionSaving + couponSaving).toFixed(2)}{"\u5143"}</button></div><button type="button" disabled={!selectedCartQuantity || Boolean(cartCheckoutBlockMessage)} title={cartCheckoutBlockMessage || undefined} onClick={openCartCheckout}>{copy.payNow}</button></footer></> : <main className="reference-empty-cart">
            <div className="reference-empty-cart-illustration" aria-hidden="true"><i /><span /><b>+</b><em>+</em></div>
            <p>购物车空空如也~</p>
            <button type="button" onClick={() => goto("home")}>去逛逛</button>
          </main>}
        </>
      ) : null}

      {view === "profile" ? (
        <MobileScroll key="profile-scroll" className="source-scroll member-scroll">
          <main className="member-screen">
            <section className="member-hero">
              <button className="member-identity" onClick={() => notifyProfileAction("会员资料")}>
                <img src="/assets/member-avatar-network.png" alt="" />
                <span className="member-name"><b>用户67289146</b><ChevronRightIcon /></span>
                <span className="member-tier"><i>VIP</i>0级会员</span>
              </button>
              <button className="member-code" onClick={() => notifyProfileAction("会员码")}>
                <img src="/assets/member-code.png" alt="" />
                <span>会员码</span>
              </button>
            </section>

            <section className="member-metrics">
              <button onClick={() => notifyProfileAction("优惠券")}><b>18</b><span>优惠券</span></button>
              <button onClick={() => notifyProfileAction("积分")}><b>0</b><span>积分</span></button>
            </section>

            <section className="member-panel member-orders">
              <header><h1>{copy.myOrders}</h1><button onClick={() => notifyProfileAction("全部订单")}>全部<ChevronRightIcon /></button></header>
              <div className="member-order-grid">
                {[
                  ["待支付", IdCardIcon], ["待发货/自提", FileTextIcon], ["待收货", BackpackIcon], ["待评价", ChatBubbleIcon], ["售后/退款", CheckCircledIcon],
                ].map(([label, Icon], index) => {
                  const ActionIcon = Icon as typeof IdCardIcon;
                  return <button key={label as string} onClick={() => notifyProfileAction(label as string)}><span className="member-order-icon"><ActionIcon />{index === 0 ? <i>1</i> : null}</span><em>{label as string}</em></button>;
                })}
              </div>
            </section>

            <section className="member-panel member-services">
              <header><h1>常用功能</h1></header>
              <div className="member-service-grid">
                {[
                  ["地址管理", SewingPinFilledIcon, "mint"], ["用药人管理", PersonIcon, "sky"], ["收藏商品", HeartIcon, "rose"], ["发票管理", FileTextIcon, "peach"],
                  ["用药指导", MobileIcon, "peach"], ["查找门店", MagnifyingGlassIcon, "rose"], ["联系门店", BackpackIcon, "sky"], ["反馈建议", EnvelopeClosedIcon, "mint"],
                  ["投诉举报", ExclamationTriangleIcon, "rose"],
                ].map(([label, Icon, tone]) => {
                  const ActionIcon = Icon as typeof SewingPinFilledIcon;
                  return <button key={label as string} onClick={() => notifyProfileAction(label as string)}><span className={`member-service-icon ${tone as string}`}><ActionIcon /></span><em>{label as string}</em></button>;
                })}
              </div>
              <button className="member-service-float" onClick={() => notifyProfileAction("客服")}><ChatBubbleIcon /><span>客服</span></button>
            </section>
          </main>
        </MobileScroll>
      ) : null}

      {view !== "detail" && view !== "combo-list" && view !== "confirm-order" && view !== "order-detail" && view !== "payment-success" && !searchOpen ? nav : null}

      {sheet ? (
        <div className="reference-cart-sheet-mask" onClick={() => setSheet(false)}>
          <section className="reference-cart-sheet" onClick={(event) => event.stopPropagation()}>
            <i />
            <header><h2>{copy.cart}</h2><button className="reference-sheet-delete"><TrashIcon />{copy.clear}</button><button className="reference-sheet-close" aria-label={"\u5173\u95ed"} onClick={() => setSheet(false)}>{"\u00d7"}</button></header>
            <div className="reference-sheet-content">
              <section className="reference-delivery-tabs">{[copy.delivery, copy.express, copy.pickup].map((item) => <button className={delivery === item ? "selected" : ""} key={item} onClick={() => setDelivery(item)}>{item}</button>)}</section>
              {renderDeliveryInfo()}
              {renderCartProductGroups(true)}
              {renderInvalidComboCartSample()}
              {renderCartOptions()}
            </div>
            <footer className="reference-cart-checkout reference-sheet-checkout">{renderChoice(allCartItemsSelected, toggleCartSelection)}<span>{"\u5df2\u9009"}{selectedCartQuantity}{copy.pieces}</span><div className="reference-cart-total"><b>{copy.total}{"\uff1a"}<em>{"\u00a5"}{cartPayableTotal.toFixed(2)}</em></b><button className="reference-cart-discount-trigger" onClick={() => setDiscountDetailOpen(true)}>{"\u5171\u4f18\u60e0"}{(activePromotionSaving + fullReductionSaving + couponSaving).toFixed(2)}{"\u5143"}</button></div><button type="button" disabled={!selectedCartQuantity || Boolean(cartCheckoutBlockMessage)} title={cartCheckoutBlockMessage || undefined} onClick={openCartCheckout}>{copy.payNow}</button></footer>
          </section>
        </div>
      ) : null}
      {exchangeOpen ? (
        <div className="reference-exchange-mask" onClick={() => setExchangeOpen(false)}>
          <section className="reference-exchange-sheet" onClick={(event) => event.stopPropagation()}>
            <i />
            <header><h2>{"\u9009\u62e9\u6362\u8d2d\u5546\u54c1"}</h2><button aria-label={"\u5173\u95ed"} onClick={() => setExchangeOpen(false)}>{"\u00d7"}</button></header>
            <p className={`reference-exchange-qualified${exchangeQualified ? "" : " not-qualified"}`}><CheckCircledIcon />{exchangeQualifiedLabel}</p>
            <div className="reference-exchange-list">
              {exchangeProducts.map((item) => {
                const selected = Boolean(exchangeSelected[item.id]);
                const limitReached = !selected && (!exchangeQualified || exchangeCount >= 1);
                return <article key={item.id}><img src={item.image} alt="" /><div><h3><em>OTC</em>{item.name}</h3><p>{item.spec}</p><footer><span>{"\u6362\u8d2d\u4ef7 "}<b>{"\u00a5"}{item.price}</b><small>{"\u00a5"}{item.original}</small></span><button className={selected ? "selected" : limitReached ? "limit-reached" : ""} onClick={() => selectExchangeItem(item.id)}>{selected ? "\u53d6\u6d88\u6362\u8d2d" : "\u6362\u8d2d"}</button></footer></div></article>;
              })}
            </div>
            <footer className="reference-exchange-checkout"><span>{"\u5df2\u9009"}{exchangeCount}{"\u4ef6\u6362\u8d2d\u5546\u54c1"}</span><button onClick={() => setExchangeOpen(false)}>{"\u786e\u8ba4\u6362\u8d2d"}</button></footer>
          </section>
        </div>
      ) : null}
      {giftOpen ? (
        <div className="reference-exchange-mask" onClick={() => setGiftOpen(false)}>
          <section className="reference-exchange-sheet reference-gift-sheet" onClick={(event) => event.stopPropagation()}>
            <i />
            <header><h2>{"\u9009\u62e9\u8d60\u54c1"}</h2><button aria-label={"\u5173\u95ed"} onClick={() => setGiftOpen(false)}>{"\u00d7"}</button></header>
            <p className={`reference-exchange-qualified${giftQualified ? "" : " not-qualified"}`}><CheckCircledIcon />{giftQualified ? `\u5df2\u6ee1${giftThreshold}\u5143\uff0c\u53ef\u90091\u4ef6\u8d60\u54c1` : `\u8fd8\u5dee${giftRemaining.toFixed(2)}\u5143\uff0c\u6ee1${giftThreshold}\u5143\u53ef\u90091\u4ef6\u8d60\u54c1`}</p>
            <div className="reference-exchange-list">
              {giftProducts.map((item) => {
                const selected = giftSelectedId === item.id;
                const limitReached = !selected && (!giftQualified || Boolean(giftSelectedId));
                return <article key={item.id}><img src={item.image} alt="" /><div><h3><em>OTC</em>{item.name}</h3><p>{item.spec}</p><footer><span>{"\u8d60\u54c1\u4ef7 "}<b>{"\u00a5"}{item.price}</b></span><button className={selected ? "selected" : limitReached ? "limit-reached" : ""} onClick={() => selectGiftItem(item.id)}>{selected ? "\u53d6\u6d88\u8d60\u54c1" : "\u9009\u8d60\u54c1"}</button></footer></div></article>;
              })}
            </div>
            <footer className="reference-exchange-checkout"><span>{"\u5df2\u9009"}{giftSelectedId ? 1 : 0}{"\u4ef6\u8d60\u54c1"}</span><button onClick={() => setGiftOpen(false)}>{"\u786e\u8ba4\u8d60\u54c1"}</button></footer>
          </section>
        </div>
      ) : null}
      {pieceGiftOpen ? (
        <div className="reference-exchange-mask" onClick={() => setPieceGiftOpen(false)}>
          <section className="reference-exchange-sheet reference-gift-sheet" onClick={(event) => event.stopPropagation()}>
            <i />
            <header><h2>{"\u9009\u62e9\u4e70\u8d60\u5546\u54c1"}</h2><button aria-label={"\u5173\u95ed"} onClick={() => setPieceGiftOpen(false)}>{"\u00d7"}</button></header>
            <p className={`reference-exchange-qualified${pieceGiftQuota ? "" : " not-qualified"}`}><CheckCircledIcon />{pieceGiftQuota ? `\u5df2\u6ee1${promotionProductQuantity}\u4ef6\uff0c\u53ef\u9009${pieceGiftQuota}\u4ef6\u8d60\u54c1` : `${pieceGiftGroupThresholdText}\uff0c${pieceGiftOrderProgress}`}</p>
            <div className="reference-exchange-list">
              {giftProducts.map((item) => {
                const selectedQuantity = pieceGiftSelections[item.id] || 0;
                const limitReached = pieceGiftSelectedCount >= pieceGiftQuota;
                return <article key={item.id}><img src={item.image} alt="" /><div><h3><em>OTC</em>{item.name}</h3><p>{item.spec}</p><footer><span>{"\u8d60\u54c1\u4ef7 "}<b>{"\u00a5"}{item.price}</b></span><button className={selectedQuantity ? "selected" : limitReached || !pieceGiftQuota ? "limit-reached" : ""} onClick={() => selectPieceGiftItem(item.id)}>{selectedQuantity ? "\u53d6\u6d88\u8d60\u54c1" : "\u9009\u8d60\u54c1"}</button></footer></div></article>;
              })}
            </div>
            <footer className="reference-exchange-checkout"><span>{"\u5df2\u9009"}{pieceGiftSelectedCount}{"\u4ef6\u8d60\u54c1"}</span><button onClick={() => setPieceGiftOpen(false)}>{"\u786e\u8ba4\u8d60\u54c1"}</button></footer>
          </section>
        </div>
      ) : null}
      {confirmBenefitPickerActivity && confirmBenefitPickerGroup && confirmBenefitPickerMetrics ? (
        <div className="reference-exchange-mask" onClick={() => setConfirmBenefitPickerActivityId("")}>
          <section className="reference-exchange-sheet reference-gift-sheet" onClick={(event) => event.stopPropagation()}>
            <i />
            <header><h2>{confirmBenefitPickerActivity.type === "full-exchange" ? "选择换购商品" : confirmBenefitPickerActivity.type === "buy-x-get-y" ? "选择赠送商品" : "选择赠品"}</h2><button aria-label="关闭" onClick={() => setConfirmBenefitPickerActivityId("")}>×</button></header>
            <p className={`reference-exchange-qualified${confirmBenefitPickerQualified ? "" : " not-qualified"}`}><CheckCircledIcon />{confirmBenefitPickerStatusLabel}</p>
            <div className="reference-exchange-list">
              {confirmBenefitPickerActivity.type === "full-exchange" ? exchangeProducts.map((item) => {
                const selected = confirmBenefitPickerGroup.lines.some((line) => line.id === `confirm-exchange-${confirmBenefitPickerActivity.id}-${item.id}`);
                const limitReached = !selected && (!confirmBenefitPickerQualified || confirmBenefitPickerMetrics.selectedExchangeCount >= 1);
                return <article key={item.id}><img src={item.image} alt="" /><div><h3><em>OTC</em>{item.name}</h3><p>{item.spec}</p><footer><span>换购价 <b>¥{item.price}</b><small>¥{item.original}</small></span><button className={selected ? "selected" : limitReached ? "limit-reached" : ""} onClick={() => selectConfirmExchangeItem(confirmBenefitPickerActivity.id, item.id)}>{selected ? "取消换购" : "换购"}</button></footer></div></article>;
              }) : giftProducts.map((item) => {
                const giftLineId = confirmBenefitPickerActivity.type === "buy-x-get-y" ? `confirm-piece-gift-${confirmBenefitPickerActivity.id}-${item.id}` : `confirm-gift-${confirmBenefitPickerActivity.id}-${item.id}`;
                const selected = confirmBenefitPickerGroup.lines.some((line) => line.id === giftLineId);
                const selectedCount = confirmBenefitPickerMetrics.selectedGiftCount;
                const limitReached = !selected && (!confirmBenefitPickerQualified || selectedCount >= confirmBenefitPickerQuota);
                const selectGift = confirmBenefitPickerActivity.type === "buy-x-get-y" ? selectConfirmPieceGiftItem : selectConfirmGiftItem;
                return <article key={item.id}><img src={item.image} alt="" /><div><h3><em>OTC</em>{item.name}</h3><p>{item.spec}</p><footer><span>赠品价 <b>¥{item.price}</b></span><button className={selected ? "selected" : limitReached ? "limit-reached" : ""} onClick={() => selectGift(confirmBenefitPickerActivity.id, item.id)}>{selected ? "取消赠品" : "选赠品"}</button></footer></div></article>;
              })}
            </div>
            <footer className="reference-exchange-checkout"><span>已选{confirmBenefitPickerActivity.type === "full-exchange" ? confirmBenefitPickerMetrics.selectedExchangeCount : confirmBenefitPickerMetrics.selectedGiftCount}件{confirmBenefitPickerActivity.type === "full-exchange" ? "换购商品" : "赠品"}</span><button onClick={() => setConfirmBenefitPickerActivityId("")}>{confirmBenefitPickerActivity.type === "full-exchange" ? "确认换购" : "确认赠品"}</button></footer>
          </section>
        </div>
      ) : null}
      {comboGiftsOpen ? (
        <div className="reference-combo-gift-mask" onClick={() => setComboGiftsOpen(false)}>
          <section className="reference-combo-gift-sheet" onClick={(event) => event.stopPropagation()}>
            <header><h2>{"\u4f18\u60e0\u7ec4\u5408"}</h2><button aria-label={"\u5173\u95ed"} onClick={() => setComboGiftsOpen(false)}>{"\u00d7"}</button></header>
            <main><h3>{"\u7ec4\u5408\u5546\u54c1 x"}{comboChildTotalQuantity}</h3>{comboCartProducts.map((item, index) => <article key={item.id}><img src={item.image} alt="" /><div><strong>{item.name}</strong><span>{item.spec}</span><em>{"\u00a5"}{comboCartAllocatedPrices[index].toFixed(2)}</em></div><b>x{(summaryComboEntry?.quantity ?? 1) * getComboComponentRequiredQuantity(item)}</b></article>)}</main>
            <footer><button onClick={() => setComboGiftsOpen(false)}>{"\u786e\u5b9a"}</button></footer>
          </section>
        </div>
      ) : null}
      {searchComboSheetOpen && searchComboSheetActivity ? <div className="reference-cart-sheet-mask reference-combo-list-sheet-mask" onClick={() => setSearchComboSheetOpen(false)}>
        <section className="reference-cart-sheet reference-combo-list-sheet" role="dialog" aria-modal="true" aria-label="组合商品列表" onClick={(event) => event.stopPropagation()}>
          <i />
          <header><h2>优惠组合</h2><button className="reference-sheet-close" type="button" aria-label="关闭" onClick={() => setSearchComboSheetOpen(false)}>×</button></header>
          <div className="reference-sheet-content reference-combo-list-sheet-content">
            <section className="combo-list-summary">
              <img className="combo-list-activity-image" src={searchComboSheetActivity.image} alt={`${searchComboSheetActivity.name}活动图片`} />
              <div><strong>{searchComboSheetActivity.name}</strong><span>共{searchComboSheetActivity.productCount}种商品</span></div>
              <p><span>组合价</span><b>{"\u00a5"}{searchComboSheetActivity.price}</b></p>
            </section>
            <section className="combo-list-products" aria-label="组合商品">
              {searchComboSheetProducts.map((item, index) => <article className="combo-list-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div><h2><em>{item.tag}</em>{item.name}</h2><p>{copy.specification}：{item.spec}</p><small className="combo-list-stock">{getComboComponentInventoryLabel(item)}</small><footer><b>{"\u00a5"}{searchComboSheetAllocatedPrices[index].toFixed(2)}</b><span>×{getComboComponentRequiredQuantity(item)}</span></footer></div>
              </article>)}
            </section>
          </div>
          <footer className="combo-list-actionbar reference-combo-list-sheet-actionbar">
            <button type="button" className="combo-list-cart" aria-label="查看购物车" onClick={() => { keyboard.hide(); setSearchComboSheetOpen(false); setSheet(true); }}><BackpackIcon /><span>{copy.cart}</span>{navCartCount ? <i>{navCartCount}</i> : null}</button>
            <button type="button" className="combo-list-add" onClick={() => openComboPurchase("cart")}>{copy.joinCart}</button>
            <button type="button" className="combo-list-buy" onClick={() => openComboPurchase("buy")}>{copy.buyNow}</button>
          </footer>
        </section>
      </div> : null}
      {giftCheckoutPromptOpen && (view === "cart" || view === "confirm-order") ? (
        <div className="reference-delete-confirm-mask" onClick={() => setGiftCheckoutPromptOpen(false)}>
          <section className="reference-delete-confirm reference-gift-checkout-confirm" role="dialog" aria-modal="true" aria-label="赠品未选择" onClick={(event) => event.stopPropagation()}>
            <h2>您有赠品未选择</h2>
            <p>当前订单已满足赠品活动条件，结算后将无法再选择赠品。</p>
            <footer>
              <button type="button" onClick={() => { setGiftCheckoutPromptOpen(false); if (view === "cart") goto("payment-success"); else proceedPaymentOrder(); }}>暂不选择，继续结算</button>
              <button type="button" className="confirm" onClick={openGiftFromCheckoutPrompt}>去选赠品</button>
            </footer>
          </section>
        </div>
      ) : null}
      {deleteConfirmOpen && view === "cart" ? (
        <div className="reference-delete-confirm-mask" onClick={() => setDeleteConfirmOpen(false)}>
          <section className="reference-delete-confirm" role="dialog" aria-modal="true" aria-label="删除选中商品" onClick={(event) => event.stopPropagation()}>
            <h2>提示</h2>
            <p>确定要删除选中的{selectedDeleteQuantity}件商品吗？</p>
            <footer><button type="button" onClick={() => setDeleteConfirmOpen(false)}>取消</button><button type="button" className="confirm" onClick={deleteSelectedCartItems}>确定</button></footer>
          </section>
        </div>
      ) : null}
      {detailPurchaseOpen && view === "detail" ? (
        <div className="detail-purchase-mask" onClick={closeDetailPurchase}>
          <section className="detail-purchase-sheet" role="dialog" aria-modal="true" aria-label={detailPurchaseMode === "buy" ? "立即购买商品规格" : "加入购物车商品规格"} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="detail-purchase-close" aria-label="关闭" onMouseDown={(event) => event.preventDefault()} onClick={closeDetailPurchase}>×</button>
            <header>
              <img src={detailProduct.image} alt={detailProduct.name} />
              <div><b>{"\u00a5"}{detailProduct.price}</b><span>库存1170{detailInfo.unit}</span></div>
            </header>
            <div className="detail-purchase-spec"><strong>规格</strong><button type="button" onMouseDown={(event) => event.preventDefault()}>{detailProduct.spec}</button></div>
            <div className="detail-purchase-quantity"><strong>购买数量</strong><div><button type="button" aria-label="减少购买数量" disabled={detailPurchaseQuantity <= 1} onMouseDown={(event) => event.preventDefault()} onClick={() => setDetailPurchaseQuantity((quantity) => Math.max(1, quantity - 1))}><MinusIcon /></button><span>{detailPurchaseQuantity}</span><button type="button" aria-label="增加购买数量" onMouseDown={(event) => event.preventDefault()} onClick={() => setDetailPurchaseQuantity((quantity) => quantity + 1)}>+</button></div></div>
            <button type="button" className="detail-purchase-confirm" onMouseDown={(event) => event.preventDefault()} onClick={confirmDetailPurchase}>确认</button>
          </section>
        </div>
      ) : null}
      {comboPurchaseOpen ? (
        <div className="detail-purchase-mask combo-purchase-mask" onClick={closeComboPurchase}>
          <section className="detail-purchase-sheet combo-purchase-sheet" role="dialog" aria-modal="true" aria-label={comboPurchaseMode === "buy" ? "立即购买组合规格" : "加入购物车组合规格"} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="detail-purchase-close" aria-label="关闭" onMouseDown={(event) => event.preventDefault()} onClick={closeComboPurchase}>×</button>
            <header>
              <img src={detailProduct.image} alt={detailProduct.comboName ?? detailProduct.name} />
              <div><b>{"\u00a5"}{detailComboPrice.toFixed(2)}</b><span>库存{detailComboStock}套</span></div>
            </header>
            <div className="detail-purchase-quantity"><strong>购买数量</strong><div><button type="button" aria-label="减少组合购买数量" disabled={comboPurchaseQuantity <= 1} onMouseDown={(event) => event.preventDefault()} onClick={() => setComboPurchaseQuantity((quantity) => Math.max(1, quantity - 1))}><MinusIcon /></button><span>{comboPurchaseQuantity}</span><button type="button" aria-label="增加组合购买数量" disabled={comboPurchaseQuantity >= detailComboStock} onMouseDown={(event) => event.preventDefault()} onClick={() => setComboPurchaseQuantity((quantity) => Math.min(detailComboStock, quantity + 1))}>+</button></div></div>
            <button type="button" className="detail-purchase-confirm" onMouseDown={(event) => event.preventDefault()} onClick={confirmComboPurchase}>确认</button>
          </section>
        </div>
      ) : null}
      {exchangeToast ? <div className="reference-exchange-toast reference-exchange-toast-global">{exchangeToast}</div> : null}
      {discountDetailOpen ? (
        <div className="reference-discount-mask" onClick={() => setDiscountDetailOpen(false)}>
          <section className="reference-discount-sheet" onClick={(event) => event.stopPropagation()}>
            <h2>金额明细</h2>
            <div><span>商品小计</span><b>{"\u00a5"}{(activeSubtotal + exchangePayableTotal).toFixed(2)}</b></div>
            <div><span>配送费</span><b>{"\u00a5"}0</b></div>
            <div className="reference-discount-promotion-total">
              <span>优惠合计</span>
              <button type="button" aria-expanded={discountPromotionExpanded} aria-label={discountPromotionExpanded ? "折叠促销活动明细" : "展开促销活动明细"} onClick={() => setDiscountPromotionExpanded((expanded) => !expanded)}>
                <b className="discount-value">-{"\u00a5"}{(activePromotionSaving + fullReductionSaving).toFixed(2)}</b>
                <ChevronRightIcon />
              </button>
            </div>
            {discountPromotionExpanded ? (
              <section className="reference-discount-promotion-list" aria-label="促销活动明细">
                {promotionDiscountDetails.length
                  ? promotionDiscountDetails.map((detail) => <div key={detail.id}><span>{detail.label}</span><b>-{"\u00a5"}{detail.amount.toFixed(2)}</b></div>)
                  : <div className="empty"><span>暂无促销优惠</span></div>}
              </section>
            ) : null}
            <div><span>优惠券</span><b className="discount-value">-{"\u00a5"}{couponSaving.toFixed(2)}</b></div>
            <div className="reference-discount-total"><span>实付</span><b>{"\u00a5"}{cartPayableTotal.toFixed(2)}</b></div>
            <small>实际金额以提交订单为准</small>
            <button onClick={() => setDiscountDetailOpen(false)}>我知道了</button>
          </section>
        </div>
      ) : null}
    </div>
  );
}
