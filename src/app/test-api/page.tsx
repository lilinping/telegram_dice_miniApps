'use client';

import { useState } from 'react';
import { apiService } from '@/lib/api';

export default function TestAPIPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('测试中...');

    try {
      // 测试 getDiceDisplay API
      const response = await apiService.getDiceDisplay();
      
      setResult(`
状态码: ${response.success ? '200' : '错误'}
响应: ${JSON.stringify(response, null, 2)}
      `);
    } catch (error) {
      setResult(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">API 测试页面</h1>
      
      <button
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '测试中...' : '测试 API'}
      </button>

      <pre className="mt-4 p-4 bg-gray-800 rounded overflow-auto">
        {result || '点击按钮开始测试'}
      </pre>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">说明</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>这个页面用于测试 API 代理是否正常工作</li>
          <li>如果看到 401 错误，说明后端需要有效的 initData</li>
          <li>如果看到 500 错误，说明 API 路由有问题</li>
          <li>如果看到 200 或其他后端返回的状态码，说明代理工作正常</li>
        </ul>
      </div>
    </div>
  );
}
