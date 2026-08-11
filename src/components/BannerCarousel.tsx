import { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface BannerSetting {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  is_active: boolean;
  display_order: number;
  is_published: boolean;
}

const BannerCarousel = () => {
  const [api, setApi] = useState<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannerSettings, setBannerSettings] = useState<BannerSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBannerSettings();
  }, []);

  useEffect(() => {
    if (!api || bannerSettings.length <= 1) return;

    const timer = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [api, bannerSettings.length]);

  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  // Same fallback banner used when banner_settings is empty or errors out —
  // just re-worded to match the Presamali brand instead of the old food copy.
  const fallbackBanner: BannerSetting = {
    id: 'fallback',
    title: 'Handwoven Heritage',
    subtitle: 'Kouna Bags & Accessories',
    image_url: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1920&h=600&fit=crop',
    button_text: 'Shop Now',
    button_link: '/shop',
    secondary_button_text: 'Our Story',
    secondary_button_link: '/about',
    is_active: true,
    display_order: 1,
    is_published: true,
  };

  const fetchBannerSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('banner_settings')
        .select('*')
        .eq('is_active', true)
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching banner settings:', error);
        setBannerSettings([fallbackBanner]);
      } else {
        setBannerSettings(data.length > 0 ? data : [fallbackBanner]);
      }
    } catch (error) {
      console.error('Error fetching banner settings:', error);
      setBannerSettings([fallbackBanner]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-[#F1E4E0] animate-pulse flex items-center justify-center">
        <div className="text-[#7D2F38]">Loading banners...</div>
      </div>
    );
  }

  if (bannerSettings.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <Carousel
        className="w-full h-full"
        setApi={setApi}
        opts={{
          align: "start",
          loop: bannerSettings.length > 1,
        }}
      >
        <CarouselContent className="h-full">
          {bannerSettings.map((banner) => (
            <CarouselItem key={banner.id} className="h-full">
              <Card className="border-0 shadow-none overflow-hidden h-full">
                <CardContent className="p-0 relative h-full">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {bannerSettings.length > 1 && (
          <>
            <CarouselPrevious className="left-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
            <CarouselNext className="right-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
          </>
        )}
      </Carousel>

      {bannerSettings.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {bannerSettings.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to banner ${index + 1}`}
              className="w-2.5 h-2.5 rounded-full transition-colors"
              style={{ backgroundColor: index === currentIndex ? '#F9DAA5' : 'rgba(255,255,255,0.5)' }}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;