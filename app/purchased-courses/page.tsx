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

      {/* Main Content with adjusted padding to prevent overlap */}
      <div className="flex-1 ml-20 lg:ml-60 p-8 bg-gradient-to-br from-gray-100 to-gray-200 h-screen overflow-y-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6">Purchased Courses</h1>
        <p className="text-lg font-medium text-gray-700 mb-8">Welcome back! Here are your enrolled courses.</p>

        {/* List of Purchased Courses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedCourses.map((course) => (
            <div key={course.id} className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{course.title}</h2>
                <p className="text-gray-500 text-sm mb-2">Instructor: {course.instructor}</p>
                <p className="text-gray-500 text-sm mb-4">Date Purchased: {course.date}</p>

                {/* Progress Bar */}
                <div className="my-4">
                  <Progress value={course.progress} className="h-2 rounded-full bg-gray-200" />
                  <p className="text-sm text-gray-600 mt-1">Progress: {course.progress}%</p>
                </div>
              </div>

              {/* Continue or View Certificate Button */}
              <div className="mt-4">
                {course.progress === 100 ? (
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition duration-200">
                    View Certificate
                  </Button>
                ) : (
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition duration-200">
                    Continue
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
