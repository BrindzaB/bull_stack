"use client"

import { useState } from "react";
import PortfolioSummaryCard from "@/components/portfolio/PortfolioSummaryCard";
import HoldingsTable from "@/components/portfolio/HoldingTable";
import AddHoldingModal from "@/components/portfolio/AddHoldingModal";

export default function PortfolioPage() {
    const [modalOpen, setModalOpen] = useState(false);

      return (
    <div className="space-y-3">

      <div className="flex items-center justify-start">
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
        >
          + Add Holding
        </button>
      </div>
      <PortfolioSummaryCard />
      <HoldingsTable />
      <AddHoldingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

    </div>
  );
}