---
version: alpha
name: Roomify
description: Modern Academic Workspace design system for a responsive Indonesian campus
  room booking application.
colors:
  primary: '#2563EB'
  on-primary: '#FFFFFF'
  primary-hover: '#1D4ED8'
  primary-container: '#DBEAFE'
  on-primary-container: '#1E3A8A'
  background: '#F8FAFC'
  surface: '#FFFFFF'
  surface-subtle: '#F1F5F9'
  text-primary: '#0F172A'
  text-secondary: '#475569'
  text-muted: '#64748B'
  border: '#E2E8F0'
  border-strong: '#CBD5E1'
  success: '#15803D'
  on-success: '#FFFFFF'
  success-container: '#DCFCE7'
  on-success-container: '#14532D'
  warning: '#B45309'
  on-warning: '#FFFFFF'
  warning-container: '#FEF3C7'
  on-warning-container: '#78350F'
  danger: '#B91C1C'
  on-danger: '#FFFFFF'
  danger-container: '#FEE2E2'
  on-danger-container: '#7F1D1D'
  info: '#1D4ED8'
  info-container: '#DBEAFE'
  neutral-status: '#64748B'
  neutral-container: '#F1F5F9'
  focus-ring: '#60A5FA'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  inverse-primary: '#b4c5ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 2.75rem
    letterSpacing: -0.03em
  h1:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 2.5rem
    letterSpacing: -0.025em
  h2:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 2rem
    letterSpacing: -0.015em
  h3:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.625rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.375rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.25rem
  label:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.25rem
  caption:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1rem
  display-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 999px
  DEFAULT: 0.5rem
  full: 9999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
  '16': 64px
  margin-mobile: 16px
  margin-desktop: 24px
  gutter: 16px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: 12px 16px
    height: 44px
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-primary}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: 12px 16px
    height: 44px
  button-danger:
    backgroundColor: '{colors.danger}'
    textColor: '{colors.on-danger}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: 12px 16px
    height: 44px
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-primary}'
    typography: '{typography.body-md}'
    rounded: '{rounded.md}'
    padding: 10px 12px
    height: 44px
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.lg}'
    padding: 24px
  badge-available:
    backgroundColor: '{colors.success-container}'
    textColor: '{colors.on-success-container}'
    typography: '{typography.caption}'
    rounded: '{rounded.pill}'
    padding: 4px 10px
  badge-maintenance:
    backgroundColor: '{colors.warning-container}'
    textColor: '{colors.on-warning-container}'
    typography: '{typography.caption}'
    rounded: '{rounded.pill}'
    padding: 4px 10px
  badge-inactive:
    backgroundColor: '{colors.neutral-container}'
    textColor: '{colors.text-secondary}'
    typography: '{typography.caption}'
    rounded: '{rounded.pill}'
    padding: 4px 10px
  badge-pending:
    backgroundColor: '{colors.warning-container}'
    textColor: '{colors.on-warning-container}'
    typography: '{typography.caption}'
    rounded: '{rounded.pill}'
    padding: 4px 10px
  badge-approved:
    backgroundColor: '{colors.success-container}'
    textColor: '{colors.on-success-container}'
    typography: '{typography.caption}'
    rounded: '{rounded.pill}'
    padding: 4px 10px
  badge-rejected:
    backgroundColor: '{colors.danger-container}'
    textColor: '{colors.on-danger-container}'
    typography: '{typography.caption}'
    rounded: '{rounded.pill}'
    padding: 4px 10px
  badge-completed:
    backgroundColor: '{colors.info-container}'
    textColor: '{colors.on-primary-container}'
    typography: '{typography.caption}'
    rounded: '{rounded.pill}'
    padding: 4px 10px
  sidebar:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-secondary}'
    rounded: '{rounded.none}'
    padding: 16px
    width: 256px
  header:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.none}'
    padding: 0 24px
    height: 64px
  dialog:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.xl}'
    padding: 24px
---

