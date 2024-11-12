export default function AboutPage() {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
          <h1 className="text-4xl font-bold mb-6 text-center">About Us</h1>
  
          {/* Introduction Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Platform</h2>
            <p className="text-gray-700 text-lg">
              Welcome to iLIM, a leading online learning platform that aims to make quality education accessible to everyone. We provide a variety of courses to help learners acquire new skills, enhance their knowledge, and achieve their professional goals.
            </p>
          </section>
  
          {/* Mission Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Mission</h2>
            <p className="text-gray-700 text-lg">
              Our mission is to empower individuals by providing affordable, high-quality educational resources. We believe that education should be available to everyone, everywhere, and we strive to bridge the gap between knowledge and accessibility.
            </p>
          </section>
  
          {/* Team Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Meet Our Team</h2>
            <p className="text-gray-700 text-lg">
              Our team is made up of passionate educators, developers, and designers who are dedicated to creating a seamless and impactful learning experience. We work hard to ensure our platform offers the latest courses and tools to help you succeed.
            </p>
          </section>
  
          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Contact Us</h2>
            <p className="text-gray-700 text-lg">
              We'd love to hear from you! If you have any questions, feedback, or suggestions, feel free to reach out to us at{" "}
              <a href="mailto:support@ilim.com" className="text-blue-500 hover:underline">
                support@ilim.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    );
  }
  