CREATE TABLE IF NOT EXISTS users(
    user_id TEXT PRIMARY KEY,
    user_name TEXT,
    user_tlf INTEGER,
    user_email TEXT
);
CREATE TABLE IF NOT EXISTS admins(
    admin_id TEXT PRIMARY KEY,
    admin_email TEXT,
    admin_name TEXT,
    admin_street TEXT,
    admin_city TEXT,
    admin_cp INTEGER,
    admin_desc TEXT
);
CREATE TABLE IF NOT EXISTS plates(
    plate_id TEXT PRIMARY KEY,
    admin_id TEXT,
    plate_name TEXT,
    plate_ingredients TEXT,
    plate_pvp INTEGER,
    plate_description TEXT,
    FOREIGN KEY(admin_id) REFERENCES admins(admin_id)
);
CREATE TABLE IF NOT EXISTS orders(
    order_id TEXT PRIMARY KEY,
    user_id TEXT,
    admin_id TEXT,
    order_date TEXT,
    last_update TEXT,
    order_status TEXT,
    totat_Price INTEGER,
    cant INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);