-- SUBSCRIPTION
INSERT INTO Subscription 
(name, title, price, annualPrice, discountPct, freeTrialDays, maxBranches, maxUsers, createdAt, updatedAt)
VALUES
('starter', 'Starter Plan', 499, 4790, 20, 7, 1, 3, NOW(), NOW()),
('inter', 'Intermediate Plan', 1299, 11990, 23, 10, 5, 10, NOW(), NOW()),
('pro', 'Pro Plan', 2499, 21990, 27, 14, 20, 50, NOW(), NOW());

-- STARTER FEATURES
INSERT INTO SubscriptionFeature (subscriptionId, type, feature, createdAt)
VALUES
((SELECT id FROM Subscription WHERE name='starter'), 'INCLUDE', 'Basic Dashboard', NOW()),
((SELECT id FROM Subscription WHERE name='starter'), 'INCLUDE', 'Order Management', NOW()),
((SELECT id FROM Subscription WHERE name='starter'), 'INCLUDE', 'Email Support', NOW()),
((SELECT id FROM Subscription WHERE name='starter'), 'EXCLUDE', 'Advanced Analytics', NOW()),
((SELECT id FROM Subscription WHERE name='starter'), 'EXCLUDE', 'Priority Support', NOW());


-- INTER FEATURES
INSERT INTO SubscriptionFeature (subscriptionId, type, feature, createdAt)
VALUES
((SELECT id FROM Subscription WHERE name='inter'), 'INCLUDE', 'Advanced Dashboard', NOW()),
((SELECT id FROM Subscription WHERE name='inter'), 'INCLUDE', 'Order + Inventory Management', NOW()),
((SELECT id FROM Subscription WHERE name='inter'), 'INCLUDE', 'Basic Analytics', NOW()),
((SELECT id FROM Subscription WHERE name='inter'), 'INCLUDE', 'Chat Support', NOW()),
((SELECT id FROM Subscription WHERE name='inter'), 'EXCLUDE', 'Dedicated Manager', NOW());


-- PRO FEATURES
INSERT INTO SubscriptionFeature (subscriptionId, type, feature, createdAt)
VALUES
((SELECT id FROM Subscription WHERE name='pro'), 'INCLUDE', 'Full Dashboard + Analytics', NOW()),
((SELECT id FROM Subscription WHERE name='pro'), 'INCLUDE', 'Order + Inventory + Reports', NOW()),
((SELECT id FROM Subscription WHERE name='pro'), 'INCLUDE', 'Priority Support', NOW()),
((SELECT id FROM Subscription WHERE name='pro'), 'INCLUDE', 'Dedicated Account Manager', NOW()),
((SELECT id FROM Subscription WHERE name='pro'), 'INCLUDE', 'Custom Integrations', NOW());

-- CUISINE
INSERT INTO Cuisine (name, image, status, createdAt, updatedAt) VALUES
('North Indian', NULL, 'ACTIVE', NOW(), NOW()),
('South Indian', NULL, 'ACTIVE', NOW(), NOW()),
('Chinese', NULL, 'ACTIVE', NOW(), NOW()),
('Italian', NULL, 'ACTIVE', NOW(), NOW()),
('Continental', NULL, 'ACTIVE', NOW(), NOW()),
('Mexican', NULL, 'ACTIVE', NOW(), NOW()),
('Thai', NULL, 'ACTIVE', NOW(), NOW()),
('Japanese', NULL, 'ACTIVE', NOW(), NOW()),
('Korean', NULL, 'ACTIVE', NOW(), NOW()),
('Mediterranean', NULL, 'ACTIVE', NOW(), NOW()),
('Lebanese', NULL, 'ACTIVE', NOW(), NOW()),
('American', NULL, 'ACTIVE', NOW(), NOW()),
('Fast Food', NULL, 'ACTIVE', NOW(), NOW()),
('Street Food', NULL, 'ACTIVE', NOW(), NOW()),
('Beverages', NULL, 'ACTIVE', NOW(), NOW()),
('Desserts', NULL, 'ACTIVE', NOW(), NOW()),
('Bakery', NULL, 'ACTIVE', NOW(), NOW()),
('Healthy Food', NULL, 'ACTIVE', NOW(), NOW()),
('Vegan', NULL, 'ACTIVE', NOW(), NOW()),
('Jain', NULL, 'ACTIVE', NOW(), NOW());

