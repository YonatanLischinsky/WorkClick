'use client';

import { useState, useEffect, useContext } from 'react';
import { getTranslation } from '~/utils/i18n';
import { LanguageContext } from '~/context/LanguageContext';
import { supabase } from '~/utils/supabase';

const PlatformPage = () => {
  const { language } = useContext(LanguageContext);
  const t = (key) => getTranslation(language, key);

  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [location, setLocation] = useState('All');
  const [experience, setExperience] = useState('All');
  const [requiresApartment, setRequiresApartment] = useState('Default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('posts_hr').select('*');

      if (error) {
        console.error('Error fetching posts:', error);
      } else if (data) {
        const formattedData = data.map((post) => ({
          ...post,
          postedAt: post.posted_at,
          requiresApartment: post.requires_apartment,
        }));
        setPosts(formattedData);
        setFilteredPosts(formattedData);
        if (formattedData.length > 0) {
          setSelectedPost(formattedData[0]);
        }
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    let newFilteredPosts = [...posts];

    if (location !== 'All') {
      newFilteredPosts = newFilteredPosts.filter((post) => post.area === location);
    }

    if (experience !== 'All') {
      switch (experience) {
        case '0-2':
          newFilteredPosts = newFilteredPosts.filter((post) => post.experience >= 0 && post.experience <= 2);
          break;
        case '2-5':
          newFilteredPosts = newFilteredPosts.filter((post) => post.experience >= 2 && post.experience <= 5);
          break;
        case '5+':
          newFilteredPosts = newFilteredPosts.filter((post) => post.experience >= 5);
          break;
        default:
          break;
      }
    }

    if (requiresApartment !== 'Default') {
      newFilteredPosts = newFilteredPosts.filter(
        (post) => post.requiresApartment === (requiresApartment === 'Yes')
      );
    }

    setFilteredPosts(newFilteredPosts);

    if (newFilteredPosts.length > 0) {
      const postToSelect = newFilteredPosts.find((p) => p.id === selectedPost?.id) || newFilteredPosts[0];
      if (postToSelect && (postToSelect.id !== selectedPost?.id || postToSelect.title !== selectedPost?.title)) {
        setSelectedPost(postToSelect);
      }
    } else {
      setSelectedPost(null);
    }
  }, [location, experience, requiresApartment, posts, selectedPost]);

  const handleResetFilters = () => {
    setLocation('All');
    setExperience('All');
    setRequiresApartment('Default');
  };

  const dir = language === 'he' ? 'rtl' : 'ltr';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" dir={dir}>
        {t('platform.loading')}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <div className="mb-8 p-4 rounded-lg bg-gray-200 dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-700">
        <div className="max-w-4xl">
          <div className="grid grid-cols-[1fr,1fr,1.5fr,auto] gap-4 items-end">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('platform.location')}
              </label>
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('platform.workExperience')}
              </label>
            </div>
            <div>
              <label htmlFor="requiresApartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('platform.requiresApartment')}
              </label>
            </div>
            <div></div> {/* Empty label for the button */}
            <div>
              <select
                id="location"
                name="location"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="All">{t('platform.allOption')}</option>
                <option value="South">{t('platform.southOption')}</option>
                <option value="Center">{t('platform.centerOption')}</option>
                <option value="North">{t('platform.northOption')}</option>
              </select>
            </div>
            <div>
              <select
                id="experience"
                name="experience"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="All">{t('platform.allOption')}</option>
                <option value="0-2">0-2</option>
                <option value="2-5">2-5</option>
                <option value="5+">5+</option>
              </select>
            </div>
            <div>
              <select
                id="requiresApartment"
                name="requiresApartment"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={requiresApartment}
                onChange={(e) => setRequiresApartment(e.target.value)}
              >
                <option value="Default">{t('platform.defaultOption')}</option>
                <option value="Yes">{t('platform.yesOption')}</option>
                <option value="No">{t('platform.noOption')}</option>
              </select>
            </div>
            <div>
              <button
                onClick={handleResetFilters}
                className="rounded-md px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('platform.resetFilters')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="space-y-4 h-96 overflow-y-auto rounded-lg border-2 border-gray-300 dark:border-slate-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead
                className={
                  filteredPosts.length > 0 ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-slate-700'
                }
              >
                <tr>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                  >
                    {t('platform.availablePosts')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 ${
                      selectedPost?.id === post.id ? 'bg-gray-200 dark:bg-slate-900' : ''
                    }`}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{post.company}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="md:col-span-2">
          {selectedPost && (
            <div className="p-4 border-2 border-gray-300 rounded-lg dark:border-slate-700">
              <h3 className="font-bold text-xl mb-2 dark:text-white">{selectedPost.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedPost.company} - {selectedPost.location}
              </p>
              <p className="mb-4 dark:text-gray-400">{selectedPost.description}</p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>{t('platform.areaLabel')}: {t(`platform.${selectedPost.area.toLowerCase()}Option`)}</p>
                <p>{t('platform.experienceLabel')}: {selectedPost.experience} {t('platform.yearsLabel')}</p>
                <p>{t('platform.requiresApartment')}: {selectedPost.requiresApartment ? t('platform.yesOption') : t('platform.noOption')}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">{t('platform.postedOnLabel')}: {new Date(selectedPost.postedAt).toLocaleDateString('en-GB')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformPage;
