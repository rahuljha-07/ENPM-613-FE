"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { Button } from '@/components/ui/button';

export default function PaymentInfoPage({ params }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const BASE_URL = process.env.NEXT_PUBLIC_ILIM_BE;
  const token = localStorage.getItem("accessToken");
  // Get course details from query parameters
  const courseData = {
    id: searchParams.get('id') || "",
    title: searchParams.get('title') || "Unknown Course",
    description: searchParams.get('description') || "No description available.",
    instructor: searchParams.get('instructor') || "Unknown Instructor",
    rating: searchParams.get('rating') || "No rating",
    price: searchParams.get('price') || "$0",
  };
 console.log('coursedata', courseData)
 console.log('searcb params', searchParams)
 
  const courseId = courseData.id; // Assuming courseId is part of params
  console.log('------', courseData)
  const handlePayment = async () => {
    setLoading(true);
    try {
      // Initiate purchase request
   
      const response = await fetch(`${BASE_URL}/student/purchase-course/${courseId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const stripeUrl = data.body;
        
        // Open Stripe payment page in new tab
        window.open(stripeUrl, '_blank');

        // Start polling for payment status
        pollPaymentStatus();
      } else {
        console.error("Error initiating purchase");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const pollPaymentStatus = async () => {
    const interval = setInterval(async () => {
      if (attempts >= 30) {
        clearInterval(interval);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${BASE_URL}/student/course/${courseId}/check-purchase`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.body === "SUCCEEDED") {
            clearInterval(interval);
            setLoading(false);
            router.push('/purchased-courses');
          } else {
            setAttempts((prev) => prev + 1);
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 5000); // 1000ms interval
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <div className="border rounded-lg p-6 w-full max-w-md bg-white shadow-md">
          <h2 className="text-xl font-semibold mb-4">PAYMENT INFO</h2>
          <div className="space-y-4">
            <div>
              <span className="font-semibold">Course Title:</span> {courseData.title}
            </div>
            <div>
              <span className="font-semibold">Description:</span> {courseData.description}
            </div>
            <div>
              <span className="font-semibold">Instructor Name:</span> {courseData.instructor}
            </div>
            <div>
              <span className="font-semibold">Ratings:</span> ⭐ {courseData.rating}
            </div>
            <div>
              <span className="font-semibold">Price:</span> {courseData.price}
            </div>
          </div>
          <Button variant="outline" className="mt-6 w-full" onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Pay"}
          </Button>
          {loading && <p className="text-center mt-4">Please wait, processing your payment...</p>}
        </div>
      </div>
    </div>
  );
}
