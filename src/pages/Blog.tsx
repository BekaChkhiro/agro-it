import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Blog = () => {
  const posts = [
    {
      title: "როგორ შევარჩიოთ სწორი მულჩერი ვენახისთვის",
      excerpt: "მულჩერის არჩევა მნიშვნელოვანი გადაწყვეტილებაა თქვენი ვენახის ეფექტური მოვლისთვის. ამ სტატიაში განვიხილავთ ყველა მთავარ ასპექტს...",
      date: "20 იანვარი, 2025",
      category: "ვენახი",
      readTime: "5 წთ",
    },
    {
      title: "თხილის ბაღის თანამედროვე ტექნოლოგიები",
      excerpt: "თხილის კულტივაცია მოითხოვს სპეციალიზებულ მიდგომას. გაეცანით უახლეს ტექნოლოგიებს და მათ უპირატესობებს...",
      date: "15 იანვარი, 2025",
      category: "კაკლოვანი",
      readTime: "7 წთ",
    },
    {
      title: "ვაშლის ბაღის საკრეფი სეზონის მომზადება",
      excerpt: "საკრეფი სეზონი მოახლოებულია. რას უნდა მოვამზადოთ და როგორ გამოვიყენოთ თანამედროვე ტექნიკა მაქსიმალური ეფექტურობისთვის...",
      date: "10 იანვარი, 2025",
      category: "ხეხილი",
      readTime: "6 წთ",
    },
  ];

  return (
    <main className="bg-background">
        {/* Breadcrumbs */}
        <div className="bg-muted py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-fast">მთავარი</Link>
              <span>/</span>
              <span className="text-foreground">ბლოგი</span>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">ბლოგი და სტატიები</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              სასარგებლო რჩევები, გზამკვლევები და ახალი ამბები 
              აგრო ტექნიკისა და თანამედროვე მეურნეობის შესახებ.
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="space-y-8 max-w-4xl mx-auto">
              {posts.map((post, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-medium transition-smooth">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Image placeholder */}
                      <div className="md:w-80 h-64 bg-primary/10 flex items-center justify-center">
                        <span className="text-6xl">📝</span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-8">
                        <div className="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
                          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full">
                            {post.category}
                          </span>
                          <span>📅 {post.date}</span>
                          <span>⏱️ {post.readTime}</span>
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-3 hover:text-primary transition-fast">
                          <Link href="#">{post.title}</Link>
                        </h2>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <Button variant="outline">
                          წაიკითხეთ სრულად →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button size="lg" variant="outline">
                მეტის ჩატვირთვა
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">გამოიწერეთ ჩვენი სიახლეები</h2>
            <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              მიიღეთ უახლესი სტატიები და ექსკლუზიური შეთავაზებები
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="თქვენი ელ. ფოსტა"
                className="flex-1 px-4 py-3 rounded-lg text-foreground"
              />
            </div>
          </div>
        </section>
    </main>
  );
};

export default Blog;
