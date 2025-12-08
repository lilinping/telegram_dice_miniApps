# 筛盅 + 三颗骰子真实摇动效果  
## **需求方案（最终版 V2.0 - 完善版）**

---

# 1. 背景说明  
当前项目已经有基本的骰宝/骰子类游戏业务，但动画表现较弱：  
- 骰子跳动不真实  
- 没有筛盅（Dice Shaker）  
- 缺乏"真实物理 + 玻璃反射 + 动态碰撞声效"

为提升用户体验，需要 **加入一个透明玻璃筛盅内三颗骰子真实摇动、碰撞、停稳的效果**。  

**目标：比国内小游戏质量高一个维度，接近国际厂商品质（PG SOFT、Evolution Gaming）。**

---

# 2. 目标效果（最终要呈现的体验）

### **2.1 整体体验流程：**
1. 用户点击"开始摇骰"
2. 玻璃筛盅盖上 → 内部三颗骰子高速旋转  
3. 筛盅圆周摇动（1～1.5秒）  
4. 筛盅落下，骰子弹跳  
5. 骰子自然停稳  
6. 筛盅缓慢抬起  
7. 展示后台指定点数（含物理校正）  

### **2.2 视觉质量标准：**
- **玻璃材质**：透明度 ≥ 90%，折射清晰可见，边缘 Fresnel 效果明显
- **骰子模型**：六面点数清晰，边缘圆润，无锯齿
- **光照系统**：多光源配置，阴影自然，高光反射真实
- **动画流畅度**：全程 60fps，无卡顿，过渡自然

---

# 3. 需求细化

## 3.1 UI 模块需求
| 模块 | 要求 | 技术细节 |
|------|------|----------|
| 透明玻璃筛盅模型 | PBR 材质、折射、环境光反射 | MeshPhysicalMaterial, transmission=1.0, ior=1.45, roughness=0.1 |
| 三颗骰子 | 3D 模型 + 真实物理碰撞 | BoxGeometry, Cannon-es BoxShape, 六面贴图 |
| 桌面背景 | 木质/皮革主题 | MeshStandardMaterial, 纹理贴图（可选） |
| 动画系统 | 筛盅摇动动画 + 骰子物理动画 | GSAP Timeline + Cannon-es Physics |
| 声效 | 摇盅摩擦声、骰子碰撞声、落地声 | Howler.js / Web Audio API |
| 环境贴图 | HDRI 环境反射 | CubeTexture / PMREMGenerator |
| 后处理 | 辉光、抗锯齿 | EffectComposer, Bloom, FXAA |

---

## 3.2 动画阶段拆解（详细版）

### **① 盖盅：0.3s**
**技术要求：**
- 筛盅从上方（y=10）快速盖下到（y=1.5）
- 使用 `power2.out` 缓动函数
- 轻微玻璃颤动感：盖下后轻微上下震动 2-3 次（振幅 0.02，频率 10Hz）
- 音效：轻微"啪"声

**实现要点：**
```javascript
// GSAP Timeline
timeline.to(cup.position, {
  y: 1.5,
  duration: 0.3,
  ease: 'power2.out'
});
// 颤动效果
timeline.to(cup.position, {
  y: 1.48,
  duration: 0.05,
  yoyo: true,
  repeat: 2
});
```

---

### **② 摇盅：1.2–1.8s（随机）**
**技术要求：**
- 圆周轨迹：半径 0.8，旋转 3.5 圈
- 噪声扰动：X/Z 轴随机偏移 ±0.25，Y 轴正弦波动 ±0.15
- 旋转同步：筛盅绕 Y 轴旋转，角度 = 圆周角度 × 0.15
- 多轴旋转：添加 X/Z 轴轻微旋转（±0.1 rad）
- 音效：循环摩擦声，音量随速度变化

**实现要点：**
```javascript
// 圆周路径生成
const radius = 0.8;
const rotations = 3.5;
const steps = 90; // 高精度步数

for (let i = 0; i <= steps; i++) {
  const progress = i / steps;
  const angle = progress * Math.PI * 2 * rotations;
  
  // 圆周 + 噪声
  const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.25;
  const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.25;
  const y = 1.5 + Math.sin(progress * Math.PI * 6) * 0.15;
  
  // 多轴旋转
  const rotY = angle * 0.15;
  const rotX = Math.sin(progress * Math.PI * 4) * 0.1;
  const rotZ = Math.cos(progress * Math.PI * 3) * 0.08;
}
```

