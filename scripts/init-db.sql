-- 国家表
CREATE TABLE IF NOT EXISTS countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,              -- 国家名称 (e.g., "United States")
    currency_code TEXT NOT NULL,     -- 货币代码 (e.g., "USD")
    currency_symbol TEXT NOT NULL,   -- 货币符号 (e.g., "$")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 费率类型表
CREATE TABLE IF NOT EXISTS fee_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,              -- 费率类型名称 (e.g., "Standard Rate", "Micropayments")
    description TEXT,                -- 费率描述
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 费率表
CREATE TABLE IF NOT EXISTS fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_id INTEGER NOT NULL,     -- 关联到 countries 表
    fee_type_id INTEGER NOT NULL,    -- 关联到 fee_types 表
    percentage DECIMAL(5,2) NOT NULL, -- 费率百分比 (e.g., 2.90)
    fixed_amount DECIMAL(10,2) NOT NULL, -- 固定费用 (e.g., 0.30)
    min_amount DECIMAL(10,2),        -- 最小金额 (可选)
    max_amount DECIMAL(10,2),        -- 最大金额 (可选)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id),
    FOREIGN KEY (fee_type_id) REFERENCES fee_types(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fees_country ON fees(country_id);
CREATE INDEX IF NOT EXISTS idx_fees_type ON fees(fee_type_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_countries_name ON countries(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_types_name ON fee_types(name);
