export async function get() {
  // 第一阶段：先生成少量测试页面
  const amounts = [];
  
  // 1. 最常用的价格点（10个页面）
  const commonAmounts = [9.99, 19.99, 29.99, 49.99, 99.99, 
                        199.99, 499.99, 999.99, 1999.99, 4999.99];
  amounts.push(...commonAmounts);
  
  // 2. 整数价格点（再加10个页面）
  const roundAmounts = [10, 20, 30, 50, 100, 
                       200, 500, 1000, 2000, 5000];
  amounts.push(...roundAmounts);

  // 注意：后续阶段的代码已准备好，但先注释掉
  /* 
  // 第二阶段：扩展到100个页面
  for (let i = 5; i <= 500; i += 5) {
    if (!amounts.includes(i)) {
      amounts.push(i);
    }
  }

  // 第三阶段：扩展到300个页面
  for (let i = 500; i <= 10000; i += 50) {
    if (!amounts.includes(i)) {
      amounts.push(i);
    }
  }
  */

  // 生成 sitemap XML
  const siteUrl = 'https://feecalc.org';
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${amounts.map(amount => `
  <url>
    <loc>${siteUrl}/fees/${amount}</loc>
    <changefreq>monthly</changefreq>
    <priority>${amount <= 100 ? '0.8' : '0.6'}</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('')}
</urlset>`;

  return {
    body: xml,
    headers: {
      'Content-Type': 'application/xml'
    }
  };
}