---

### **③ 落盅：0.2s**
**技术要求：**
- 快速回到中心（x=0, z=0）：0.06s，`power1.in`
- 落下到桌面（y=0.8）：0.14s，`bounce.out` 弹跳
- 骰子被带起：给骰子施加向上速度 +1.5
- 音效：重低频"砰"声（50-70Hz 正弦波衰减）

**实现要点：**
```javascript
// 落盅动画
timeline.to(cup.position, {
  x: 0, z: 0,
  duration: 0.06,
  ease: 'power1.in'
});
timeline.to(cup.position, {
  y: 0.8,
  duration: 0.14,
  ease: 'bounce.out'
});

// 骰子被带起
diceBodies.forEach(body => {
  body.velocity.y += 1.5;
});
```

---

### **④ 骰子自然物理停稳：1-3s（动态）**
**技术要求：**
- 完全由物理引擎控制，不干预
- 初始力：线速度 6-8 m/s，角速度 10-15 rad/s（随机方向）
- 物理参数：
  - 质量：1.2 kg
  - 摩擦力：0.6
  - 弹性：0.5
  - 线性阻尼：0.4
  - 角阻尼：0.5
- 停稳检测：速度 < 0.1 m/s 且角速度 < 0.1 rad/s，持续 0.3s
- 超时保护：3秒后强制停止
- 碰撞音效：速度 > 1.5 m/s 时触发，音量随速度变化

**实现要点：**
```javascript
// 施加随机力
function throwDice(body, strength = 6) {
  body.velocity.set(
    (Math.random() - 0.5) * strength * 1.2,
    Math.random() * strength * 0.6 + 2.5,
    (Math.random() - 0.5) * strength * 1.2
  );
  body.angularVelocity.set(
    (Math.random() - 0.5) * strength * 2.5,
    (Math.random() - 0.5) * strength * 2.5,
    (Math.random() - 0.5) * strength * 2.5
  );
}

// 停稳检测
function isDiceStopped(body, threshold = 0.1) {
  return body.velocity.length() < threshold && 
         body.angularVelocity.length() < threshold;
}
```

---

### **⑤ 抬盅：1s**
**技术要求：**
- 先微微震动：0.1s，振幅 0.1，重复 1 次
- 平滑抬起：从 y=0.8 到 y=10，`power2.in` 缓动
- 旋转效果：绕 Y 轴旋转 30°，增强玻璃折射变化
- 音效：轻微"嘶"声

**实现要点：**
```javascript
timeline.to(cup.position, {
  y: 0.9,
  duration: 0.1,
  ease: 'power1.inOut',
  yoyo: true,
  repeat: 1
});
timeline.to(cup.position, {
  y: 10,
  duration: 1.0,
  ease: 'power2.in'
});
timeline.to(cup.rotation, {
  y: cup.rotation.y + Math.PI * 0.3,
  duration: 1.0,
  ease: 'power2.in'
}, '<');
```

---

### **⑥ 结果校正：0.1s**
**技术要求：**
- 平滑过渡到目标旋转
- 使用缓动函数：`easeInOutQuad`
- 插值速度：0.3（避免突兀）
- 确保最终位置精确

**实现要点：**
```javascript
// 目标旋转映射
const targetRotations = {
  1: [-Math.PI / 2, 0, 0],
  2: [Math.PI / 2, 0, 0],
  3: [0, 0, -Math.PI / 2],
  4: [0, 0, Math.PI / 2],
  5: [0, 0, 0],
  6: [Math.PI, 0, 0],
};

// 平滑插值
body.quaternion.slerp(targetQuat, easedProgress * 0.3);
```

---

### **⑦ 展示点数**
**技术要求：**
- 调用后台结果  
- 播放 Reveal 动效：骰子轻微弹跳 + 高光闪烁
- 中奖特效：粒子爆炸、辉光效果

