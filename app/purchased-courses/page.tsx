// app/purchased-courses/page.tsx
import Sidebar from '../components/Sidebar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function PurchasedCoursesPage() {
  // Sample purchased course data
  const purchasedCourses = [
    { id: 1, title: 'How to learn Driving', instructor: 'Vivek', date: '04/11/2005', progress: 25 },
    { id: 2, title: 'How to learn Cooking', instructor: 'Rahul', date: '29/05/2022', progress: 100 },
    { id: 3, title: 'How to learn Driving', instructor: 'Vivek', date: '04/11/2005', progress: 15 },
    { id: 4, title: 'How to learn DJ Music', instructor: 'Pranav', date: '20/08/2011', progress: 15 },
  ];

  return (
    <div className="flex">
      {/* Sidebar with fixed position */}
      <div className="fixed top-0 left-0 h-full w-16 lg:w-48 bg-gray-800 text-white">
        <Sidebar />
      </div>

      {/* Main Content with adjusted padding */}
      <div className="flex-1 ml-16 lg:ml-48 p-6 bg-gray-100 overflow-y-auto h-screen">
        <h1 className="text-3xl font-bold mb-4">Purchased Courses</h1>
        <p className="text-lg mb-8">Welcome Back!</p>

        {/* List of Purchased Courses */}
        <div className="space-y-6">
          {purchasedCourses.map((course) => (
            <div key={course.id} className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{course.title} - {course.instructor}</h2>
                <p className="text-gray-500 text-sm">Date Purchased: {course.date}</p>
                
                {/* Progress Bar */}
                <Progress value={course.progress} className="my-4" />
                <p className="text-sm text-gray-700">Progress: {course.progress}%</p>
              </div>

              {/* Continue or View Certificate Button */}
              <div className="ml-4">
                {course.progress === 100 ? (
                  <Button variant="outline">View Certificate</Button>
                ) : (
                  <Button variant="outline">Continue</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
