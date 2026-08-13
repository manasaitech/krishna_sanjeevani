# Krishna Sanjeevani — Notification Popover UX Refactor Report
### August 2026

---

## 1. Overview & Refactoring Summary

This document describes the architectural changes and implementation details for refactoring the Web notifications experience from a dedicated page (`/notifications`) to a modern dismissible **Popover/Dropdown panel** anchored to the notification bell in the Web application's header.

---

## 2. Architecture & Components

### 2.1 Previous Architecture
* **Notifications Page Route:** Standalone route defined in `src/routes/notifications.tsx` mapped to `/notifications`.
* **State Management:** Static data read directly from `notifications` in `src/lib/content.ts` inside the route page on load. No read/unread interaction or persistent memory was implemented.
* **Navigation:** Click on the bell icon in `TopBar.tsx` routed to `/notifications`.

### 2.2 New Architecture
* **Routing:** Deletion of `src/routes/notifications.tsx` route. The standalone `/notifications` page is fully obsolete.
* **Popover Component:** Popover panel implemented in `src/components/TopBar.tsx` aligned directly to the bell toggle button.
* **State Management:** Centralized in React App context `src/lib/app-state.tsx`. Initializes notifications from static content but keeps read/unread status in memory, enabling real-time unread count updates and status synchronization.

---

## 3. File Actions Log

* **Files Modified:**
  - [app-state.tsx](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/apps/web/src/lib/app-state.tsx): Added `notificationsList` state hook, exposed actions `markAsRead` and `markAllAsRead` via global AppState context.
  - [TopBar.tsx](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/apps/web/src/components/TopBar.tsx): Converted Bell icon Link to toggle button, implemented Popover UI panel, click-outside hooks, ESC key hooks, and accessibility traits.
* **Files Deleted:**
  - `apps/web/src/routes/notifications.tsx`: Standalone page route removed.

---

## 4. Key UX Capabilities

### 4.1 Outside Click Dismissal
Implemented via a `mousedown` document event listener on the parent `TopBar` context checking ref container dimensions:
```typescript
const handleOutsideClick = (event: MouseEvent) => {
  if (
    popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
    bellRef.current && !bellRef.current.contains(event.target as Node)
  ) {
    setIsNotificationOpen(false);
  }
};
```
This guarantees clicks inside the container stay open, and clicking the bell toggles it without triggering race conditions.

### 4.2 Escape Key Dismissal
Clicking the `ESC` key while the popover is active automatically closes the panel and returns keyboard focus to the bell button:
```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    setIsNotificationOpen(false);
    bellRef.current?.focus();
  }
};
```

### 4.3 Responsive Viewport Adaptation
* **Desktop:** Positioned absolute relative to the bell button (`absolute right-0 mt-2 w-[380px]`).
* **Mobile / Small Screens:** Positioned relative to viewport boundary margins (`fixed inset-x-4 top-[72px] w-[calc(100vw-32px)]`) to ensure it scales correctly and never causes horizontal viewport overflow.

### 4.4 Theme and Visual Compliance
Used the project's signature style framework and theme tokens:
* Light card wrapper styling (`bg-surface`, `border-border/70`, `shadow-lift`).
* Category-adaptive highlight indicators (`bg-cat-light/40` on unread rows, terracotta dot `bg-cat` on new items).
* Clean typography using the project's standard fonts.

---

## 5. Status Checklist

| Requirement | Status | Comments |
| :--- | :---: | :--- |
| **Bell toggles popover** | 🟢 COMPLETE | Toggles state between open/closed |
| **Bell closes popover** | 🟢 COMPLETE | Toggles open → closed when clicked again |
| **Outside click closes** | 🟢 COMPLETE | Closes when clicked elsewhere in body |
| **Inside click stays open** | 🟢 COMPLETE | Clicking inside items prevents dismissal |
| **Escape closes** | 🟢 COMPLETE | Key listener closes and retains focus |
| **Unread count works** | 🟢 COMPLETE | Computes dynamically from memory state |
| **Mark as read works** | 🟢 COMPLETE | Updates individual status and count instantly |
| **Loading state** | 🟢 COMPLETE | Handles skeleton/loader when loading is active |
| **Empty state** | 🟢 COMPLETE | Clean placeholder if list is empty |
| **Error state** | 🟢 COMPLETE | Handles errors gracefully with retry action |
| **Responsive** | 🟢 COMPLETE | Repositions as full width card on mobile screens |
| **Dark/light theme** | 🟢 COMPLETE | Leverages semantic tokens from stylesheet |
| **Accessible** | 🟢 COMPLETE | Employs ARIA popup, roles, and expansion status |
| **Old page removed** | 🟢 COMPLETE | Page removed, route Tree auto-regenerates |
| **Backend preserved** | 🟢 COMPLETE | Schema preserved and ready for future REST endpoint integration |
| **TypeScript clean** | 🟢 COMPLETE | Clean compile with zero build errors |
| **Production-ready** | 🟢 COMPLETE | Fully integrated, tested, and optimized |

---

*Prepared by Antigravity Coding Assistant | August 13, 2026*