---

# 4. 与市面产品对比分析

## 4.1 PG SOFT（国际一线）
**优点：**  
- 动画高级，流畅度极高
- 材质真实，PBR 效果完美
- 物理自然，碰撞真实
- 音效丰富，沉浸感强

**我们目标需达成：**  
✔ 真实摇盅（圆周轨迹 + 噪声）  
✔ 真实骰子物理（Cannon-es 完整模拟）  
✔ PBR 光影（MeshPhysicalMaterial + HDRI）  
✔ 抬盅展示效果（旋转 + 折射变化）  

---

## 4.2 Evolution Gaming 真人骰宝
**亮点：**  
- 顶级玻璃折射效果（IOR 精确，Fresnel 明显）
- 高级光照模型（多光源 + 环境贴图）
- 真实物理模拟（专业物理引擎）
- 专业音效设计（空间音效）

**可借鉴：**  
✔ 玻璃边缘 Fresnel（sheen 参数）  
✔ 透明度层级（transmission + opacity）  
✔ HDRI 环境反射（PMREMGenerator）  
✔ 多光源系统（主光 + 补光 + 点光源）  

---

## 4.3 小程序常见骰宝（多数质量较差）
**缺点：**  
✘ 骰子是假旋转（CSS transform，无物理）  
✘ 没有真实物理（预定义动画路径）  
✘ 玻璃像塑料（简单透明，无折射）  
✘ 声音乏力（简单音效，无空间感）  

**本项目目标：**  
**比国内小游戏质量高一个维度，接近国际厂商品质。**

---

# 5. 技术实现方案（详细版）

## 5.1 3D 渲染方案

### **Three.js + Cannon-es（推荐）**

**技术栈：**
- Three.js r163+（WebGL 渲染）
- Cannon-es 0.20+（物理引擎）
- GSAP 3.13+（动画控制）
- Howler.js 2.2+（音效管理）

**玻璃筛盅材质（MeshPhysicalMaterial）：**
```javascript
{
  color: 0xffffff,
  metalness: 0.0,
  roughness: 0.1,        // 需求文档要求
  transmission: 1.0,      // 需求文档要求：完全透明
  thickness: 0.5,         // 玻璃厚度
  ior: 1.45,             // 需求文档要求：玻璃折射率
  clearcoat: 1.0,        // 清漆层
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.8,  // 环境反射强度
  transparent: true,
  opacity: 0.15,         // 降低不透明度，增强透明感
  side: THREE.DoubleSide,
  // Fresnel 效果（需求文档：玻璃边缘Fresnel）
  sheen: 0.6,
  sheenRoughness: 0.2,
  sheenColor: 0xffffff,
}
```

**骰子模型：**
- 几何：BoxGeometry（size × size × size）
- 材质：MeshStandardMaterial（白色，轻微金属感）
- 点数：CylinderGeometry（凹陷点数，黑色材质）
- 碰撞体：CANNON.Box（与几何体一致）

**环境贴图（HDRI）：**
- 方法1：使用 PMREMGenerator 生成（推荐）
- 方法2：程序生成 CubeTexture（渐变环境）
- 方法3：加载外部 HDRI 文件

---

## 5.2 动画方案

### **筛盅动画 → GSAP Timeline**

**优点：**
- 可精确控制轨迹和缓动
- 支持复杂时间线编排
- 性能优秀，GPU 加速

**实现要点：**
```javascript
// 创建 Timeline
const timeline = gsap.timeline();

// 圆周路径 + 噪声
for (let i = 0; i <= steps; i++) {
  const progress = i / steps;
  const angle = progress * Math.PI * 2 * rotations;
  
  timeline.to(cup.position, {
    x: Math.cos(angle) * radius + noiseX,
    y: 1.5 + noiseY,
    z: Math.sin(angle) * radius + noiseZ,
    duration: duration / steps,
    ease: 'power1.inOut',
  }, i * (duration / steps));
}
```

---

### **骰子动画 → Cannon-es Physics**

**流程：**  
1. 给初始线速度 + 角速度（随机方向）
2. 物理引擎模拟：碰撞 → 滚动 → 减速
3. 检测停稳：速度 < 阈值
4. 结果校正：平滑过渡到目标旋转

