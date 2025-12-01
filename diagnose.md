# 500 错误诊断指南

## 问题分析

本地测试出现 500 错误，可能的原因：

### 1. ✅ 已修复：rewrites 配置冲突
- **问题**: `next.config.js` 中的 `rewrites` 配置与 API 路由冲突
- **解决**: 已移除 `rewrites` 配置，现在完全使用 API 路由

### 2. 可能的原因：AbortSignal 兼容性
- **问题**: `AbortSignal.timeout()` 在某些 Node.js 版本中不可用
- **解决**: 已改用 `AbortController` + `setTimeout`

### 3. 可能的原因：请求头大小写
- **问题**: HTTP 请求头不区分大小写，但代码中使用了 `initdata`（小写）
- **检查**: 确保前端发送的是 `initData`，API 路由接收时转换为小写

## 快速测试步骤

### 步骤 1: 重启开发服务器
```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 步骤 2: 访问测试页面
打开浏览器访问: http://localhost:3000/test-api

点击"测试 API"按钮，查看结果：
- ✅ 如果看到 401 错误 + "Missing initData header" → API 路由工作正常，只是缺少有效认证
- ❌ 如果看到 500 错误 → API 路由有问题，查看控制台日志
- ✅ 如果看到 200 或其他状态码 → 一切正常

### 步骤 3: 检查控制台日志
在终端中查看 Next.js 开发服务器的输出，应该看到：
```
[API Proxy] GET http://46.250.168.177:8079/dice/display
[API Proxy] Response status: 401
```

如果看到错误堆栈，记录下来以便进一步诊断。

### 步骤 4: 测试后端连接
```bash
node test-backend-api.js
```

应该看到所有请求都返回 401 + "Missing initData header"，这是正常的。

## 常见错误和解决方案

### 错误 1: "Cannot read properties of undefined"
**原因**: `params.path` 可能为 undefined
**解决**: 检查 API 路由文件名是否正确：`[...path]/route.ts`

### 错误 2: "fetch is not defined"
**原因**: Node.js 版本太低（< 18）
**解决**: 升级 Node.js 到 18+ 或使用 `node-fetch`

### 错误 3: "AbortError: The operation was aborted"
**原因**: 请求超时（30秒）
**解决**: 检查后端服务是否正常运行

### 错误 4: "ECONNREFUSED"
**原因**: 无法连接到后端服务器
**解决**: 
1. 检查后端服务是否运行在 `http://46.250.168.177:8079`
2. 检查网络连接
3. 检查防火墙设置

## 验证清单

- [ ] 已移除 `next.config.js` 中的 `rewrites` 配置
- [ ] 已重启开发服务器
- [ ] API 路由文件存在：`src/app/api/backend/[...path]/route.ts`
- [ ] Node.js 版本 >= 18
- [ ] 后端服务正常运行
- [ ] 可以访问测试页面：http://localhost:3000/test-api

## 下一步

如果问题仍然存在：

1. **查看完整错误日志**
   - 在终端中查看 Next.js 开发服务器的输出
   - 在浏览器控制台查看错误信息

2. **检查 API 路由是否被正确识别**
   ```bash
   # 查看 Next.js 路由
   npm run build
   # 查看输出中是否有 /api/backend/[...path]
   ```

3. **使用 curl 直接测试**
   ```bash
   curl -v http://localhost:3000/api/backend/dice/display \
     -H "Content-Type: application/json" \
     -H "initData: test"
   ```

4. **提供错误信息**
   - 完整的错误堆栈
   - 浏览器控制台的错误
   - 终端的错误输出
