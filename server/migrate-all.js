const fs = require('fs');
const path = require('path');
const { Product, Navbar, Blog, ContactDetails, AboutUs, AboutUsMember, User, SellingRequest, sequelize } = require('./models');

async function migrate() {
  console.log("Starting full migration (Files and DB only)...");

  const serverDir = __dirname;
  const uploadsDir = path.join(serverDir, 'uploads');
  
  // 1. Create folders
  const folders = ['navbar', 'products', 'blog', 'reports', 'contact', 'about', 'broker'];
  folders.forEach(fd => {
    const p = path.join(uploadsDir, fd);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  });

  // 2. Move files
  const getFolder = (filename) => {
    if (filename.startsWith('blog_')) return 'blog';
    if (filename.startsWith('report_photo_')) return 'reports';
    if (filename.startsWith('contact_')) return 'contact';
    if (filename.startsWith('about_infra_') || filename.startsWith('about_banner_') || filename.startsWith('about_intro_') || filename.startsWith('about_member_')) return 'about';
    if (filename.startsWith('broker_')) return 'broker';
    if (filename.startsWith('nav_') || filename.startsWith('I1_') || filename.startsWith('I2_') || filename.startsWith('I3_') || filename.startsWith('I4_') || filename.startsWith('I5_') || filename.startsWith('intro_')) return 'navbar';
    if (fs.statSync(path.join(uploadsDir, filename)).isDirectory()) return null;
    return 'products'; // defaults to products
  };

  const files = fs.readdirSync(uploadsDir);
  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    if (fs.statSync(filePath).isFile()) {
      const targetFolder = getFolder(file);
      if (targetFolder) {
        const targetPath = path.join(uploadsDir, targetFolder, file);
        fs.renameSync(filePath, targetPath);
        console.log(`Moved ${file} -> ${targetFolder}/`);
      }
    }
  });

  // 4. Update Database
  try {
    await sequelize.authenticate();
    console.log("DB connected.");

    // Function to safely replace URL
    const replaceUrl = (url, folder) => {
      if (typeof url === 'string' && url.includes('/uploads/') && !url.includes(`/uploads/${folder}/`)) {
        return url.replace('/uploads/', `/uploads/${folder}/`);
      }
      return url;
    };

    const products = await Product.findAll();
    for (const p of products) {
       p.product_image = replaceUrl(p.product_image, 'products');
       if (p.changed()) await p.save();
    }

    const navbars = await Navbar.findAll();
    for (const n of navbars) {
       ['nav_logo_path', 'I1_path', 'I2_path', 'I3_path', 'I4_path', 'I5_path', 'intro_path'].forEach(col => {
         n[col] = replaceUrl(n[col], 'navbar');
       });
       if (n.changed()) await n.save();
    }

    const blogs = await Blog.findAll();
    for (const b of blogs) {
       b.banner_image = replaceUrl(b.banner_image, 'blog');
       if (b.changed()) await b.save();
    }

    const contacts = await ContactDetails.findAll();
    for (const c of contacts) {
       c.banner_image = replaceUrl(c.banner_image, 'contact');
       if (c.changed()) await c.save();
    }

    const abouts = await AboutUs.findAll();
    for (const a of abouts) {
       ['about_banner_image', 'about_intro_image', 'infra_image_1', 'infra_image_2', 'infra_image_3', 'infra_image_4', 'infra_image_5', 'infra_image_6'].forEach(col => {
         a[col] = replaceUrl(a[col], 'about');
       });
       if (a.changed()) await a.save();
    }

    const members = await AboutUsMember.findAll();
    for (const m of members) {
       m.member_image = replaceUrl(m.member_image, 'about');
       if (m.changed()) await m.save();
    }
    
    const requests = await SellingRequest.findAll();
    for (const r of requests) {
       r.sample_photos = replaceUrl(r.sample_photos, 'reports');
       if (r.sample_photos && r.sample_photos.includes('/uploads/') && !r.sample_photos.includes('/uploads/reports/')) {
         try {
           let arr = JSON.parse(r.sample_photos);
           arr = arr.map(u => replaceUrl(u, 'reports'));
           r.sample_photos = JSON.stringify(arr);
         } catch(e) {}
       }
       if (r.broker_reject_photos && r.broker_reject_photos.includes('/uploads/') && !r.broker_reject_photos.includes('/uploads/broker/')) {
         try {
           let arr = JSON.parse(r.broker_reject_photos);
           arr = arr.map(u => replaceUrl(u, 'broker'));
           r.broker_reject_photos = JSON.stringify(arr);
         } catch(e) {}
       }
       if (r.changed()) await r.save();
    }
    console.log("DB updated completely.");
  } catch(e) {
    console.error(e);
  }

}

migrate();
