import React, { useState, useEffect, useRef } from 'react';
import './Blog.css';

// Question line color palette (cycles through these)
const QUESTION_COLORS = [
  '#c8860a',  // warm amber
  '#1a7a4a',  // deep green
  '#b5391f',  // rich red
  '#1d5fad',  // ocean blue
  '#7b3fa0',  // royal purple
  '#c25f00',  // burnt orange
  '#1a6e6e',  // teal
  '#8c2155',  // magenta
];

// Detect if a line is a question / section heading
const isHeading = (line) => {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Specific markers user used for headings
  const headingEmojis = ['🌿', '🥜', '💡', '🛢', '🔸', '🔥', '🛒', ' ', '🌟'];
  for (const emoji of headingEmojis) {
    if (trimmed.startsWith(emoji)) return true;
  }

  return (
    trimmed.endsWith('?') || // question mark
    /^#+\s/.test(trimmed)    // markdown heading
  );
};

// Split blog content into Q&A blocks: [{question, answer}]
const parseBlocks = (content) => {
  if (!content) return [];
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const blocks = [];
  let currentQuestion = null;
  let currentAnswer = [];

  for (const line of lines) {
    if (isHeading(line)) {
      if (currentQuestion !== null) {
        blocks.push({ question: currentQuestion, answer: currentAnswer.join('\n') });
      }
      currentQuestion = line;
      currentAnswer = [];
    } else {
      if (currentQuestion === null) {
        // Content before first heading — treat as intro block
        currentQuestion = '';
        currentAnswer = [];
      }
      currentAnswer.push(line);
    }
  }
  // Push last block
  if (currentQuestion !== null) {
    blocks.push({ question: currentQuestion, answer: currentAnswer.join('\n') });
  }
  return blocks;
};

// Animated card using IntersectionObserver
const AnimatedCard = ({ children, delay = 0 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="animate-card"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/blogs');
      if (!response.ok) throw new Error('Failed to fetch blogs');
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-loading">
          <div className="loading-spinner"></div>
          <p>Loading blogs…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-page">
        <div className="blog-error">⚠️ {error}</div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      {blogs.length === 0 ? (
        <>
          <div className="blog-hero">
            <h1 className="blog-hero-title">Dharti Oil Blog</h1>
            <p className="blog-hero-sub">Pure knowledge, trusted insights</p>
          </div>
          <div className="blog-wrapper">
            <div className="no-blogs">No blog posts available yet.</div>
          </div>
        </>
      ) : (
        blogs.map((blog) => {
          const blocks = parseBlocks(blog.content);
          return (
            <div key={blog.id} className="blog-article-full">
              {/* If banner_image exists, render it as full-width hero */}
              {blog.banner_image ? (
                <AnimatedCard delay={0}>
                  <div
                    className="blog-hero-image"
                    style={{
                      backgroundImage: `url(${blog.banner_image.startsWith('http')
                          ? blog.banner_image
                          : `http://localhost:5000${blog.banner_image}`
                        })`
                    }}
                  >
                    <div className="blog-hero-overlay">
                      <h1 className="blog-hero-title-large">{blog.title}</h1>
                    </div>
                  </div>
                </AnimatedCard>
              ) : (
                <div className="blog-hero">
                  <h1 className="blog-hero-title">{blog.title || 'Dharti Oil Blog'}</h1>
                  <p className="blog-hero-sub">Pure knowledge, trusted insights</p>
                </div>
              )}

              <div className="blog-wrapper">
                {/* Meta */}
                <AnimatedCard delay={80}>
                  <div className="blog-meta-bar">
                    <span className="blog-meta-author">✍️ {blog.author}</span>
                    <span className="blog-meta-date">
                      {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </AnimatedCard>

                {/* Q&A blocks */}
                <div className="qa-list">
                  {blocks.length > 0 ? (
                    blocks.map((block, idx) => (
                      <AnimatedCard key={idx} delay={120 + idx * 80}>
                        <div className="qa-card">
                          {block.question && (
                            <div
                              className="qa-question"
                              style={{ color: QUESTION_COLORS[idx % QUESTION_COLORS.length] }}
                            >
                              {block.question}
                            </div>
                          )}
                          {block.answer && (
                            <div className="qa-answer">
                              {block.answer.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </AnimatedCard>
                    ))
                  ) : (
                    // Fallback: just render content as paragraphs
                    <AnimatedCard delay={150}>
                      <div className="qa-card">
                        <div className="qa-answer">
                          {blog.content.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </AnimatedCard>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Blog;