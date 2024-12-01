import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

async function submitUrlsToGSC() {
  try {
    // 需要设置 Google API 凭证
    const auth = new google.auth.GoogleAuth({
      keyFile: 'path/to/your-credentials.json',
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const indexing = google.indexing({
      version: 'v3',
      auth: await auth.getClient(),
    });

    // 生成要提交的 URL
    const amounts = [];
    // $1-$100: 每 $5 一个页面
    for (let i = 5; i <= 100; i += 5) {
      amounts.push(i);
    }
    
    // 特殊金额
    const specialAmounts = [9.99, 19.99, 29.99, 49.99, 99.99, 199.99, 499.99, 999.99];
    amounts.push(...specialAmounts);

    // 提交 URL
    for (const amount of amounts) {
      try {
        const url = `https://feecalc.org/fees/${amount}`;
        await indexing.urlNotifications.publish({
          requestBody: {
            url,
            type: 'URL_UPDATED',
          },
        });
        console.log(`Submitted: ${url}`);
        // 避免超出 API 配额
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error submitting ${amount}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// 运行脚本
submitUrlsToGSC();
