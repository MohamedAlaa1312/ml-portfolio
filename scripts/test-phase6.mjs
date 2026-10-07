async function testApiEndpoints() {
  const cookie = 'sb-admin-auth-preview=active';

  // 1. Validation test: empty name
  const invalidRes = await fetch('http://localhost:3000/api/admin/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ profile: { name: '', professional_title: 'MLE' } })
  });
  const invalidData = await invalidRes.json();
  console.log('Validation (empty name) => Status:', invalidRes.status, 'Error:', invalidData.error);

  // 2. Validation test: invalid email
  const invalidEmailRes = await fetch('http://localhost:3000/api/admin/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ profile: { name: 'Mohamed Khaled', professional_title: 'MLE', email: 'not-an-email' } })
  });
  const invalidEmailData = await invalidEmailRes.json();
  console.log('Validation (bad email) => Status:', invalidEmailRes.status, 'Error:', invalidEmailData.error);

  // 3. Valid update
  const validRes = await fetch('http://localhost:3000/api/admin/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({
      profile: {
        name: 'Mohamed Khaled',
        professional_title: 'Senior Machine Learning Engineer',
        subtitle: 'Architecting Scalable AI Systems',
        bio: 'I am a Machine Learning Engineer specializing in computer vision, generative AI, and high-performance ML pipelines.',
        email: 'mohamed@example.com',
        phone: '+20 100 123 4567',
        location: 'Cairo, Egypt',
        profile_image: '/images/profile.jpg',
        profile_image_url: '/images/profile.jpg',
        resume_url: '/documents/resume.pdf',
        social_links: {
          linkedin: 'https://linkedin.com',
          github: 'https://github.com',
          x: 'https://x.com',
          email: 'mailto:mohamed@example.com'
        }
      },
      hero: {
        greeting: "Hello, I'm",
        summary: 'Architecting scalable AI and neural systems for real-world impact.',
        primaryCta: { label: 'Explore Models', anchor: '#projects' },
        secondaryCta: { label: 'Get in Touch', anchor: '#contact' }
      }
    })
  });
  const validData = await validRes.json();
  console.log('Valid update => Status:', validRes.status, 'Success:', validData.success, 'Message:', validData.message);

  // 4. File upload validation (unsupported type)
  const form = new FormData();
  const blob = new Blob(['malicious content'], { type: 'application/x-msdownload' });
  form.append('file', blob, 'test.exe');

  const uploadRes = await fetch('http://localhost:3000/api/admin/upload', {
    method: 'POST',
    headers: { 'Cookie': cookie },
    body: form
  });
  const uploadData = await uploadRes.json();
  console.log('Upload validation (unsupported exe) => Status:', uploadRes.status, 'Error:', uploadData.error);

  // 5. File upload valid image
  const imgForm = new FormData();
  const imgBlob = new Blob([new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])], { type: 'image/jpeg' });
  imgForm.append('file', imgBlob, 'portrait-test.jpg');

  const validUploadRes = await fetch('http://localhost:3000/api/admin/upload', {
    method: 'POST',
    headers: { 'Cookie': cookie },
    body: imgForm
  });
  const validUploadData = await validUploadRes.json();
  console.log('Upload valid image => Status:', validUploadRes.status, 'Success:', validUploadData.success, 'URL:', validUploadData.url);
}

testApiEndpoints().catch(console.error);
