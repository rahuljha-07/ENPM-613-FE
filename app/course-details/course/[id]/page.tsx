"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { Button } from '@/components/ui/button';

export default function PaymentInfoPage({ params }) {
  const searchParams = useSearchParams();

  // Get course details from query parameters
  const courseData = {
    title: searchParams.get('title') || "Unknown Course",
    description: searchParams.get('description') || "No description available.",
    instructor: searchParams.get('instructor') || "Unknown Instructor",
    rating: searchParams.get('rating') || "No rating",
    price: searchParams.get('price') || "$0",
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
          <Button variant="outline" className="mt-6 w-full">
            Pay
          </Button>
        </div>
      </div>
    </div>
  );
}
