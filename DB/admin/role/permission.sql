INSERT INTO `Permission`
(`panel`, `module`, `action`, `status`, `createdById`, `updatedById`)
VALUES

-- ================= ADMIN PANEL =================

-- Role
('KITCHEN', 'STAFF', 'CREATE', 'ACTIVE', 1, 1),
('KITCHEN', 'STAFF', 'UPDATE', 'ACTIVE', 1, 1),
('KITCHEN', 'STAFF', 'DELETE', 'ACTIVE', 1, 1),
('KITCHEN', 'STAFF', 'LIST', 'ACTIVE', 1, 1),
('KITCHEN', 'STAFF', 'DETAIL', 'ACTIVE', 1, 1),
('KITCHEN', 'STAFF', 'TRASH_LIST', 'ACTIVE', 1, 1),
('KITCHEN', 'STAFF', 'RESTORE', 'ACTIVE', 1, 1),
('KITCHEN', 'STAFF', 'DESTROY', 'ACTIVE', 1, 1);