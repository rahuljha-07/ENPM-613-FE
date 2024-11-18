"use client";
import React, { useState } from "react";
import RejectionModal from "./components/RejectionModal";
import ApplicationCard from "../insttructor-app-admin/components/Applicationcard";

const applications = [
  { name: "John Doe", title: "Instructor of Mathematics" },
  { name: "Jane Smith", title: "Instructor of Science" },
];

const InstructorApplicationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRejectClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSendReason = (reason) => {
    console.log("Rejection reason:", reason);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Instructor Applications</h1>

      <div className="space-y-4">
        {applications.map((app, index) => (
          <ApplicationCard
            key={index}
            name={app.name}
            title={app.title}
            onReject={handleRejectClick} // Trigger modal on reject
          />
        ))}
      </div>

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSend={handleSendReason}
      />
    </div>
  );
};

export default InstructorApplicationsPage;
