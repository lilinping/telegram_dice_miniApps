# 全局骰子模式接口文档 (Global Dice Mode API Documentation)

根据提供的 Swagger UI 截图，以下是全局骰子模式的 API 接口定义。

## 基础信息
- **Base URL**: `http://46.250.168.177:8079` (示例)
- **Content-Type**: `application/json`

## 接口列表

### 1. 清空骰宝所有选项
**GET** `/dice/global/revertAll/{userId}/{number}`

**描述**: 清空用户在指定期数的所有下注选项。

**参数**:
- `userId` (string/int, path): 用户 ID
- `number` (string/int, path): 期数 (Issue Number)

---

### 2. 撤回全局骰宝的选项
**GET** `/dice/global/revert/{userId}/{number}/{chooseId}`

**描述**: 撤回用户在指定期数的某个具体下注选项。

**参数**:
- `userId` (string/int, path): 用户 ID
- `number` (string/int, path): 期数
- `chooseId` (string/int, path): 下注项 ID (例如: 大、小、单、双的具体 ID)

---

### 3. 查看全局历史开奖结果分页列表
**GET** `/dice/global/result/{pageIndex}/{pageSize}`

**描述**: 获取全局模式的历史开奖结果，用于走势图或历史记录展示。

**参数**:
- `pageIndex` (int, path): 页码 (从 1 开始)
- `pageSize` (int, path): 每页数量

---

### 4. 查看某一局全局骰宝的信息
**GET** `/dice/global/query/{userId}/{number}`

**描述**: 查询指定期数的详细信息，包括用户的下注情况和开奖结果（如果已开奖）。

**参数**:
- `userId` (string/int, path): 用户 ID
- `number` (string/int, path): 期数

---

### 5. 查看当前还未开奖的若干期结果
**GET** `/dice/global/latest/results`

**描述**: 获取当前正在进行或即将进行的期数信息（通常用于获取倒计时、当前期号等）。
*注：Swagger 描述为“查看当前还未开奖的若干期结果”，可能返回当前期及未来几期的列表，或者最近已开奖的几期。根据上下文通常用于初始化游戏大厅状态。*

---

### 6. 查看玩家全局骰宝的历史信息
**GET** `/dice/global/history/{userId}/{pageIndex}/{pageSize}`

**描述**: 获取特定玩家的下注历史记录。

**参数**:
- `userId` (string/int, path): 用户 ID
- `pageIndex` (int, path): 页码
- `pageSize` (int, path): 每页数量

---

### 7. 选择全局骰宝的选项 (下注)
**GET** `/dice/global/bet/{userId}/{number}/{chooseId}/{bet}`

**描述**: 用户对指定期数的特定选项进行下注。

**参数**:
- `userId` (string/int, path): 用户 ID
- `number` (string/int, path): 期数
- `chooseId` (string/int, path): 下注项 ID
- `bet` (int/float, path): 下注金额

---

## 业务逻辑说明 (根据需求推断)

1.  **系统定时开奖**: 系统每 5 分钟生成一期新的 `number` (期数)。
2.  **倒计时**: 客户端通过 `/dice/global/latest/results` 或类似接口获取当前期数和剩余时间。
3.  **封盘**: 当倒计时剩余 30 秒时，客户端应禁止调用 `/dice/global/bet` 接口，并提示“封盘中”。
4.  **开奖**: 倒计时结束，服务器生成骰子结果，结算金额。
5.  **查看结果**: 客户端轮询或通过 WebSocket (如果支持) 获取最新开奖结果。
