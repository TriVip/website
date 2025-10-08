-- Sample data for Rare Parfume website (SQLite version)

-- Insert sample products
INSERT INTO products (name, brand, description, price, image_urls, stock_quantity, scent_notes, volume_ml, category, is_featured) VALUES
('Midnight Rose', 'Rare Parfume', 'A mysterious blend of dark roses and amber that captures the essence of a moonlit garden.', 299.99, '["/images/midnight-rose-1.jpg", "/images/midnight-rose-2.jpg"]', 15, '{"top_notes": ["Bergamot", "Pink Pepper"], "middle_notes": ["Rose", "Jasmine"], "base_notes": ["Amber", "Musk", "Sandalwood"]}', 100, 'perfume', 1),

('Ocean Breeze', 'Rare Parfume', 'Fresh and invigorating like a morning breeze over crystal clear waters.', 249.99, '["/images/ocean-breeze-1.jpg", "/images/ocean-breeze-2.jpg"]', 20, '{"top_notes": ["Sea Salt", "Lemon"], "middle_notes": ["Marine Accord", "White Flowers"], "base_notes": ["Driftwood", "Ambergris"]}', 100, 'perfume', 1),

('Golden Hour', 'Rare Parfume', 'Warm and luxurious, capturing the golden light of sunset.', 349.99, '["/images/golden-hour-1.jpg", "/images/golden-hour-2.jpg"]', 12, '{"top_notes": ["Saffron", "Cardamom"], "middle_notes": ["Rose", "Oud"], "base_notes": ["Vanilla", "Sandalwood", "Musk"]}', 100, 'perfume', 1),

('Forest Whisper', 'Rare Parfume', 'The deep, earthy scent of ancient forests and morning dew.', 279.99, '["/images/forest-whisper-1.jpg", "/images/forest-whisper-2.jpg"]', 18, '{"top_notes": ["Green Leaves", "Cypress"], "middle_notes": ["Pine", "Moss"], "base_notes": ["Cedar", "Patchouli", "Oakmoss"]}', 100, 'perfume', 0),

('Citrus Burst', 'Rare Parfume', 'Energizing blend of fresh citrus fruits and sparkling bergamot.', 199.99, '["/images/citrus-burst-1.jpg", "/images/citrus-burst-2.jpg"]', 25, '{"top_notes": ["Orange", "Lemon", "Grapefruit"], "middle_notes": ["Neroli", "Orange Blossom"], "base_notes": ["White Musk", "Cedar"]}', 100, 'perfume', 0),

('Velvet Dreams', 'Rare Parfume', 'Luxurious and seductive, like silk against the skin.', 399.99, '["/images/velvet-dreams-1.jpg", "/images/velvet-dreams-2.jpg"]', 8, '{"top_notes": ["Black Pepper", "Saffron"], "middle_notes": ["Rose", "Jasmine", "Ylang-Ylang"], "base_notes": ["Oud", "Vanilla", "Amber"]}', 100, 'perfume', 1),

('Mountain Air', 'Rare Parfume', 'Crisp and clean like alpine air at dawn.', 229.99, '["/images/mountain-air-1.jpg", "/images/mountain-air-2.jpg"]', 22, '{"top_notes": ["Mint", "Eucalyptus"], "middle_notes": ["Pine", "Juniper"], "base_notes": ["Cedar", "White Musk"]}', 100, 'perfume', 0),

('Desert Bloom', 'Rare Parfume', 'Exotic and mysterious, inspired by desert flowers.', 329.99, '["/images/desert-bloom-1.jpg", "/images/desert-bloom-2.jpg"]', 14, '{"top_notes": ["Cumin", "Coriander"], "middle_notes": ["Rose", "Jasmine", "Orange Blossom"], "base_notes": ["Amber", "Sandalwood", "Musk"]}', 100, 'perfume', 0);

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, featured_image, author, is_published, published_at) VALUES
('The Art of Choosing Your Signature Scent', 'art-of-choosing-signature-scent', 
'Choosing a signature scent is like choosing a piece of art that represents your personality. It''s not just about smelling good - it''s about expressing who you are through fragrance. In this guide, we''ll explore how to find the perfect perfume that speaks to your soul.

First, consider your personality. Are you bold and adventurous? You might gravitate toward spicy, oriental fragrances. Are you romantic and feminine? Floral scents might be your calling. Understanding your personality is the first step in finding your signature scent.

Next, think about the occasions when you''ll wear your perfume. Do you need something versatile for everyday wear, or are you looking for something special for evening events? The context matters when choosing your fragrance.

Finally, don''t rush the process. Take your time testing different scents, and remember that a perfume can smell different on your skin than it does on paper. Your body chemistry plays a crucial role in how a fragrance develops.', 
'Discover how to find the perfect perfume that represents your unique personality and style.', 
'/images/blog-signature-scent.jpg', 'Rare Parfume Team', 1, CURRENT_TIMESTAMP),

('Understanding Fragrance Notes: A Complete Guide', 'understanding-fragrance-notes-guide',
'Every perfume is composed of different notes that create its unique character. Understanding these notes will help you make better choices and appreciate the complexity of fine fragrances.

Top notes are the first impression of a perfume - they''re what you smell immediately when you spray it. These notes are usually light and evaporate quickly, lasting about 15-30 minutes. Common top notes include citrus, herbs, and light fruits.

Middle notes, also called heart notes, emerge after the top notes fade. They form the core of the fragrance and last for several hours. These notes are often floral, spicy, or fruity and create the main character of the perfume.

Base notes are the foundation of the fragrance and provide depth and longevity. They''re usually rich, heavy scents like woods, musks, and resins that can last for hours or even days. These notes are what you''ll smell hours after applying the perfume.

The art of perfumery lies in balancing these three layers to create a harmonious and evolving scent experience.', 
'Learn about top, middle, and base notes and how they work together to create beautiful fragrances.', 
'/images/blog-fragrance-notes.jpg', 'Rare Parfume Team', 1, CURRENT_TIMESTAMP),

('The History of Perfume: From Ancient Times to Modern Luxury', 'history-of-perfume-ancient-to-modern',
'Perfume has a rich and fascinating history that spans thousands of years and multiple civilizations. From ancient Egypt to modern Paris, the art of fragrance has evolved and flourished.

In ancient Egypt, perfume was considered sacred and was used in religious ceremonies and burial rituals. The Egyptians were masters of distillation and created complex fragrances using flowers, herbs, and resins.

The Greeks and Romans expanded the use of perfume beyond religious purposes, using it for personal grooming and social status. They imported exotic ingredients from across their empires and created sophisticated fragrance blends.

During the Middle Ages, perfume-making knowledge was preserved and refined by Islamic scholars, who developed advanced distillation techniques. This knowledge eventually spread to Europe through trade routes.

The modern perfume industry began in France in the 19th century, with the rise of luxury brands and the development of synthetic fragrance ingredients. Today, perfume is a multi-billion dollar industry that combines ancient traditions with cutting-edge technology.', 
'Explore the fascinating journey of perfume from ancient civilizations to modern luxury brands.', 
'/images/blog-perfume-history.jpg', 'Rare Parfume Team', 1, CURRENT_TIMESTAMP);

-- Insert admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@rareparfume.com', '$2a$10$wrjfTeeUM7CRcG4VgHepSer2mxJB4InGzlCxBu633zpSd/SGmQCOu', 'Admin User', 'admin');
