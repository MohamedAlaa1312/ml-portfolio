-- ==============================================================================
-- MACHINE LEARNING ENGINEER PORTFOLIO — SEED DATA (PHASE 1)
-- Includes published, draft, and disabled items to verify RLS filtering
-- ==============================================================================

-- 1. SEED SITE SETTINGS
INSERT INTO public.site_settings (
    name,
    title,
    professional_title,
    subtitle,
    bio,
    email,
    phone,
    location,
    social_links,
    hero_title,
    hero_subtitle,
    resume_url,
    seo_title,
    seo_description
) VALUES (
    'Mohamed Khaled',
    'Machine Learning Engineer',
    'Machine Learning Engineer',
    'Turning Data Into Intelligent Solutions',
    'I am a Machine Learning Engineer with a passion for building AI systems that solve real-world problems. I enjoy working with data, designing models, and turning complex ideas into practical solutions.',
    'mohamed@example.com',
    '+20 100 123 4567',
    'Cairo, Egypt',
    '{
        "linkedin": "https://linkedin.com",
        "github": "https://github.com",
        "x": "https://x.com",
        "email": "mailto:mohamed@example.com"
    }'::jsonb,
    'Mohamed Khaled',
    'Machine Learning Engineer',
    '/documents/resume.pdf',
    'Mohamed Khaled | Machine Learning Engineer Portfolio',
    'Machine Learning Engineer portfolio showcasing AI architectures, deep learning models, data science pipelines, and verified certifications.'
)
ON CONFLICT ((true)) DO UPDATE SET
    name = EXCLUDED.name,
    title = EXCLUDED.title,
    professional_title = EXCLUDED.professional_title,
    subtitle = EXCLUDED.subtitle,
    bio = EXCLUDED.bio,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    social_links = EXCLUDED.social_links;

-- 2. SEED DYNAMIC SECTIONS
INSERT INTO public.sections (type, title, slug, content, display_order, enabled, status)
VALUES
(
    'hero',
    'Hero Section',
    'hero',
    '{
        "greeting": "Hello, I''m",
        "badge": "Machine Learning Engineer",
        "summary": "I build intelligent systems using data, machine learning and modern technologies. Passionate about solving real-world problems and creating impactful solutions.",
        "primaryCta": { "label": "View My Projects", "anchor": "#projects" },
        "secondaryCta": { "label": "Contact Me", "anchor": "#contact" }
    }'::jsonb,
    1,
    true,
    'published'
),
(
    'about',
    'About Me',
    'about',
    '{
        "badge": "About Me",
        "heading": "Turning Data Into Intelligent Solutions",
        "description": "I am a Machine Learning Engineer with a passion for building AI systems that solve real-world problems. I enjoy working with data, designing models, and turning complex ideas into practical solutions.",
        "pillars": [
            { "title": "Problem Solver", "description": "Finds effective solutions" },
            { "title": "Continuous Learner", "description": "Always exploring" },
            { "title": "Team Player", "description": "Builds great products" }
        ]
    }'::jsonb,
    2,
    true,
    'published'
),
(
    'experience',
    'Experience',
    'experience',
    '{
        "badge": "Career",
        "title": "Experience",
        "subtitle": "My professional journey in building data-driven solutions and working on impactful projects."
    }'::jsonb,
    3,
    true,
    'published'
),
(
    'skills',
    'Skills',
    'skills',
    '{
        "badge": "Capabilities",
        "title": "Skills",
        "subtitle": "Tools and technologies I work with."
    }'::jsonb,
    4,
    true,
    'published'
),
(
    'projects',
    'Featured Projects',
    'projects',
    '{
        "badge": "Portfolio",
        "title": "Featured Projects",
        "subtitle": "A collection of projects that showcase my skills and experience in machine learning and software engineering."
    }'::jsonb,
    5,
    true,
    'published'
),
(
    'certifications',
    'Certifications',
    'certifications',
    '{
        "badge": "Credentials",
        "title": "Certifications",
        "subtitle": "Relevant certifications that validate my skills and knowledge."
    }'::jsonb,
    6,
    true,
    'published'
),
(
    'contact',
    'Get In Touch',
    'contact',
    '{
        "badge": "Contact",
        "title": "Get In Touch",
        "subtitle": "Feel free to reach out for collaborations, opportunities or just to say hello!"
    }'::jsonb,
    7,
    true,
    'published'
),
-- Draft Section (Must be hidden from public visitors)
(
    'custom',
    'Experimental Research Laboratory',
    'research-lab',
    '{"badge": "Research", "title": "Ongoing AI Experiments", "status": "WIP"}'::jsonb,
    8,
    true,
    'draft'
)
ON CONFLICT (slug) DO UPDATE SET
    content = EXCLUDED.content,
    display_order = EXCLUDED.display_order,
    enabled = EXCLUDED.enabled,
    status = EXCLUDED.status;

