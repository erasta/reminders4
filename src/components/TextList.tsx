'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Text {
  id: number;
  content: string;
  created_at: string;
}

export default function TextList() {
  const { data: session } = useSession();
  const [texts, setTexts] = useState<Text[]>([]);
  const [newText, setNewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTexts() {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch('/api/texts');
        if (!response.ok) {
          throw new Error('Failed to fetch texts');
        }
        const data = await response.json();
        setTexts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching texts:', error);
        setError('Failed to load texts');
        setTexts([]);
      }
    }

    fetchTexts();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newText }),
      });

      if (!response.ok) {
        throw new Error('Failed to add text');
      }

      const newTextItem = await response.json();
      setTexts(prevTexts => [newTextItem, ...prevTexts]);
      setNewText('');
    } catch (error) {
      console.error('Error adding text:', error);
      setError('Failed to add text');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter your text..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? 'Adding...' : 'Add Text'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {texts.length === 0 ? (
          <p className="text-gray-500 text-center">No texts yet. Add your first text above!</p>
        ) : (
          texts.map((text) => (
            <div
              key={text.id}
              className="p-4 border rounded bg-white shadow-sm"
            >
              <p className="text-gray-800">{text.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(text.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 