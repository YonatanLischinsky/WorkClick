'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState, useEffect } from 'react';

const PlatformPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from('hr_posts').select('*');
      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data);
        if (data.length > 0) {
          setSelectedPost(data[0]);
        }
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Platform</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Available Workers</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <button
                key={post.id}
                className="w-full text-left p-4 border rounded-lg hover:bg-gray-100"
                onClick={() => setSelectedPost(post)}
              >
                <h3 className="font-bold">{post.title}</h3>
                <p className="text-sm text-gray-600">{post.location}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Post Details</h2>
          {selectedPost && (
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold text-xl mb-2">{selectedPost.title}</h3>
              <p className="text-gray-600 mb-4">{selectedPost.location}</p>
              <p>{selectedPost.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformPage;
