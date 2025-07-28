import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  GlobeIcon, 
  PaletteIcon, 
  ZapIcon,
  ArrowRightIcon
} from 'lucide-react';

const Landing: React.FC = () => {
  const features = [
    {
      icon: GlobeIcon,
      title: 'Multi-Language Translation',
      description: 'Translate manga from Japanese, Korean, Chinese to English, Spanish, French, and more with AI precision.'
    },
    {
      icon: PaletteIcon,
      title: 'AI Colorization',
      description: 'Transform black & white manga into vibrant colored artwork while preserving the original art style.'
    },
    {
      icon: ZapIcon,
      title: 'Lightning Fast',
      description: 'Process entire manga pages in seconds with our optimized AI pipeline and cloud infrastructure.'
    },
    {
      icon: SparklesIcon,
      title: 'Smart Text Replacement',
      description: 'Seamlessly replace original text while maintaining panel layout, fonts, and visual aesthetics.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Transform Your
              <span className="block gradient-text-hero">
                Manga Experience
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
              AI-powered manga translation and colorization that preserves the artistic soul while breaking language barriers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/register"
              className="group bg-brand-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-2xl flex items-center space-x-2"
            >
              <span>Start Creating</span>
              <ArrowRightIcon size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="#demo"
              className="glass text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              Watch Demo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Experience the future of manga localization with cutting-edge technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="glass rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/70">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Manga?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of creators who are already using mangaka.ai to break language barriers.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 bg-brand-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              <span>Start Your Journey</span>
              <ArrowRightIcon size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;