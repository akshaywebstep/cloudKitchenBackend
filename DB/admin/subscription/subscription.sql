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