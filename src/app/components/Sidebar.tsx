'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Video {
  id: number;
  name: string;
}

interface SidebarProps {
  channelId: number;
  videos: Video[];
}

const Sidebar = ({ channelId, videos }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="md:hidden flex items-center p-4 absolute top-0 left-0 z-20">
        <button onClick={() => setIsOpen(!isOpen)}>
          <svg
            className="w-6 h-6 text-gray-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 bg-gray-900 p-4 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 z-10`}
      >
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Videos</h3>
        <ul className="list-none mb-4">
          <li className="mb-2 bg-gray-900 hover:bg-gray-700 rounded-md transition-colors duration-150 ease-in-out">
            <Link
              href={`/channels/${channelId}`}
              className="block text-gray-200 hover:text-white py-2 pl-2 pr-4 transition duration-150 ease-in-out w-full"
            >
              Channel Home
            </Link>
          </li>
        </ul>
        <ul className="list-none">
          {videos.map((video) => (
            <li
              key={video.id}
              className="mb-2 bg-gray-900 hover:bg-gray-700 rounded-md transition-colors duration-150 ease-in-out"
            >
              <Link
                href={`/channels/${channelId}/videos/${video.id}`}
                className="block text-gray-200 hover:text-white py-2 pl-2 pr-4 transition duration-150 ease-in-out w-full"
              >
                {video.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
