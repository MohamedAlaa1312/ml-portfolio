import type {
  Section,
  Experience,
  SiteSettings,
  Project,
  Skill,
  Certification,
  SkillCategory,
  SkillsContent,
  SocialLinkItem,
  CmsDraft,
  DraftEntityType,
  MediaItem,
  MediaUsageReference,
  MediaItemWithUsage,
} from './supabase/types';
import { parseSocialLinks } from './social-utils';

/**
 * Resilient In-Memory & Local Development Store
 * Activated automatically when NEXT_PUBLIC_SUPABASE_URL is unconfigured,
 * guaranteeing seamless CMS functionality in development and testing environments.
 */

// Global singleton to preserve state across hot reloads in Next.js development
declare global {
  // eslint-disable-next-line no-var
  var __portfolioStore:
    | {
        siteSettings: SiteSettings;
        sections: Section[];
        experience: Experience[];
        skills: Skill[];
        projects: Project[];
        certifications?: Certification[];
        drafts?: CmsDraft[];
        media?: MediaItem[];
      }
    | undefined;
}

const initialSiteSettings: SiteSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Mohamed Khaled',
  title: 'Machine Learning Engineer',
  professional_title: 'Machine Learning Engineer',
  subtitle: 'Turning Data Into Intelligent Solutions',
  bio: 'I am a Machine Learning Engineer with a passion for building AI systems that solve real-world problems. I enjoy working with data, designing models, and turning complex ideas into practical solutions.',
  email: 'mohamed@example.com',
  phone: '+20 100 123 4567',
  location: 'Cairo, Egypt',
  social_links: {
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    x: 'https://x.com',
    email: 'mailto:mohamed@example.com',
  },
  profile_image: '/images/profile.jpg',
  profile_image_url: '/images/profile.jpg',
  hero_title: 'Mohamed Khaled',
  hero_subtitle: 'Machine Learning Engineer',
  logo: null,
  logo_url: null,
  favicon: '/favicon.ico',
  favicon_url: '/favicon.ico',
  resume: '/documents/resume.pdf',
  resume_url: '/documents/resume.pdf',
  site_name: 'Mohamed Khaled Portfolio',
  site_description: 'Portfolio of Mohamed Khaled, Machine Learning Engineer specializing in AI, Deep Learning, and data-driven systems.',
  default_language: 'en',
  timezone: 'UTC',
  seo_title: 'Mohamed Khaled | Machine Learning Engineer Portfolio',
  seo_description: 'Portfolio of Mohamed Khaled, Machine Learning Engineer specializing in AI, Deep Learning, and data-driven systems.',
  og_image: '/images/profile.jpg',
  og_image_url: '/images/profile.jpg',
  canonical_url: 'https://mohamedkhaled.dev',
  allow_indexing: true,
  theme_preference: 'dark',
  accent_color: 'amber',
  default_items_per_page: 10,
  enable_contact_form: true,
  analytics_enabled: false,
  updated_at: new Date().toISOString(),
};

const initialCategories: SkillCategory[] = [
  {
    id: 'cat-1',
    name: 'Machine Learning',
    description: 'Core ML architectures, deep neural models, and inference pipelines',
    icon: '🧠',
    display_order: 1,
    enabled: true,
  },
  {
    id: 'cat-2',
    name: 'Programming',
    description: 'System software and high-performance programming languages',
    icon: '💻',
    display_order: 2,
    enabled: true,
  },
  {
    id: 'cat-3',
    name: 'Data Science',
    description: 'Data wrangling, analytical modeling, and visual insights',
    icon: '📊',
    display_order: 3,
    enabled: true,
  },
  {
    id: 'cat-4',
    name: 'Backend',
    description: 'Distributed servers, APIs, and microservices',
    icon: '⚙️',
    display_order: 4,
    enabled: true,
  },
  {
    id: 'cat-5',
    name: 'Databases',
    description: 'Relational databases, document stores, and in-memory caches',
    icon: '🗄️',
    display_order: 5,
    enabled: true,
  },
  {
    id: 'cat-6',
    name: 'Tools',
    description: 'Deployment containers, dev tools, and version control',
    icon: '🛠️',
    display_order: 6,
    enabled: true,
  },
];