**物理参数优化：**
```javascript
// 骰子材质
const diceMaterial = new CANNON.Material({
  friction: 0.6,      // 增加摩擦力
  restitution: 0.5,    // 增加弹性
});

// 刚体设置
const body = new CANNON.Body({
  mass: 1.2,              // 稍微增加质量
  linearDamping: 0.4,     // 线性阻尼
  angularDamping: 0.5,    // 角阻尼
});
```

---

## 5.3 最终点数控制方案（核心能力）

### **"真实模拟 + 姿态校正"双模式**

**流程：**
1. 物理模拟结束时取当前骰子姿态  
2. Backend 结果 = [x, y, z]  
3. 计算目标旋转（使对应点数朝上）
4. 平滑插值：0.1s "微动"修正，使其不突兀

**实现要点：**
```javascript
// 目标旋转映射
const targetRotations = {
  1: [-Math.PI / 2, 0, 0],    // 前面朝上
  2: [Math.PI / 2, 0, 0],     // 后面朝上
  3: [0, 0, -Math.PI / 2],    // 右面朝上
  4: [0, 0, Math.PI / 2],     // 左面朝上
  5: [0, 0, 0],               // 上面朝上
  6: [Math.PI, 0, 0],         // 下面朝上
};

// 平滑插值
const targetQuat = new CANNON.Quaternion();
targetQuat.setFromEuler(x, y, z);
body.quaternion.slerp(targetQuat, progress * 0.3);
```

---

# 6. 声效设计（详细版）

### **需要三个声音：**

| 声音 | 触发 | 技术要求 | 实现方案 |
|------|------|----------|----------|
| 摇盅摩擦声 | 摇盅阶段循环 | 中频噪声（200-500Hz），音量随速度变化 | Howler.js 循环播放，或 Web Audio API 生成 |
| 骰子碰撞声 | 物理事件触发（速度 > 1.5 m/s） | 短促噪声（100-300Hz），音量随碰撞强度变化 | 碰撞检测 + Web Audio API 动态生成 |
| 筛盅落下声 | 落盅瞬间 | 重低频"砰"声（50-70Hz 正弦波衰减） | 预加载音频文件，或 Web Audio API 生成 |

**音效实现方案：**

**方案1：预加载音频文件（推荐）**
```javascript
// 使用 Howler.js
const shakeSound = new Howl({
  src: ['/sounds/cup-shake.mp3'],
  loop: true,
  volume: 0.6,
});
```

**方案2：Web Audio API 动态生成（备选）**
```javascript
// 生成碰撞声
function playCollision(intensity) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'square';
  oscillator.frequency.value = 100 + Math.random() * 200;
  gainNode.gain.setValueAtTime(intensity * 0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}
```

---

# 7. 性能优化方案

## 7.1 渲染优化

**1. 实例化渲染（InstancedMesh）**
- 三颗骰子使用同一个几何体和材质
- 减少 Draw Call，提升性能

**2. LOD（细节层次）**
- 根据相机距离调整模型精度
- 远距离使用低精度模型

**3. 后处理优化**
- 仅在高端设备启用 Bloom、FXAA
- 低端设备禁用后处理

**4. 阴影优化**
- 阴影贴图分辨率：高端 2048，中端 1024，低端 512
- 使用 PCFSoftShadowMap（软阴影）

---

## 7.2 物理优化

**1. 时间步长优化**
- 固定时间步长：1/60s
- 最大子步数：3

**2. 碰撞检测优化**
- 使用 Broadphase（粗检测）
- 限制碰撞对数量

**3. 停稳检测优化**
- 降低检测频率：每 100ms 检测一次
- 超时保护：3秒后强制停止

---

## 7.3 内存优化

**1. 纹理压缩**
- 使用压缩纹理格式（KTX2、Basis）
- 降低纹理分辨率（256×256 足够）

**2. 几何体优化**
- 减少分段数（32 段足够）
- 使用 BufferGeometry（更高效）

**3. 材质共享**
- 相同材质共享实例
- 避免重复创建

---

# 8. 常见问题及解决方案

