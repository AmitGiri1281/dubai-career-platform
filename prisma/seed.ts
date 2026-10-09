import { PrismaClient } from "../generated/prisma/client";
import { Role } from "../generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding database...");

  // Admin
  const adminEmail =
    process.env.ADMIN_EMAIL ?? "amitgiri99353@gmail.com";

  const adminPassword =
    process.env.ADMIN_PASSWORD ?? "Amit@123";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      passwordHash,
    },
    create: {
      email: adminEmail,
      name: "Platform Admin",
      passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Admin created: ${adminEmail}`);

  // Categories
  const categories = [
    { name: "Technology", slug: "technology" },
    { name: "Healthcare", slug: "healthcare" },
    {
      name: "Hospitality & Tourism",
      slug: "hospitality-tourism",
    },
    { name: "Engineering", slug: "engineering" },
    {
      name: "Finance & Banking",
      slug: "finance-banking",
    },
    {
      name: "Sales & Marketing",
      slug: "sales-marketing",
    },
    {
      name: "Logistics & Supply Chain",
      slug: "logistics",
    },
    { name: "Construction", slug: "construction" },
  ];

  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      })
    )
  );

  console.log(`✅ ${createdCategories.length} categories`);

  // Services
  const services = [
    {
      title: "CV / Resume Preparation",
      slug: "cv-resume-preparation",
      description:
        "Professionally crafted, ATS-friendly CVs tailored to UAE job market standards and employer expectations.",
      icon: "FileText",
      order: 1,
    },
    {
      title: "Job Application Assistance",
      slug: "job-application-assistance",
      description:
        "End-to-end support applying to Dubai and UAE employers, with application tracking.",
      icon: "Briefcase",
      order: 2,
    },
    {
      title: "Interview Preparation",
      slug: "interview-preparation",
      description:
        "Mock interviews, HR and technical guidance, and preparation for UAE-specific interview formats.",
      icon: "MessageSquare",
      order: 3,
    },
    {
      title: "Travel & Documentation Guidance",
      slug: "travel-documentation-guidance",
      description:
        "Guidance for visa processing, attestation, medicals, and travel documentation for the UAE.",
      icon: "Plane",
      order: 4,
    },
    {
      title: "Career Counseling",
      slug: "career-counseling",
      description:
        "One-on-one career guidance to help users choose suitable paths in the UAE job market.",
      icon: "Users",
      order: 5,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }

  console.log(`✅ ${services.length} services`);

  // Categories for sample jobs
  const techCat = createdCategories.find(
    (category) => category.slug === "technology"
  );

  const hospCat = createdCategories.find(
    (category) => category.slug === "hospitality-tourism"
  );

  const engCat = createdCategories.find(
    (category) => category.slug === "engineering"
  );

  if (!techCat || !hospCat || !engCat) {
    throw new Error("Required job categories were not created.");
  }

  // Sample jobs
  const jobs = [
    {
      title: "Senior Full-Stack Developer",
      slug: "senior-full-stack-developer",
      company: "Emirates Tech Solutions",
      location: "Dubai Internet City, Dubai",
      description:
        "We are seeking a Senior Full-Stack Developer to build scalable web applications for our growing platform.",
      requirements:
        "5+ years experience with Node.js, React/Next.js, PostgreSQL. Knowledge of AWS/Docker. Bachelor's in CS or related field. Excellent English communication.",
      salaryMin: 18000,
      salaryMax: 28000,
      currency: "AED",
      type: "FULL_TIME",
      remote: false,
      isPublished: true,
      categoryId: techCat.id,
    },
    {
      title: "Hotel Front Desk Manager",
      slug: "hotel-front-desk-manager",
      company: "Palm Luxury Hotels",
      location: "Palm Jumeirah, Dubai",
      description:
        "Lead our front desk team at a hospitality property. Manage check-ins, guest relations, and team scheduling.",
      requirements:
        "3+ years in luxury hospitality, excellent English, Arabic is a plus, Opera PMS knowledge, strong leadership.",
      salaryMin: 9000,
      salaryMax: 14000,
      currency: "AED",
      type: "FULL_TIME",
      remote: false,
      isPublished: true,
      categoryId: hospCat.id,
    },
    {
      title: "Mechanical Engineer - HVAC",
      slug: "mechanical-engineer-hvac",
      company: "Gulf Construction Group",
      location: "Business Bay, Dubai",
      description:
        "Design and oversee HVAC systems for commercial towers and coordinate with project teams.",
      requirements:
        "Bachelor's in Mechanical Engineering, 4+ years HVAC design, AutoCAD/Revit proficiency.",
      salaryMin: 12000,
      salaryMax: 18000,
      currency: "AED",
      type: "FULL_TIME",
      remote: false,
      isPublished: true,
      categoryId: engCat.id,
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {},
      create: job,
    });
  }

  console.log(`✅ ${jobs.length} sample jobs`);

  // Testimonials
  const testimonials = [
    {
      name: "Ahmed Al Mansoori",
      role: "Software Engineer",
      message:
        "The team helped me improve my CV and prepare for interviews for opportunities in Dubai.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Healthcare Professional",
      message:
        "The documentation guidance helped me understand the process and prepare my documents.",
      rating: 5,
    },
    {
      name: "John Okonkwo",
      role: "Site Engineer",
      message:
        "The career support and documentation guidance were helpful throughout my preparation.",
      rating: 5,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    });
  }

  console.log(`✅ ${testimonials.length} testimonials`);

  // FAQs
  const faqs = [
    {
      question:
        "How do I apply for jobs through your platform?",
      answer:
        "Browse the Job Opportunities page, filter by category or location, and follow the application instructions provided for the selected opportunity.",
      category: "Jobs",
      order: 1,
    },
    {
      question: "Do you charge for job listings?",
      answer:
        "Browsing job listings is free. Paid services may include CV preparation, interview preparation, and documentation guidance.",
      category: "Pricing",
      order: 2,
    },
    {
      question:
        "Can you help with UAE visa processing?",
      answer:
        "We provide guidance related to employment documentation and the UAE visa process. Official visa processing should be completed through the appropriate UAE authorities or authorized parties.",
      category: "Visa",
      order: 3,
    },
    {
      question:
        "How long does CV preparation take?",
      answer:
        "The expected turnaround depends on the selected service and the information provided by the applicant.",
      category: "Services",
      order: 4,
    },
    {
      question: "Are your job listings verified?",
      answer:
        "Job listings should be reviewed and verified by the platform team before publication. Applicants should also independently verify employers and offers before making payments or sharing sensitive documents.",
      category: "Trust",
      order: 5,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: faq,
    });
  }

  console.log(`✅ ${faqs.length} FAQs`);

  console.log("🎉 Seed completed successfully");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });