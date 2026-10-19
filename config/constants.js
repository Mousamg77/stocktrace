const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
};

const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.STAFF]: 1,
};

const MOVEMENT_TYPES = {
  STOCK_IN: 'STOCK_IN',
  STOCK_OUT: 'STOCK_OUT',
  ADJUSTMENT: 'ADJUSTMENT',
};

const ALERT_TYPES = {
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  EXPIRY_SOON: 'EXPIRY_SOON',
  EXPIRED: 'EXPIRED',
};

const ALERT_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
};

const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
};

const EXPIRY_STATUS = {
  SAFE: 'safe',
  EXPIRING_SOON: 'expiring_soon',
  EXPIRED: 'expired',
  NO_EXPIRY: 'no_expiry',
};

const EXPIRY_SOON_DAYS = 30;

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  MOVEMENT_TYPES,
  ALERT_TYPES,
  ALERT_STATUS,
  STOCK_STATUS,
  EXPIRY_STATUS,
  EXPIRY_SOON_DAYS,
};
