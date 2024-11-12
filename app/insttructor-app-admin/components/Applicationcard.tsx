import { Button } from '@/components/ui/button';

const ApplicationCard = ({ name, title }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg mb-4 shadow-sm">
      {/* Applicant Info */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          {/* Placeholder for User Icon */}
          <span className="text-xl">👤</span>
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <Button variant="outline">Check Application</Button>
        <Button variant="success" className="text-green-600">Approve</Button>
        <Button variant="destructive" className="text-red-600">Reject</Button>
      </div>
    </div>
  );
};

export default ApplicationCard;