INSERT IGNORE INTO Ingredient (name, image, category, status, createdAt, updatedAt) VALUES
('Tomato', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Onion', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Potato', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Garlic', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Ginger', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Green Chilli', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Capsicum', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Carrot', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Cabbage', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Cauliflower', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),

('Spinach', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Fenugreek Leaves', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Coriander Leaves', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Mint Leaves', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Peas', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Beans', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Brinjal', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Radish', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Beetroot', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),
('Sweet Corn', NULL, 'Vegetable', 'ACTIVE', NOW(), NOW()),

('Paneer', NULL, 'Dairy', 'ACTIVE', NOW(), NOW()),
('Milk', NULL, 'Dairy', 'ACTIVE', NOW(), NOW()),
('Butter', NULL, 'Dairy', 'ACTIVE', NOW(), NOW()),
('Cheese', NULL, 'Dairy', 'ACTIVE', NOW(), NOW()),
('Curd', NULL, 'Dairy', 'ACTIVE', NOW(), NOW()),
('Cream', NULL, 'Dairy', 'ACTIVE', NOW(), NOW()),

('Chicken', NULL, 'Meat', 'ACTIVE', NOW(), NOW()),
('Mutton', NULL, 'Meat', 'ACTIVE', NOW(), NOW()),
('Fish', NULL, 'Meat', 'ACTIVE', NOW(), NOW()),
('Egg', NULL, 'Meat', 'ACTIVE', NOW(), NOW()),

('Rice', NULL, 'Grain', 'ACTIVE', NOW(), NOW()),
('Basmati Rice', NULL, 'Grain', 'ACTIVE', NOW(), NOW()),
('Wheat Flour', NULL, 'Grain', 'ACTIVE', NOW(), NOW()),
('Maida', NULL, 'Grain', 'ACTIVE', NOW(), NOW()),
('Semolina', NULL, 'Grain', 'ACTIVE', NOW(), NOW()),
('Oats', NULL, 'Grain', 'ACTIVE', NOW(), NOW()),

('Salt', NULL, 'Spice', 'ACTIVE', NOW(), NOW()),
('Black Pepper', NULL, 'Spice', 'ACTIVE', NOW(), NOW()),
('Turmeric', NULL, 'Spice', 'ACTIVE', NOW(), NOW()),
('Red Chilli Powder', NULL, 'Spice', 'ACTIVE', NOW(), NOW()),
('Coriander Powder', NULL, 'Spice', 'ACTIVE', NOW(), NOW()),
('Cumin Seeds', NULL, 'Spice', 'ACTIVE', NOW(), NOW()),
('Mustard Seeds', NULL, 'Spice', 'ACTIVE', NOW(), NOW()),
('Garam Masala', NULL, 'Spice', 'ACTIVE', NOW(), NOW()),
('Chaat Masala', NULL, 'Spice', 'ACTIVE', NOW(), NOW()),
('Kasuri Methi', NULL, 'Spice', 'ACTIVE', NOW(), NOW()),

('Sugar', NULL, 'Sweetener', 'ACTIVE', NOW(), NOW()),
('Jaggery', NULL, 'Sweetener', 'ACTIVE', NOW(), NOW()),
('Honey', NULL, 'Sweetener', 'ACTIVE', NOW(), NOW()),

('Cooking Oil', NULL, 'Oil', 'ACTIVE', NOW(), NOW()),
('Mustard Oil', NULL, 'Oil', 'ACTIVE', NOW(), NOW()),
('Olive Oil', NULL, 'Oil', 'ACTIVE', NOW(), NOW()),
('Ghee', NULL, 'Oil', 'ACTIVE', NOW(), NOW()),

('Tomato Ketchup', NULL, 'Sauce', 'ACTIVE', NOW(), NOW()),
('Soy Sauce', NULL, 'Sauce', 'ACTIVE', NOW(), NOW()),
('Chilli Sauce', NULL, 'Sauce', 'ACTIVE', NOW(), NOW()),
('Vinegar', NULL, 'Sauce', 'ACTIVE', NOW(), NOW()),

('Bread', NULL, 'Bakery', 'ACTIVE', NOW(), NOW()),
('Burger Bun', NULL, 'Bakery', 'ACTIVE', NOW(), NOW()),
('Pizza Base', NULL, 'Bakery', 'ACTIVE', NOW(), NOW()),

('Banana', NULL, 'Fruit', 'ACTIVE', NOW(), NOW()),
('Apple', NULL, 'Fruit', 'ACTIVE', NOW(), NOW()),
('Mango', NULL, 'Fruit', 'ACTIVE', NOW(), NOW()),
('Orange', NULL, 'Fruit', 'ACTIVE', NOW(), NOW()),
('Pineapple', NULL, 'Fruit', 'ACTIVE', NOW(), NOW()),
('Grapes', NULL, 'Fruit', 'ACTIVE', NOW(), NOW()),

('Dry Fruits Mix', NULL, 'Dry Fruit', 'ACTIVE', NOW(), NOW()),
('Cashew', NULL, 'Dry Fruit', 'ACTIVE', NOW(), NOW()),
('Almond', NULL, 'Dry Fruit', 'ACTIVE', NOW(), NOW()),
('Raisin', NULL, 'Dry Fruit', 'ACTIVE', NOW(), NOW()),
('Pistachio', NULL, 'Dry Fruit', 'ACTIVE', NOW(), NOW()),

('Noodles', NULL, 'Packaged', 'ACTIVE', NOW(), NOW()),
('Pasta', NULL, 'Packaged', 'ACTIVE', NOW(), NOW()),
('Cornflakes', NULL, 'Packaged', 'ACTIVE', NOW(), NOW()),

('Chocolate', NULL, 'Dessert', 'ACTIVE', NOW(), NOW()),
('Ice Cream', NULL, 'Dessert', 'ACTIVE', NOW(), NOW()),
('Custard Powder', NULL, 'Dessert', 'ACTIVE', NOW(), NOW()),

('Water', NULL, 'Beverage', 'ACTIVE', NOW(), NOW()),
('Tea Leaves', NULL, 'Beverage', 'ACTIVE', NOW(), NOW()),
('Coffee Powder', NULL, 'Beverage', 'ACTIVE', NOW(), NOW()),
('Green Tea', NULL, 'Beverage', 'ACTIVE', NOW(), NOW());