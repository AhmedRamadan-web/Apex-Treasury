"use client";

import { useState } from "react";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <title>Apex Treasury - تداول منصة الخزانة المؤسسية</title>
        <meta
          name="description"
          content="منصة تداول لإدارة الخزانة المؤسسية، المحافظ الاستثمارية، والأصول الرقمية"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-surface text-on-surface min-h-screen flex w-full font-cairo antialiased selection:bg-primary/30 selection:text-primary">
        {/* Navigation Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Workspace */}
        <div className="flex-1 mr-0 md:mr-[260px] flex flex-col min-h-screen relative overflow-x-hidden">
          {/* Header */}
          <Header onToggleSidebar={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 mt-16 p-4 md:p-8 w-full mx-auto bg-[#070d18]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
