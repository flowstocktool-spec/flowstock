# Flowstock Design Guidelines

## Design Approach: Design System Approach (Material Design)
**Justification**: This is a utility-focused productivity tool where efficiency, clarity, and learnability are paramount. The application handles data-dense content (product lists, stock levels, supplier information) and requires standard UI patterns for optimal user experience.

## Core Design Elements

### A. Color Palette
- **Primary**: 25 85% 50% (Deep blue for trust and reliability)
- **Secondary**: 210 15% 95% (Light gray for subtle backgrounds)
- **Success**: 120 60% 45% (Green for positive stock levels)
- **Warning**: 45 95% 55% (Orange for low stock alerts)
- **Error**: 0 75% 55% (Red for out of stock)
- **Background**: 0 0% 98% (light mode), 220 15% 8% (dark mode)

### B. Typography
- **Primary Font**: Inter (Google Fonts)
- **Headings**: Semi-bold (600), sizes: text-3xl, text-2xl, text-xl
- **Body**: Regular (400), sizes: text-base, text-sm
- **Data/Numbers**: Mono font for stock quantities and IDs

### C. Layout System
**Spacing Units**: Consistent use of Tailwind units 2, 4, 8, and 16
- Tight spacing: p-2, m-2 (buttons, form inputs)
- Standard spacing: p-4, m-4 (cards, sections)
- Generous spacing: p-8, m-8 (page containers)
- Large spacing: p-16 (hero sections, major divisions)

### D. Component Library

**Navigation**
- Clean header with logo, main navigation, and user profile
- Sidebar navigation for main sections: Dashboard, Products, Suppliers, Alerts, Settings

**Data Display**
- Table components with sortable headers for product listings
- Card layouts for supplier information and alert summaries
- Status badges for stock levels (Good/Low/Out of Stock)
- Progress indicators for bulk upload processing

**Forms**
- Clean input fields with clear labels
- File upload areas with drag-and-drop functionality
- Email configuration forms with validation
- Threshold setting controls with number inputs

**Dashboard Elements**
- Summary cards showing total products, active alerts, recent uploads
- Simple charts showing stock distribution (if needed)
- Recent activity feed for uploaded reports and sent alerts

**Overlays**
- Modal dialogs for product/supplier creation and editing
- Toast notifications for successful uploads and alert confirmations
- Confirmation dialogs for critical actions

### E. Animations
Minimal animations only for:
- Loading states during file processing
- Subtle hover effects on interactive elements
- Toast notification slide-ins

## Key Design Principles

1. **Data Clarity**: Prioritize clear presentation of stock data and supplier information
2. **Workflow Efficiency**: Streamlined flows for daily stock report uploads
3. **Status Visibility**: Clear visual indicators for stock levels and alert status
4. **Clean Hierarchy**: Logical information architecture supporting the core workflow
5. **Accessibility**: Consistent dark mode support and clear color contrast

## Images
No hero images required. This is a utility-focused application where:
- **Dashboard**: Simple icon-based summary cards
- **Product listings**: Optional small product thumbnails (placeholder if none)
- **Empty states**: Simple illustrations for empty product lists or no alerts
- **File upload**: Visual drop zone indicator

The design should feel professional, trustworthy, and focused on getting work done efficiently rather than creating visual excitement.