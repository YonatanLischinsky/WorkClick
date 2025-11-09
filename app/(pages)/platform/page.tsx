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
  const [priceRange, setPriceRange] = useState('All');
  const [numberOfRooms, setNumberOfRooms] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedButton, setSelectedButton] = useState('workers');

  const getAreaFromLocation = (location: string) => {
    if (!location) return null;
    const southCities = ['אשדוד', 'באר שבע', 'אילת'];
    const centerCities = ['תל אביב', 'ירושלים', 'נתניה', 'רעננה', 'פתח תקווה', 'חולון', 'ראשון לציון', 'מודיעין', 'קיסריה', 'גבעתיים'];
    const northCities = ['חיפה', 'טבריה', 'עכו', 'כרמיאל'];
    const lowerCaseLocation = location.toLowerCase();
    if (southCities.some(city => lowerCaseLocation.includes(city))) return 'South';
    if (centerCities.some(city => lowerCaseLocation.includes(city))) return 'Center';
    if (northCities.some(city => lowerCaseLocation.includes(city))) return 'North';
    return 'Other';
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      let tableName = '';
      switch (selectedButton) {
        case 'workers':
          tableName = 'posts_hr';
          break;
        case 'contractors':
          tableName = 'posts_contractors';
          break;
        case 'apartments':
          tableName = 'posts_apartments';
          break;
        default:
          tableName = 'posts_hr';
      }

      const { data, error } = await supabase.from(tableName).select('*');

      if (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
        setFilteredPosts([]);
        setSelectedPost(null);
      } else if (data) {
        const formattedData = data.map((post) => {
            const basePost: any = {
                ...post,
                postedAt: post.posted_at,
                type: selectedButton.slice(0, -1),
            };
            if (selectedButton === 'apartments') {
                basePost.area = getAreaFromLocation(post.location);
            } else {
                basePost.requiresApartment = post.requires_apartment;
            }
            return basePost;
        });
        setPosts(formattedData);
        if (formattedData.length > 0) {
          setSelectedPost(formattedData[0]);
        } else {
          setSelectedPost(null);
        }
      }
      setLoading(false);
    };

    fetchPosts();
  }, [selectedButton]);

  useEffect(() => {
    let newFilteredPosts = [...posts];

    if (location !== 'All') {
        newFilteredPosts = newFilteredPosts.filter((post) => post.area === location);
    }

    if (selectedButton === 'apartments') {
        if (priceRange !== 'All') {
            const [min, max] = priceRange.split('-').map(Number);
            newFilteredPosts = newFilteredPosts.filter(post => {
                if (max) {
                    return post.rent_amount >= min && post.rent_amount <= max;
                }
                return post.rent_amount >= min;
            });
        }
        if (numberOfRooms !== 'All') {
            const rooms = Number(numberOfRooms.replace('+', ''));
            if (numberOfRooms.includes('+')) {
                newFilteredPosts = newFilteredPosts.filter(post => post.number_of_rooms >= rooms);
            } else {
                newFilteredPosts = newFilteredPosts.filter(post => post.number_of_rooms == rooms);
            }
        }
    } else {
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
            if (selectedButton === 'workers') {
              newFilteredPosts = newFilteredPosts.filter(
                (post) => post.requiresApartment === (requiresApartment === 'Yes')
              );
            } else if (selectedButton === 'contractors') {
              newFilteredPosts = newFilteredPosts.filter(
                (post) => post.accommodation_provided === (requiresApartment === 'Yes')
              );
            }
          }
    }

    setFilteredPosts(newFilteredPosts);

    if (newFilteredPosts.length > 0) {
      const postToSelect = newFilteredPosts.find((p) => p.id === selectedPost?.id) || newFilteredPosts[0];
      if (postToSelect && (postToSelect.id !== selectedPost?.id || postToSelect.title !== selectedPost?.title)) {
        setSelectedPost(postToSelect);
      } else if (!selectedPost) {
        setSelectedPost(newFilteredPosts[0]);
      }
    } else {
      setSelectedPost(null);
    }
  }, [location, experience, requiresApartment, posts, selectedButton, priceRange, numberOfRooms]);

  const handleResetFilters = () => {
    setLocation('All');
    setExperience('All');
    setRequiresApartment('Default');
    setPriceRange('All');
    setNumberOfRooms('All');
  };

  const dir = language === 'he' ? 'rtl' : 'ltr';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]" dir={dir}>
        <div className="mb-4 text-4xl">{t('platform.loading')}</div>
        <svg
          className="animate-spin h-40 w-40 text-blue-600 inline-block"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <div className="mb-4 flex justify-center gap-4">
        <button
          onClick={() => setSelectedButton('workers')}
          className={`px-4 py-2 rounded-md ${
            selectedButton === 'workers' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-slate-700'
          }`}
        >
          {t('platform.workersAvailable')}
        </button>
        <button
          onClick={() => setSelectedButton('contractors')}
          className={`px-4 py-2 rounded-md ${
            selectedButton === 'contractors' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-slate-700'
          }`}
        >
          {t('platform.contractorsRequests')}
        </button>
        <button
          onClick={() => setSelectedButton('apartments')}
          className={`px-4 py-2 rounded-md ${
            selectedButton === 'apartments' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-slate-700'
          }`}
        >
          {t('platform.apartments')}
        </button>
      </div>
      <div className="mb-8 p-4 rounded-lg bg-gray-200 dark:bg-slate-800">
        <div className="mx-auto">
          <div className="flex items-end">
            {selectedButton === 'apartments' ? (
              <div className="flex-1 grid grid-cols-3">
                <div className="px-4 border-e border-gray-300 dark:border-slate-700">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('platform.location')}
                  </label>
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
                <div className="px-4 border-e border-gray-300 dark:border-slate-700">
                  <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('platform.priceRange')}
                  </label>
                  <select
                    id="priceRange"
                    name="priceRange"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  >
                    <option value="All">{t('platform.allOption')}</option>
                    <option value="0-4000">0 - 4000</option>
                    <option value="4000-6000">4000 - 6000</option>
                    <option value="6000-8000">6000 - 8000</option>
                    <option value="8000+">8000+</option>
                  </select>
                </div>
                <div className="px-4">
                  <label htmlFor="numberOfRooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('platform.numberOfRooms')}
                  </label>
                  <select
                    id="numberOfRooms"
                    name="numberOfRooms"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={numberOfRooms}
                    onChange={(e) => setNumberOfRooms(e.target.value)}
                  >
                    <option value="All">{t('platform.allOption')}</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5+</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-3">
                <div className="px-4 border-e border-gray-300 dark:border-slate-700">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('platform.location')}
                  </label>
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
                <div className="px-4 border-e border-gray-300 dark:border-slate-700">
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('platform.workExperience')}
                  </label>
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
                <div className="px-4">
                  <label htmlFor="requiresApartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedButton === 'contractors' ? t('platform.accommodationProvided') : t('platform.requiresApartment')}
                  </label>
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
              </div>
            )}
            <div className="px-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 opacity-0">
                {t('platform.resetFilters')}
              </label>
              <button
                onClick={handleResetFilters}
                className="mt-1 w-full rounded-md px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    {`${filteredPosts.length} ${t('platform.postsAvailable')}`}
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
                      <div className="text-sm text-gray-500 dark:text-gray-400">{post.company || post.location}</div>
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
              {selectedPost.type === 'apartment' ? (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedPost.location}</p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {selectedPost.company} - {selectedPost.location}
                </p>
              )}
              <p className="mb-4 dark:text-gray-400">{selectedPost.description}</p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedPost.type === 'worker' && (
                  <>
                    <p>{t('platform.areaLabel')}: {t(`platform.${selectedPost.area?.toLowerCase()}Option`)}</p>
                    <p>{t('platform.experienceLabel')}: {selectedPost.experience} {t('platform.yearsLabel')}</p>
                    <p>{t('platform.requiresApartment')}: {selectedPost.requiresApartment ? t('platform.yesOption') : t('platform.noOption')}</p>
                  </>
                )}
                {selectedPost.type === 'contractor' && (
                  <>
                    <p>{t('platform.areaLabel')}: {t(`platform.${selectedPost.area?.toLowerCase()}Option`)}</p>
                    <p>{t('platform.experienceLabel')}: {selectedPost.experience} {t('platform.yearsLabel')}</p>
                    <p>{t('platform.accommodationProvided')}: {selectedPost.accommodation_provided ? t('platform.yesOption') : t('platform.noOption')}</p>
                  </>
                )}
                {selectedPost.type === 'apartment' && (
                  <>
                    <p>{t('platform.rent')}: {selectedPost.rent_amount} {selectedPost.rent_currency}</p>
                    <p>{t('platform.rooms')}: {selectedPost.number_of_rooms}</p>
                    <p>{t('platform.area_sqm')}: {selectedPost.area_sqm} {t('platform.sqm')}</p>
                  </>
                )}
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
