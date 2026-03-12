UPDATE products SET category = 'shoes' WHERE title IN (
  'Nike Air Max',
  'Adidas Ultraboost',
  'Puma RS-X',
  'Hiking Boots'
);

UPDATE products SET category = 'clothing' WHERE title IN (
  'Running Shorts',
  'Adidas Hoodie',
  'Basic T-Shirt',
  'Denim Jacket',
  'Winter Jacket',
  'Sports Socks',
  'Baseball Cap'
);

UPDATE products SET category = 'bags' WHERE title IN (
  'City Backpack',
  'Travel Backpack',
  'Laptop Backpack'
);

UPDATE products SET category = 'electronics' WHERE title IN (
  'Wireless Headphones',
  'Bluetooth Speaker',
  'Smart Watch',
  'Fitness Tracker',
  'iPhone Case',
  'USB-C Charger',
  'Wireless Charger',
  'MacBook Sleeve',
  'Gaming Headset',
  'Gaming Mouse',
  'Mechanical Keyboard',
  'LED Monitor',
  'External SSD',
  'VR Headset',
  'Drone Camera',
  'Portable Power Bank',
  'Smart Home Hub',
  'Action Camera'
);

UPDATE products SET category = 'fitness' WHERE title IN (
  'Yoga Mat',
  'Dumbbell Set',
  'Protein Shaker'
);

UPDATE products SET category = 'outdoor' WHERE title IN (
  'Camping Tent',
  'Sleeping Bag',
  'Water Bottle',
  'Sunglasses'
);

UPDATE products SET category = 'accessories' WHERE title IN (
  'Leather Wallet',
  'Coffee Mug',
  'Desk Lamp'
);

UPDATE products
SET category = 'other'
WHERE category IS NULL OR trim(category) = '';