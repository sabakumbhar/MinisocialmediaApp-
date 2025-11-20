import { useEffect, useState } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, UserPlus, UserCheck } from 'lucide-react';

interface ExploreProps {
  onViewProfile: (username: string) => void;
}

export function Explore({ onViewProfile }: ExploreProps) {
  const { profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
    if (currentProfile) {
      loadFollowing();
    }
  }, [currentProfile]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    if (!currentProfile) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentProfile.id);

      if (error) throw error;
      setFollowing(new Set(data?.map((f) => f.following_id) || []));
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!currentProfile) return;

    try {
      if (following.has(userId)) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentProfile.id)
          .eq('following_id', userId);
        setFollowing((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await supabase.from('follows').insert({
          follower_id: currentProfile.id,
          following_id: userId,
        });
        setFollowing((prev) => new Set(prev).add(userId));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentProfile?.id &&
      (user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore Users</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <button
                onClick={() => onViewProfile(user.username)}
                className="flex-shrink-0"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onViewProfile(user.username)}
                  className="text-left"
                >
                  <h3 className="font-bold text-gray-900 truncate hover:text-blue-600 transition">
                    {user.display_name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">@{user.username}</p>
                </button>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {user.bio || 'No bio yet'}
                </p>
              </div>

              <button
                onClick={() => handleFollow(user.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition flex-shrink-0 ${
                  following.has(user.id)
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {following.has(user.id) ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Follow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-600">No users found</p>
        </div>
      )}
    </div>
  );
}
