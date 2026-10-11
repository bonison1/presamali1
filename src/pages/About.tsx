
import Layout from '../components/Layout';

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-[#2b1115] text-white py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
    <p className="text-xl md:text-2xl max-w-3xl mx-auto">
      This is about section.
    </p>
  </div>
</section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">This is about section.</h2>

            <p className="text-lg text-gray-600 mb-6">
              This is about section.
            </p>

            {/* <p className="text-lg text-gray-600 mb-8">
              What started as family recipes shared among friends has grown into a passionate endeavor
              to bring authentic, high-quality food products to tables everywhere. Our signature beef
              pickles and Chicken Sinju represent the perfect blend of traditional methods and premium
              ingredients.
            </p> */}

            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>

            <p className="text-lg text-gray-600 mb-6">
              This is about section.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-orange-800 mb-3">Quality First</h3>
                <p className="text-gray-700">
                 This is about section.
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-red-800 mb-3">Authentic Flavors</h3>
                <p className="text-gray-700">
                  This is about section.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">What Makes Us Special</h2>

            <ul className="list-disc list-inside text-lg text-gray-600 space-y-3 mb-8">
              {/* <li>Small-batch, handcrafted products</li>
              <li>Authentic Manipuri flavors</li>
              <li>Indigenous, locally sourced ingredients</li> */}
              <li>This is about section.</li>
              <li>This is about section.</li>
            </ul>


            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-xl text-gray-800 font-medium mb-4">
                This is about section.
                This is about section.
              </p>
              {/* <p className="text-lg text-gray-600">
                – Momita
                <br />This is about section.
              </p> */}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
