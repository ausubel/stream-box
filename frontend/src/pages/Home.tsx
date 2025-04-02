import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Play } from 'lucide-react';

// Tipo para los videos
interface Video {
  id: number;
  title: string;
  youtube_link: string;
  description: string;
  type: string;
  status: string;
  thumbnail: string | null;
  user_id: number;
  created_at: string;
  tags: string[];
}

// Función para extraer el ID de YouTube de diferentes formatos de URL
const extractYoutubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

// Componente para la tarjeta de video
const VideoCard = ({ video, onClick }: { video: Video; onClick: () => void }) => {
  const videoId = extractYoutubeId(video.youtube_link);
  const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 max-w-full"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={thumbnailUrl} 
          alt={video.title} 
          className="w-full aspect-video object-cover"
          style={{ minHeight: '200px' }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="bg-red-600 rounded-full p-4">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
        {video.type === 'en_vivo' && (
          <div className="absolute top-3 left-3 flex items-center gap-1">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium bg-red-600 text-white px-3 py-1 rounded-full">En vivo</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate text-lg">{video.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mt-2">{video.description}</p>
      </div>
    </div>
  );
};

// Componente personalizado para los botones de navegación
const SwiperNavButtons = () => {
  return (
    <div className="swiper-nav-btns">
      <button className="swiper-button-prev absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-white/80 shadow-md p-2 rounded-r-full hover:bg-white transition-colors">
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <button className="swiper-button-next absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-white/80 shadow-md p-2 rounded-l-full hover:bg-white transition-colors">
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
};

export default function Home() {
  const [liveVideos, setLiveVideos] = useState<Video[]>([]);
  const [recordedVideos, setRecordedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('All');
  const [tags, setTags] = useState<string[]>([]);
  const [filteredRecordedVideos, setFilteredRecordedVideos] = useState<Video[]>([]);
  const [filteredLiveVideos, setFilteredLiveVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener videos en vivo y grabados
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        
        // Obtener videos en vivo
        const liveResponse = await fetch('http://localhost:8000/videos/live');
        const liveData = await liveResponse.json();
        
        // Obtener videos grabados
        const recordedResponse = await fetch('http://localhost:8000/videos/recorded');
        const recordedData = await recordedResponse.json();
        
        // Obtener tags/categorías
        const tagsResponse = await fetch('http://localhost:8000/videos/tags');
        const tagsData = await tagsResponse.json();
        
        if (liveData.message === 'SUCCESS') {
          setLiveVideos(liveData.data);
        }
        
        if (recordedData.message === 'SUCCESS') {
          setRecordedVideos(recordedData.data);
          setFilteredRecordedVideos(recordedData.data);
        }
        
        if (tagsData.message === 'SUCCESS') {
          // Extraer nombres de tags y agregar 'All' al principio
          const tagNames = tagsData.data.map((tag: any) => tag.name);
          setTags(['All', ...tagNames]);
        }
      } catch (error) {
        console.error('Error al cargar videos:', error);
        toast.error('Error al cargar videos. Por favor intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, []);
  
  // Filtrar videos grabados por tag
  useEffect(() => {
    if (activeTag === 'All') {
      setFilteredRecordedVideos(recordedVideos);
    } else {
      const filtered = recordedVideos.filter(video => 
        video.tags && video.tags.includes(activeTag)
      );
      setFilteredRecordedVideos(filtered);
    }
  }, [activeTag, recordedVideos]);

  // Filtrar videos por término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Si no hay término de búsqueda, mostrar todos los videos (respetando el filtro de tags)
      if (activeTag === 'All') {
        setFilteredRecordedVideos(recordedVideos);
      } else {
        const filtered = recordedVideos.filter(video => 
          video.tags && video.tags.includes(activeTag)
        );
        setFilteredRecordedVideos(filtered);
      }
      setFilteredLiveVideos(liveVideos);
    } else {
      // Filtrar videos en vivo por término de búsqueda
      const filteredLive = liveVideos.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLiveVideos(filteredLive);
      
      // Filtrar videos grabados por término de búsqueda (respetando el filtro de tags)
      let filteredRecorded;
      if (activeTag === 'All') {
        filteredRecorded = recordedVideos.filter(video => 
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        filteredRecorded = recordedVideos.filter(video => 
          (video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
          video.tags && video.tags.includes(activeTag)
        );
      }
      setFilteredRecordedVideos(filteredRecorded);
    }
  }, [searchTerm, liveVideos, recordedVideos, activeTag]);

  const openVideoModal = (video: Video) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  const closeVideoModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/fondo.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Overlay para mejorar la visibilidad del contenido */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 0,
        }}
      />
      
      {/* Contenedor con el segundo fondo */}
      <div 
        className="relative z-10 min-h-screen py-6 overflow-hidden w-full"
        style={{
          backgroundImage: "url('/fondo_total.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundBlendMode: "overlay"
        }}
      >
        <div className="container mx-auto px-4 space-y-8 overflow-hidden w-full min-w-[320px]">
          {/* Barra de búsqueda */}
          <div className="relative w-full max-w-md mx-auto mt-6 px-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input 
              type="search" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Buscar videos..." 
              className="w-full py-3 pl-10 pr-4 text-gray-700 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-md"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Sección de Videos en Vivo con imagen de fondo */}
          <section 
            className="relative rounded-lg overflow-hidden p-6 max-w-full w-full min-w-[300px]"
            style={{
              backgroundImage: "url('/fondo.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Overlay oscuro para mejorar la legibilidad */}
            <div 
              className="absolute inset-0" 
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                zIndex: 0,
              }}
            />
            
            {/* Contenido de la sección de videos en vivo */}
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6 text-white">Live Videos</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : filteredLiveVideos.length > 0 ? (
                <div className="relative">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    navigation={{
                      nextEl: '.swiper-button-next',
                      prevEl: '.swiper-button-prev',
                    }}
                    pagination={{ 
                      clickable: true, 
                      el: '.swiper-pagination',
                      bulletActiveClass: 'bg-indigo-600 w-3 h-3',
                      bulletClass: 'inline-block w-2 h-2 rounded-full bg-gray-300 mx-1'
                    }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    className="pb-12 max-w-full"
                    breakpoints={{
                      640: { slidesPerView: 1, spaceBetween: 20 },
                      768: { slidesPerView: 2, spaceBetween: 20 },
                      1024: { slidesPerView: 3, spaceBetween: 20 },
                      1280: { slidesPerView: 3, spaceBetween: 30 },
                    }}
                  >
                    {filteredLiveVideos.map((video) => (
                      <SwiperSlide key={video.id}>
                        <VideoCard video={video} onClick={() => openVideoModal(video)} />
                      </SwiperSlide>
                    ))}
                    <SwiperNavButtons />
                    <div className="swiper-pagination mt-4"></div>
                  </Swiper>
                </div>
              ) : (
                <div className="text-white/70 text-center py-20 min-h-[300px] flex items-center justify-center w-full">
                  <p>No live videos at the moment</p>
                </div>
              )}
            </div>
          </section>

          {/* Sección de Videos Grabados */}
          <section 
            className="relative rounded-lg overflow-hidden p-6 max-w-full w-full min-w-[300px]"
            style={{
              backgroundImage: "url('/fondo_2.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Overlay oscuro para mejorar la legibilidad */}
            <div 
              className="absolute inset-0" 
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                zIndex: 0,
              }}
            />
            
            {/* Contenido de la sección de videos grabados */}
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6 text-white">Recorded Videos</h2>
            
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filtros de tags */}
                  <div className="flex gap-2 overflow-x-auto pb-4">
                    {tags.map((tag) => (
                      <button 
                        key={tag}
                        className={`px-4 py-2 rounded-full ${activeTag === tag ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
                        onClick={() => setActiveTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                
                  {filteredRecordedVideos.length > 0 ? (
                    <div className="relative">
                      <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation={{
                          nextEl: '.swiper-button-next',
                          prevEl: '.swiper-button-prev',
                        }}
                        pagination={{ 
                          clickable: true, 
                          el: '.swiper-pagination',
                          bulletActiveClass: 'bg-indigo-600 w-3 h-3',
                          bulletClass: 'inline-block w-2 h-2 rounded-full bg-gray-300 mx-1'
                        }}
                        className="pb-12 max-w-full"
                        breakpoints={{
                          640: { slidesPerView: 1, spaceBetween: 20 },
                          768: { slidesPerView: 2, spaceBetween: 20 },
                          1024: { slidesPerView: 3, spaceBetween: 20 },
                          1280: { slidesPerView: 3, spaceBetween: 30 },
                        }}
                      >
                        {filteredRecordedVideos.map((video) => (
                          <SwiperSlide key={video.id}>
                            <VideoCard video={video} onClick={() => openVideoModal(video)} />
                          </SwiperSlide>
                        ))}
                        <SwiperNavButtons />
                        <div className="swiper-pagination mt-4"></div>
                      </Swiper>
                    </div>
                  ) : (
                    <div className="text-white/70 text-center py-20 min-h-[300px] flex items-center justify-center w-full">
                      <p>No recorded videos found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Modal para reproducir video */}
        {showModal && selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={closeVideoModal}>
            <div className="relative w-full max-w-4xl p-2" onClick={e => e.stopPropagation()}>
              <button 
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
                onClick={closeVideoModal}
              >
                Cerrar
              </button>
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <iframe 
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${extractYoutubeId(selectedVideo.youtube_link)}?autoplay=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}