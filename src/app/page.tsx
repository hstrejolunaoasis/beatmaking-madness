import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Beatmaking Madness - Premium Beats For Artists & Producers",
  description: "Discover high-quality beats for your next music project. License exclusive beats with clear terms and instant downloads. Beatmaking Madness - where hits are made.",
  keywords: "beats, music production, hip hop beats, trap beats, r&b beats, buy beats, license beats",
  openGraph: {
    title: "Beatmaking Madness - Premium Beats For Artists & Producers",
    description: "Discover high-quality beats for your next music project. License exclusive beats with clear terms and instant downloads.",
    url: "https://beatmakingmadness.com",
    siteName: "Beatmaking Madness",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Beatmaking Madness",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const featuredBeats = [
  {
    id: "beat-1",
    title: "Midnight Vibes",
    genre: "R&B/Soul",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1571974599782-fac9c6b08382?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: "beat-2",
    title: "Trap Kingdom",
    genre: "Trap",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: "beat-3",
    title: "Future Wave",
    genre: "Hip Hop",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=500&auto=format&fit=crop"
  },
];

const testimonials = [
  {
    name: "James Wilson",
    role: "Independent Artist",
    content: "The beats from Beatmaking Madness have taken my music to another level. Professional quality and unique sounds that help me stand out.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Sophia Martinez",
    role: "Music Producer",
    content: "I've worked with many beat platforms, but the selection and quality here is unmatched. My clients are always impressed with the tracks I produce using these beats.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Ethan Johnson",
    role: "YouTube Creator",
    content: "Finding the perfect background music for my videos has never been easier. The licensing options are clear and the beats are top-notch.",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg"
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-black to-slate-900 text-white">
        <div className="container px-4 py-20 mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Premium Beats For Your <span className="text-primary">Next Hit</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-xl">
              High-quality, professionally mixed beats for artists, producers, and content creators. License your next track today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/beats">Browse Beats</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/licensing">Licensing Options</Link>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="w-full h-[400px] relative rounded-lg overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-transparent mix-blend-overlay z-10"></div>
              <Image 
                src="https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=1000&auto=format&fit=crop"
                alt="Music production studio with equipment"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
        {/* Abstract decoration */}
        <div className="absolute -bottom-24 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Featured Beats Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Beats</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Check out our latest and most popular beats. All professionally mixed and mastered to industry standards.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredBeats.map((beat) => (
            <Card key={beat.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="relative h-48 w-full">
                <Image
                  src={beat.image}
                  alt={beat.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{beat.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{beat.genre}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">${beat.price}</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-yellow-500"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">Preview</Button>
                <Button>Add to Cart</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/beats">View All Beats</Link>
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Beatmaking Madness</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer premium quality beats with clear licensing terms and excellent customer support.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-background border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                    <path d="M20 12a8 8 0 1 0-16 0" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <CardTitle>Instant Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get your beats immediately after purchase. No waiting, just instant access to your files.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M3 11v6a2 2 0 0 0 2 2h4m-6-8h18m-6 8h2a2 2 0 0 0 2-2v-6" />
                  </svg>
                </div>
                <CardTitle>Clear Licensing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our straightforward licensing options ensure you know exactly what you're getting and how you can use it.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M17 7 7 17" />
                    <path d="M17 17H7V7" />
                  </svg>
                </div>
                <CardTitle>Premium Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All beats are professionally produced, mixed, and mastered to industry standards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what artists and producers using our beats have to say.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background border-none shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  "{testimonial.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your Next Hit?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Browse our collection of premium beats and find the perfect sound for your project.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link href="/beats">Browse Beats</Link>
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* FAQ Schema for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What types of beats do you offer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We offer a wide range of beats including Hip Hop, Trap, R&B, Pop, and more. All beats are professionally produced and ready for commercial use with proper licensing."
              }
            },
            {
              "@type": "Question",
              "name": "How does beat licensing work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We offer different licensing options depending on your needs. Basic licenses allow for limited use, while Premium and Exclusive licenses offer more extensive usage rights. All details are clearly outlined on our licensing page."
              }
            },
            {
              "@type": "Question",
              "name": "Do I get the full track stems when I purchase a beat?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "This depends on the license type. Premium and Exclusive licenses typically include full track stems, while Basic licenses include only the final mixed track."
              }
            }
          ]
        })
      }} />

      {/* Call to Action - Sign Up */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Create Your Next Hit?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join BeatMaking Madness today and get access to premium beats, exclusive deals, and early access to new releases.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">Sign Up Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Already have an account? Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
