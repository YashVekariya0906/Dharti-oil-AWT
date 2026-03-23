const { Blog, syncDatabase } = require('./models');

async function createInitialBlogPost() {
  try {
    console.log('🔄 Creating initial blog post...');

    // Check if blog post already exists
    const existingBlog = await Blog.findOne({
      where: { slug: 'dharti-amrut-groundnut-oil' }
    });

    if (existingBlog) {
      console.log('✅ Blog post already exists, skipping creation');
      return;
    }

    const blogContent = `Dharati Amrut Groundnut Oil: Pure Taste, Trusted Quality

When it comes to cooking oil, every household wants something that is pure, healthy, and reliable. At Dharati Amrut, we bring you premium quality G20 groundnut oil that combines traditional goodness with modern quality standards.

Whether you are cooking daily meals or preparing special dishes, choosing the right oil makes all the difference.

🥜 Why Choose Groundnut Oil for Daily Cooking?

Groundnut oil has been a part of Indian kitchens for generations. Its natural properties make it one of the most trusted oils for cooking.

With Dharati Amrut Groundnut Oil, you get:

Rich natural taste and aroma
High smoke point for safe cooking
Ideal for Indian dishes like frying, sautéing, and tadka
Light texture that doesn't feel greasy

It is perfect for both home kitchens and commercial use.

💡 What Makes Dharati Amrut Special?

At Dharati Amrut, we focus on quality, purity, and consistency. Our G20 groundnut oil is carefully processed to maintain its natural goodness while ensuring safe and long-lasting use.

✔ Made from high-quality groundnuts
✔ Clean and hygienic processing
✔ Balanced taste suitable for all recipes
✔ Designed for everyday cooking needs

We believe in delivering oil that you can trust for your family.

🛢️ Available Packaging Options

We understand that every household and business has different needs. That's why Dharati Amrut offers multiple packaging sizes:

🔸 15 KG Tin Oil

Perfect for:

Restaurants
Bulk users
Commercial kitchens

Provides long-lasting supply and better value.

🔸 15 KG Can Oil

Ideal for:

Large families
Catering services

Easy to store and handle for regular use.

🔸 5 KG Can Oil

Best for:

Medium-sized families
Monthly household use

A balance between quantity and convenience.

🔸 1 Litre Oil

Suitable for:

Small families
Trial use

Compact, easy to use, and perfect for daily cooking.

🔥 Suitable for Every Cooking Style

Dharati Amrut Groundnut Oil is versatile and works well for:

Deep frying (snacks, bhajiya, puri)
Daily cooking (sabji, dal, roti)
Tadka and seasoning
Commercial food preparation

Its stability at high temperatures makes it a reliable choice.

🛒 Smart Buying Tips

Before purchasing any cooking oil, always check:

Packaging quality and seal
Manufacturing and expiry date
Brand trust and consistency
Storage conditions

With Dharati Amrut, you can be assured of freshness and quality in every pack.

✅ Final Thoughts

Choosing the right cooking oil is not just about price — it's about health, taste, and trust.

Dharati Amrut Groundnut Oil (G20) is designed to meet the needs of:

Everyday households
Bulk buyers
Food businesses

Whether you choose 1 litre or 15 kg, you are choosing quality you can rely on.`;

    const blog = await Blog.create({
      title: 'Dharati Amrut Groundnut Oil: Pure Taste, Trusted Quality',
      slug: 'dharti-amrut-groundnut-oil',
      content: blogContent,
      banner_image: null, // Admin can upload image later
      author: 'Dharti Oil Team',
      status: 'published'
    });

    console.log('✅ Initial blog post created successfully!');
    console.log('📝 Blog ID:', blog.id);
    console.log('🔗 Slug:', blog.slug);

  } catch (error) {
    console.error('❌ Error creating initial blog post:', error);
  }
}

// Run if called directly
if (require.main === module) {
  syncDatabase().then(() => {
    createInitialBlogPost().then(() => {
      console.log('🎉 Blog setup complete!');
      process.exit(0);
    });
  });
}

module.exports = { createInitialBlogPost };