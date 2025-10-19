'use client';

import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { Room } from 'business';

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await apiService.listRooms();
        setRooms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Timer App - Web</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Available Rooms</h2>
          
          {loading && (
            <p className="text-gray-600 dark:text-gray-400">Loading rooms...</p>
          )}
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
              <p className="text-sm mt-2">Make sure the backend server is running at http://localhost:8080</p>
            </div>
          )}
          
          {!loading && !error && rooms.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400">No rooms available. Create one using the mobile app!</p>
          )}
          
          {!loading && !error && rooms.length > 0 && (
            <ul className="space-y-4">
              {rooms.map((room) => (
                <li key={room.id} className="border border-gray-300 dark:border-gray-600 p-4 rounded">
                  <h3 className="font-semibold text-lg">{room.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Invite Code: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{room.invite_code}</code>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Timers: {Object.keys(room.timers || {}).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Users: {Object.keys(room.users || {}).length}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">About This Website</h2>
          <p className="text-gray-700 dark:text-gray-300">
            This Next.js website uses the same <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">business</code> package 
            as the mobile app for all API calls and business logic. The website focuses only on the UI layer.
          </p>
        </div>
      </main>
    </div>
  );
}
