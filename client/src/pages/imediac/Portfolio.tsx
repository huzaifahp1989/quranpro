import { useState } from "react";
import { Layout } from "@/components/imediac/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, X } from "lucide-react";

interface PortfolioItem {
  id: number;
  title: string;
  category: "posters" | "websites" | "logos";
  description: string;
  image: string;
  tags: string[];
}

export function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const portfolioItems: PortfolioItem[] = [
    {
      id: 1,
      title: "Islamic Conference Poster",
      category: "posters",
      description: "Modern poster design for an Islamic conference featuring elegant typography and traditional patterns.",
      image: "🕌",
      tags: ["Islamic", "Event", "Conference"]
    },
    {
      id: 2,
      title: "Business Website",
      category: "websites",
      description: "Responsive business website with modern design and e-commerce functionality.",
      image: "💼",
      tags: ["Business", "E-commerce", "Responsive"]
    },
    {
      id: 3,
      title: "Mosque Logo Design",
      category: "logos",
      description: "Clean and modern logo design for a local mosque community.",
      image: "🏛️",
      tags: ["Logo", "Islamic", "Branding"]
    },
    {
      id: 4,
      title: "Charity Event Flyer",
      category: "posters",
      description: "Eye-catching flyer design for a charity fundraising event.",
      image: "🤝",
      tags: ["Charity", "Event", "Fundraising"]
    },
    {
      id: 5,
      title: "School Website",
      category: "websites",
      description: "Educational website with student portal and parent communication features.",
      image: "🎓",
      tags: ["Education", "School", "Portal"]
    },
    {
      id: 6,
      title: "Restaurant Logo",
      category: "logos",
      description: "Elegant logo design for a halal restaurant chain.",
      image: "🍽️",
      tags: ["Restaurant", "Halal", "Food"]
    },
    {
      id: 7,
      title: "Eid Celebration Poster",
      category: "posters",
      description: "Festive poster design for Eid celebrations with vibrant colors.",
      image: "🌙",
      tags: ["Eid", "Celebration", "Festival"]
    },
    {
      id: 8,
      title: "E-commerce Platform",
      category: "websites",
      description: "Full-featured online store with payment integration and inventory management.",
      image: "🛒",
      tags: ["E-commerce", "Shopping", "Online Store"]
    },
    {
      id: 9,
      title: "Community Center Logo",
      category: "logos",
      description: "Professional logo design for a community center serving diverse populations.",
      image: "🏢",
      tags: ["Community", "Center", "Diversity"]
    }
  ];

  const categories = [
    { id: "all", name: "All Projects", count: portfolioItems.length },
    { id: "posters", name: "Posters", count: portfolioItems.filter(item => item.category === "posters").length },
    { id: "websites", name: "Websites", count: portfolioItems.filter(item => item.category === "websites").length },
    { id: "logos", name: "Logos", count: portfolioItems.filter(item => item.category === "logos").length }
  ];

  const filteredItems = selectedCategory === "all" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Our <span className="text-blue-600">Portfolio</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Explore our collection of creative designs, modern websites, and professional branding solutions 
              that have helped businesses and organizations succeed online.
            </p>
          </div>
        </section>

        {/* Filter Buttons */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`font-semibold px-6 py-3 ${
                    selectedCategory === category.id
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-blue-200 text-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0"
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-0">
                    {/* Image Placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-t-lg">
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                        {item.image}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge 
                          variant="secondary" 
                          className="bg-blue-100 text-blue-600 capitalize"
                        >
                          {item.category}
                        </Badge>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox Modal */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
                    {selectedItem.title}
                    <Badge className="bg-blue-100 text-blue-600 capitalize">
                      {selectedItem.category}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Large Image */}
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <span className="text-9xl">{selectedItem.image}</span>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Project Description</h4>
                    <p className="text-gray-600 leading-relaxed">{selectedItem.description}</p>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="flex gap-4 pt-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      Start Similar Project
                    </Button>
                    <Button variant="outline">
                      View More Work
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}