const initialSections: Section[] = [
  {
    id: 'sec-hero',
    type: 'hero',
    title: 'Hero Section',
    slug: 'hero',
    content: {
      greeting: "Hello, I'm",
      badge: 'Machine Learning Engineer',
      summary:
        'I build intelligent systems using data, machine learning and modern technologies. Passionate about solving real-world problems and creating impactful solutions.',
      primaryCta: { label: 'View My Projects', anchor: '#projects' },
      secondaryCta: { label: 'Contact Me', anchor: '#contact' },
    },
    display_order: 1,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sec-about',
    type: 'about',
    title: 'About Me',
    slug: 'about',
    content: {
      badge: 'About Me',
      heading: 'Turning Data Into Intelligent Solutions',
      description:
        'I am a Machine Learning Engineer with a passion for building AI systems that solve real-world problems. I enjoy working with data, designing models, and turning complex ideas into practical solutions.',
      pillars: [
        { title: 'Problem Solver', description: 'Finds effective solutions', icon: '⚡' },
        { title: 'Continuous Learner', description: 'Always exploring modern architectures', icon: '🧠' },
        { title: 'Team Player', description: 'Builds great products in production', icon: '🤝' },
      ],
      avatarUrl: '/images/about-profile.jpg',
    },
    display_order: 2,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sec-experience',
    type: 'experience',
    title: 'Experience',
    slug: 'experience',
    content: {
      badge: 'Career',
      title: 'Experience',
      subtitle:
        'My professional journey in building data-driven solutions and working on impactful projects.',
    },
    display_order: 3,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sec-skills',
    type: 'skills',
    title: 'Skills',
    slug: 'skills',
    content: {
      badge: 'Capabilities',
      title: 'Skills',
      subtitle: 'Tools and technologies I work with.',
      categories: initialCategories,
      categoriesOrder: initialCategories.map((c) => c.name),
    },
    display_order: 4,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sec-projects',
    type: 'projects',
    title: 'Featured Projects',
    slug: 'projects',
    content: {
      badge: 'Portfolio',
      title: 'Featured Projects',
      subtitle:
        'A collection of projects that showcase my skills and experience in machine learning.',
    },
    display_order: 5,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sec-certifications',
    type: 'certifications',
    title: 'Certifications',
    slug: 'certifications',
    content: {
      badge: 'Credentials',
      title: 'Certifications',
      subtitle: 'Relevant certifications that validate my skills and knowledge.',
    },
    display_order: 6,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sec-contact',
    type: 'contact',
    title: 'Get In Touch',
    slug: 'contact',
    content: {
      badge: 'Contact',
      title: 'Get In Touch',
      subtitle:
        'Feel free to reach out for collaborations, opportunities or just to say hello!',
    },
    display_order: 7,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialExperience: Experience[] = [
  {
    id: 'exp-1',
    company: 'Google',
    role: 'Machine Learning Engineer',
    employment_type: 'Full-time',
    location: 'Remote',
    start_date: '2022-01-01',
    end_date: null,
    is_current: true,
    current_position: true,
    description:
      'Developed and deployed production-grade machine learning models serving millions of queries.',
    responsibilities: [
      'Developed and deployed ML models for large-scale applications.',
      'Improved model performance and reduced inference latency by 40%.',
      'Collaborated with cross-functional teams to deliver high-impact AI features.',
    ],
    technologies: ['Python', 'TensorFlow', 'Kubernetes', 'GCP'],
    achievements: [
      'Reduced inference latency by 40%',
      'Scaled model inference to 10M+ requests/day',
    ],
    display_order: 1,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    company: 'Microsoft',
    role: 'Data Scientist',
    employment_type: 'Full-time',
    location: 'Remote',
    start_date: '2020-06-01',
    end_date: '2021-12-31',
    is_current: false,
    current_position: false,
    description:
      'Built enterprise data pipelines and machine learning models for business intelligence.',
    responsibilities: [
      'Built data pipelines and machine learning models for business intelligence.',
      'Worked on NLP and recommendation systems across customer datasets.',
      'Optimized data processing workflows and distributed model training pipelines.',
    ],
    technologies: ['Python', 'PyTorch', 'Azure ML', 'Spark'],
    achievements: ['Engineered predictive churn models with 92% precision'],
    display_order: 2,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    company: 'Amazon',
    role: 'Machine Learning Intern',
    employment_type: 'Internship',
    location: 'Seattle, USA',
    start_date: '2019-07-01',
    end_date: '2019-09-30',
    is_current: false,
    current_position: false,
    description: 'Assisted in research and prototyping of personalization algorithms.',
    responsibilities: [
      'Assisted in developing ML models for personalized product recommendation.',
      'Analyzed large datasets and created visual data insights for product teams.',
      'Conducted experimental ablation studies on neural collaborative filtering.',
    ],
    technologies: ['Python', 'Scikit-learn', 'AWS', 'Pandas'],
    achievements: ['Published internal benchmark study on recommendation latency'],
    display_order: 3,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialSkills: Skill[] = [
  // Machine Learning
  { id: 'sk-1', name: 'Scikit-learn', category: 'Machine Learning', proficiency: 95, display_order: 1, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-2', name: 'TensorFlow', category: 'Machine Learning', proficiency: 90, display_order: 2, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-3', name: 'PyTorch', category: 'Machine Learning', proficiency: 92, display_order: 3, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-4', name: 'Keras', category: 'Machine Learning', proficiency: 88, display_order: 4, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Programming
  { id: 'sk-5', name: 'Python', category: 'Programming', proficiency: 98, display_order: 1, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-6', name: 'Java', category: 'Programming', proficiency: 80, display_order: 2, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-7', name: 'C++', category: 'Programming', proficiency: 75, display_order: 3, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-8', name: 'TypeScript', category: 'Programming', proficiency: 85, display_order: 4, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Data Science
  { id: 'sk-9', name: 'Pandas', category: 'Data Science', proficiency: 95, display_order: 1, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-10', name: 'NumPy', category: 'Data Science', proficiency: 95, display_order: 2, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-11', name: 'Matplotlib', category: 'Data Science', proficiency: 88, display_order: 3, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-12', name: 'Seaborn', category: 'Data Science', proficiency: 88, display_order: 4, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Backend
  { id: 'sk-13', name: 'FastAPI', category: 'Backend', proficiency: 92, display_order: 1, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-14', name: 'Django', category: 'Backend', proficiency: 85, display_order: 2, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-15', name: 'Node.js', category: 'Backend', proficiency: 82, display_order: 3, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-16', name: 'Express', category: 'Backend', proficiency: 80, display_order: 4, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Databases
  { id: 'sk-17', name: 'PostgreSQL', category: 'Databases', proficiency: 90, display_order: 1, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-18', name: 'MongoDB', category: 'Databases', proficiency: 85, display_order: 2, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-19', name: 'MySQL', category: 'Databases', proficiency: 82, display_order: 3, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-20', name: 'Redis', category: 'Databases', proficiency: 80, display_order: 4, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Tools
  { id: 'sk-21', name: 'Docker', category: 'Tools', proficiency: 88, display_order: 1, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-22', name: 'Git', category: 'Tools', proficiency: 95, display_order: 2, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-23', name: 'Linux', category: 'Tools', proficiency: 90, display_order: 3, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-24', name: 'Jupyter', category: 'Tools', proficiency: 96, display_order: 4, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Fake News Detection',
    slug: 'fake-news-detection',
    short_description: 'ML model to detect fake news using NLP and transformer models.',
    full_description: 'A state-of-the-art Natural Language Processing pipeline leveraging BERT and transformer architectures to classify misinformation in online media articles with high accuracy.',
    thumbnail: '/images/project-fake-news.jpg',
    thumbnail_url: '/images/project-fake-news.jpg',
    gallery_urls: [],
    technologies: ['Python', 'TensorFlow', 'NLP', 'Transformers'],
    github_url: 'https://github.com/example/fake-news-detection',
    live_url: 'https://demo.example.com/fake-news',
    featured: true,
    display_order: 1,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    title: 'Image Classification',
    slug: 'image-classification',
    short_description: 'Deep learning model for image classification using CNNs.',
    full_description: 'Convolutional Neural Network system fine-tuned on custom visual datasets for robust real-time object classification and feature extraction.',
    thumbnail: '/images/project-image-classification.jpg',
    thumbnail_url: '/images/project-image-classification.jpg',
    gallery_urls: [],
    technologies: ['Python', 'PyTorch', 'Computer Vision', 'OpenCV'],
    github_url: 'https://github.com/example/image-classification',
    live_url: 'https://demo.example.com/image-clf',
    featured: true,
    display_order: 2,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    title: 'Recommendation System',
    slug: 'recommendation-system',
    short_description: 'Personalized product recommendations using collaborative filtering.',
    full_description: 'Hybrid recommendation engine combining collaborative filtering and matrix factorization to deliver real-time personalized recommendations.',
    thumbnail: '/images/project-recsys.jpg',
    thumbnail_url: '/images/project-recsys.jpg',
    gallery_urls: [],
    technologies: ['Python', 'Scikit-learn', 'Data Science', 'FastAPI'],
    github_url: 'https://github.com/example/recommendation-system',
    live_url: 'https://demo.example.com/recsys',
    featured: true,
    display_order: 3,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-4',
    title: 'Data Pipeline',
    slug: 'data-pipeline',
    short_description: 'End-to-end data pipeline for processing and analyzing large datasets.',
    full_description: 'Scalable, fault-tolerant ETL and streaming data pipeline built with Apache Airflow and Kafka for continuous machine learning model training.',
    thumbnail: '/images/project-data-pipeline.jpg',
    thumbnail_url: '/images/project-data-pipeline.jpg',
    gallery_urls: [],
    technologies: ['Python', 'Airflow', 'Big Data', 'Docker'],
    github_url: 'https://github.com/example/data-pipeline',
    live_url: 'https://demo.example.com/pipeline',
    featured: true,
    display_order: 4,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-5',
    title: 'Autonomous Drone Navigation',
    slug: 'autonomous-drone-navigation',
    short_description: 'Reinforcement learning for obstacle avoidance.',
    full_description: 'PPO agent trained in Isaac Gym for real-time obstacle avoidance.',
    thumbnail: null,
    thumbnail_url: null,
    gallery_urls: [],
    technologies: ['Python', 'PyTorch', 'RL', 'Simulation'],
    github_url: 'https://github.com/example/drone-rl',
    live_url: null,
    featured: false,
    display_order: 5,
    enabled: false,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialCertifications: Certification[] = [
  {
    id: 'cert-1',
    title: 'Machine Learning Specialization',
    issuer: 'Coursera',
    issue_date: '2022-03-15',
    expiration_date: null,
    credential_id: 'AB0123',
    credential_url: 'https://coursera.org/verify/AB0123',
    image: null,
    image_url: null,
    description: 'Comprehensive mastery of supervised learning, advanced algorithms, and unsupervised learning.',
    display_order: 1,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cert-2',
    title: 'Deep Learning with PyTorch',
    issuer: 'Udemy',
    issue_date: '2021-11-20',
    expiration_date: null,
    credential_id: 'DEF456',
    credential_url: 'https://udemy.com/certificate/DEF456',
    image: null,
    image_url: null,
    description: 'In-depth practical experience with deep neural networks, CNNs, RNNs, and GANs in PyTorch.',
    display_order: 2,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cert-3',
    title: 'Python for Data Science',
    issuer: 'DataCamp',
    issue_date: '2021-08-10',
    expiration_date: null,
    credential_id: 'GH1789',
    credential_url: 'https://datacamp.com/statement/GH1789',
    image: null,
    image_url: null,
    description: 'Advanced data wrangling, statistical inference, visualization, and algorithmic modeling in Python.',
    display_order: 3,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cert-4',
    title: 'AZ-900: Microsoft Azure Fundamentals',
    issuer: 'Microsoft',
    issue_date: '2021-06-05',
    expiration_date: null,
    credential_id: 'JKL012',
    credential_url: 'https://microsoft.com/credentials/JKL012',
    image: null,
    image_url: null,
    description: 'Foundational cloud computing architectural concepts, security, privacy, and compliance.',
    display_order: 4,
    enabled: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cert-5',
    title: 'Legacy ITIL v3 Foundation',
    issuer: 'AXELOS',
    issue_date: '2018-01-15',
    expiration_date: null,
    credential_id: 'ARCH-001',
    credential_url: null,
    image: null,
    image_url: null,
    description: 'Deprecated IT service management certification.',
    display_order: 99,
    enabled: false,
    status: 'archived',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialMedia: MediaItem[] = [
  {
    id: 'med-profile',
    file_name: 'profile.jpg',
    storage_path: 'profile.jpg',
    public_url: '/images/profile.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 61517,
    alt_text: 'Portrait of Mohamed Khaled — Machine Learning Engineer',
    title: 'Mohamed Khaled Profile Photo',
    description: 'Primary portrait photograph for hero and identity sections.',
    width: 800,
    height: 960,
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'med-about-profile',
    file_name: 'about-profile.jpg',
    storage_path: 'about-profile.jpg',
    public_url: '/images/about-profile.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 37167,
    alt_text: 'Mohamed Khaled working at workstation with ML models',
    title: 'Workstation & Research Photo',
    description: 'Workspace photograph illustrating development and model training.',
    width: 600,
    height: 600,
    created_at: new Date('2024-01-02T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-02T00:00:00Z').toISOString(),
  },
  {
    id: 'med-proj-fake-news',
    file_name: 'project-fake-news.jpg',
    storage_path: 'project-fake-news.jpg',
    public_url: '/images/project-fake-news.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 14352,
    alt_text: 'BERT transformer attention heatmap for text classification',
    title: 'Fake News NLP Pipeline',
    description: 'Architecture and attention weight visualization for fake news detection.',
    width: 1200,
    height: 675,
    created_at: new Date('2024-01-03T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-03T00:00:00Z').toISOString(),
  },
  {
    id: 'med-proj-img-clf',
    file_name: 'project-image-classification.jpg',
    storage_path: 'project-image-classification.jpg',
    public_url: '/images/project-image-classification.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 17576,
    alt_text: 'Convolutional neural network visual feature maps',
    title: 'CNN Image Classification',
    description: 'Convolutional feature activation maps and real-time bounding boxes.',
    width: 1200,
    height: 675,
    created_at: new Date('2024-01-04T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-04T00:00:00Z').toISOString(),
  },
  {
    id: 'med-proj-recsys',
    file_name: 'project-recsys.jpg',
    storage_path: 'project-recsys.jpg',
    public_url: '/images/project-recsys.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 16207,
    alt_text: 'Collaborative filtering matrix latent factor diagram',
    title: 'Personalized Recommender Engine',
    description: 'Neural collaborative filtering architecture diagram.',
    width: 1200,
    height: 675,
    created_at: new Date('2024-01-05T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-05T00:00:00Z').toISOString(),
  },
  {
    id: 'med-proj-data-pipeline',
    file_name: 'project-data-pipeline.jpg',
    storage_path: 'project-data-pipeline.jpg',
    public_url: '/images/project-data-pipeline.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 14667,
    alt_text: 'Airflow streaming DAG pipeline with Kafka nodes',
    title: 'Distributed ETL Data Pipeline',
    description: 'Stream processing DAG graph for automated model retraining.',
    width: 1200,
    height: 675,
    created_at: new Date('2024-01-06T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-06T00:00:00Z').toISOString(),
  },
  {
    id: 'med-proj-pipeline',
    file_name: 'project-pipeline.jpg',
    storage_path: 'project-pipeline.jpg',
    public_url: '/images/project-pipeline.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 15991,
    alt_text: 'Continuous training pipeline architecture diagram',
    title: 'MLOps Continuous Training Workflow',
    description: 'End-to-end model registry, tracking, and automated deployment graph.',
    width: 1200,
    height: 675,
    created_at: new Date('2024-01-07T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-07T00:00:00Z').toISOString(),
  },
  {
    id: 'med-resume-doc',
    file_name: 'resume.pdf',
    storage_path: 'resume.pdf',
    public_url: '/documents/resume.pdf',
    media_type: 'document',
    mime_type: 'application/pdf',
    file_size: 102400,
    alt_text: 'Mohamed Khaled Curriculum Vitae / Resume PDF Document',
    title: 'Mohamed Khaled — CV / Resume (PDF)',
    description: 'Official Curriculum Vitae document for recruiters and engineering leaders.',
    width: null,
    height: null,
    created_at: new Date('2024-01-08T00:00:00Z').toISOString(),
    updated_at: new Date('2024-01-08T00:00:00Z').toISOString(),
  },
];

if (!global.__portfolioStore) {
  global.__portfolioStore = {
    siteSettings: initialSiteSettings,
    sections: initialSections,
    experience: initialExperience,
    skills: initialSkills,
    projects: initialProjects,
    certifications: initialCertifications,
    drafts: [],
    media: initialMedia,
  };
} else {
  if (!global.__portfolioStore.skills) {
    global.__portfolioStore.skills = initialSkills;
  }
  if (!global.__portfolioStore.experience) {
    global.__portfolioStore.experience = initialExperience;
  }
  if (!global.__portfolioStore.projects) {
    global.__portfolioStore.projects = initialProjects;
  }
  if (!global.__portfolioStore.certifications) {
    global.__portfolioStore.certifications = initialCertifications;
  }
  if (!global.__portfolioStore.drafts) {
    global.__portfolioStore.drafts = [];
  }
  if (!global.__portfolioStore.media) {
    global.__portfolioStore.media = initialMedia;
  }
}

export const DevFallbackStore = {
  isConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY;
    return Boolean(url && key);
  },

  getSiteSettings(): SiteSettings {
    return global.__portfolioStore!.siteSettings;
  },

  updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
    global.__portfolioStore!.siteSettings = {
      ...global.__portfolioStore!.siteSettings,
      ...settings,
      updated_at: new Date().toISOString(),
    };
    return global.__portfolioStore!.siteSettings;
  },

  getSocialLinks(): SocialLinkItem[] {
    return parseSocialLinks(global.__portfolioStore!.siteSettings.social_links);
  },

  upsertSocialLink(link: Partial<SocialLinkItem>): SocialLinkItem {
    const list = this.getSocialLinks();
    const now = new Date().toISOString();

    if (link.id) {
      const idx = list.findIndex((item) => item.id === link.id);
      if (idx >= 0) {
        const updated: SocialLinkItem = {
          ...list[idx],
          ...link,
          updated_at: now,
        } as SocialLinkItem;
        list[idx] = updated;
        global.__portfolioStore!.siteSettings.social_links = list;
        return updated;
      }
    }

    const maxOrder = list.reduce(
      (max, item) => Math.max(max, item.display_order || 0),
      0
    );

    const newId =
      link.id ||
      `soc-${(link.platform || 'link')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}`;

    const created: SocialLinkItem = {
      id: newId,
      platform: link.platform || 'Custom Link',
      label: link.label || link.platform || 'Custom Link',
      url: link.url || '',
      icon: link.icon || '',
      display_order:
        typeof link.display_order === 'number' ? link.display_order : maxOrder + 1,
      enabled: link.enabled !== undefined ? link.enabled : true,
      status: link.status || 'published',
      created_at: now,
      updated_at: now,
    };

    list.push(created);
    global.__portfolioStore!.siteSettings.social_links = list;
    return created;
  },

  deleteSocialLink(id: string): void {
    const list = this.getSocialLinks().filter((item) => item.id !== id);
    global.__portfolioStore!.siteSettings.social_links = list;
  },

  reorderSocialLinks(orderedIds: string[]): void {
    const list = this.getSocialLinks();
    orderedIds.forEach((id, index) => {
      const item = list.find((s) => s.id === id);
      if (item) {
        item.display_order = index + 1;
      }
    });
    list.sort((a, b) => a.display_order - b.display_order);
    global.__portfolioStore!.siteSettings.social_links = list;
  },

  toggleSocialLink(id: string, enabled?: boolean): SocialLinkItem | null {
    const list = this.getSocialLinks();
    const item = list.find((s) => s.id === id);
    if (!item) return null;
    item.enabled = enabled !== undefined ? enabled : !item.enabled;
    item.updated_at = new Date().toISOString();
    global.__portfolioStore!.siteSettings.social_links = list;
    return item;
  },

  getAllSections(): Section[] {
    return [...global.__portfolioStore!.sections].sort(
      (a, b) => a.display_order - b.display_order
    );
  },

  getPublishedSections(): Section[] {
    return global.__portfolioStore!.sections
      .filter((s) => s.status === 'published' && s.enabled)
      .sort((a, b) => a.display_order - b.display_order);
  },

  getSectionById(id: string): Section | null {
    return (
      global.__portfolioStore!.sections.find(
        (s) => s.id === id || s.slug === id || s.type === id
      ) || null
    );
  },

  getSectionBySlug(slug: string): Section | null {
    return global.__portfolioStore!.sections.find((s) => s.slug === slug) || null;
  },

  reorderSections(orderedIds: string[]): Section[] {
    const list = global.__portfolioStore!.sections;
    const now = new Date().toISOString();

    orderedIds.forEach((id, index) => {
      const item = list.find((s) => s.id === id || s.slug === id);
      if (item) {
        item.display_order = index + 1;
        item.updated_at = now;
      }
    });

    list.sort((a, b) => a.display_order - b.display_order);
    global.__portfolioStore!.sections = list;
    return [...list];
  },

  toggleSection(id: string, enabled?: boolean): Section | null {
    const list = global.__portfolioStore!.sections;
    const item = list.find((s) => s.id === id || s.slug === id);
    if (!item) return null;

    item.enabled = enabled !== undefined ? enabled : !item.enabled;
    item.updated_at = new Date().toISOString();
    return item;
  },

  updateSection(id: string, updates: Partial<Section>): Section | null {
    const list = global.__portfolioStore!.sections;
    const item = list.find((s) => s.id === id || s.slug === id);
    if (!item) return null;

    if (updates.title !== undefined) item.title = updates.title;
    if (updates.slug !== undefined) item.slug = updates.slug;
    if (updates.enabled !== undefined) item.enabled = updates.enabled;
    if (updates.status !== undefined) item.status = updates.status;
    if (updates.display_order !== undefined) item.display_order = updates.display_order;
    if (updates.content !== undefined) item.content = { ...item.content, ...updates.content };
    item.updated_at = new Date().toISOString();

    return item;
  },

  upsertSection(section: Partial<Section> & { slug: string }): Section {
    const list = global.__portfolioStore!.sections;
    const index = list.findIndex(
      (s) => s.slug === section.slug || (section.id && s.id === section.id)
    );

    const now = new Date().toISOString();
    if (index >= 0) {
      const updated: Section = {
        ...list[index],
        ...section,
        updated_at: now,
      };
      list[index] = updated;
      return updated;
    } else {
      const created: Section = {
        id: section.id || `sec-${Date.now()}`,
        type: section.type || 'custom',
        title: section.title || 'New Section',
        slug: section.slug,
        content: section.content || {},
        display_order: section.display_order || list.length + 1,
        enabled: section.enabled !== undefined ? section.enabled : true,
        status: section.status || 'published',
        created_at: now,
        updated_at: now,
      };
      list.push(created);
      return created;
    }
  },

  deleteSection(id: string): void {
    global.__portfolioStore!.sections = global.__portfolioStore!.sections.filter(
      (s) => s.id !== id
    );
  },

  // ----------------------------------------------------------------------------
  // EXPERIENCE METHODS
  // ----------------------------------------------------------------------------
  getAllExperience(): Experience[] {
    return [...global.__portfolioStore!.experience].sort(
      (a, b) => a.display_order - b.display_order
    );
  },

  getPublishedExperience(): Experience[] {
    return global.__portfolioStore!.experience
      .filter((e) => e.status === 'published' && e.enabled)
      .sort((a, b) => a.display_order - b.display_order);
  },

  getExperienceById(id: string): Experience | null {
    return global.__portfolioStore!.experience.find((e) => e.id === id) || null;
  },

  upsertExperience(exp: Partial<Experience>): Experience {
    const list = global.__portfolioStore!.experience;
    const now = new Date().toISOString();

    if (exp.id) {
      const index = list.findIndex((e) => e.id === exp.id);
      if (index >= 0) {
        const updated: Experience = {
          ...list[index],
          ...exp,
          updated_at: now,
        } as Experience;
        list[index] = updated;
        return updated;
      }
    }

    const created: Experience = {
      id: exp.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      company: exp.company || '',
      role: exp.role || '',
      employment_type: exp.employment_type || 'Full-time',
      location: exp.location || 'Remote',
      start_date: exp.start_date || now.substring(0, 10),
      end_date: exp.end_date !== undefined ? exp.end_date : null,
      is_current: Boolean(exp.is_current ?? exp.current_position),
      current_position: Boolean(exp.is_current ?? exp.current_position),
      description: exp.description || '',
      responsibilities: exp.responsibilities || [],
      technologies: exp.technologies || [],
      achievements: exp.achievements || [],
      company_logo: exp.company_logo || exp.company_logo_url || null,
      company_logo_url: exp.company_logo_url || exp.company_logo || null,
      display_order: exp.display_order || list.length + 1,
      enabled: exp.enabled !== undefined ? exp.enabled : true,
      status: exp.status || 'published',
      created_at: now,
      updated_at: now,
    };
    list.push(created);
    return created;
  },

  deleteExperience(id: string): void {
    global.__portfolioStore!.experience = global.__portfolioStore!.experience.filter(
      (e) => e.id !== id
    );
  },

  reorderExperience(orderedIds: string[]): void {
    const list = global.__portfolioStore!.experience;
    orderedIds.forEach((id, index) => {
      const item = list.find((e) => e.id === id);
      if (item) {
        item.display_order = index + 1;
      }
    });
  },

  // ----------------------------------------------------------------------------
  // SKILLS & CATEGORIES METHODS
  // ----------------------------------------------------------------------------
  getSkillCategories(): SkillCategory[] {
    const skillsSection = global.__portfolioStore!.sections.find(
      (s) => s.type === 'skills' || s.slug === 'skills'
    );
    const content = skillsSection?.content as SkillsContent | undefined;
    let categories = content?.categories || [];

    // Fallback: if categories array empty, derive from unique categories in skills
    if (categories.length === 0) {
      const skillsList = global.__portfolioStore?.skills || initialSkills;
      const distinct = Array.from(
        new Set(skillsList.map((s) => s.category))
      );
      categories = distinct.map((name, idx) => ({
        id: `cat-${idx + 1}`,
        name,
        display_order: idx + 1,
        enabled: true,
      }));
    }

    return [...categories].sort((a, b) => a.display_order - b.display_order);
  },

  upsertSkillCategory(cat: Partial<SkillCategory>): SkillCategory {
    const skillsSection = global.__portfolioStore!.sections.find(
      (s) => s.type === 'skills' || s.slug === 'skills'
    );
    const content = (skillsSection?.content as SkillsContent) || {};
    const categories: SkillCategory[] = content.categories ? [...content.categories] : [];

    let targetCategory: SkillCategory;
    if (cat.id) {
      const index = categories.findIndex((c) => c.id === cat.id);
      if (index >= 0) {
        const oldName = categories[index].name;
        targetCategory = {
          ...categories[index],
          ...cat,
        } as SkillCategory;
        categories[index] = targetCategory;

        // Cascade category rename to existing skills
        if (cat.name && cat.name !== oldName) {
          global.__portfolioStore!.skills.forEach((s) => {
            if (s.category === oldName) {
              s.category = cat.name!;
              s.updated_at = new Date().toISOString();
            }
          });
        }
      } else {
        targetCategory = {
          id: cat.id,
          name: cat.name || 'New Category',
          description: cat.description,
          icon: cat.icon || '⚡',
          display_order: cat.display_order || categories.length + 1,
          enabled: cat.enabled !== undefined ? cat.enabled : true,
        };
        categories.push(targetCategory);
      }
    } else {
      targetCategory = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: cat.name || 'New Category',
        description: cat.description,
        icon: cat.icon || '⚡',
        display_order: cat.display_order || categories.length + 1,
        enabled: cat.enabled !== undefined ? cat.enabled : true,
      };
      categories.push(targetCategory);
    }

    // Update skills section content
    const updatedContent: SkillsContent = {
      ...content,
      categories,
      categoriesOrder: categories
        .sort((a, b) => a.display_order - b.display_order)
        .map((c) => c.name),
    };

    if (skillsSection) {
      skillsSection.content = updatedContent as any;
      skillsSection.updated_at = new Date().toISOString();
    }

    return targetCategory;
  },

  deleteSkillCategory(catId: string): void {
    const skillsSection = global.__portfolioStore!.sections.find(
      (s) => s.type === 'skills' || s.slug === 'skills'
    );
    if (!skillsSection) return;

    const content = (skillsSection.content as SkillsContent) || {};
    const categories = (content.categories || []).filter((c) => c.id !== catId);

    const updatedContent: SkillsContent = {
      ...content,
      categories,
      categoriesOrder: categories
        .sort((a, b) => a.display_order - b.display_order)
        .map((c) => c.name),
    };

    skillsSection.content = updatedContent as any;
    skillsSection.updated_at = new Date().toISOString();
  },

  reorderSkillCategories(orderedIds: string[]): void {
    const skillsSection = global.__portfolioStore!.sections.find(
      (s) => s.type === 'skills' || s.slug === 'skills'
    );
    if (!skillsSection) return;

    const content = (skillsSection.content as SkillsContent) || {};
    const categories = content.categories ? [...content.categories] : [];

    orderedIds.forEach((id, index) => {
      const cat = categories.find((c) => c.id === id || c.name === id);
      if (cat) {
        cat.display_order = index + 1;
      }
    });

    const updatedContent: SkillsContent = {
      ...content,
      categories: [...categories].sort((a, b) => a.display_order - b.display_order),
      categoriesOrder: [...categories]
        .sort((a, b) => a.display_order - b.display_order)
        .map((c) => c.name),
    };

    skillsSection.content = updatedContent as any;
    skillsSection.updated_at = new Date().toISOString();
  },

  getSkillsList(): Skill[] {
    if (!global.__portfolioStore!.skills) {
      global.__portfolioStore!.skills = [...initialSkills];
    }
    return global.__portfolioStore!.skills;
  },

  getAllSkills(): Skill[] {
    return [...this.getSkillsList()].sort(
      (a, b) => a.display_order - b.display_order
    );
  },

  getEnabledSkills(): Skill[] {
    const disabledCategories = new Set(
      this.getSkillCategories()
        .filter((c) => !c.enabled)
        .map((c) => c.name)
    );

    return this.getSkillsList()
      .filter((s) => s.enabled && !disabledCategories.has(s.category))
      .sort((a, b) => a.display_order - b.display_order);
  },

  getSkillById(id: string): Skill | null {
    return this.getSkillsList().find((s) => s.id === id) || null;
  },

  upsertSkill(skill: Partial<Skill>): Skill {
    const list = this.getSkillsList();
    const now = new Date().toISOString();

    if (skill.id) {
      const index = list.findIndex((s) => s.id === skill.id);
      if (index >= 0) {
        const updated: Skill = {
          ...list[index],
          ...skill,
          updated_at: now,
        } as Skill;
        list[index] = updated;
        return updated;
      }
    }

    const sameCategorySkills = list.filter((s) => s.category === skill.category);
    const maxOrder = sameCategorySkills.reduce(
      (max, item) => Math.max(max, item.display_order || 0),
      0
    );

    const created: Skill = {
      id: skill.id || `sk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: skill.name || '',
      category: skill.category || 'General',
      icon: skill.icon || null,
      proficiency: skill.proficiency !== undefined ? skill.proficiency : null,
      display_order: skill.display_order || maxOrder + 1,
      enabled: skill.enabled !== undefined ? skill.enabled : true,
      created_at: now,
      updated_at: now,
    };
    list.push(created);
    return created;
  },

  deleteSkill(id: string): void {
    global.__portfolioStore!.skills = global.__portfolioStore!.skills.filter(
      (s) => s.id !== id
    );
  },

  reorderSkills(orderedIds: string[]): void {
    const list = global.__portfolioStore!.skills;
    orderedIds.forEach((id, index) => {
      const item = list.find((s) => s.id === id);
      if (item) {
        item.display_order = index + 1;
      }
    });
  },

  // ----------------------------------------------------------------------------
  // PROJECTS METHODS
  // ----------------------------------------------------------------------------
  getProjectsList(): Project[] {
    if (!global.__portfolioStore!.projects) {
      global.__portfolioStore!.projects = [...initialProjects];
    }
    return global.__portfolioStore!.projects;
  },

  getAllProjects(): Project[] {
    return [...this.getProjectsList()].sort(
      (a, b) => a.display_order - b.display_order
    );
  },

  getPublishedProjects(featuredOnly = false): Project[] {
    return this.getProjectsList()
      .filter((p) => (p.status === 'published' || p.enabled) && p.enabled !== false && p.status !== 'archived' && p.status !== 'draft')
      .filter((p) => (!featuredOnly || p.featured))
      .sort((a, b) => a.display_order - b.display_order);
  },

  getProjectById(id: string): Project | null {
    return this.getProjectsList().find((p) => p.id === id || p.slug === id) || null;
  },

  upsertProject(proj: Partial<Project>): Project {
    const list = this.getProjectsList();
    const now = new Date().toISOString();

    if (proj.id) {
      const index = list.findIndex((p) => p.id === proj.id);
      if (index >= 0) {
        const updated: Project = {
          ...list[index],
          ...proj,
          updated_at: now,
        } as Project;
        list[index] = updated;
        return updated;
      }
    }

    const maxOrder = list.reduce(
      (max, item) => Math.max(max, item.display_order || 0),
      0
    );

    const created: Project = {
      id: proj.id || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: proj.title || 'Untitled Project',
      slug: proj.slug || `project-${Date.now()}`,
      short_description: proj.short_description || '',
      full_description: proj.full_description || '',
      thumbnail: proj.thumbnail || proj.thumbnail_url || null,
      thumbnail_url: proj.thumbnail_url || proj.thumbnail || null,
      gallery_urls: proj.gallery_urls || [],
      technologies: proj.technologies || [],
      github_url: proj.github_url || null,
      live_url: proj.live_url || null,
      featured: proj.featured !== undefined ? proj.featured : false,
      display_order: proj.display_order || maxOrder + 1,
      status: proj.status || (proj.enabled === false ? 'draft' : 'published'),
      enabled: proj.enabled !== undefined ? proj.enabled : (proj.status === 'published'),
      created_at: now,
      updated_at: now,
    };
    list.push(created);
    return created;
  },

  deleteProject(id: string): void {
    if (!global.__portfolioStore!.projects) return;
    global.__portfolioStore!.projects = global.__portfolioStore!.projects.filter(
      (p) => p.id !== id && p.slug !== id
    );
  },

  reorderProjects(orderedIds: string[]): void {
    const list = this.getProjectsList();
    orderedIds.forEach((id, index) => {
      const item = list.find((p) => p.id === id || p.slug === id);
      if (item) {
        item.display_order = index + 1;
      }
    });
  },

  // ----------------------------------------------------------------------------
  // CERTIFICATIONS METHODS
  // ----------------------------------------------------------------------------
  getCertificationsList(): Certification[] {
    if (!global.__portfolioStore!.certifications) {
      global.__portfolioStore!.certifications = [...initialCertifications];
    }
    return global.__portfolioStore!.certifications;
  },

  getAllCertifications(): Certification[] {
    return [...this.getCertificationsList()].sort(
      (a, b) => a.display_order - b.display_order
    );
  },

  getPublishedCertifications(): Certification[] {
    return this.getCertificationsList()
      .filter(
        (c) =>
          (c.status === 'published' || c.enabled) &&
          c.enabled !== false &&
          c.status !== 'archived' &&
          c.status !== 'draft'
      )
      .sort((a, b) => a.display_order - b.display_order);
  },

  getCertificationById(id: string): Certification | null {
    return this.getCertificationsList().find((c) => c.id === id) || null;
  },

  upsertCertification(cert: Partial<Certification>): Certification {
    const list = this.getCertificationsList();
    const now = new Date().toISOString();

    if (cert.id) {
      const index = list.findIndex((c) => c.id === cert.id);
      if (index >= 0) {
        const updated: Certification = {
          ...list[index],
          ...cert,
          updated_at: now,
        } as Certification;
        list[index] = updated;
        return updated;
      }
    }

    const maxOrder = list.reduce(
      (max, item) => Math.max(max, item.display_order || 0),
      0
    );

    const created: Certification = {
      id: cert.id || `cert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: cert.title || 'Untitled Certification',
      issuer: cert.issuer || 'Issuing Organization',
      issue_date: cert.issue_date || now.substring(0, 10),
      expiration_date: cert.expiration_date || null,
      credential_id: cert.credential_id || null,
      credential_url: cert.credential_url || null,
      image: cert.image || cert.image_url || null,
      image_url: cert.image_url || cert.image || null,
      description: cert.description || '',
      display_order: cert.display_order || maxOrder + 1,
      status: cert.status || (cert.enabled === false ? 'draft' : 'published'),
      enabled: cert.enabled !== undefined ? cert.enabled : (cert.status === 'published'),
      created_at: now,
      updated_at: now,
    };
    list.push(created);
    return created;
  },

  deleteCertification(id: string): void {
    if (!global.__portfolioStore!.certifications) return;
    global.__portfolioStore!.certifications = global.__portfolioStore!.certifications.filter(
      (c) => c.id !== id
    );
  },

  reorderCertifications(orderedIds: string[]): void {
    const list = this.getCertificationsList();
    orderedIds.forEach((id, index) => {
      const item = list.find((c) => c.id === id);
      if (item) {
        item.display_order = index + 1;
      }
    });
  },

  // ----------------------------------------------------------------------------
  // DRAFT & PUBLISHING WORKFLOW (PHASE 13)
  // ----------------------------------------------------------------------------
  getDraftsList(): CmsDraft[] {
    if (!global.__portfolioStore!.drafts) {
      global.__portfolioStore!.drafts = [];
    }
    return global.__portfolioStore!.drafts;
  },

  getAllDrafts(): CmsDraft[] {
    const drafts = [...this.getDraftsList()];

    // Aggregate table items that natively have status === 'draft'
    const projects = this.getProjectsList().filter((p) => p.status === 'draft');
    projects.forEach((p) => {
      const exists = drafts.some((d) => d.entity_type === 'project' && d.entity_id === p.id);
      if (!exists) {
        drafts.push({
          id: `draft-proj-${p.id}`,
          entity_type: 'project',
          entity_id: p.id,
          title: `Project: ${p.title}`,
          summary: `Draft project "${p.title}"`,
          data: p as unknown as Record<string, unknown>,
          status: 'draft',
          created_at: p.created_at,
          updated_at: p.updated_at,
        });
      }
    });

    const exp = (global.__portfolioStore!.experience || []).filter((e) => e.status === 'draft');
    exp.forEach((e) => {
      const exists = drafts.some((d) => d.entity_type === 'experience' && d.entity_id === e.id);
      if (!exists) {
        drafts.push({
          id: `draft-exp-${e.id}`,
          entity_type: 'experience',
          entity_id: e.id,
          title: `Experience: ${e.role} at ${e.company}`,
          summary: `Draft experience at ${e.company}`,
          data: e as unknown as Record<string, unknown>,
          status: 'draft',
          created_at: e.created_at,
          updated_at: e.updated_at,
        });
      }
    });

    const certs = this.getCertificationsList().filter((c) => c.status === 'draft');
    certs.forEach((c) => {
      const exists = drafts.some((d) => d.entity_type === 'certification' && d.entity_id === c.id);
      if (!exists) {
        drafts.push({
          id: `draft-cert-${c.id}`,
          entity_type: 'certification',
          entity_id: c.id,
          title: `Certification: ${c.title}`,
          summary: `Draft certification by ${c.issuer}`,
          data: c as unknown as Record<string, unknown>,
          status: 'draft',
          created_at: c.created_at,
          updated_at: c.updated_at,
        });
      }
    });

    const sections = this.getAllSections().filter((s) => s.status === 'draft');
    sections.forEach((s) => {
      const exists = drafts.some((d) => d.entity_type === 'section' && d.entity_id === s.id);
      if (!exists) {
        drafts.push({
          id: `draft-sec-${s.id}`,
          entity_type: 'section',
          entity_id: s.id,
          title: `Section: ${s.title}`,
          summary: `Draft section status for #${s.slug}`,
          data: s as unknown as Record<string, unknown>,
          status: 'draft',
          created_at: s.created_at,
          updated_at: s.updated_at,
        });
      }
    });

    return drafts.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  },

  getDraftById(id: string): CmsDraft | null {
    const list = this.getAllDrafts();
    return list.find((d) => d.id === id || (d.entity_type === id && d.entity_id === id)) || null;
  },

  getDraftByEntity(entityType: DraftEntityType, entityId: string): CmsDraft | null {
    const list = this.getAllDrafts();
    return list.find((d) => d.entity_type === entityType && d.entity_id === entityId) || null;
  },

  saveDraft(
    draft: Omit<CmsDraft, 'created_at' | 'updated_at' | 'status'> & { id?: string }
  ): CmsDraft {
    const list = this.getDraftsList();
    const now = new Date().toISOString();
    const id = draft.id || `draft-${draft.entity_type}-${draft.entity_id}`;

    const existingIdx = list.findIndex(
      (d) =>
        d.id === id ||
        (d.entity_type === draft.entity_type && d.entity_id === draft.entity_id)
    );

    const saved: CmsDraft = {
      id,
      entity_type: draft.entity_type,
      entity_id: draft.entity_id,
      title: draft.title || `Draft: ${draft.entity_type}`,
      summary: draft.summary || `Unpublished updates to ${draft.entity_type}`,
      data: draft.data,
      status: 'draft',
      created_at: existingIdx >= 0 ? list[existingIdx].created_at : now,
      updated_at: now,
    };

    if (existingIdx >= 0) {
      list[existingIdx] = saved;
    } else {
      list.push(saved);
    }

    return saved;
  },

  discardDraft(id: string): boolean {
    const list = this.getDraftsList();
    const idx = list.findIndex((d) => d.id === id);
    if (idx >= 0) {
      list.splice(idx, 1);
      return true;
    }

    // Check if id refers to a draft in projects, experience, or certifications
    if (id.startsWith('draft-proj-')) {
      const projId = id.replace('draft-proj-', '');
      const p = this.getProjectById(projId);
      if (p && p.status === 'draft') {
        this.deleteProject(projId);
        return true;
      }
    }
    if (id.startsWith('draft-exp-')) {
      const expId = id.replace('draft-exp-', '');
      const e = (global.__portfolioStore!.experience || []).find((x) => x.id === expId);
      if (e && e.status === 'draft') {
        this.deleteExperience(expId);
        return true;
      }
    }
    if (id.startsWith('draft-cert-')) {
      const certId = id.replace('draft-cert-', '');
      const c = this.getCertificationById(certId);
      if (c && c.status === 'draft') {
        this.deleteCertification(certId);
        return true;
      }
    }

    return false;
  },

  discardAllDrafts(): boolean {
    global.__portfolioStore!.drafts = [];
    return true;
  },

  publishDraft(id: string): { success: boolean; message: string } {
    const draft = this.getDraftById(id);
    if (!draft) {
      return { success: false, message: 'Draft not found.' };
    }

    const { entity_type, entity_id, data } = draft;

    switch (entity_type) {
      case 'site_settings':
        this.updateSiteSettings(data);
        break;

      case 'theme':
        if (data && data.active_theme) {
          this.updateSiteSettings({ active_theme: data.active_theme });
        }
        break;

      case 'sections_order':
        if (Array.isArray(data.orderedIds)) {
          this.reorderSections(data.orderedIds);
        }
        if (data.enabledMap && typeof data.enabledMap === 'object') {
          for (const [secId, enabled] of Object.entries(data.enabledMap)) {
            this.toggleSection(secId, Boolean(enabled));
          }
        }
        break;

      case 'section':
        this.updateSection(entity_id, {
          ...data,
          status: 'published',
        });
        break;

      case 'project':
        this.upsertProject({
          ...data,
          id: entity_id,
          status: 'published',
          enabled: true,
        });
        break;

      case 'experience':
        this.upsertExperience({
          ...data,
          id: entity_id,
          status: 'published',
          enabled: true,
        });
        break;

      case 'certification':
        this.upsertCertification({
          ...data,
          id: entity_id,
          status: 'published',
          enabled: true,
        });
        break;

      case 'skill':
        this.upsertSkill({
          ...data,
          id: entity_id,
          enabled: true,
        });
        break;

      case 'social_link':
        this.upsertSocialLink({
          ...data,
          id: entity_id,
          status: 'published',
          enabled: true,
        });
        break;

      default:
        return { success: false, message: `Unknown draft entity type: ${entity_type}` };
    }

    // Remove from draft staging list
    const list = this.getDraftsList();
    const idx = list.findIndex((d) => d.id === draft.id);
    if (idx >= 0) {
      list.splice(idx, 1);
    }

    return { success: true, message: `Published "${draft.title}".` };
  },

  publishAllDrafts(): { publishedCount: number; message: string } {
    const drafts = this.getAllDrafts();
    let count = 0;

    for (const draft of drafts) {
      const res = this.publishDraft(draft.id);
      if (res.success) {
        count++;
      }
    }

    // Also publish any leftover draft-status rows
    this.getProjectsList()
      .filter((p) => p.status === 'draft')
      .forEach((p) => {
        p.status = 'published';
        p.enabled = true;
        count++;
      });

    (global.__portfolioStore!.experience || [])
      .filter((e) => e.status === 'draft')
      .forEach((e) => {
        e.status = 'published';
        e.enabled = true;
        count++;
      });

    this.getCertificationsList()
      .filter((c) => c.status === 'draft')
      .forEach((c) => {
        c.status = 'published';
        c.enabled = true;
        count++;
      });

    this.getAllSections()
      .filter((s) => s.status === 'draft')
      .forEach((s) => {
        s.status = 'published';
        count++;
      });

    global.__portfolioStore!.drafts = [];

    return {
      publishedCount: count,
      message: `Successfully published ${count} draft update${count === 1 ? '' : 's'}.`,
    };
  },

  // ----------------------------------------------------------------------------
  // MEDIA MANAGEMENT (Phase 14: Centralized Media Management & Usage Tracking)
  // ----------------------------------------------------------------------------
  getMediaList(): MediaItem[] {
    if (!global.__portfolioStore) return [];
    if (!global.__portfolioStore.media) {
      global.__portfolioStore.media = initialMedia;
    }
    return global.__portfolioStore.media;
  },

  getAllMedia(): MediaItem[] {
    return [...this.getMediaList()];
  },

  getMediaById(id: string): MediaItem | null {
    const list = this.getMediaList();
    return list.find((m) => m.id === id || m.file_name === id || m.storage_path === id) || null;
  },

  getMediaByUrl(url: string): MediaItem | null {
    if (!url) return null;
    const cleanUrl = url.trim().toLowerCase();
    const list = this.getMediaList();
    return (
      list.find((m) => {
        const itemUrl = m.public_url.trim().toLowerCase();
        const itemFileName = m.file_name.trim().toLowerCase();
        return (
          itemUrl === cleanUrl ||
          cleanUrl.endsWith(`/${itemFileName}`) ||
          itemUrl.endsWith(`/${cleanUrl}`)
        );
      }) || null
    );
  },

  getMediaUsage(idOrUrl: string): MediaUsageReference[] {
    const media = this.getMediaById(idOrUrl) || this.getMediaByUrl(idOrUrl);
    if (!media) return [];

    const references: MediaUsageReference[] = [];
    const mediaUrl = media.public_url.trim().toLowerCase();
    const mediaFile = media.file_name.trim().toLowerCase();
    const storagePath = media.storage_path.trim().toLowerCase();
    const mediaId = media.id.trim().toLowerCase();

    const isMatch = (targetVal?: string | null): boolean => {
      if (!targetVal) return false;
      const val = targetVal.trim().toLowerCase();
      return (
        val === mediaUrl ||
        val === mediaFile ||
        val === storagePath ||
        val === mediaId ||
        val.endsWith(`/${mediaFile}`) ||
        mediaUrl.endsWith(`/${val}`) ||
        (storagePath.length > 5 && val.includes(storagePath))
      );
    };

    // 1. Check Site Settings
    const settings = this.getSiteSettings();
    if (settings) {
      if (isMatch(settings.profile_image) || isMatch(settings.profile_image_url)) {
        references.push({
          entityType: 'profile',
          entityId: settings.id || 'singleton',
          entityTitle: 'Profile & Hero Identity',
          field: 'Profile Avatar',
        });
      }
      if (isMatch(settings.hero_media) || isMatch(settings.hero_media_url)) {
        references.push({
          entityType: 'hero',
          entityId: settings.id || 'singleton',
          entityTitle: 'Hero Section Banner',
          field: 'Hero Media Asset',
        });
      }
      if (isMatch(settings.resume_url) || isMatch(settings.resume)) {
        references.push({
          entityType: 'profile',
          entityId: settings.id || 'singleton',
          entityTitle: 'Profile Resume / CV',
          field: 'Curriculum Vitae Document',
        });
      }
      if (isMatch(settings.logo_url) || isMatch(settings.logo)) {
        references.push({
          entityType: 'profile',
          entityId: settings.id || 'singleton',
          entityTitle: 'Site Logo',
          field: 'Logo Graphic',
        });
      }
      if (isMatch(settings.favicon_url) || isMatch(settings.favicon)) {
        references.push({
          entityType: 'section',
          entityId: settings.id || 'singleton',
          entityTitle: 'Global Site Favicon',
          field: 'Browser Favicon Icon',
        });
      }
      if (isMatch(settings.og_image_url) || isMatch(settings.og_image)) {
        references.push({
          entityType: 'section',
          entityId: settings.id || 'singleton',
          entityTitle: 'Global SEO Settings',
          field: 'Social Sharing Image (OG)',
        });
      }
    }

    // 2. Check Sections (About photo, etc.)
    const sections = this.getAllSections();
    for (const sec of sections) {
      if (sec.content && typeof sec.content === 'object') {
        const content = sec.content as Record<string, any>;
        if (isMatch(content.avatarUrl)) {
          references.push({
            entityType: 'about',
            entityId: sec.id,
            entityTitle: `Section: ${sec.title}`,
            field: 'About Portrait',
          });
        }
      }
    }

    // 3. Check Projects
    const projects = this.getAllProjects();
    for (const proj of projects) {
      if (isMatch(proj.thumbnail) || isMatch(proj.thumbnail_url)) {
        references.push({
          entityType: 'project',
          entityId: proj.id,
          entityTitle: `Project: ${proj.title}`,
          field: 'Cover Thumbnail',
        });
      }
      if (Array.isArray(proj.gallery_urls)) {
        for (const gUrl of proj.gallery_urls) {
          if (isMatch(gUrl)) {
            references.push({
              entityType: 'project',
              entityId: proj.id,
              entityTitle: `Project: ${proj.title}`,
              field: 'Gallery Image',
            });
            break;
          }
        }
      }
    }

    // 4. Check Certifications
    const certs = this.getAllCertifications();
    for (const cert of certs) {
      if (isMatch(cert.image) || isMatch(cert.image_url)) {
        references.push({
          entityType: 'certification',
          entityId: cert.id,
          entityTitle: `Certification: ${cert.title}`,
          field: 'Certificate Credential',
        });
      }
    }

    // 5. Check Experience
    const expList = this.getAllExperience();
    for (const exp of expList) {
      if (isMatch(exp.company_logo) || isMatch(exp.company_logo_url)) {
        references.push({
          entityType: 'experience',
          entityId: exp.id,
          entityTitle: `Experience: ${exp.company}`,
          field: 'Company Logo',
        });
      }
    }

    // 6. Check Active Drafts
    const drafts = this.getAllDrafts();
    for (const d of drafts) {
      const dataStr = JSON.stringify(d.data || {}).toLowerCase();
      if (dataStr.includes(mediaUrl) || dataStr.includes(mediaFile) || dataStr.includes(storagePath)) {
        references.push({
          entityType: 'draft',
          entityId: d.id,
          entityTitle: `Draft: ${d.title}`,
          field: 'Pending Draft Modification',
          isDraft: true,
        });
      }
    }

    return references;
  },

  getAllMediaWithUsage(): MediaItemWithUsage[] {
    const list = this.getAllMedia();
    return list.map((m) => {
      const references = this.getMediaUsage(m.id);
      return {
        ...m,
        references,
        usageCount: references.length,
        inUse: references.length > 0,
      };
    });
  },

  registerMedia(media: Omit<MediaItem, 'id' | 'created_at'> & { id?: string }): MediaItem {
    const list = this.getMediaList();
    const id = media.id || `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const existingIdx = list.findIndex(
      (m) => m.id === id || m.storage_path === media.storage_path || m.public_url === media.public_url
    );

    const newItem: MediaItem = {
      id,
      file_name: media.file_name,
      storage_path: media.storage_path,
      public_url: media.public_url,
      media_type: media.media_type || 'image',
      mime_type: media.mime_type || 'image/jpeg',
      file_size: Number(media.file_size) || 0,
      alt_text: media.alt_text || '',
      title: media.title || media.file_name,
      description: media.description || '',
      width: media.width || null,
      height: media.height || null,
      created_at: existingIdx >= 0 ? list[existingIdx].created_at : now,
      updated_at: now,
    };

    if (existingIdx >= 0) {
      list[existingIdx] = newItem;
    } else {
      list.unshift(newItem);
    }

    return newItem;
  },

  updateMediaMetadata(
    id: string,
    metadata: { title?: string; alt_text?: string; description?: string }
  ): MediaItem | null {
    const list = this.getMediaList();
    const idx = list.findIndex((m) => m.id === id || m.file_name === id || m.storage_path === id);
    if (idx < 0) return null;

    list[idx] = {
      ...list[idx],
      title: metadata.title !== undefined ? metadata.title.trim() : list[idx].title,
      alt_text: metadata.alt_text !== undefined ? metadata.alt_text.trim() : list[idx].alt_text,
      description:
        metadata.description !== undefined ? metadata.description.trim() : list[idx].description,
      updated_at: new Date().toISOString(),
    };

    return list[idx];
  },

  deleteMedia(id: string): { success: boolean; message: string; error?: string } {
    const list = this.getMediaList();
    const idx = list.findIndex((m) => m.id === id || m.file_name === id || m.storage_path === id);
    if (idx < 0) {
      return { success: false, message: 'Media not found.', error: 'Media not found' };
    }

    const item = list[idx];
    const references = this.getMediaUsage(item.id);

    // Requirement 20: Used Media Protection - Block deletion if in active use
    if (references.length > 0) {
      const refNames = references.map((r) => r.entityTitle).slice(0, 3).join(', ');
      return {
        success: false,
        message: `Cannot delete media: it is currently referenced by ${references.length} active content item(s) (${refNames}). Remove these references before deleting.`,
        error: 'Media in use',
      };
    }

    // Safe deletion: remove record from store
    list.splice(idx, 1);
    return {
      success: true,
      message: `Media "${item.file_name}" deleted successfully.`,
    };
  },

  getMediaStats(): {
    totalMedia: number;
    totalImages: number;
    totalDocuments: number;
    inUseCount: number;
    unusedCount: number;
    totalSizeBytes: number;
    totalCount: number;
    imagesCount: number;
    documentsCount: number;
  } {
    const listWithUsage = this.getAllMediaWithUsage();
    const totalMedia = listWithUsage.length;
    const totalImages = listWithUsage.filter((m) => m.media_type === 'image').length;
    const totalDocuments = listWithUsage.filter((m) => m.media_type === 'document').length;
    const inUseCount = listWithUsage.filter((m) => m.inUse).length;
    const unusedCount = totalMedia - inUseCount;
    const totalSizeBytes = listWithUsage.reduce((acc, m) => acc + (m.file_size || 0), 0);

    return {
      totalMedia,
      totalImages,
      totalDocuments,
      inUseCount,
      unusedCount,
      totalSizeBytes,
      totalCount: totalMedia,
      imagesCount: totalImages,
      documentsCount: totalDocuments,
    };
  },
};

