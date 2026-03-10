# Fashion App – Requirements Checklist

This document verifies each requirement from the last scope against the codebase.

---

## 1. Home page lagging

| Check | Status | Where |
|-------|--------|--------|
| Defer non-critical work so first paint isn’t blocked | Done | `mobile/src/screens/HomeScreen/index.tsx`: image preload runs after 50ms `setTimeout` |
| Reduce logging in production | Done | Banner/carousel/preload logs wrapped in `__DEV__`; preload errors not logged in production |

---

## 2. Recommended / random products on home

| Check | Status | Where |
|-------|--------|--------|
| “Recommended” section shows products (not empty) | Done | Section uses random API when logged out, personalized when logged in |
| Different order/set each time user opens app | Done | `useRandomProducts(10, focusShuffleKey)`; `useFocusEffect` increments `focusShuffleKey` so refetch gives new random set; Featured & Recently Added use `focusShuffleKey` in `useMemo` for shuffle |
| Backend random endpoint | Done | `GET /api/products/random?limit=10` in `productController.mongodb.ts` (aggregation `$sample`) |
| Mobile hook and usage | Done | `useRandomProducts`, `getRandom` in `product.service.ts`; HomeScreen uses it for “Recommended for You” when not logged in |

---

## 3. Style issue

| Check | Status | Where |
|-------|--------|--------|
| Admin: product add/edit – style dropdown shows existing styles | Done | `admin/src/app/product-add/page.tsx` and `product-edit/page.tsx`: `useStyles()`, dropdown options from `styles.map(s => <option value={s.name}>{s.name}</option>)` |
| App: style page banner shows that style’s image (not generic “girl in green”) | Done | `mobile/src/screens/StyleDetailScreen/index.tsx`: `useStyleByName(styleName)`, banner `source={style?.image ? getImageSource(style.image) : images.casual}` |

---

## 4. Setting up payments

| Check | Status | Where |
|-------|--------|--------|
| Payments go to your account | Done | Backend uses Stripe; `STRIPE_SECRET_KEY` in env controls connected account |
| Change payment details in admin | Done | Admin **Settings** → Payment Settings: view Stripe status, edit **currency** (stored in DB `Setting` key `payment_currency`) |
| Backend uses DB currency for Stripe | Done | `orderController.mongodb.ts` and product controller read `payment_currency` from `Setting` |

---

## 5. Custom categories

| Check | Status | Where |
|-------|--------|--------|
| Add / edit / remove custom home categories | Done | Admin **Others → Home Categories** (`/home-categories-list`), add (`/home-category-add`), edit (`/home-category-edit`) |
| Show below Featured on home | Done | `mobile/src/screens/HomeScreen/index.tsx`: “Featured Items” section, then “Custom Home Categories” block, then “Recently Added” |
| Backend model and API | Done | `HomeCategory` model, CRUD, `GET /api/home-categories/app` for app (with products) |

---

## 6. Banner integration (brand)

| Check | Status | Where |
|-------|--------|--------|
| Extra homepage banner that leads to brand page | Done | Position `homepage_brand` in Banner model; mobile brand carousel with “Shop Now” → `StoreDetail` with `storeId: banner.linkUrl` |
| Swipable | Done | Brand banners in horizontal `FlatList` (swipable carousel) |
| Select location/order in admin | Done | Admin **Banners → Add Banner** / **Edit Banner**: position “Homepage (Brand)”, **Link URL / Brand ID** (`linkUrl`), **Order** (`order`) |
| Backend | Done | `Banner` model: `position: 'homepage_brand'`, `order`, `linkUrl`; routes and controller support them |

---

## 7. Manually add reviews, sold count, remove reviews in app

| Check | Status | Where |
|-------|--------|--------|
| Bulk add reviews (e.g. 700) from admin | Done | Product **Edit** → “Bulk add reviews”: count, default name/rating/comment, button calls `POST /api/products/:id/reviews/bulk` |
| Item sold indicator visible in app | Done | `ProductDetailScreen`: “X sold” next to rating when `product.salesCount > 0` |
| Manually set sold count in admin | Done | Product **Edit**: “Items sold” field, saved with product (`salesCount`) |
| Reviews section removed in app | Done | No reviews UI in `ProductDetailScreen`; review hooks/state and `handleReviewSubmit` removed so reviews are not fetched or shown |

---

## Summary

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Home page lagging | Done |
| 2 | Recommended / random products on home | Done |
| 3 | Style: admin dropdown + app style banner | Done |
| 4 | Payments + admin payment settings | Done |
| 5 | Custom home categories (add/edit/remove, below Featured) | Done |
| 6 | Brand banner on homepage (swipable, link to brand, admin order/link) | Done |
| 7 | Bulk reviews, sold count in admin, sold in app, reviews removed in app | Done |

All listed requirements are implemented and verified in the codebase.
