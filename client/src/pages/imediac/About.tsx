import { Layout } from "@/components/imediac/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Award, Target, MessageCircle } from "lucide-react";

export function About() {
  const values = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Quality First",
      description: "We believe in delivering exceptional quality in every project, no matter the size or budget."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Community Focused",
      description: "We specialize in serving small businesses, schools, and Islamic organizations with dedication."
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-500" />,
      title: "Professional Excellence",
      description: "Our team brings years of experience in design, development, and digital marketing."
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "Results Driven",
      description: "We focus on creating solutions that help our clients achieve their goals and grow their presence."
    }
  ];

  const stats = [
    { number: "100+", label: "Projects Completed" },
    { number: "50+", label: "Happy Clients" },
    { number: "3+", label: "Years Experience" },
    { number: "24/7", label: "Support Available" }
  ];

  const team = [
    {
      name: "Ahmed Hassan",
      role: "Creative Director",
      description: "Specializes in Islamic design and branding with over 5 years of experience.",
      emoji: "👨‍🎨"
    },
    {
      name: "Sarah Khan",
      role: "Web Developer",
      description: "Full-stack developer passionate about creating fast, accessible websites.",
      emoji: "👩‍💻"
    },
    {
      name: "Omar Ali",
      role: "Digital Marketing",
      description: "SEO and social media expert helping businesses grow their online presence.",
      emoji: "👨‍💼"
    }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 to-white">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-blue-100 text-blue-600 mb-6">About IMediaC</Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  We Create <span className="text-blue-600">Digital Excellence</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  We are a creative digital studio offering design and maintenance solutions for small businesses, 
                  schools, and Islamic organisations. Our mission is to make quality design affordable and hassle-free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3">
                    Start Your Project
                  </Button>
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3">
                    View Our Work
                  </Button>
                </div>
              </div>
              
              {/* Team Illustration */}
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center shadow-2xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-2xl font-bold text-blue-600">Innovation</p>
                    <p className="text-gray-600">Meets Tradition</p>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg">
                  <span className="text-2xl">🎨</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-lg">
                  <span className="text-2xl">💻</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-blue-600">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-blue-100 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These principles guide everything we do and help us deliver exceptional results for our clients.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our diverse team of creative professionals is passionate about helping your business succeed online.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="text-6xl mb-4">{member.emoji}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {member.name}
                    </h3>
                    <Badge className="bg-blue-100 text-blue-600 mb-4">
                      {member.role}
                    </Badge>
                    <p className="text-gray-600">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                To empower small businesses, educational institutions, and Islamic organizations with 
                professional digital solutions that are both affordable and effective. We believe that 
                every organization deserves a strong online presence, regardless of their budget.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Let's Work Together
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}