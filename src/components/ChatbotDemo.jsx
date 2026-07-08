import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, User, Bot, Trash2, Download, Table, CheckSquare, Globe, Layers, Palette, Plus, Trash, ExternalLink, Copy, Check } from 'lucide-react';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

const TEMPLATES = {
  bakery: {
    title: "Artisanal Breads & Delectable Pastries Baked Daily",
    subtitle: "Welcome to our bakery, where every ingredient is selected with care, and every item is baked with love.",
    about: "Established in 2016, we have been a cornerstone of the neighborhood. We utilize stone-ground local grains and long fermentation processes to create sourdoughs, croissants, and sweet treats that comfort the soul.",
    products: [
      { name: 'Sourdough Country Loaf', price: '₹150', desc: 'Naturally leavened crusty bread, baked in stone hearth.' },
      { name: 'Almond Croissant', price: '₹120', desc: 'Twice-baked flaky croissant filled with sweet almond frangipane.' },
      { name: 'Custom Birthday Cake', price: '₹1,200+', desc: 'Three layers of sponge, homemade buttercream, customized decorations.' }
    ],
    theme: "amber"
  },
  services: {
    title: "Scale Your Operations. Dominate Your Market.",
    subtitle: "Tailored business automation and coaching solutions designed to increase efficiency and double your sales.",
    about: "We help small and medium enterprises optimize their workflows and integrate cutting-edge AI systems. Our certified architects design custom roadmaps that eliminate bottlenecks and reduce operating costs.",
    products: [
      { name: 'Operational Bottleneck Audit', price: '₹9,999', desc: 'Comprehensive review of your digital systems with a detailed roadmap.' },
      { name: 'Custom AI Chatbot Set Up', price: '₹45,000', desc: 'End-to-end configuration and CRM integration for automated sales.' },
      { name: 'Staff Prompting Workshop', price: '₹5,000/hr', desc: 'Interactive coaching sessions for teaching employees effective prompt work.' }
    ],
    theme: "breeze"
  },
  salon: {
    title: "Relax. Rejuvenate. Rediscover Your Glow.",
    subtitle: "Premium beauty treatments, therapeutic massages, and organic skincare services in a serene sanctuary.",
    about: "Our boutique spa offers a peaceful escape from the hustle and bustle of daily life. Our licensed therapists use premium botanicals and advanced techniques to restore your natural balance and vitality.",
    products: [
      { name: 'Signature Organic Facial', price: '₹1,999', desc: 'Deep cleansing treatment using customized botanical extracts.' },
      { name: 'Aromatherapy Swedish Massage', price: '₹2,500/hr', desc: 'Full-body relaxation therapy with lavender and chamomile essential oils.' },
      { name: 'Designer Haircut & Blowout', price: '₹1,200', desc: 'Personal consultation, nourishing wash, bespoke cut and styling.' }
    ],
    theme: "rose"
  },
  fitness: {
    title: "Unleash Your Strength. Achieve Your Apex.",
    subtitle: "Premium training sessions, state-of-the-art weights, and a supportive community to power your fitness journey.",
    about: "Apex Fitness is dedicated to building sustainable fitness habits. Our certified personal trainers and high-intensity group classes are designed to push you safely past your boundaries to achieve real results.",
    products: [
      { name: 'Standard Monthly Pass', price: '₹1,999/mo', desc: 'Unlimited access to gym facilities, locker rooms, and group warmups.' },
      { name: 'Elite Personal Coaching', price: '₹1,500/hr', desc: 'One-on-one tailored program design and weekly nutritional audits.' },
      { name: 'HIIT & Conditioning Class', price: '₹399/class', desc: '45-minute intense cardiovascular circuits led by group instructors.' }
    ],
    theme: "mint"
  },
  dental: {
    title: "Gentle Care for Healthy, Radiant Smiles",
    subtitle: "State-of-the-art dental treatments, preventive cleanings, and cosmetic procedures in a comforting environment.",
    about: "We are committed to providing personalized dental care. Our experienced clinical staff utilizes digital x-rays, ultra-low radiation scanners, and advanced techniques to maintain your long-term oral health.",
    products: [
      { name: 'Routine Hygiene & Polishing', price: '₹999', desc: 'Complete oral hygiene clean, plaque removal, and fluoride shield application.' },
      { name: 'Laser Teeth Whitening', price: '₹8,500', desc: 'In-office session utilizing LED accelerators to brighten teeth up to 8 shades.' },
      { name: 'Cosmetic Veneer Consult', price: 'Free', desc: '1-on-1 digital scan and cosmetic analysis with our chief prosthodontist.' }
    ],
    theme: "aqua"
  },
  plumbing: {
    title: "Fast, Reliable, & Certified Plumbing Experts",
    subtitle: "Emergency pipe repairs, water heater replacements, and clog removals available 24/7.",
    about: "For over 15 years, our licensed technicians have served local homes and business centers. We offer upfront pricing, guaranteed clean workspace recovery, and fully warranted parts installations.",
    products: [
      { name: 'Emergency Drain Clog Removal', price: '₹1,499', desc: 'Full inspection and hydro-jet clear of residential plumbing blockages.' },
      { name: 'Standard Water Heater Service', price: '₹3,500', desc: 'Anode rod replacement, tank flushing, pressure safety testing, and calibration.' },
      { name: 'Kitchen & Bath Leak Detection', price: '₹999', desc: 'Ultrasonic leak scanning for hidden pipe cracks and damp spot inspections.' }
    ],
    theme: "breeze"
  },
  petcare: {
    title: "Premium Grooming & Boarding for Happy Pets",
    subtitle: "Professional coat trims, soothing baths, and safe cage-free boarding for dogs and cats.",
    about: "Our pet salon is staffed by certified groomers and passionate animal behaviorists. We design low-stress sessions tailored to your pet's age, coat condition, and energy levels.",
    products: [
      { name: 'Full Grooming & Spa Package', price: '₹1,200', desc: 'Shampoo wash, blow dry, claw trim, ear clean, and custom scissor trim.' },
      { name: 'Overnight Kennel-Free Boarding', price: '₹800/night', desc: 'Climate-controlled sleeping space, 3 daily walks, and live web-camera monitoring.' },
      { name: 'Soothing Medicated Oatmeal Bath', price: '₹400', desc: 'Specialized sensitive-skin treatment to alleviate itching and shedding.' }
    ],
    theme: "peach"
  },
  realestate: {
    title: "Find Your Perfect Home in Premium Locations",
    subtitle: "Exclusive listings, virtual walkthroughs, and expert brokerage consultation for local properties.",
    about: "We streamline the house hunting and selling process. Our property brokers combine market analysis and neighborhood profiles to help you secure high-value residences and investment portfolios.",
    products: [
      { name: 'Comprehensive Buying Consult', price: 'Free', desc: 'Market budget modeling, loan prep review, and custom listings search setup.' },
      { name: 'Professional Property Listing', price: '₹4,999', desc: 'High-definition HDR photography, drone site shots, and digital portal publishing.' },
      { name: 'Legal Title & Contract Review', price: '₹9,999', desc: 'Full legal title chain checking and contract analysis for secure transactions.' }
    ],
    theme: "royalgold"
  },
  boutique: {
    title: "Curated Designer Apparels & Chic Stylings",
    subtitle: "Explore our collection of handcrafted fabrics, modern silhouettes, and custom accessories.",
    about: "We celebrate individual style through limited-edition garments and slow-fashion principles. Our items are locally designed using sustainable silks, linens, and organic cotton weaves.",
    products: [
      { name: 'Hand-Tailored Silk Wrap Dress', price: '₹4,500', desc: '100% pure mulberry silk dress, adjustable waist, organic dye colors.' },
      { name: 'Linen Summer Utility Jacket', price: '₹2,800', desc: 'Breathable structured linen jacket with deep pockets and tortoise buttons.' },
      { name: '1-on-1 Personal Styling Consultation', price: '₹1,500/hr', desc: 'Bespoke fit analysis, color palette advice, and wardrobe setup.' }
    ],
    theme: "rose"
  },
  bookstore: {
    title: "Discover Stories, Rare Editions, & Cozy Brews",
    subtitle: "A handpicked collection of literature, comfortable reading alcoves, and artisanal coffee.",
    about: "We are an independent bookstore dedicated to fostering a love for reading. From modern fiction to antique paperbacks, we curating bookshelves that inspire curiosities and cozy conversations.",
    products: [
      { name: 'Signed First-Edition Novel', price: '₹950', desc: 'Special hardback release signed by featured author, includes custom bookmark.' },
      { name: 'Artisanal Bookworm Brew Bundle', price: '₹350', desc: 'Large single-origin French press coffee paired with a freshly baked muffin.' },
      { name: 'Monthly Book Club Membership', price: '₹600/mo', desc: 'Get 1 selected book, access to weekly discussions, and free cafe drinks.' }
    ],
    theme: "coffee"
  },
  law: {
    title: "Bespoke Legal Counsel with Integrity",
    subtitle: "Corporate contracts, intellectual property protection, and real estate litigation experts.",
    about: "Our attorneys deliver results-driven advocacy for startups, families, and growing enterprises. We prioritize transparent communications, thorough document audits, and sound litigation planning.",
    products: [
      { name: 'Initial Case Assessment Hour', price: '₹5,000', desc: 'Document review, liability mapping, and legal strategy formulation.' },
      { name: 'NDAs & Founder Agreements', price: '₹15,000', desc: 'Tailored corporate agreements drafted to protect assets and IP rights.' },
      { name: 'Trademark Search & Filing Package', price: '₹12,500', desc: 'Exhaustive registration searches and application submissions.' }
    ],
    theme: "platinum"
  },
  pharmacy: {
    title: "Your Trusted Partner in Health & Wellness",
    subtitle: "Same-day prescription deliveries, digital health checks, and herbal remedies.",
    about: "We are a community-focused pharmacy committed to your family's health. We offer accurate dispensing, free drug interaction audits, and personal wellness coaching.",
    products: [
      { name: 'Home-Care Wellness Kit', price: '₹1,250', desc: 'Digital thermometer, pulse oximeter, immune supplements, and sanitizer spray.' },
      { name: 'Personal Medication Plan Review', price: '₹500', desc: 'Review of prescription interactions, schedule optimizing, and pill organizing.' },
      { name: 'Organic Ayurvedic Stress Supps', price: '₹850', desc: '60 capsules of pure ashwagandha and Brahmi extracts for cortisol regulation.' }
    ],
    theme: "mint"
  },
  autorepair: {
    title: "Expert Auto Repairs & Precision Tuning",
    subtitle: "Engine diagnostics, brake replacements, and scheduled maintenance for all vehicle models.",
    about: "Our ASE-certified mechanics use modern diagnostic equipment to locate vehicle faults instantly. We provide transparent estimates, original manufacturer parts, and reliable turnarounds.",
    products: [
      { name: 'Precision Brake Pad Replacement', price: '₹3,200', desc: 'Installation of ceramic pads, rotor inspection, and fluid topping.' },
      { name: 'Full Engine OBD Diagnostics', price: '₹999', desc: 'Electronic sensor check, trouble code reading, and emission status mapping.' },
      { name: 'Annual Synthetic Oil Change Tune', price: '₹2,499', desc: '5L premium synthetic oil swap, new filter, and 25-point check.' }
    ],
    theme: "charcoal"
  },
  photography: {
    title: "Capturing Life's Most Beautiful Moments",
    subtitle: "High-end portraiture, commercial catalog shoots, and wedding documentary photography.",
    about: "We believe every photo should tell a story. Using natural light, professional styling, and modern editing workflows, we deliver print-ready digital memories that last a lifetime.",
    products: [
      { name: 'Outdoor Portrait Session', price: '₹7,500', desc: '90-minute session, 2 outfits, 15 high-end retouched digital pictures.' },
      { name: 'Product Catalog Studio Shoot', price: '₹12,000', desc: 'White-background tabletop images, professional lighting setup, 30 items.' },
      { name: 'Full Wedding Coverage Package', price: '₹45,000', desc: '6 hours coverage, secondary shooter, online gallery, and premium photobook.' }
    ],
    theme: "midnight"
  },
  grocery: {
    title: "Farm-Fresh, Organic, & Sustainable Groceries",
    subtitle: "Direct-from-farm vegetables, bulk grains, and eco-friendly home products delivered to your door.",
    about: "We partner with local organic farming co-ops to bring pesticide-free foods to your table. We pack all deliveries in zero-plastic biodegradable paper crates.",
    products: [
      { name: 'Weekly Organic Veggie Box', price: '₹650', desc: '5kg of seasonal farm-picked greens, root vegetables, and fresh herbs.' },
      { name: 'Cold-Pressed Mustard Oil (1L)', price: '₹280', desc: 'Traditionally extracted yellow mustard seed oil, high smoke point.' },
      { name: 'Raw Unfiltered Forest Honey (500g)', price: '₹399', desc: 'Single-source wild honey, retaining beneficial pollens and enzymes.' }
    ],
    theme: "forest"
  },
  software: {
    title: "Building Scalable Custom Software Solutions",
    subtitle: "Cloud integrations, mobile applications, and high-performance business dashboard designs.",
    about: "We are an agile software development agency helping businesses scale. We turn complex requirements into clean codebases utilizing React, Node.js, and Amazon AWS cloud architectures.",
    products: [
      { name: 'MVP Concept Discovery Workshop', price: '₹18,000', desc: 'Figma mockups, API structure mapping, and architecture roadmap.' },
      { name: 'Managed Cloud Migrating Plan', price: '₹75,000', desc: 'Database migration to secure cloud hosting with zero downtime.' },
      { name: 'Dedicated React/Node Weekly Dev', price: '₹35,000/week', desc: '40 hours of expert engineering resources focused on your backlog.' }
    ],
    theme: "violet"
  },
  catering: {
    title: "Gourmet Catering for Unforgettable Events",
    subtitle: "Custom menus, chef-led prep, and professional table service for weddings and corporate galas.",
    about: "We create culinary experiences tailored to your celebration. From finger-food buffets to 5-course plated dinners, we source farm-fresh seasonal ingredients to create menu highlights guests will love.",
    products: [
      { name: 'Premium High-Tea Party Menu', price: '₹450/guest', desc: 'Savory tarts, mini-sliders, pastries, and premium tea/coffee selection.' },
      { name: 'Plated 3-Course Wedding Feast', price: '₹1,200/guest', desc: 'Artisanal starters, main choices, customized desserts, bread service.' },
      { name: 'Gourmet Grazing Board Setup', price: '₹8,500', desc: 'Curated cheese selection, charcuterie, dry fruits, dips, serves 25.' }
    ],
    theme: "amber"
  },
  cleaning: {
    title: "Eco-Friendly Cleaning for Homes & Offices",
    subtitle: "Deep sanitization, window washing, and upholstery care using non-toxic products.",
    about: "We keep your spaces spotless and allergen-free. Our bonded cleaning staff uses HEPA-filter vacuums and certified biodegradable disinfectants to maintain a clean environment.",
    products: [
      { name: 'Standard 2BHK Deep Cleaning', price: '₹2,999', desc: 'Kitchen degreasing, bathroom descaling, balcony wash, and floor sanitizing.' },
      { name: 'Eco Carpet Stain Sanitizing', price: '₹1,200', desc: 'Steam cleaning, allergen extraction, and natural citrus deodorizing.' },
      { name: 'Corporate Office Clean (Monthly)', price: '₹15,000/mo', desc: 'Bi-weekly general sweeps, trash sorting, desk clean, and window wash.' }
    ],
    theme: "skyblue"
  },
  marketing: {
    title: "Data-Driven Marketing to Scale Online Sales",
    subtitle: "Pay-per-click advertising, high-conversion SEO audits, and content creation campaigns.",
    about: "We grow brands through measurable performance marketing. We combine creative copy with analytics and social ad setups to drive qualified buyers directly to your product checkout page.",
    products: [
      { name: 'Full Brand SEO Keyword Audit', price: '₹8,500', desc: 'Competitor backlink reports, site loading speed audits, and keyword lists.' },
      { name: 'Facebook & Google Ad Setup', price: '₹25,000', desc: 'Targeting setup, tracking pixel configs, copywriting, and 3 ad creatives.' },
      { name: 'Monthly Social Media Calendar', price: '₹15,000/mo', desc: '12 high-impact graphics and custom caption copy tailored for your audience.' }
    ],
    theme: "cyber"
  },
  tutoring: {
    title: "Unlock Academic Excellence & Tech Certs",
    subtitle: "1-on-1 math tutoring, science lab prep, and AP class coaching from top-tier mentors.",
    about: "We match students with dedicated instructors to rebuild confidence. Our personalized study planners and test-taking simulators help students secure high grades and college admissions.",
    products: [
      { name: '1-on-1 AP Physics Tutoring Hour', price: '₹1,500/hr', desc: 'Individual problem-solving breakdown, conceptual check, and notes.' },
      { name: '10-Session SAT Prep Bootcamp', price: '₹12,000', desc: 'Complete review of exam strategies, 3 mock tests, and error feedback.' },
      { name: 'Intro to Python Coding Course', price: '₹6,000', desc: '8 modules of video tutorials, weekly assignments, and certified grader reviews.' }
    ],
    theme: "lavender"
  },
  florist: {
    title: "Artisanal Floral Designs & Elegant Bouquets",
    subtitle: "Freshly cut roses, customized event backdrops, and monthly home flower subscriptions.",
    about: "We believe flowers speak. Our florists compose custom arrangements for birthdays, anniversaries, and corporate lobbies using fresh-cut stems sourced daily.",
    products: [
      { name: 'Classic Red Rose Hand Bouquet', price: '₹1,200', desc: '12 premium long-stem roses wrapped with seasonal foliage and silk ribbon.' },
      { name: 'Signature Ceramic Table Centerpiece', price: '₹2,500', desc: 'Low-profile elegant mix of lilies, carnations, and eucalyptus branches.' },
      { name: 'Weekly Fresh Floral Delivery', price: '₹3,000/mo', desc: 'Fresh seasonal bouquet delivered in water-gel packaging every Monday.' }
    ],
    theme: "rose"
  },
  construction: {
    title: "Strong Roofs & Custom Home Construction",
    subtitle: "Premium shingle roofing repairs, house extensions, and outdoor deck installations.",
    about: "Our certified engineers and carpenters build structurally sound, weather-resistant structures. We offer guaranteed material sourcing, site safety clearances, and structural warranties.",
    products: [
      { name: 'Standard Roof Leak Inspection', price: '₹1,500', desc: 'Complete scanning of shingles, flashing seams, gutters, and attic insulation.' },
      { name: 'Custom Wooden Deck Installation', price: '₹85,000+', desc: 'High-grade treated pine deck, safety railings, steps, 12x12ft dimensions.' },
      { name: 'Concrete Driveway Resurfacing', price: '₹45,000', desc: 'Pressure wash, crack repair, epoxy level coat, and weather sealing.' }
    ],
    theme: "bronze"
  },
  music: {
    title: "Learn Instruments, Vocals, & Music Theory",
    subtitle: "Bespoke piano courses, guitar lessons, and vocal coaching sessions for ages 6 to adult.",
    about: "Our instructors are conservatory-trained performers. We make music learning fun and rewarding, helping beginners learn basic cords and advanced students master complex concertos.",
    products: [
      { name: 'Individual Piano Class (45 mins)', price: '₹1,200', desc: 'One-on-one session covering classical technique, sight reading, and expression.' },
      { name: 'Acoustic Guitar Starter Course', price: '₹800/class', desc: 'Weekly group class focusing on chord transitions, tuning, and strumming.' },
      { name: 'Vocal Pitch & Breathing Lesson', price: '₹1,500', desc: 'Private diaphragmatic breathing session, range test, and vocal warmups.' }
    ],
    theme: "deeppurple"
  },
  jewelry: {
    title: "Timeless Fine Jewelry & Bespoke Gold Craft",
    subtitle: "Handcrafted 18k gold bands, conflict-free diamond rings, and professional laser repairs.",
    about: "We manufacture heirloom quality jewelry with passion. Our master craftsmen combine traditional metalsmithing with CAD-based jewelry design to create one-of-a-kind treasures.",
    products: [
      { name: 'Classic Solitaire Engagement Ring', price: '₹75,000+', desc: '0.5 carat round-cut lab diamond set on a polished 18k yellow gold band.' },
      { name: 'Bespoke Birthstone Gold Pendant', price: '₹18,500', desc: 'Customizable gold disk set with your choice of natural gemstone.' },
      { name: 'Professional Jewelry Laser Clean', price: '₹500', desc: 'Ultrasonic dirt extraction, prong checking, and high-shine wheel polish.' }
    ],
    theme: "royalgold"
  },
  optician: {
    title: "Precision Vision Tests & Designer Eyewear",
    subtitle: "Comprehensive computerized eye tests, blue-light blocking lenses, and trendy frames.",
    about: "Protect your eyesight with our advanced optometric checks. We offer eye exams, custom progressive lens fittings, and a wide collection of designer and budget frames.",
    products: [
      { name: 'Computerized Refraction Eye Test', price: 'Free', desc: 'Full prescription analysis, glaucoma screening, and binocular balance check.' },
      { name: 'Blue-Light Protect Glasses Bundle', price: '₹2,499', desc: 'Sleek polycarbonate frame fitted with anti-glare screen protection lenses.' },
      { name: 'Premium Hydrogel Contact Lenses', price: '₹1,800/box', desc: 'Daily disposable contacts, high oxygen transmission, 30 lenses.' }
    ],
    theme: "breeze"
  },
  coworking: {
    title: "Flexible Desks & High-Tech Meeting Rooms",
    subtitle: "Gigabit internet, ergonomic workspaces, and organic coffee for creators and teams.",
    about: "Scale your startup in our workspace. We offer flexible memberships, acoustic phone booths, spacious conference halls, and a professional community of tech founders.",
    products: [
      { name: 'Flexi Desk Day Pass Package', price: '₹499/day', desc: 'Ergonomic seating, gigabit WiFi, credits for printer and cafeteria drinks.' },
      { name: 'Acoustic Meeting Room Hour', price: '₹1,200/hr', desc: 'Soundproof room for 6 guests, equipped with 4k TV and camera system.' },
      { name: 'Dedicated Desk Monthly Space', price: '₹9,999/mo', desc: 'Reserved workspace, lockable cabinet, 24/7 access card, and mail address.' }
    ],
    theme: "breeze"
  },
  travel: {
    title: "Curated International Tours & Custom Flights",
    subtitle: "Unlock handpicked resort stays, local cultural guides, and custom travel itineraries.",
    about: "We make traveling stress-free. Our advisors design custom vacations, manage visa documentation, and organize guided excursions to help you explore the globe safely.",
    products: [
      { name: '4-Night Bali Tropical Tour Plan', price: '₹24,999', desc: 'Private beach villa, daily breakfast, airport transfers, and Ubud guide.' },
      { name: 'Custom Honeymoon Design Consult', price: '₹1,500', desc: 'Exotic destination scoping, flight schedules, and resort options.' },
      { name: 'Premium Travel Insurance Coverage', price: '₹1,200', desc: 'Full medical coverage, lost baggage compensation, trip delay support.' }
    ],
    theme: "tropical"
  },
  laundry: {
    title: "Eco-Friendly Wet Clean & Steam Ironing",
    subtitle: "Same-day clothing wash, premium stain removal, and door-to-door pickup services.",
    about: "Keep your wardrobe looking fresh. We utilize non-toxic biodegradable detergents and high-pressure steam tables to clean and iron your premium wools, silks, and cottons.",
    products: [
      { name: 'Premium Suit Dry Cleaning Swap', price: '₹450', desc: 'Two-piece suit wash, specialized stain extraction, and hanger packaging.' },
      { name: 'Wash & Fold Laundry Bag (5kg)', price: '₹350', desc: 'General garments washed, tumble dried, sorted, and packed in paper bag.' },
      { name: 'Silk Saree Delicate Steam Iron', price: '₹150', desc: 'Low-heat safe ironing to preserve delicate weave luster and borders.' }
    ],
    theme: "skyblue"
  },
  barber: {
    title: "Sharp Fades, Hot Shaves, & Classic Grooming",
    subtitle: "Precision cuts, beard line trims, and hot towel facial massage in a vintage lounge.",
    about: "Get the haircut you deserve. Our experienced barbers specialize in classic pompadours, skin fades, hair coloring, and traditional straight-razor shave rituals.",
    products: [
      { name: 'Signature Haircut & Style', price: '₹500', desc: 'Personal consultation, shampoo wash, bespoke scissor cut, and pomade styling.' },
      { name: 'Beard Trim & Hot Towel Shave', price: '₹350', desc: 'Beard shaping, moisturizing oil application, straight razor neck cleanup.' },
      { name: 'Premium Charcoal Face Detox', price: '₹600', desc: 'Deep-pore peel mask, vapor steam, cold wash, and facial massage.' }
    ],
    theme: "charcoal"
  },
  architecture: {
    title: "Inspiring Spaces & Modern Building Design",
    subtitle: "CAD blueprints, interior space planning, and 3D architectural render services.",
    about: "We design structures that harmonize with their surroundings. Our architects combine spatial flow, structural calculations, and green building materials to design beautiful homes.",
    products: [
      { name: 'Residential Floor Plan Consult', price: '₹15,000', desc: 'Initial layout sketch, zoning analysis, and structural consultation.' },
      { name: 'High-End 3D Interior Rendering', price: '₹8,500/room', desc: 'Photorealistic digital visualization of colors, textures, and lighting.' },
      { name: 'Full Building Blueprint Set', price: '₹1,50,000+', desc: 'Civil drawings, electrical mapping, plumbing design, and permit filing.' }
    ],
    theme: "steel"
  },
  veterinary: {
    title: "Compassionate Veterinary Care for Family Pets",
    subtitle: "Computerized pet wellness checks, vaccinations, and emergency dental surgery.",
    about: "We keep your pets healthy and happy. Our clinic is equipped with in-house blood labs, digital x-ray units, and an experienced veterinary surgery team for optimal pet care.",
    products: [
      { name: 'Annual Pet Health Examination', price: '₹800', desc: 'Check of ears, teeth, heart rate, weight, and general skin wellness.' },
      { name: 'Puppy Vaccination Schedule Pack', price: '₹2,500', desc: 'Core vaccines including Rabies, DHPP, and booster schedule cards.' },
      { name: 'Dog Dental Scale & Polish', price: '₹4,500', desc: 'Tarter removal under safe anesthesia, polishing, and gum cleaning.' }
    ],
    theme: "pistachio"
  },
  handyman: {
    title: "Professional Repairs & Custom Installs",
    subtitle: "TV wall mounting, cabinet repairs, lock replacements, and fixture fittings.",
    about: "No task is too small. Our background-checked craftsmen arrive fully equipped to fix your creaky doors, install shelves, or replace broken kitchen taps quickly.",
    products: [
      { name: 'Standard TV Wall Mount Install', price: '₹800', desc: 'Secure mounting on concrete/drywall, cable hide setup, level adjustment.' },
      { name: 'Door Lock & Handle Replacement', price: '₹600', desc: 'Installation of secure brass deadbolt and lever handle set.' },
      { name: 'Half-Day Handyman Booking (4h)', price: '₹2,500', desc: 'Hire an expert craftsman to fix your list of general home repairs.' }
    ],
    theme: "copper"
  },
  webdesign: {
    title: "Stunning Web Design for Modern Brands",
    subtitle: "Figma UI/UX layouts, high-conversion landing pages, and responsive Webflow sites.",
    about: "We build websites that grow businesses. We focus on modern typography, intuitive navigation structures, rapid loading optimization, and responsive design systems.",
    products: [
      { name: '1-Page Landing Page Design', price: '₹15,000', desc: 'High-converting custom layout with responsive mobile optimization.' },
      { name: 'Complete UI/UX Figma Design', price: '₹35,000', desc: 'Interactive prototype, components library, style guide, up to 6 pages.' },
      { name: 'SEO & Speed Optimization Pack', price: '₹8,500', desc: 'Web page compression, asset delivery setup, schema data integrations.' }
    ],
    theme: "cyberneon"
  },
  accounting: {
    title: "Accurate Tax & Business Accounting",
    subtitle: "GST filing, annual company accounts audit, and outsourced payroll solutions.",
    about: "We keep your financial books balanced and compliant. Our certified accountants manage ledger reconciliations, payroll records, and tax returns so you can focus on growth.",
    products: [
      { name: 'GST Filing & Compliance (Monthly)', price: '₹2,499/mo', desc: 'Invoice reconciliation, tax calculations, and GSTR-1/3B filing.' },
      { name: 'Annual Income Tax Return Pack', price: '₹4,999', desc: 'Profit & Loss analysis, tax deduction optimization, and filing.' },
      { name: 'Company Payroll Management (50 staff)', price: '₹9,999/mo', desc: 'Payslip generation, tax deductions, and direct bank transfers.' }
    ],
    theme: "bordeaux"
  },
  nails: {
    title: "Luxury Manicures & Creative Nail Art",
    subtitle: "Gel extensions, paraffin wax hand spa, and custom nail designs in a chic salon.",
    about: "Treat your hands to premium care. Our nail tech professionals use certified organic gels, non-toxic polishes, and sterile instruments to design custom nail styles.",
    products: [
      { name: 'Signature Gel Manicure', price: '₹999', desc: 'Nail shaping, cuticle treatment, organic gel polish coating, LED dry.' },
      { name: 'Acrylic Nail Extensions', price: '₹2,500', desc: 'Length extension, hand-sculpted acrylics, color polish application.' },
      { name: 'Paraffin Wax Hydrating Hand Spa', price: '₹800', desc: 'Warm wax wrap, skin moisturizing treatment, and hand massage.' }
    ],
    theme: "bubblegum"
  },
  security: {
    title: "Certified Security & CCTV Camera Install",
    subtitle: "IP camera setups, intercom wiring, and biometric access card integrations.",
    about: "Protect what matters. We install smart security networks equipped with night vision, motion alert smartphone syncs, and secure cloud storage vaults.",
    products: [
      { name: '4-Camera HD CCTV System Install', price: '₹18,500', desc: '4 dome cameras (1080p), 1TB DVR box, installation cables, mobile app setup.' },
      { name: 'Biometric Access Control Door Lock', price: '₹7,500', desc: 'Fingerprint and RFID card reader lock installed on office entry.' },
      { name: 'Annual Security System Service', price: '₹2,500', desc: 'Lens cleaning, power supply checking, connection test, software updates.' }
    ],
    theme: "midnight"
  },
  electrician: {
    title: "Safe, Certified Electrician & Wiring Repairs",
    subtitle: "Circuit breaker upgrades, smart home switches, and residential rewiring.",
    about: "We keep your electricity flowing safely. Our licensed wiremen diagnose electric shorts, replace burned sockets, and install modern lighting fixtures cleanly.",
    products: [
      { name: 'Circuit Breaker Box Diagnostics', price: '₹1,200', desc: 'Overload safety tests, fuse check, and grounding line calibration.' },
      { name: 'Smart Switch Installation Package', price: '₹2,500', desc: 'Upgrade 5 legacy switches to WiFi-controlled smart touch models.' },
      { name: 'Whole House Wiring Safety Check', price: '₹1,500', desc: 'Thermal scanner check of sockets, insulation testing, safety certification.' }
    ],
    theme: "solar"
  },
  carwash: {
    title: "Premium Foam Car Wash & Paint Detailing",
    subtitle: "Interior steam vacuum, high-gloss ceramic coatings, and alloy wheel polish.",
    about: "Restore that new-car shine. We use paint-safe micro-fiber pads, ph-neutral shampoo suds, and high-pressure blowers to detail your car without scratches.",
    products: [
      { name: 'Signature Foam Wash & Vacuum', price: '₹799', desc: 'Exterior snow foam spray, wheel wash, tyre shine, dashboard clean, vacuum.' },
      { name: 'Interior Deep Steam Sanitization', price: '₹2,499', desc: 'Upholstery stain extraction, roof cleaning, AC vent steam sanitizing.' },
      { name: '9H Hardness Ceramic Paint Coating', price: '₹18,000', desc: 'Dual-layer ceramic shield, swirl removal compound polish, 3-year warranty.' }
    ],
    theme: "skyblue"
  },
  pestcontrol: {
    title: "Effective, Non-Toxic Pest Control Solutions",
    subtitle: "Termite barriers, cockroach gel treatments, and rodent proofing guarantees.",
    about: "Keep your home healthy and pest-free. We use WHO-approved odorless gels and botanical sprays that are safe for kids and house pets.",
    products: [
      { name: '3-BHK Cockroach Gel Treatment', price: '₹1,800', desc: 'Advanced bait gel spots in kitchen and bath, herbal spray protection.' },
      { name: 'Anti-Termite Soil Injection Barrier', price: '₹12,500', desc: 'Chemical soil barrier around structure walls, 5-year warranty card.' },
      { name: 'Rodent Proofing & Baiting Service', price: '₹2,200', desc: 'Sealing entry holes, setting pet-safe bait stations, checkup visit.' }
    ],
    theme: "olive"
  },
  bicycle: {
    title: "Premium Bicycle Shop & Gear Tuning",
    subtitle: "Mountain bike gear adjustments, disc brake bleeding, and custom frame builds.",
    about: "Keep your wheels spinning smoothly. Our master mechanics tune road, gravel, and mountain bikes to keep your shifting fast and braking crisp.",
    products: [
      { name: 'Comprehensive Drivetrain Service', price: '₹1,500', desc: 'Chain and cassette degreasing, gear tuning, new gear cables.' },
      { name: 'Hydraulic Disc Brake Bleeding', price: '₹800/wheel', desc: 'Old fluid flush, mineral oil refill, pad check, caliper centering.' },
      { name: 'Custom Road Bike Wheel Truing', price: '₹400', desc: 'Spoke tension adjustment on truing stand to remove wheel wobbles.' }
    ],
    theme: "lime"
  },
  yoga: {
    title: "Mindful Vinyasa, Yin, & Meditation Classes",
    subtitle: "Daily group yoga classes, breathwork tutorials, and deep meditation retreats.",
    about: "Restore balance to your body and mind. Our certified instructors guide practitioners of all levels through slow, breath-aligned flows and relaxing poses.",
    products: [
      { name: '10-Class Group Yoga Pass', price: '₹3,500', desc: 'Valid for all daily morning Vinyasa and evening Yin yoga classes.' },
      { name: 'Private Sound Healing Session', price: '₹2,500', desc: '90 minutes of Tibetan singing bowls and chakra balancing breathwork.' },
      { name: 'Weekend Mindfulness Retreat Pass', price: '₹8,500', desc: 'Includes organic lunches, 4 yoga classes, and guided outdoor meditation.' }
    ],
    theme: "zen"
  },
  language: {
    title: "Learn Languages from Native Instructors",
    subtitle: "Interactive French, German, and Spanish courses for business and travel.",
    about: "Speak confidently from day one. Our conversational approach, online feedback tools, and weekly practice sessions help you learn vocabulary and pronunciation fast.",
    products: [
      { name: '12-Week A1 German Course Pack', price: '₹9,999', desc: '48 hours of instruction, textbook PDF, grammar worksheets, certified test.' },
      { name: 'Private English Pronouncing Hour', price: '₹1,200/hr', desc: 'Focus on native accents, phonetics review, and presentation practice.' },
      { name: 'Travel Spanish Survival Course', price: '₹3,500', desc: '8 sessions of basic phrases for ordering food, shopping, and directions.' }
    ],
    theme: "lavender"
  },
  events: {
    title: "Flawless Event Planning & Creative Decors",
    subtitle: "Custom theme weddings, corporate product launches, and birthday balloon setups.",
    about: "We handle the logistics so you can enjoy your celebration. From vendor contracts and venue designs to schedule timing, we execute flawless events.",
    products: [
      { name: 'Complete Birthday Design Setup', price: '₹15,000', desc: 'Themed backdrop, organic balloon arch, cake table styling, lighting.' },
      { name: 'Wedding Coordination Package', price: '₹85,000', desc: 'On-site coordinator for wedding day, vendor management, schedule monitoring.' },
      { name: 'Corporate Launch Event Consult', price: '₹5,000', desc: 'Floor plan concepts, audiovisual setup plan, and budget spreadsheet.' }
    ],
    theme: "sunset"
  },
  artgallery: {
    title: "Original Paintings & Fine Art Prints",
    subtitle: "Explore abstract oils, watercolor landscapes, and custom framing options.",
    about: "We connect art collectors with talented local and international creators. We host monthly exhibition openings and assist with curated corporate art setups.",
    products: [
      { name: 'Original Abstract Oil Painting', price: '₹28,000+', desc: 'Canvas stretched painting (3x3ft), signed, with authenticity certificate.' },
      { name: 'Giclee Museum-Quality Art Print', price: '₹3,500', desc: 'High-resolution archival ink print on heavy acid-free textured paper.' },
      { name: 'Custom Archival Wood Framing', price: '₹1,800', desc: 'Solid oak frame, acid-free backing mat, UV-filtering acrylic cover.' }
    ],
    theme: "charcoal"
  },
  dentrepair: {
    title: "Paintless Dent Removal & Paint Refinishing",
    subtitle: "Remove door dings, bumper scrapes, and paint scratches with factory-match coating.",
    about: "Restore your car's bodywork without costly replacements. We utilize specialized dent pulling rods and computer-matched paint sprays to fix dings invisible.",
    products: [
      { name: 'Paintless Dent Repair (per panel)', price: '₹1,500', desc: 'Ping and hail dent massage from behind the panel, no paint required.' },
      { name: 'Bumper Scrape Scatch Paint Repair', price: '₹3,500', desc: 'Sanding, primer application, base coat paint matching, and clear coat.' },
      { name: 'Full Car Paint Polish & Wax', price: '₹4,500', desc: 'Swirl mark correction, high-gloss carnauba wax coating protection.' }
    ],
    theme: "steel"
  },
  tailor: {
    title: "Bespoke Tailoring & Garment Alters",
    subtitle: "Handcrafted suits, customized evening gowns, and precision clothing alterations.",
    about: "Get the perfect fit. Our tailors measure, cut, and stitch premium fabrics to create custom patterns that match your body shape and movements.",
    products: [
      { name: 'Bespoke 2-Piece Suit Stitching', price: '₹15,000', desc: 'Custom jacket and trousers, 3 fitting sessions, excludes fabric cost.' },
      { name: 'Trousers Waist & Hem Alteration', price: '₹350', desc: 'Adjusting leg length and tapering leg line for optimal fit.' },
      { name: 'Evening Gown Fitting Alteration', price: '₹1,800', desc: 'Bust adjustment, strap shortening, zipper fix, and delicate hem lining.' }
    ],
    theme: "plum"
  },
  tattoo: {
    title: "Safe, Creative Tattoo Art & Custom Ink",
    subtitle: "Custom blackwork designs, watercolor tattoos, and cover-up experts.",
    about: "Express yourself through safe body art. Our award-winning tattooists specialize in fine-line, realistic portraiture, and bold tribal blackwork in a sterile clinic.",
    products: [
      { name: 'Custom Tattoo Session Hour', price: '₹3,000/hr', desc: 'Private studio session, sterile disposable needles, organic dynamic inks.' },
      { name: 'Fine-Line Minimalist Tattoo', price: '₹2,500', desc: 'Up to 2x2 inches, clean single-needle blackwork design on skin.' },
      { name: 'Tattoo Cover-Up Consultation', price: 'Free', desc: 'Review of existing ink, custom redesign sketch options, and sizing.' }
    ],
    theme: "vampire"
  },
  gardening: {
    title: "Lush Landscaping & Automatic Irrigation",
    subtitle: "Lawn seeding, garden soil preparation, and drip watering systems.",
    about: "Build your backyard sanctuary. We design stone paths, plant seasonal flower beds, install natural turf rolls, and build smart irrigation timers.",
    products: [
      { name: 'Custom Drip Irrigation Installation', price: '₹18,500', desc: 'Pipes, drip heads, pressure valves, smart WiFi timer control setup.' },
      { name: 'Lawn Aerating & Overseeding', price: '₹4,999', desc: 'Soil aeration, organic compost spreading, premium Bermuda grass seeds.' },
      { name: 'Garden Maintenance Visit (4h)', price: '₹2,000', desc: 'Pruning shrubs, weed removal, soil digging, and organic fertilizing.' }
    ],
    theme: "forest"
  },
  crossfit: {
    title: "High-Intensity CrossFit & Strength Coaching",
    subtitle: "Olympic lifting platforms, rowers, gymnastics rings, and certified coaches.",
    about: "Build functional strength and endurance. Our group workouts (WODs) are designed to challenge you safely under constant coaching supervision.",
    products: [
      { name: 'Unlimited Monthly CrossFit Pass', price: '₹3,500/mo', desc: 'Access to all daily WOD classes, open gym hours, and track logs.' },
      { name: 'Olympic Weightlifting Class', price: '₹600/class', desc: '60 minutes focusing on snatch and clean-and-jerk technical drills.' },
      { name: 'Personal Strength Assessment (1h)', price: '₹1,500', desc: 'Mobility screening, 1RM strength testing, and custom workout routine plan.' }
    ],
    theme: "magma"
  },
  physio: {
    title: "Physiotherapy & Sports Rehabilitation",
    subtitle: "Dry needling, joint mobilization, and custom recovery exercise plans.",
    about: "Recover from pain and injury. Our licensed physiotherapists diagnose your movement limits and design a targeted recovery plan to help you heal.",
    products: [
      { name: 'Initial Physiotherapy Assessment', price: '₹1,200', desc: 'Orthopedic tests, range of motion measure, and first rehab treatment.' },
      { name: 'Sports Injury Therapy Session', price: '₹1,000', desc: 'Dry needling, muscle release massage, and home exercise setup.' },
      { name: 'Kinesiology Taping Package', price: '₹400', desc: 'Application of elastic therapeutic tape to support weak muscles.' }
    ],
    theme: "aqua"
  }
};
export default function ChatbotDemo({ onAddLead, currentUser, onTriggerLogin }) {
  // Wizard Setup Step State
  const [wizardStep, setWizardStep] = useState(1); // 1: Bot Settings, 2: Webpage Settings

  // Configuration State
  const [bizName, setBizName] = useState("");
  const [agentTone, setAgentTone] = useState("friendly"); // friendly, professional, sales, direct
  const [systemPrompt, setSystemPrompt] = useState("");
  const [requireEmail, setRequireEmail] = useState(true);
  const [requirePhone, setRequirePhone] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || "");
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [botTrained, setBotTrained] = useState(false);

  // Website Generator State
  const [slug, setSlug] = useState("");
  const [webTheme, setWebTheme] = useState("amber");
  const [webTemplate, setWebTemplate] = useState("bakery");
  const [webTitle, setWebTitle] = useState("");
  const [webSubtitle, setWebSubtitle] = useState("");
  const [webAbout, setWebAbout] = useState("");
  const [productsList, setProductsList] = useState([]);
  const [enableChatBot, setEnableChatBot] = useState(true);

  const handleToneChange = (newTone) => {
    setAgentTone(newTone);
    setBotTrained(false);

    const nameToUse = bizName || "[Business Name]";
    let promptTemplate = "";
    if (newTone === "friendly") {
      promptTemplate = `You are a warm, welcoming, and helpful assistant for ${nameToUse}. Use a friendly tone, support with matching emojis, and show real empathy. Explain our services and help answer queries. If they want to order or book a consultation, ask for their name, email, and description of what they want.`;
    } else if (newTone === "professional") {
      promptTemplate = `You are a highly professional, polite, and formal customer representative for ${nameToUse}. Maintain a clear, objective corporate tone with absolute precision. Do not use any emojis or casual expressions. Answer queries professionally and request their contact details (name, email, phone) to arrange formal callback consultations.`;
    } else if (newTone === "sales") {
      promptTemplate = `You are a persuasive, high-converting sales specialist for ${nameToUse}. Your goal is to guide visitors toward making bookings or purchasing catalog products. Highlight the value of our products and prompt them early in the conversation for their contact details (name, email) to lock in special discounts or quotes.`;
    } else if (newTone === "direct") {
      promptTemplate = `You are a direct, concise, and straight-to-the-point assistant for ${nameToUse}. Keep responses extremely brief, crisp, and factual. Answer user questions directly in one or two short sentences without any fluff. Prompt for their contact information only when they explicitly ask to be contacted or place an order.`;
    }
    setSystemPrompt(promptTemplate);
  };

  // Dynamic system prompt generation as the user types their business name
  useEffect(() => {
    if (bizName && !systemPrompt) {
      handleToneChange(agentTone);
    }
  }, [bizName]);

  // Website Generator UI State
  const [webLoading, setWebLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Sync Slug with Business Name on initial typing
  useEffect(() => {
    const defaultSlug = bizName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    setSlug(defaultSlug);
  }, [bizName]);

  // Update Template Content Defaults dynamically
  const handleTemplateChange = (tmpl) => {
    setWebTemplate(tmpl);
    const data = TEMPLATES[tmpl];
    if (data) {
      setWebTitle(data.title);
      setWebSubtitle(data.subtitle);
      setWebAbout(data.about);
      setProductsList(data.products);
      setWebTheme(data.theme);
    }
  };

  const handleGenerateWebsite = async (e) => {
    e.preventDefault();
    if (!slug.trim()) return;

    if (!currentUser) {
      alert("🔒 Authentication Required: You must be logged in to generate and launch your website. Please sign in first.");
      if (onTriggerLogin) onTriggerLogin();
      return;
    }

    setWebLoading(true);
    const siteData = {
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      bizName,
      theme: webTheme,
      template: webTemplate,
      title: webTitle,
      subtitle: webSubtitle,
      about: webAbout,
      products: productsList,
      botConfig: {
        bizName,
        systemPrompt,
        requireEmail,
        requirePhone,
        selectedModel,
        apiKey,
        agentTone
      },
      enableBot: enableChatBot,
      ownerEmail: currentUser?.email || 'anonymous'
    };

    // Save to Firebase Firestore
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'websites', siteData.slug), siteData);
        console.log('[FIREBASE] Web configuration written for:', siteData.slug);
      } catch (err) {
        console.error('[FIREBASE ERROR] Firestore write failed:', err);
      }
    }

    // Backup mirror in LocalStorage
    try {
      const stored = JSON.parse(localStorage.getItem('aiformsme_websites') || '{}');
      stored[siteData.slug] = siteData;
      localStorage.setItem('aiformsme_websites', JSON.stringify(stored));
    } catch (err) {
      console.error(err);
    }

    const baseOrigin = window.location.origin.includes('onrender.com')
      ? 'https://aiformsme.co.in'
      : window.location.origin;
    setGeneratedUrl(`${baseOrigin}/${siteData.slug}`);
    setWebLoading(false);
    setShowSuccessModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddProduct = () => {
    setProductsList([...productsList, { name: 'New Item', price: '₹1,000', desc: 'Provide brief details.' }]);
  };

  const handleProductChange = (index, field, value) => {
    setProductsList(productsList.map((p, idx) => {
      if (idx === index) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleRemoveProduct = (index) => {
    setProductsList(productsList.filter((_, idx) => idx !== index));
  };

  // Chat State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "Hi! I am your AI assistant. Tell me your business name on the left to customize me!" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Lead Collection tracking state in current session
  const [collectedData, setCollectedData] = useState({ name: '', email: '', phone: '', note: '' });
  const [leadsList, setLeadsList] = useState([]);

  // Sync leads from Firebase Firestore or local storage fallback (filtered by currentUser)
  useEffect(() => {
    const syncLocalLeads = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
        // Filter by logged-in user email
        const filtered = stored.filter(lead => lead.ownerEmail === currentUser?.email);
        setLeadsList(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    syncLocalLeads();

    let unsubscribe = null;
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'leads'), orderBy('date', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const list = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Filter Firestore list elements by logged-in user email for privacy
            if (data.ownerEmail === currentUser?.email) {
              list.push({ id: docSnap.id, ...data });
            }
          });
          setLeadsList(list);
        }, (err) => {
          console.error('[FIRESTORE LEADS LISTENER ERROR]:', err);
        });
      } catch (err) {
        console.error(err);
      }
    }

    window.addEventListener('aiformsme_lead_added', syncLocalLeads);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('aiformsme_lead_added', syncLocalLeads);
    };
  }, [currentUser]);

  const saveCapturedLead = async (lead) => {
    // Enrich lead data with the active operator's email identity
    const enrichedLead = {
      ...lead,
      ownerEmail: lead.ownerEmail || currentUser?.email || 'anonymous'
    };

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'leads'), enrichedLead);
        console.log('[FIREBASE] Lead captured & saved:', enrichedLead.name);
      } catch (err) {
        console.error('[FIREBASE ERROR] Failed saving lead:', err);
      }
    }
    try {
      const stored = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
      localStorage.setItem('aiformsme_leads', JSON.stringify([enrichedLead, ...stored]));
      window.dispatchEvent(new Event('aiformsme_lead_added'));
    } catch (err) {
      console.error(err);
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle system prompt adjustments -> Reset chat
  const handleConfigChange = () => {
    if (!currentUser) {
      alert("🔒 Authentication Required: You must be logged in to deploy and train your AI agent sandbox simulator. Please sign in first.");
      if (onTriggerLogin) onTriggerLogin();
      return;
    }
    setMessages([
      { id: 1, sender: 'bot', text: `Chat reset. Welcome to ${bizName}! How can I help you today?` }
    ]);
    setCollectedData({ name: '', email: '', phone: '', note: '' });
    setBotTrained(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = inputVal.trim();
    const updatedMessages = [...messages, { id: Date.now(), sender: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setInputVal("");
    setIsTyping(true);

    if (apiKey.trim()) {
      // LIVE OPENROUTER API CHAT FLOW
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "AIForMSME Studio",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: "system", content: `${systemPrompt} Rules: Act strictly within this description. Do NOT hallucinate policies. Keep responses concise and focused.` },
              ...messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
              })),
              { role: "user", content: userMsg }
            ]
          })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText} (${response.status})`);

        const data = await response.json();
        const botResponse = data.choices[0].message.content;

        const finalMessages = [...updatedMessages, { id: Date.now() + 1, sender: 'bot', text: botResponse }];
        setMessages(finalMessages);

        // Parse & Refine leads dynamically using AI on the complete conversation history
        triggerLeadGeneration(finalMessages);

      } catch (err) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: `API Request Failed: ${err.message}. Please verify your API Key and network.` }]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // LOCAL SIMULATION FALLBACK FLOW
      setTimeout(() => {
        let botResponse = "";
        const textLower = userMsg.toLowerCase();
        const emailMatch = userMsg.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
        const hasEmail = emailMatch && emailMatch.length > 0;
        const cleanPhoneNum = userMsg.replace(/[^0-9]/g, "");
        const hasPhone = cleanPhoneNum.length >= 7 && cleanPhoneNum.length <= 15;

        if (textLower.includes("hello") || textLower.includes("hi") || textLower.includes("hey")) {
          botResponse = `Hello there! Welcome to ${bizName}. Are you looking to make a purchase, browse our items, or schedule something?`;
        } 
        else if (textLower.includes("order") || textLower.includes("buy") || textLower.includes("book") || textLower.includes("price") || textLower.includes("hire") || textLower.includes("consult")) {
          botResponse = `I'd love to help you with that! To get started, what is your name?`;
        } 
        else if (hasEmail) {
          const email = emailMatch[0];
          botResponse = `Perfect. I have recorded your email (${email}). I have logged your request. Our team will contact you shortly!`;
        }
        else if (hasPhone) {
          botResponse = `Thank you. I've noted your phone number (${userMsg}). What are details of your inquiry?`;
        }
        else if (collectedData.name === '') {
          const name = userMsg;
          setCollectedData(prev => ({ ...prev, name }));
          botResponse = `Nice to meet you, ${name}! ` + 
            (requireEmail ? `Could you please provide your email address so we can reach you?` : `Could you provide some detail on what you need?`);
        } 
        else {
          botResponse = `Got it! I've logged your request. We will get in touch with you shortly. Thank you!`;
        }

        const finalMessages = [...updatedMessages, { id: Date.now() + 1, sender: 'bot', text: botResponse }];
        setMessages(finalMessages);

        // Parse & Refine leads dynamically using local heuristics on the complete conversation history
        triggerLeadGeneration(finalMessages);
        setIsTyping(false);
      }, 1200);
    }
  };

  const getSimulatedSummary = (historyText) => {
    const textLower = historyText.toLowerCase();
    if (textLower.includes("cake") || textLower.includes("wedding")) {
      return "Wants custom wedding cake consultation";
    }
    if (textLower.includes("croissant") || textLower.includes("bread") || textLower.includes("pastry")) {
      return "Wants to order custom pastries / croissants";
    }
    if (textLower.includes("price") || textLower.includes("quote") || textLower.includes("cost")) {
      return "Requested pricing details & catalog rates";
    }
    if (textLower.includes("book") || textLower.includes("schedule") || textLower.includes("meet")) {
      return "Requested callback scheduling for consultation";
    }
    return "General business callback request";
  };

  const offlineExtractLead = (chatHistoryList) => {
    let name = "N/A";
    let email = "N/A";
    let phone = "N/A";
    let chatConcat = chatHistoryList.map(m => m.text).join(" ");
    
    // Email regex
    const emailMatch = chatConcat.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    if (emailMatch) email = emailMatch[0];

    // Phone regex
    const phoneMatches = chatHistoryList.map(m => m.text.replace(/[^0-9]/g, ""));
    const phoneMatch = phoneMatches.find(p => p.length >= 7 && p.length <= 15);
    if (phoneMatch) phone = phoneMatch;

    // Clean name: find where customer answered the name question
    for (let i = 0; i < chatHistoryList.length; i++) {
      if (chatHistoryList[i].sender === 'bot') {
        const text = chatHistoryList[i].text.toLowerCase();
        if (text.includes("your name") || text.includes("who are you")) {
          let nextMsg = chatHistoryList[i + 1]?.text || "";
          if (nextMsg) {
            let cleaned = nextMsg.replace(/my name is/i, "")
                                 .replace(/i am/i, "")
                                 .replace(/this is/i, "")
                                 .trim();
            
            if (cleaned.toLowerCase().includes("name") && cleaned.toLowerCase().includes("email")) {
              const namePart = cleaned.match(/name\s+([a-zA-Z]+)/i);
              if (namePart) cleaned = namePart[1];
            } else if (cleaned.toLowerCase().includes("name")) {
              const namePart = cleaned.match(/name\s+([a-zA-Z]+)/i);
              if (namePart) cleaned = namePart[1];
            } else {
              const words = cleaned.split(/[^a-zA-Z]+/);
              const properWord = words.find(w => w.length > 2 && w[0] === w[0].toUpperCase());
              if (properWord) cleaned = properWord;
              else cleaned = words[0] || cleaned;
            }
            name = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
          }
          break;
        }
      }
    }

    if (name === "N/A" || name.toLowerCase().includes("cake") || name.toLowerCase().includes("croissant")) {
      const namePart = chatConcat.match(/name\s+([a-zA-Z]+)/i);
      if (namePart) name = namePart[1];
    }

    return {
      name: name.slice(0, 30),
      email,
      phone,
      note: getSimulatedSummary(chatConcat)
    };
  };

  const refineAllLeadFieldsWithAI = async (chatHistory, leadId) => {
    if (!apiKey.trim()) return;
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "AIForMSME Studio",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: "You are a CRM database assistant. Analyze the chat history between the customer and the AI Bot and extract structured details. Return ONLY a valid JSON object. Do not wrap in markdown tags or include any text before or after the JSON. Use N/A if not found. Keep inquiry summary under 10 words.\n\nJSON Schema:\n{\n  \"name\": \"Properly capitalized first & last name. Extract ONLY the human name, clean it of any other sentences or details (e.g. if customer says 'chesse cake 1kg Name Vihaan email...', extract 'Vihaan').\",\n  \"email\": \"Valid email address or 'N/A'\",\n  \"phone\": \"Clean formatted phone number or 'N/A'\",\n  \"inquiry\": \"One-sentence logical summary of what they want (max 10 words, e.g. 'Wants to order 1kg cheesecake').\"\n}"
            },
            {
              role: "user",
              content: `Chat history to extract:\n${chatHistory}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API call failed");
      const resData = await response.json();
      
      let rawContent = resData.choices[0].message.content.trim();
      
      // Clean markdown code blocks if returned
      if (rawContent.startsWith("```")) {
        rawContent = rawContent.replace(/```json|```/g, "").trim();
      }

      const parsed = JSON.parse(rawContent);

      const refinedLead = {
        id: leadId,
        name: parsed.name || "N/A",
        email: parsed.email || "N/A",
        phone: parsed.phone || "N/A",
        note: parsed.inquiry || "General Inquiry",
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        source: 'Simulator AI'
      };

      saveCapturedLead(refinedLead);

    } catch (err) {
      setLeadsList(prev => prev.map(l => {
        if (l.id === leadId) {
          const fallback = {
            id: leadId,
            name: "Customer Lead",
            email: "Check logs",
            phone: "Check logs",
            note: "AI Refinement failed",
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            source: 'Simulator AI'
          };
          saveCapturedLead(fallback);
        }
        return l;
      }));
    }
  };

  const triggerLeadGeneration = (chatHistoryList) => {
    // Check if the history contains at least some contact information to capture
    const hasContactInfo = chatHistoryList.some(m => {
      const text = m.text.toLowerCase();
      const hasEmail = text.includes("@") && text.includes(".");
      const cleanNum = text.replace(/[^0-9]/g, "");
      const hasPhone = cleanNum.length >= 7 && cleanNum.length <= 15;
      return hasEmail || hasPhone;
    });

    if (!hasContactInfo) return; // Wait until contact info exists in the chat

    const tempLeadId = Date.now();
    const isLive = apiKey.trim() !== "";

    // Check if duplicate
    const isDuplicate = leadsList.some(l => l.name === "Extracting..." || (hasContactInfo && chatHistoryList.some(m => m.text.includes(l.email)) && l.email !== 'N/A'));
    if (isDuplicate) return;

    const initialLead = {
      id: tempLeadId,
      name: "Extracting...",
      email: "Extracting...",
      phone: "Extracting...",
      note: isLive ? "Refining with AI..." : "Parsing...",
      date: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setLeadsList(prev => {
      const hasInProgress = prev.some(l => l.name === "Extracting...");
      if (hasInProgress) return prev;
      return [initialLead, ...prev];
    });

    if (!isLive) {
      const parsedLead = offlineExtractLead(chatHistoryList);
      parsedLead.id = tempLeadId;
      parsedLead.date = initialLead.date;
      parsedLead.source = 'Simulator';

      saveCapturedLead(parsedLead);
    } else {
      const chatHistoryStr = chatHistoryList.map(m => `${m.sender === 'user' ? 'Customer' : 'Bot'}: ${m.text}`).join('\n');
      refineAllLeadFieldsWithAI(chatHistoryStr, tempLeadId);
    }
  };

  const clearChat = () => {
    setMessages([
      { id: 1, sender: 'bot', text: `Chat reset. Welcome to ${bizName}! How can I help you today?` }
    ]);
    setCollectedData({ name: '', email: '', phone: '', note: '' });
  };

  const downloadLeadsCSV = () => {
    const headers = 'Name,Email,Phone,Inquiry,Date\n';
    const rows = leadsList.map(l => `"${l.name}","${l.email}","${l.phone}","${l.note.replace(/"/g, '""')}","${l.date}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${bizName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_leads.csv`);
    a.click();
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div className="chatbot-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'stretch' }}>
        
        {/* Left Column: Setup Wizard */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '480px', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Wizard Step Indicator & Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--primary-light))', fontWeight: 'bold' }}>
                  STEP {wizardStep} OF 5
                </span>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
                  {wizardStep === 1 && "Business Identity"}
                  {wizardStep === 2 && "AI Agent Instructions"}
                  {wizardStep === 3 && "Sandbox Deployment"}
                  {wizardStep === 4 && "Webpage Design"}
                  {wizardStep === 5 && "Webpage Content"}
                </span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${wizardStep * 20}%`, height: '100%', background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* STEP 1: Business Identity */}
            {wizardStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Globe style={{ color: 'hsl(var(--primary-light))' }} size={22} />
                  <h3 style={{ fontSize: '1.25rem' }}>Business Identity</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="biz-name-wizard" style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Business Name *</label>
                  <input 
                    id="biz-name-wizard"
                    type="text" 
                    value={bizName} 
                    onChange={(e) => {
                      setBizName(e.target.value);
                      setBotTrained(false);
                    }} 
                    placeholder="e.g. Rawat Bakery"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'white',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="slug-wizard" style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>URL Slug *</label>
                  <input 
                    id="slug-wizard"
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="e.g. rawat_bakery"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'white',
                      fontSize: '0.95rem'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                    This defines the clean link to view your generated website.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: AI Agent Instructions */}
            {wizardStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings style={{ color: 'hsl(var(--primary-light))' }} size={22} />
                  <h3 style={{ fontSize: '1.25rem' }}>AI Bot Persona</h3>
                </div>

                {/* AI Tone of Voice Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="tone-wizard" style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>AI Tone of Voice</label>
                  <select 
                    id="tone-wizard"
                    value={agentTone}
                    onChange={(e) => handleToneChange(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="friendly" style={{ background: '#0a0f1d', color: '#fff' }}>😊 Friendly & Warm (Default)</option>
                    <option value="professional" style={{ background: '#0a0f1d', color: '#fff' }}>💼 Highly Professional & Formal</option>
                    <option value="sales" style={{ background: '#0a0f1d', color: '#fff' }}>🚀 Persuasive & Sales-Oriented</option>
                    <option value="direct" style={{ background: '#0a0f1d', color: '#fff' }}>⚡ Direct & Concise</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="prompt-wizard" style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>System Prompts & Knowledge Base *</label>
                  <textarea 
                    id="prompt-wizard"
                    rows={4}
                    value={systemPrompt} 
                    onChange={(e) => {
                      setSystemPrompt(e.target.value);
                      setBotTrained(false);
                    }} 
                    placeholder="Define how the AI should talk, answer questions, and behave..."
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'white',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Required Lead Info</span>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={requireEmail} onChange={(e) => {
                        setRequireEmail(e.target.checked);
                        setBotTrained(false);
                      }} />
                      Capture Email
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={requirePhone} onChange={(e) => {
                        setRequirePhone(e.target.checked);
                        setBotTrained(false);
                      }} />
                      Capture Phone Number
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Sandbox Deployment */}
            {wizardStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bot style={{ color: 'hsl(var(--primary-light))' }} size={22} />
                  <h3 style={{ fontSize: '1.25rem' }}>Engine Sandbox Training</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Live OpenRouter Integration (Optional)</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="api-key-wizard" style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>OpenRouter API Key</label>
                    <input 
                      id="api-key-wizard"
                      type="password" 
                      placeholder="sk-or-v1-..."
                      value={apiKey} 
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setBotTrained(false);
                      }} 
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'white',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="model-select-wizard" style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Model Selection</label>
                    <select 
                      id="model-select-wizard"
                      value={selectedModel} 
                      onChange={(e) => {
                        setSelectedModel(e.target.value);
                        setBotTrained(false);
                      }} 
                      style={{
                        background: 'rgba(15,23,42,0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'white',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    >
                      <option value="openrouter/free">Auto-Select Free Model (Recommended)</option>
                      <option value="meta-llama/llama-3.1-8b-instruct:free">Llama 3.1 8B (Free)</option>
                      <option value="google/gemma-2-9b-it:free">Gemma 2 9B (Free)</option>
                      <option value="qwen/qwen-2.5-coder-32b-instruct:free">Qwen 2.5 Coder 32B (Free)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <button 
                    type="button"
                    className="btn-primary" 
                    onClick={handleConfigChange} 
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      fontSize: '0.9rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px'
                    }}
                  >
                    Deploy & Train Sandbox AI Agent
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px' }}>
                    {botTrained ? (
                      <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Sandbox model trained & active!
                      </span>
                    ) : (
                      <span style={{ color: '#facc15', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⚠️ Click button to train sandbox model.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Webpage Design & Styling */}
            {wizardStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Palette style={{ color: 'hsl(var(--secondary-light))' }} size={22} />
                  <h3 style={{ fontSize: '1.25rem' }}>Webpage Design & Theme</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="template-wizard" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Template Design</label>
                    <select 
                      id="template-wizard"
                      value={webTemplate}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      style={{
                        background: 'rgba(15,23,42,0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'white',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    >
                      <option value="bakery">Bakery & Café Layout</option>
                      <option value="services">Professional Consulting</option>
                      <option value="salon">Spa & Beauty Salon</option>
                      <option value="fitness">Fitness Studio Layout</option>
                      <option value="dental">Dental & Smile Clinic</option>
                      <option value="plumbing">Plumbing & Pipe Repair</option>
                      <option value="petcare">Pet Grooming & Spa</option>
                      <option value="realestate">Real Estate Agency</option>
                      <option value="boutique">Boutique Fashion Store</option>
                      <option value="bookstore">Cozy Bookstore & Cafe</option>
                      <option value="law">Law Firm Advocacy</option>
                      <option value="pharmacy">Pharmacy & Wellness Hub</option>
                      <option value="autorepair">Auto Repair & Diagnostic</option>
                      <option value="photography">Professional Photo Studio</option>
                      <option value="grocery">Organic Grocery Delivery</option>
                      <option value="software">Software Dev Agency</option>
                      <option value="catering">Gourmet Events Catering</option>
                      <option value="cleaning">Eco Cleaning Services</option>
                      <option value="marketing">Digital Marketing Growth</option>
                      <option value="tutoring">Tutoring & Tech Academy</option>
                      <option value="florist">Flower Shop & Floral Design</option>
                      <option value="construction">Roofing & House Building</option>
                      <option value="music">Music School & Vocal coach</option>
                      <option value="jewelry">Bespoke Jewelry & Fine Gold</option>
                      <option value="optician">Optician Eyewear Clinic</option>
                      <option value="coworking">Co-working Space & desks</option>
                      <option value="travel">Travel Agency Tours</option>
                      <option value="laundry">Dry Cleaning & Laundry</option>
                      <option value="barber">Barber Lounge & Shave</option>
                      <option value="architecture">Architecture & Space Design</option>
                      <option value="veterinary">Veterinary Pet Care</option>
                      <option value="handyman">Handyman Repairs & Installs</option>
                      <option value="webdesign">Modern Web Design Studio</option>
                      <option value="accounting">Accounting & GST Tax Advisory</option>
                      <option value="nails">Nail Salon & Gel Art</option>
                      <option value="security">Security Guard & CCTV</option>
                      <option value="electrician">Electrician Wiring Repair</option>
                      <option value="carwash">Foam Car Wash & Detailing</option>
                      <option value="pestcontrol">Safe Eco Pest Control</option>
                      <option value="bicycle">Bicycle Shop & Gear Tuning</option>
                      <option value="yoga">Yoga Vinyasa Studio</option>
                      <option value="language">Language School Lessons</option>
                      <option value="events">Event Organizer & Design</option>
                      <option value="artgallery">Fine Art Painting Gallery</option>
                      <option value="dentrepair">Bumper Paint & Dent Repair</option>
                      <option value="tailor">Bespoke Tailor Stitching</option>
                      <option value="tattoo">Creative Tattoo Ink Studio</option>
                      <option value="gardening">Landscaping & Garden Trim</option>
                      <option value="crossfit">CrossFit Box & Lifting Gym</option>
                      <option value="physio">Physiotherapy & Rehab Care</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="theme-wizard" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Theme Accent</label>
                    <select 
                      id="theme-wizard"
                      value={webTheme}
                      onChange={(e) => setWebTheme(e.target.value)}
                      style={{
                        background: 'rgba(15,23,42,0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'white',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    >
                      <option value="amber">Warm Amber (Cozy)</option>
                      <option value="mint">Emerald Mint (Fresh)</option>
                      <option value="breeze">Ocean Breeze (Clean)</option>
                      <option value="cyber">Cyberpunk Dark (Vibrant Neon)</option>
                      <option value="rose">Rose Quartz (Elegant)</option>
                      <option value="lavender">Lavender Dream (Soft Slate)</option>
                      <option value="crimson">Crimson Ruby (Bold Red)</option>
                      <option value="midnight">Midnight Blue (Royal Indigo)</option>
                      <option value="forest">Forest Moss (Deep Pine)</option>
                      <option value="citrus">Citrus Gold (Vibrant Amber)</option>
                      <option value="violet">Electric Violet (Neon Purple)</option>
                      <option value="coffee">Coffee Cream (Earthy Brown)</option>
                      <option value="aqua">Aqua Marine (Tropical Teal)</option>
                      <option value="sunset">Sunset Pink (Magenta Gradient)</option>
                      <option value="platinum">Platinum Slate (Metallic Silver)</option>
                      <option value="solar">Solar Yellow (High Contrast Obsidian)</option>
                      <option value="lime">Neon Lime (Toxic Space)</option>
                      <option value="plum">Plum Velvet (Rich Aubergine)</option>
                      <option value="royalgold">Royal Gold (Navy & Gold)</option>
                      <option value="copper">Rusty Copper (Warm Earth)</option>
                      <option value="vampire">Vampire Red (Pitch Black & Blood Red)</option>
                      <option value="orchid">Orchid Petal (Soft Orchid Pink)</option>
                      <option value="peach">Peach Sorbet (Terracotta Peach)</option>
                      <option value="sage">Sage Garden (Muted Olive)</option>
                      <option value="skyblue">Sky Blue (Sunny Cyan)</option>
                      <option value="charcoal">Charcoal Ash (Pure Slate Gray)</option>
                      <option value="ice">Ice Blizzard (Frosted Pale Blue)</option>
                      <option value="banana">Banana Split (Creamy Pastel Yellow)</option>
                      <option value="chocolate">Chocolate Truffle (Rich Dark Cocoa)</option>
                      <option value="bubblegum">Bubblegum Pink (Sweet Candy Pink)</option>
                      <option value="desert">Desert Sand (Warm Gold Sand)</option>
                      <option value="tropical">Tropical Ocean (Deep Turquoise Marine)</option>
                      <option value="magma">Magma Orange (Volcanic Lava)</option>
                      <option value="electricindigo">Electric Indigo (Sleek Deep Indigo)</option>
                      <option value="cyberneon">Neon Cyber (High-Volt Pink & Lime)</option>
                      <option value="olive">Olive Grove (Rustic Deep Olive)</option>
                      <option value="pistachio">Pistachio Green (Cozy Soft Sage)</option>
                      <option value="coral">Coral Reef (Bright Sunset Orange)</option>
                      <option value="teal">Teal Lagoon (Sleek Dark Teal)</option>
                      <option value="glacier">Glacier Blue (Frosted Icy Blue)</option>
                      <option value="deeppurple">Deep Purple (Midnight Purple Accent)</option>
                      <option value="cherryblossom">Cherry Blossom (Warm Sakura Pink)</option>
                      <option value="autumn">Autumn Leaf (Cozy Maple Orange)</option>
                      <option value="mermaid">Mermaid Lagoon (Deep Ocean Aquamarine)</option>
                      <option value="bronze">Steampunk Bronze (Rustic Dark Brass)</option>
                      <option value="steel">Steel Metallic (Cool Graphite Slate)</option>
                      <option value="bordeaux">Bordeaux Wine (Rich Deep Burgundy)</option>
                      <option value="tangerine">Neon Tangerine (Vibrant Coal Orange)</option>
                      <option value="mintchoc">Mint Chocolate (Sweet Mint Green)</option>
                      <option value="zen">Zen Bamboo (Balanced Moss & Ochre)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="headline-wizard" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Website Headline Banner *</label>
                  <input 
                    id="headline-wizard"
                    type="text" 
                    value={webTitle}
                    onChange={(e) => setWebTitle(e.target.value)}
                    placeholder="Enter main header headline..."
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px',
                      color: 'white',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="subtitle-wizard" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Sub-headline Introduction *</label>
                  <input 
                    id="subtitle-wizard"
                    type="text" 
                    value={webSubtitle}
                    onChange={(e) => setWebSubtitle(e.target.value)}
                    placeholder="Enter introductory sub-headline..."
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px',
                      color: 'white',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>
            )}

            {/* STEP 5: Webpage Content & Catalog */}
            {wizardStep === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers style={{ color: 'hsl(var(--secondary-light))' }} size={22} />
                  <h3 style={{ fontSize: '1.25rem' }}>Webpage Content & Catalog</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="about-wizard" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Detailed About Biography *</label>
                  <textarea 
                    id="about-wizard"
                    rows={3}
                    value={webAbout}
                    onChange={(e) => setWebAbout(e.target.value)}
                    placeholder="Describe your business operations, foundation history, and mission..."
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px',
                      color: 'white',
                      fontSize: '0.85rem',
                      lineHeight: '1.4',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Custom Catalog Products / Services</span>
                    <button 
                      type="button" 
                      onClick={handleAddProduct}
                      style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', color: 'hsl(var(--secondary-light))', borderRadius: '4px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '100px', overflowY: 'auto', paddingRight: '4px' }}>
                    {productsList.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <input 
                          type="text" 
                          value={p.name} 
                          onChange={(e) => handleProductChange(idx, 'name', e.target.value)} 
                          style={{ flex: 1.5, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem', padding: '2px' }}
                          placeholder="Item Name"
                        />
                        <input 
                          type="text" 
                          value={p.price} 
                          onChange={(e) => handleProductChange(idx, 'price', e.target.value)} 
                          style={{ flex: 0.8, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'hsl(var(--secondary-light))', fontSize: '0.8rem', padding: '2px', fontWeight: 'bold' }}
                          placeholder="Price"
                        />
                        <input 
                          type="text" 
                          value={p.desc} 
                          onChange={(e) => handleProductChange(idx, 'desc', e.target.value)} 
                          style={{ flex: 2, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'hsl(var(--text-muted))', fontSize: '0.8rem', padding: '2px' }}
                          placeholder="Description"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveProduct(idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={enableChatBot} onChange={(e) => setEnableChatBot(e.target.checked)} />
                    Embed AI Chatbot Widget on Site
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons footer for step transitions */}
          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '10px' }}>
            {wizardStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setWizardStep(prev => prev - 1)}
                style={{ flex: 1, padding: '12px', fontSize: '0.85rem', justifyContent: 'center' }}
              >
                ← Back
              </button>
            )}

            {wizardStep === 1 && (
              <button
                type="button"
                className="btn-primary"
                disabled={!bizName.trim() || !slug.trim()}
                onClick={() => setWizardStep(2)}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  fontSize: '0.9rem', 
                  justifyContent: 'center',
                  opacity: (!bizName.trim() || !slug.trim()) ? 0.5 : 1,
                  cursor: (!bizName.trim() || !slug.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                Next: AI Bot Settings →
              </button>
            )}

            {wizardStep === 2 && (
              <button
                type="button"
                className="btn-primary"
                disabled={!systemPrompt.trim()}
                onClick={() => setWizardStep(3)}
                style={{ 
                  flex: 1.5, 
                  padding: '12px', 
                  fontSize: '0.9rem', 
                  justifyContent: 'center',
                  opacity: !systemPrompt.trim() ? 0.5 : 1,
                  cursor: !systemPrompt.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                Next: Sandbox Deploy →
              </button>
            )}

            {wizardStep === 3 && (
              <button
                type="button"
                className="btn-primary"
                disabled={!botTrained}
                onClick={() => setWizardStep(4)}
                style={{ 
                  flex: 1.5, 
                  padding: '12px', 
                  fontSize: '0.9rem', 
                  justifyContent: 'center',
                  opacity: !botTrained ? 0.5 : 1,
                  cursor: !botTrained ? 'not-allowed' : 'pointer'
                }}
              >
                Next: Design Layout →
              </button>
            )}

            {wizardStep === 4 && (
              <button
                type="button"
                className="btn-primary"
                disabled={!webTitle.trim() || !webSubtitle.trim()}
                onClick={() => setWizardStep(5)}
                style={{ 
                  flex: 1.5, 
                  padding: '12px', 
                  fontSize: '0.9rem', 
                  justifyContent: 'center',
                  opacity: (!webTitle.trim() || !webSubtitle.trim()) ? 0.5 : 1,
                  cursor: (!webTitle.trim() || !webSubtitle.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                Next: Final Content →
              </button>
            )}

            {wizardStep === 5 && (
              <button 
                type="button"
                className="btn-primary" 
                onClick={handleGenerateWebsite}
                disabled={!botTrained || webLoading || !webAbout.trim()}
                style={{ 
                  flex: 2, 
                  padding: '12px', 
                  fontSize: '0.9rem', 
                  background: (botTrained && webAbout.trim()) ? 'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--primary)) 100%)' : '#334155', 
                  border: 'none', 
                  color: (botTrained && webAbout.trim()) ? 'white' : 'hsl(var(--text-muted))', 
                  fontWeight: 'bold', 
                  boxShadow: (botTrained && webAbout.trim()) ? '0 4px 15px rgba(6, 182, 212, 0.25)' : 'none',
                  cursor: (botTrained && webAbout.trim()) ? 'pointer' : 'not-allowed',
                  opacity: (botTrained && webAbout.trim()) ? 1 : 0.7,
                  justifyContent: 'center'
                }}
              >
                {webLoading ? 'Creating Web...' : '✨ Launch Website'}
              </button>
            )}
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(5, 7, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}>
            <div className="glass-panel" style={{
              width: '450px',
              padding: '40px',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(139,92,246,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', display: 'flex', alignItems: 'center', justify_content: 'center', marginBottom: '8px' }}>
                  <Globe size={28} />
                </div>
                <h3 style={{ fontSize: '1.4rem' }}>Website Generated Successfully!</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                  Your fully interactive simulation web page has been created and synced with the Firestore database.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: 'bold' }}>Sandbox URL Link</label>
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--secondary-light))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>{generatedUrl}</span>
                  <button 
                    onClick={copyToClipboard}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {!isFirebaseConfigured && (
                <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: '8px', padding: '12px', fontSize: '0.75rem', color: '#facc15', lineHeight: '1.4' }}>
                  ⚠️ **Demo Mode Active**: Firebase credentials are not configured in `.env`. The website is currently saved in local memory/cache. Connect Firebase to share this website link externally.
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                >
                  Close Window
                </button>
                <a 
                  href={generatedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ flex: 1.2, padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}
                  onClick={() => setShowSuccessModal(false)}
                >
                  Visit Website <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Visual Mobile Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '380px',
            height: '520px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '2px solid hsl(var(--primary) / 0.3)',
            boxShadow: 'var(--shadow-glow)'
          }}>
            {/* Simulator Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, rgba(255,255,255,0.02) 100%)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'hsl(var(--primary) / 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'hsl(var(--primary-light))'
                }}>
                  <Bot size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem' }}>{bizName || "My Business"} AI</h4>
                  <span style={{ fontSize: '0.75rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                    Online Agent
                  </span>
                </div>
              </div>

              <button 
                onClick={clearChat}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'hsl(var(--text-muted))',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Reset Chat"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', 
                    gap: '8px',
                    alignItems: 'flex-end',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  {msg.sender === 'bot' && (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'hsl(var(--primary-light))',
                      flexShrink: 0
                    }}>
                      <Bot size={12} />
                    </div>
                  )}
                  <div className="glass-panel" style={{
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.sender === 'user' ? 'hsl(var(--primary) / 0.15)' : 'rgba(255,255,255,0.03)',
                    border: msg.sender === 'user' ? '1px solid hsl(var(--primary) / 0.3)' : '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'hsl(var(--primary-light))'
                  }}>
                    <Bot size={12} />
                  </div>
                  <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff', opacity: 0.4, animation: 'pulse 1s infinite alternate' }} />
                      <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff', opacity: 0.4, animation: 'pulse 1s infinite alternate 0.2s' }} />
                      <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff', opacity: 0.4, animation: 'pulse 1s infinite alternate 0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '10px' }}>
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask chatbot anything... (e.g. hello)"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '10px',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                className="btn-icon" 
                style={{ width: '36px', height: '36px', backgroundColor: 'hsl(var(--primary) / 0.2)', border: 'none', color: 'hsl(var(--primary-light))' }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Captured Leads Table */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Table style={{ color: 'hsl(var(--secondary-light))' }} size={22} />
            <h3 style={{ fontSize: '1.2rem' }}>Leads Captured by AI Agent (Simulation Database)</h3>
          </div>
          {currentUser && (
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={downloadLeadsCSV}>
              <Download size={14} style={{ marginRight: '6px' }} /> Download Excel (CSV)
            </button>
          )}
        </div>

        {!currentUser ? (
          <div style={{ 
            padding: '40px 20px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '16px',
            background: 'rgba(5, 7, 16, 0.4)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            textAlign: 'center'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', color: 'hsl(var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'white', marginBottom: '6px' }}>Simulation Database Locked</h4>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', maxWidth: '420px', margin: '0 auto' }}>
                Sign in to your operator account to view live captured leads, download CSV exports, and monitor incoming requirements.
              </p>
            </div>
            <button className="btn-primary" onClick={onTriggerLogin} style={{ padding: '8px 24px', fontSize: '0.8rem' }}>
              Sign In to View Database
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Phone</th>
                  <th style={{ padding: '12px 16px' }}>Inquiry Description</th>
                  <th style={{ padding: '12px 16px' }}>Source</th>
                  <th style={{ padding: '12px 16px' }}>Captured On</th>
                </tr>
              </thead>
              <tbody>
                {leadsList.map((lead, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{lead.name}</td>
                    <td style={{ padding: '12px 16px', color: 'hsl(var(--secondary-light))' }}>{lead.email}</td>
                    <td style={{ padding: '12px 16px' }}>{lead.phone}</td>
                    <td style={{ padding: '12px 16px', color: 'hsl(var(--text-secondary))' }}>{lead.note}</td>
                    <td style={{ padding: '12px 16px', color: 'hsl(var(--primary-light))', fontWeight: '500' }}>{lead.source || 'Simulator'}</td>
                    <td style={{ padding: '12px 16px', color: 'hsl(var(--text-muted))' }}>{lead.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
