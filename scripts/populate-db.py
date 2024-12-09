import json
import sqlite3
import re
from datetime import datetime

# 货币符号映射
CURRENCY_SYMBOLS = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AUD': 'A$',
    'CAD': 'C$',
    'BRL': 'R$',
    'CZK': 'Kč',
    'DKK': 'kr',
    'HKD': 'HK$',
    'HUF': 'Ft',
    'ILS': '₪',
    'JPY': '¥',
    'MYR': 'RM',
    'MXN': 'Mex$',
    'TWD': 'NT$',
    'NZD': 'NZ$',
    'NOK': 'kr',
    'PHP': '₱',
    'PLN': 'zł',
    'SGD': 'S$',
    'SEK': 'kr',
    'CHF': 'Fr',
    'THB': '฿'
}

def parse_fee_string(fee_string):
    """解析费率字符串，返回百分比、固定费用和描述"""
    # 提取描述（如果存在）
    description = None
    if '(' in fee_string:
        main_part, description = fee_string.split('(', 1)
        description = description.rstrip(')').strip()
        fee_string = main_part.strip()
    
    # 解析百分比和固定费用
    parts = fee_string.split('+')
    
    # 解析百分比
    percentage = float(re.search(r'(\d+[.,]?\d*)', parts[0]).group(1).replace(',', '.'))
    
    # 解析固定费用（如果存在）
    fixed_amount = 0
    if len(parts) > 1:
        fixed_match = re.search(r'[\d.,]+', parts[1])
        if fixed_match:
            fixed_amount = float(fixed_match.group().replace(',', '.'))
    
    # 解析金额范围（如果在描述中）
    min_amount = max_amount = None
    if description:
        amount_range = re.search(r'(\d+[.,]?\d*)\s*(?:to|-)\s*(\d+[.,]?\d*)', description or '')
        if amount_range:
            min_amount = float(amount_range.group(1).replace(',', '.'))
            max_amount = float(amount_range.group(2).replace(',', '.'))
    
    return {
        'percentage': percentage,
        'fixed_amount': fixed_amount,
        'description': description,
        'min_amount': min_amount,
        'max_amount': max_amount
    }

def init_db():
    """初始化数据库"""
    conn = sqlite3.connect('paypal_fees.db')
    with open('scripts/init-db.sql', 'r') as f:
        conn.executescript(f.read())
    return conn

def populate_db():
    """填充数据库"""
    conn = init_db()
    cursor = conn.cursor()
    
    # 读取 JSON 文件
    with open('src/components/fee-calculator/paypal_fees.json', 'r') as f:
        fee_data = json.load(f)
    
    # 处理每个国家
    for country_with_currency, fees in fee_data.items():
        # 解析国家名称和货币代码
        country_match = re.match(r'(.*?)\s*\((.*?)\)', country_with_currency)
        if not country_match:
            continue
            
        country_name, currency_code = country_match.groups()
        currency_symbol = CURRENCY_SYMBOLS.get(currency_code, currency_code)
        
        # 插入国家
        cursor.execute('''
            INSERT OR IGNORE INTO countries (name, currency_code, currency_symbol)
            VALUES (?, ?, ?)
        ''', (country_name, currency_code, currency_symbol))
        country_id = cursor.execute('SELECT id FROM countries WHERE name = ?', 
                                  (country_name,)).fetchone()[0]
        
        # 处理每个费率
        for fee_string in fees:
            fee_data = parse_fee_string(fee_string)
            
            # 插入费率类型
            fee_type_name = fee_data['description'] or 'Standard Rate'
            cursor.execute('''
                INSERT OR IGNORE INTO fee_types (name, description)
                VALUES (?, ?)
            ''', (fee_type_name, fee_data['description']))
            fee_type_id = cursor.execute('SELECT id FROM fee_types WHERE name = ?', 
                                       (fee_type_name,)).fetchone()[0]
            
            # 插入费率
            cursor.execute('''
                INSERT INTO fees (
                    country_id, fee_type_id, percentage, fixed_amount, 
                    min_amount, max_amount
                )
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                country_id, fee_type_id, fee_data['percentage'],
                fee_data['fixed_amount'], fee_data['min_amount'],
                fee_data['max_amount']
            ))
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    populate_db()
