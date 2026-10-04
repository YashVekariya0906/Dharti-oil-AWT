/**
 * views/index.js
 *
 * MVC Views Layer — Re-exports all page-level view components.
 *
 * In this project's MVC structure:
 * - views/      → Full-page view components (screens rendered by App.jsx based on state/routing)
 * - components/ → Reusable UI sub-components used within views (Navbar, Footer, CartDrawer, etc.)
 * - assets/     → Static files (images, icons, etc.)
 * - utils/      → Utility/helper functions and API clients
 * - locales/    → Localization dictionary files
 */

// ===== PUBLIC VIEWS =====
export { default as HomeView } from './HomeView';
export { default as BlogView } from './BlogView';
export { default as ContactUsView } from './ContactUsView';
export { default as AboutUsView } from './AboutUsView';
export { default as ProductInfoView } from './ProductInfoView';
export { default as ReturnPolicyView } from './ReturnPolicyView';

// ===== AUTH VIEWS =====
export { default as LoginView } from './LoginView';
export { default as RegisterView } from './RegisterView';

// ===== USER VIEWS =====
export { default as UserProfileView } from './UserProfileView';

// ===== ADMIN VIEWS =====
export { default as AdminDashboardView } from './AdminDashboardView';

// ===== BROKER VIEWS =====
export { default as BrokerDashboardView } from './BrokerDashboardView';
export { default as BrokerLoginView } from './BrokerLoginView';
