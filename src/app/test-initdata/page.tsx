'use client'

import { useState, useEffect } from 'react'
import { apiService } from '@/lib/api'

export default function TestInitDataPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20))
  }

  const testInitData = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
      const initData = window.Telegram.WebApp.initData
      addLog(`Current initData: ${initData.substring(0, 100)}...`)
      addLog(`initData length: ${initData.length}`)
    } else {
      addLog('No Telegram WebApp initData available')
    }
  }

  const testApiRequest = async () => {
    setLoading(true)
    addLog('Making API request...')
    
    try {
      const response = await apiService.getDiceDisplay()
      addLog(`API request successful: ${response.success}`)
      addLog(`Response data keys: ${Object.keys(response.data || {}).length}`)
    } catch (error) {
      addLog(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testMultipleRequests = async () => {
    addLog('Testing multiple requests...')
    
    for (let i = 1; i <= 3; i++) {
      addLog(`Request ${i}/3...`)
      await testApiRequest()
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    addLog('Multiple requests test completed')
  }

  useEffect(() => {
    addLog('Page loaded')
    testInitData()
  }, [])

  return (
    <div className="min-h-screen bg-bg-darkest p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary-gold mb-4">
          InitData 测试页面
        </h1>

        <div className="space-y-4 mb-6">
          <button
            onClick={testInitData}
            className="px-4 py-2 bg-primary-gold text-bg-darkest rounded-lg font-medium"
          >
            检查当前 InitData
          </button>

          <button
            onClick={testApiRequest}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 ml-2"
          >
            {loading ? '请求中...' : '测试单次 API 请求'}
          </button>

          <button
            onClick={testMultipleRequests}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 ml-2"
          >
            {loading ? '请求中...' : '测试多次 API 请求'}
          </button>

          <button
            onClick={() => setLogs([])}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium ml-2"
          >
            清空日志
          </button>
        </div>

        <div className="bg-bg-dark rounded-lg p-4">
          <h2 className="text-lg font-semibold text-primary-gold mb-2">
            日志输出
          </h2>
          <div className="space-y-1 font-mono text-sm text-text-secondary max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-text-tertiary">暂无日志</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="border-b border-bg-darker pb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-bg-dark rounded-lg p-4">
          <h2 className="text-lg font-semibold text-primary-gold mb-2">
            说明
          </h2>
          <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
            <li>每次 API 请求都会从 Telegram WebApp 获取最新的 initData</li>
            <li>initData 用于后端认证，过期会导致 401 错误</li>
            <li>查看浏览器控制台可以看到更详细的日志</li>
            <li>测试多次请求可以验证 initData 是否每次都更新</li>
          </ul>
        </div>
      </div>
    </div>
  )
}