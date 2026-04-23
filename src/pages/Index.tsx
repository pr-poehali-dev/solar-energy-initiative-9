import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Featured from "@/components/Featured";
import Promo from "@/components/Promo";
import MapPreview from "@/components/MapPreview";
import ReportDrawer from "@/components/ReportDrawer";
import Footer from "@/components/Footer";

const Index = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <main className="min-h-screen">
      <div className="relative">
        <Hero />
        <Header onReportClick={() => setDrawerOpen(true)} />
      </div>
      <Featured />
      <MapPreview />
      <Promo />
      <Footer />
      <ReportDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </main>
  );
};

export default Index;