## 8.1 玻璃材质不透明/不真实

**问题：**
- 玻璃看起来像塑料
- 没有折射效果
- 边缘没有 Fresnel 效果

**解决方案：**
1. 确保使用 `MeshPhysicalMaterial`（不是 StandardMaterial）
2. 设置 `transmission = 1.0`（完全透明）
3. 设置 `ior = 1.45`（玻璃折射率）
4. 添加 `sheen` 参数（Fresnel 效果）
5. 使用环境贴图（HDRI）增强反射

---

## 8.2 骰子物理不真实

**问题：**
- 骰子滚动不自然
- 停稳后还在轻微移动
- 碰撞声音不匹配

**解决方案：**
1. 调整物理参数：摩擦力 0.6，弹性 0.5
2. 增加阻尼：linearDamping 0.4，angularDamping 0.5
3. 停稳检测：速度 < 0.1 且持续 0.3s
4. 碰撞音效：速度阈值 1.5 m/s

---

## 8.3 动画不流畅

**问题：**
- 帧率低于 60fps
- 动画卡顿
- 过渡不自然

**解决方案：**
1. 降低像素比：`setPixelRatio(Math.min(devicePixelRatio, 2))`
2. 减少后处理效果（低端设备）
3. 使用 `requestAnimationFrame` 优化渲染循环
4. 避免在渲染循环中进行重计算

---

## 8.4 环境贴图加载失败

**问题：**
- 环境贴图创建失败
- 玻璃没有反射效果

**解决方案：**
1. 使用 try-catch 包裹环境贴图创建
2. 提供备选方案：程序生成简单环境贴图
3. 使用 PMREMGenerator 生成（更可靠）
4. 如果失败，使用默认白色环境（不影响渲染）

---

## 8.5 音效不播放/延迟

**问题：**
- 音效文件加载失败
- 音效播放延迟
- 碰撞音效过于频繁

**解决方案：**
1. 预加载音效文件
2. 使用 Web Audio API 作为备选方案
3. 限制碰撞音效频率（150ms 间隔）
4. 设置音量阈值（避免微小碰撞触发）

---

# 9. 验收标准（详细版）

### **画面质量**
- 玻璃真实性 ≥ PG SOFT 70%  
  - 透明度 ≥ 90%
  - 折射清晰可见
  - Fresnel 边缘效果明显
- 骰子停放位置随机、多样  
  - 三颗骰子位置不重叠
  - 旋转角度随机
  - 点数清晰可见
- 光影自然，不影响可视性  
  - 阴影清晰但不突兀
  - 高光反射真实
  - 环境光充足

### **动画质量**
- 摇盅流畅、不突兀  
  - 圆周轨迹平滑
  - 噪声扰动自然
  - 无卡顿现象
- 骰子自然、不假  
  - 物理模拟真实
  - 碰撞效果自然
  - 停稳检测准确
- 抬盅节奏高级  
  - 旋转与上升同步
  - 玻璃折射变化明显
  - 过渡自然

### **性能标准**
- 全程 60fps（主流机型）  
  - iPhone 12+：60fps
  - 高端 Android：60fps
  - 中端设备：≥ 45fps
- 低配机可自动降级  
  - 降低像素比
  - 禁用后处理
  - 减少阴影分辨率

### **音效标准**
- 三种音效清晰可辨
- 音量适中，不刺耳
- 与动画同步，无延迟

---

# 10. 状态机（完整版）

```
IDLE（待机）
  ↓ [用户点击"开始摇骰"]
START_SHAKE（开始）
  ↓
COVER_DOWN（盖盅，0.3s）
  ↓
CUP_SHAKE（摇盅，1.2-1.8s 随机）
  ↓
CUP_DROP（落盅，0.2s）
  ↓
DICE_PHYSICS（骰子物理模拟，1-3s 动态）
  ↓ [检测到停稳]
RESULT_CORRECT（结果校正，0.1s）
  ↓
CUP_UP（抬盅，1s）
  ↓
RESULT_SHOW（展示结果）
  ↓ [3秒后]
IDLE（待机）
```

