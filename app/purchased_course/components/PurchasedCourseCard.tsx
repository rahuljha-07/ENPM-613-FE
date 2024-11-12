import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const PurchasedCourseCard = ({ title, instructor, date, progress, isCompleted }) => {
  return (
    <Card className="p-4 shadow-lg border border-gray-200 mb-4 flex justify-between items-center">
      <div>
        <CardTitle className="text-lg font-semibold">{title} - {instructor}</CardTitle>
        <p className="text-gray-500 text-sm mb-2">{date}</p>
        <Progress value={progress} className="my-2" />
        <p className="text-sm text-gray-700">Progress: {progress}%</p>
      </div>

      <div>
        {isCompleted ? (
          <Button variant="outline">View Certificate</Button>
        ) : (
          <Button variant="secondary">Continue</Button>
        )}
      </div>
    </Card>
  );
};

export default PurchasedCourseCard;
