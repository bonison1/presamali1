import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import StoryPreview from '../components/StoryPreview';
import SocialMedia from '../components/SocialMedia';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';

const Home = () => {
  return (
    <>
      <Header />
      <Hero />
      <FeaturedProducts />
      <StoryPreview />
      <SocialMedia />
      <Newsletter />
      <Footer />
      <FloatingActions />
    </>
  );
};

export default Home;