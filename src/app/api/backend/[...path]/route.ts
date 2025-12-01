import { NextRequest, NextResponse } from 'next/server';

// 后端 API 基础 URL
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://46.250.168.177:8079';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const path = params.path.join('/');
    const url = `${BACKEND_URL}/${path}`;
    
    // 获取请求体（如果有）
    let body = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch (e) {
        // 如果没有请求体，忽略错误
      }
    }

    // 转发请求到后端
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // 转发必要的请求头
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
      },
      body,
    });

    // 获取响应数据
    const data = await response.text();
    
    // 返回响应
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { 
        code: 500, 
        message: 'Internal Server Error',
        data: null 
      },
      { status: 500 }
    );
  }
}
