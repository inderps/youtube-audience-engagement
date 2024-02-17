'use client';
import { FormEvent } from 'react';

export default function Home() {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const channelUrl = (
      form.elements.namedItem('channelUrl') as HTMLInputElement
    ).value;

    try {
      const response = await fetch('/channels', {
        method: 'POST',
        body: JSON.stringify({ channelUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = `/channels/${data.channelId}`;
      } else {
        console.error('Submission failed');
      }
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-800">
      <div className="text-center">
        <form
          onSubmit={handleSubmit}
          className="dark:bg-gray-700 p-10 rounded-lg"
        >
          <div>
            <label
              htmlFor="channelUrl"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              YouTube Channel URL
            </label>
            <input
              type="text"
              id="channelUrl"
              name="channelUrl"
              required
              className="bg-gray-900 text-white appearance-none border-2 border-gray-700 rounded w-full py-2 px-4 leading-tight focus:outline-none focus:bg-gray-600 focus:border-purple-500"
              placeholder="Enter Channel ID"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none"
          >
            Prepare Audience Engagement
          </button>
        </form>
      </div>
    </div>
  );
}
