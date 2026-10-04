const fs = require('fs');
const path = require('path');
const { AboutUs } = require('./models');

async function test() {
  const aboutUs = await AboutUs.findOne();
  console.log("Banner image URL:", aboutUs.about_banner_image);
  if (aboutUs.about_banner_image) {
    const filename = aboutUs.about_banner_image.split('/').pop();
    const filepath = path.join(__dirname, 'uploads', filename);
    console.log("Filepath:", filepath);
    console.log("Exists:", fs.existsSync(filepath));
  }
}
test();