-- 3. SEED SKILLS
INSERT INTO public.skills (name, category, proficiency, display_order, enabled) VALUES
-- Machine Learning
('Scikit-learn', 'Machine Learning', 95, 1, true),
('TensorFlow', 'Machine Learning', 90, 2, true),
('PyTorch', 'Machine Learning', 92, 3, true),
('Keras', 'Machine Learning', 88, 4, true),

-- Programming
('Python', 'Programming', 98, 5, true),
('Java', 'Programming', 80, 6, true),
('C++', 'Programming', 75, 7, true),
('TypeScript', 'Programming', 85, 8, true),

-- Data Science
('Pandas', 'Data Science', 95, 9, true),
('NumPy', 'Data Science', 95, 10, true),
('Matplotlib', 'Data Science', 88, 11, true),
('Seaborn', 'Data Science', 88, 12, true),

-- Backend
('FastAPI', 'Backend', 92, 13, true),
('Django', 'Backend', 85, 14, true),
('Node.js', 'Backend', 82, 15, true),
('Express', 'Backend', 80, 16, true),

-- Databases
('PostgreSQL', 'Databases', 90, 17, true),
('MongoDB', 'Databases', 85, 18, true),
('MySQL', 'Databases', 82, 19, true),
('Redis', 'Databases', 80, 20, true),

-- Tools
('Docker', 'Tools', 88, 21, true),
('Git', 'Tools', 95, 22, true),
('Linux', 'Tools', 90, 23, true),
('Jupyter', 'Tools', 96, 24, true),

-- Disabled Skill (Must be hidden from public visitors)
('Legacy Fortran', 'Programming', 40, 99, false);

-- 4. SEED EXPERIENCE
INSERT INTO public.experience (company, role, employment_type, location, start_date, end_date, is_current, current_position, description, responsibilities, technologies, achievements, display_order, enabled, status)
VALUES
(
    'Google',
    'Machine Learning Engineer',
    'Full-time',
    'Remote',
    '2022-01-01',
    NULL,
    true,
    true,
    'Developed and deployed production-grade machine learning models serving millions of queries.',
    ARRAY[
        'Developed and deployed ML models for large-scale applications.',
        'Improved model performance and reduced inference latency by 40%.',
        'Collaborated with cross-functional teams to deliver high-impact AI features.'
    ],
    ARRAY['Python', 'TensorFlow', 'Kubernetes', 'GCP'],
    ARRAY['Reduced inference latency by 40%', 'Scaled model inference to 10M+ requests/day'],
    1,
    true,
    'published'
),
(
    'Microsoft',
    'Data Scientist',
    'Full-time',
    'Remote',
    '2020-06-01',
    '2021-12-31',
    false,
    false,
    'Built enterprise data pipelines and machine learning models for business intelligence.',
    ARRAY[
        'Built data pipelines and machine learning models for business intelligence.',
        'Worked on NLP and recommendation systems across customer datasets.',
        'Optimized data processing workflows and distributed model training pipelines.'
    ],
    ARRAY['Python', 'PyTorch', 'Azure ML', 'Spark'],
    ARRAY['Engineered predictive churn models with 92% precision'],
    2,
    true,
    'published'
),
(
    'Amazon',
    'Machine Learning Intern',
    'Internship',
    'Seattle, USA',
    '2019-07-01',
    '2019-09-30',
    false,
    false,
    'Assisted in research and prototyping of personalization algorithms.',
    ARRAY[
        'Assisted in developing ML models for personalized product recommendation.',
        'Analyzed large datasets and created visual data insights for product teams.',
        'Conducted experimental ablation studies on neural collaborative filtering.'
    ],
    ARRAY['Python', 'Scikit-learn', 'AWS', 'Pandas'],
    ARRAY['Published internal benchmark study on recommendation latency'],
    3,
    true,
    'published'
);