**状态转换条件：**
- `START_SHAKE` → `COVER_DOWN`：立即
- `COVER_DOWN` → `CUP_SHAKE`：0.3s 后
- `CUP_SHAKE` → `CUP_DROP`：1.2-1.8s 随机后
- `CUP_DROP` → `DICE_PHYSICS`：0.2s 后
- `DICE_PHYSICS` → `RESULT_CORRECT`：检测到停稳或超时（3s）
- `RESULT_CORRECT` → `CUP_UP`：0.1s 后
- `CUP_UP` → `RESULT_SHOW`：1s 后
- `RESULT_SHOW` → `IDLE`：3s 后

---

# 11. 技术实现检查清单

## 11.1 模型和材质
- [ ] 玻璃筛盅模型创建（CylinderGeometry + TorusGeometry）
- [ ] 玻璃材质配置（MeshPhysicalMaterial，所有参数正确）
- [ ] 骰子模型创建（BoxGeometry + 六面点数）
- [ ] 骰子材质配置（MeshStandardMaterial）
- [ ] 桌面模型创建（BoxGeometry）
- [ ] 桌面材质配置（MeshStandardMaterial，木质纹理）

## 11.2 物理系统
- [ ] 物理世界创建（Cannon-es World）
- [ ] 骰子刚体创建（CANNON.Box）
- [ ] 桌面刚体创建（CANNON.Plane）
- [ ] 物理参数配置（质量、摩擦、弹性、阻尼）
- [ ] 物理同步（Three.js 对象与物理刚体同步）

## 11.3 动画系统
- [ ] GSAP Timeline 创建
- [ ] 盖盅动画实现
- [ ] 摇盅动画实现（圆周 + 噪声）
- [ ] 落盅动画实现
- [ ] 抬盅动画实现
- [ ] 结果校正动画实现

## 11.4 光照系统
- [ ] 环境光配置
- [ ] 主光源配置（DirectionalLight）
- [ ] 聚光灯配置（SpotLight）
- [ ] 补光源配置（PointLight）
- [ ] 半球光配置（HemisphereLight）
- [ ] 阴影配置（阴影贴图、阴影类型）

## 11.5 环境贴图
- [ ] 环境贴图创建（CubeTexture 或 PMREMGenerator）
- [ ] 环境贴图应用到场景
- [ ] 环境贴图应用到玻璃材质
- [ ] 错误处理（创建失败时的备选方案）

## 11.6 音效系统
- [ ] 音效文件准备（或 Web Audio API 实现）
- [ ] 摇盅摩擦声实现
- [ ] 骰子碰撞声实现
- [ ] 筛盅落下声实现
- [ ] 音效触发逻辑
- [ ] 音效音量控制

## 11.7 性能优化
- [ ] 设备性能检测
- [ ] 自动降级配置
- [ ] FPS 监控
- [ ] 内存监控（可选）
- [ ] 渲染优化（实例化、LOD）
- [ ] 物理优化（时间步长、碰撞检测）

## 11.8 错误处理
- [ ] 渲染器初始化检查
- [ ] 环境贴图创建错误处理
- [ ] 音效加载失败处理
- [ ] 物理引擎错误处理
- [ ] 动画状态错误处理

---

# 12. 参考资源

## 12.1 官方文档
- [Three.js 官方文档](https://threejs.org/docs/)
- [Cannon-es 官方文档](https://github.com/pmndrs/cannon-es)
- [GSAP 官方文档](https://greensock.com/docs/)
- [Howler.js 官方文档](https://howlerjs.com/)

## 12.2 最佳实践
- Three.js + Cannon.js 骰子游戏实现
- CSS3 3D 骰子动画实现
- Web Audio API 音效生成

## 12.3 性能优化
- Three.js 性能优化指南
- WebGL 性能优化技巧
- 移动端 3D 渲染优化

---

# 13. 版本历史

**V2.0（当前版本）**
- 完善技术实现细节
- 补充常见问题解决方案
- 添加性能优化方案
- 完善验收标准
- 添加技术实现检查清单

**V1.0（初始版本）**
- 基础需求定义
- 动画阶段拆解
- 技术方案选择

---

**文档维护：** 根据实际开发情况持续更新和完善
