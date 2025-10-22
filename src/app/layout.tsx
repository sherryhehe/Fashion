import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import AuthCheck from "@/components/AuthCheck";
import QueryProvider from "@/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shopo Admin Dashboard",
  description: "A fully responsive premium admin dashboard template",
  keywords: ["admin", "dashboard", "ecommerce", "management"],
  authors: [{ name: "Shopo Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="shortcut icon" href="/assets/images/favicon.ico" />
        {/* Vendor css (Require in all Page) */}
        <link href="/assets/css/vendor.min.css" rel="stylesheet" type="text/css" />
        {/* Icons css (Require in all Page) */}
        <link href="/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
        {/* App css (Require in all Page) */}
        <link href="/assets/css/app.min.css" rel="stylesheet" type="text/css" />
        {/* Button Interactions css (Enhanced UX) */}
        <link href="/assets/css/button-interactions.css" rel="stylesheet" type="text/css" />
      </head>
            <body className="antialiased">
              <QueryProvider>
                <ThemeProvider>
                  <AuthCheck>
                    {children}
                  </AuthCheck>
                </ThemeProvider>
              </QueryProvider>
        
        {/* Theme Settings Offcanvas */}
        <div className="offcanvas offcanvas-end border-0" tabIndex={-1} id="theme-settings-offcanvas">
          <div className="d-flex align-items-center bg-primary p-3 offcanvas-header">
            <h5 className="text-white m-0">Theme Settings</h5>
            <button type="button" className="btn-close btn-close-white ms-auto" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body p-0">
            <div data-simplebar className="h-100">
              <div className="p-3 settings-bar">
                <div>
                  <h5 className="mb-3 font-16 fw-semibold">Color Scheme</h5>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="data-bs-theme" id="layout-color-light" value="light" />
                    <label className="form-check-label" htmlFor="layout-color-light">Light</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="data-bs-theme" id="layout-color-dark" value="dark" />
                    <label className="form-check-label" htmlFor="layout-color-dark">Dark</label>
                  </div>
                </div>
                <div>
                  <h5 className="my-3 font-16 fw-semibold">Topbar Color</h5>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="data-topbar-color" id="topbar-color-light" value="light" />
                    <label className="form-check-label" htmlFor="topbar-color-light">Light</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="data-topbar-color" id="topbar-color-dark" value="dark" />
                    <label className="form-check-label" htmlFor="topbar-color-dark">Dark</label>
                  </div>
                </div>
                <div>
                  <h5 className="my-3 font-16 fw-semibold">Menu Color</h5>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="data-menu-color" id="leftbar-color-light" value="light" />
                    <label className="form-check-label" htmlFor="leftbar-color-light">Light</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="data-menu-color" id="leftbar-color-dark" value="dark" />
                    <label className="form-check-label" htmlFor="leftbar-color-dark">Dark</label>
                  </div>
                </div>
                <div>
                  <h5 className="my-3 font-16 fw-semibold">Sidebar Size</h5>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="data-menu-size" id="leftbar-size-default" value="default" />
                    <label className="form-check-label" htmlFor="leftbar-size-default">Default</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="data-menu-size" id="leftbar-size-small" value="condensed" />
                    <label className="form-check-label" htmlFor="leftbar-size-small">Condensed</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="data-menu-size" id="leftbar-hidden" value="hidden" />
                    <label className="form-check-label" htmlFor="leftbar-hidden">Hidden</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="data-menu-size" id="leftbar-size-small-hover-active" value="sm-hover-active" />
                    <label className="form-check-label" htmlFor="leftbar-size-small-hover-active">Small Hover Active</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="data-menu-size" id="leftbar-size-small-hover" value="sm-hover" />
                    <label className="form-check-label" htmlFor="leftbar-size-small-hover">Small Hover</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="offcanvas-footer border-top p-3 text-center">
            <div className="row">
              <div className="col">
                <button type="button" className="btn btn-danger w-100" id="reset-layout">Reset</button>
              </div>
            </div>
          </div>
        </div>

        
        {/* React Override Script - Load FIRST to prevent vanilla JS conflicts */}
        <Script
          src="/assets/js/react-override.js"
          strategy="beforeInteractive"
        />
        
        {/* External Scripts - Loaded after interactive */}
        <Script
          src="https://code.iconify.design/3/3.1.1/iconify.min.js"
          strategy="afterInteractive"
        />
        
        {/* Internal Scripts - Loaded after interactive */}
        <Script
          src="/assets/js/vendor.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/js/config.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/js/app.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/js/admin-functionality.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/js/dashboard-interactive.js"
          strategy="afterInteractive"
        />
        <Script
          src="/assets/js/button-functionality.js"
          strategy="afterInteractive"
        />
               <Script
                 src="/assets/js/dashboard.js"
                 strategy="afterInteractive"
               />
               <Script
                 src="/assets/js/layout.js"
                 strategy="afterInteractive"
               />
      </body>
    </html>
  );
}
