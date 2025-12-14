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
    // 构建完整路径
    // Next.js会自动解码路径参数，我们需要重新编码以确保特殊字符正确传递
    const path = params.path.map(segment => encodeURIComponent(segment)).join('/');
    const url = `${BACKEND_URL}/${path}`;
    
    // 添加查询参数（如果有）
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;
    
    console.log(`[API Proxy] ${method} ${fullUrl}`);
    
    // 获取请求体（如果有）
    let body = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const text = await request.text();
        if (text) {
          body = text;
          console.log(`[API Proxy] Request body:`, text);
        }
      } catch (e) {
        console.log(`[API Proxy] No request body`);
      }
    }

    // 创建超时控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    try {
      // 转发请求到后端
      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 转发 Telegram initData 认证头（最重要！）
          ...(request.headers.get('initdata') && {
            'initData': request.headers.get('initdata')!
          }),
          // 转发 Authorization 头
          ...(request.headers.get('authorization') && {
            'Authorization': request.headers.get('authorization')!
          }),
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`[API Proxy] Response status: ${response.status}`);

      // 获取响应数据
      const data = await response.text();
      
      // 如果后端返回 401，记录详细信息
      if (response.status === 401) {
        console.error(`[API Proxy] 401 Unauthorized for ${fullUrl}`);
        console.error(`[API Proxy] Response:`, data);
      }
      
      // 返回响应
      return new NextResponse(data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // 如果是中止错误（超时）
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('[API Proxy] Request timeout');
        return NextResponse.json(
          { 
            code: 504, 
            message: 'Gateway Timeout',
            data: null 
          },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    
    return NextResponse.json(
      { 
        code: 500, 
        message: error instanceof Error ? error.message : 'Internal Server Error',
        data: null 
      },
      { status: 500 }
    );
  }
}
