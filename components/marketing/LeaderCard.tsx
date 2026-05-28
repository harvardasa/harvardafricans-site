import { Leader } from '@/lib/marketing-types';
import Image from 'next/image';

interface LeaderCardProps {
  leader: Leader;
}

const LeaderCard = ({ leader }: LeaderCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64 w-full bg-gray-100">
        <Image
          src={leader.image || '/images/placeholder.jpg'}
          alt={leader.name}
          fill
          className={`${leader.imageFit || 'object-cover'} ${leader.imagePosition || 'object-center'}`}
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900">{leader.name}</h3>
        <p className="text-red-800 font-medium mb-2">{leader.role}</p>
        <p className="text-gray-600 text-sm mb-4">{leader.bio}</p>
        <div className="flex space-x-4">
          {leader.email && (
            <a href={`mailto:${leader.email}`} className="text-gray-400 hover:text-red-800">
              Email
            </a>
          )}
          {leader.linkedin && (
            <a href={leader.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700">
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderCard;
