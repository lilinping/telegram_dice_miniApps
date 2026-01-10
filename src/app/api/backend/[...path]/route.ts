import { NextRequest, NextResponse } from 'next/server'

// 后端 API 基础地址
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://46.250.168.177:8079'

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PATCH')
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // 构建目标 URL - 保留 /api/backend 前缀
    const path = params.path.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const targetUrl = `${BACKEND_API_URL}/api/backend/${path}${searchParams ? `?${searchParams}` : ''}`

    // 准备请求头
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // 转发原始请求的认证头
    const initData = request.headers.get('initData')
    if (initData) {
      headers['initData'] = initData
      console.log(`[API Proxy] ${method} ${targetUrl} - initData present: ${initData.substring(0, 50)}...`)
    } else {
      console.warn(`[API Proxy] ${method} ${targetUrl} - No initData in request`)
    }

    // 转发其他重要的头部
    const authorization = request.headers.get('authorization')
    if (authorization) {
      headers['authorization'] = authorization
    }

    // 准备请求体
    let body: string | undefined
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const requestBody = await request.text()
        if (requestBody) {
          body = requestBody
        }
      } catch (error) {
        console.warn('Failed to read request body:', error)
      }
    }

    // 发送请求到后端
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    })

    // 获取响应数据
    const responseData = await response.text()
    
    // 创建响应
    const nextResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    })

    // 设置 CORS 头
    nextResponse.headers.set('Access-Control-Allow-Origin', '*')
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, initData')

    // 转发响应头
    const contentType = response.headers.get('content-type')
    if (contentType) {
      nextResponse.headers.set('Content-Type', contentType)
    }

    return nextResponse
  } catch (error) {
    console.error('API Proxy Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'API代理请求失败',
        error: error instanceof Error ? error.message : 'Unknown error'
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, initData',
    },
  })
}