-- 5. SEED PROJECTS
INSERT INTO public.projects (title, slug, short_description, full_description, technologies, github_url, live_url, featured, display_order, status)
VALUES
(
    'Fake News Detection',
    'fake-news-detection',
    'ML model to detect fake news using NLP and transformer models.',
    'A state-of-the-art Natural Language Processing pipeline leveraging BERT and transformer architectures to classify misinformation in online media articles with high accuracy.',
    ARRAY['Python', 'TensorFlow', 'NLP', 'Transformers'],
    'https://github.com/example/fake-news-detection',
    'https://demo.example.com/fake-news',
    true,
    1,
    'published'
),
(
    'Image Classification',
    'image-classification',
    'Deep learning model for image classification using CNNs.',
    'Convolutional Neural Network system fine-tuned on custom visual datasets for robust real-time object classification and feature extraction.',
    ARRAY['Python', 'PyTorch', 'Computer Vision', 'OpenCV'],
    'https://github.com/example/image-classification',
    'https://demo.example.com/image-clf',
    true,
    2,
    'published'
),
(
    'Recommendation System',
    'recommendation-system',
    'Personalized product recommendations using collaborative filtering.',
    'Hybrid recommendation engine combining collaborative filtering and matrix factorization to deliver real-time personalized recommendations.',
    ARRAY['Python', 'Scikit-learn', 'Data Science', 'FastAPI'],
    'https://github.com/example/recommendation-system',
    'https://demo.example.com/recsys',
    true,
    3,
    'published'
),
(
    'Data Pipeline',
    'data-pipeline',
    'End-to-end data pipeline for processing and analyzing large datasets.',
    'Scalable, fault-tolerant ETL and streaming data pipeline built with Apache Airflow and Kafka for continuous machine learning model training.',
    ARRAY['Python', 'Airflow', 'Big Data', 'Docker'],
    'https://github.com/example/data-pipeline',
    'https://demo.example.com/pipeline',
    true,
    4,
    'published'
),
-- Draft Project (Must be hidden from public visitors)
(
    'Autonomous Drone Navigation',
    'autonomous-drone-navigation',
    'Reinforcement learning for obstacle avoidance.',
    'PPO agent trained in Isaac Gym for real-time obstacle avoidance.',
    ARRAY['Python', 'PyTorch', 'RL', 'Simulation'],
    'https://github.com/example/drone-rl',
    NULL,
    false,
    5,
    'draft'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    technologies = EXCLUDED.technologies,
    featured = EXCLUDED.featured,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status;

-- 6. SEED CERTIFICATIONS
INSERT INTO public.certifications (title, issuer, issue_date, credential_id, credential_url, description, display_order, status)
VALUES
(
    'Machine Learning Specialization',
    'Coursera',
    '2022-03-15',
    'AB0123',
    'https://coursera.org/verify/AB0123',
    'Comprehensive mastery of supervised learning, advanced algorithms, and unsupervised learning.',
    1,
    'published'
),
(
    'Deep Learning with PyTorch',
    'Udemy',
    '2021-11-20',
    'DEF456',
    'https://udemy.com/certificate/DEF456',
    'In-depth practical experience with deep neural networks, CNNs, RNNs, and GANs in PyTorch.',
    2,
    'published'
),
(
    'Python for Data Science',
    'DataCamp',
    '2021-08-10',
    'GH1789',
    'https://datacamp.com/statement/GH1789',
    'Advanced data wrangling, statistical inference, visualization, and algorithmic modeling in Python.',
    3,
    'published'
),
(
    'AZ-900: Microsoft Azure Fundamentals',
    'Microsoft',
    '2021-06-05',
    'JKL012',
    'https://microsoft.com/credentials/JKL012',
    'Foundational cloud computing architectural concepts, security, privacy, and compliance.',
    4,
    'published'
),
-- Archived Certification (Must be hidden from public visitors)
(
    'Legacy ITIL v3 Foundation',
    'AXELOS',
    '2018-01-15',
    'ARCH-001',
    NULL,
    'Deprecated IT service management certification.',
    99,
    'archived'
);
