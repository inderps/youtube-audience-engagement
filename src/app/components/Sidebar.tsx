import Link from 'next/link';
import Video from '../models/video';

interface SidebarProps {
  channelId: number;
  videos: Video[];
}

const Sidebar = ({ channelId, videos }: SidebarProps) => {
  return (
    <div className="w-full md:w-1/4 p-4 bg-gray-700 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Video List</h3>
      <ul className="list-none">
        {videos.map((video) => (
          <li key={video.id} className="mb-2">
            <Link
              href={`/channels/${channelId}/videos/${video.id}`}
              className="text-blue-400 hover:text-blue-600 transition duration-150 ease-in-out"
            >
              {video.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
