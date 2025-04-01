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
      className="bg-white rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={thumbnailUrl} 
          alt={video.title} 
          className="w-full aspect-video object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="bg-red-600 rounded-full p-3">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
        {video.type === 'en_vivo' && (
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium bg-red-600 text-white px-2 py-0.5 rounded-full">En vivo</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">{video.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-1 mt-1">{video.description}</p>
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
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const openVideoModal = (video: Video) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  const closeVideoModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen py-6 bg-gray-50">
      <div className="container mx-auto px-4 space-y-8">
        {/* Sección de Videos en Vivo con imagen de fondo */}
        <section 
          className="relative rounded-lg overflow-hidden p-6"
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
            ) : liveVideos.length > 0 ? (
              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={16}
                  slidesPerView={1}
                  navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                  }}
                  pagination={{ clickable: true, el: '.swiper-pagination' }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  className="pb-10"
                  breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 16 },
                    768: { slidesPerView: 2, spaceBetween: 16 },
                    1024: { slidesPerView: 3, spaceBetween: 16 },
                  }}
                >
                  {liveVideos.map((video) => (
                    <SwiperSlide key={video.id}>
                      <VideoCard video={video} onClick={() => openVideoModal(video)} />
                    </SwiperSlide>
                  ))}
                  <SwiperNavButtons />
                  <div className="swiper-pagination mt-4"></div>
                </Swiper>
              </div>
            ) : (
              <div className="text-white/70 text-center py-10">No live videos at the moment</div>
            )}
          </div>
        </section>

        {/* Sección de Videos Grabados (sin imagen de fondo) */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Recorded Videos</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
                    spaceBetween={16}
                    slidesPerView={1}
                    navigation={{
                      nextEl: '.swiper-button-next',
                      prevEl: '.swiper-button-prev',
                    }}
                    pagination={{ clickable: true, el: '.swiper-pagination' }}
                    className="pb-10"
                    breakpoints={{
                      640: { slidesPerView: 2, spaceBetween: 16 },
                      768: { slidesPerView: 2, spaceBetween: 16 },
                      1024: { slidesPerView: 3, spaceBetween: 16 },
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
                <div className="text-gray-500 text-center py-10">No recorded videos found</div>
              )}
            </div>
          )}
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
  );
}