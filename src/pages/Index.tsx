import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import StoryPreview from '../components/StoryPreview';
import SocialNewsletter from '../components/SocialNewsletter';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased selection:bg-[#7D2F38] selection:text-white">
      <Header />

      <main>
        <Hero />
        <FeaturedProducts />
        <StoryPreview />
        <SocialNewsletter />
      </main>

      <Footer />
      <FloatingActions />
    </div>
  );
};

export default Home;