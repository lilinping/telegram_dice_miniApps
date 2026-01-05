import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://46.250.168.177:8079'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'DELETE')
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const path = params.path.join('/')
    const url = `${BACKEND_URL}/${path}`
    
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const finalUrl = queryString ? `${url}?${queryString}` : url

    console.log(`[API Proxy] ${method} ${finalUrl}`)

    // 准备请求头
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // 转发原始请求的 initData 头
    const initData = request.headers.get('initData')
    if (initData) {
      headers['initData'] = initData
    }

    // 转发其他相关头
    const userAgent = request.headers.get('user-agent')
    if (userAgent) {
      headers['User-Agent'] = userAgent
    }

    // 准备请求体
    let body: string | undefined
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text()
      } catch (e) {
        // 如果没有请求体，忽略错误
      }
    }

    // 发送请求到后端
    const response = await fetch(finalUrl, {
      method,
      headers,
      body,
    })

    // 获取响应数据
    const responseText = await response.text()
    
    console.log(`[API Proxy] Response: ${response.status} ${response.statusText}`)
    
    // 返回响应
    return new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        // 添加 CORS 头
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, initData',
      },
    })
  } catch (error) {
    console.error('[API Proxy] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// 处理 OPTIONS 请求（CORS 预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, initData',
    },
  })
}