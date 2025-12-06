# 骰子动画优化实现计划

## 当前状态分析

### 现有实现（CSS 3D Transform）
- ✅ 基础3D骰子显示
- ✅ 简单旋转动画
- ✅ 弹跳效果
- ❌ 无真实物理
- ❌ 无筛盅
- ❌ 无玻璃材质
- ❌ 无声效

### 目标实现（Three.js + Cannon-es）
- ✅ 透明玻璃筛盅（PBR材质）
- ✅ 真实物理模拟
- ✅ 完整动画流程
- ✅ 声效系统
- ✅ 性能优化

## 技术栈选择

### Three.js（3D渲染）
```bash
npm install three @types/three
```

### Cannon-es（物理引擎）
```bash
npm install cannon-es @types/cannon-es
```

### GSAP（补间动画）
```bash
npm install gsap
```

### Howler.js（音效）
```bash
npm install howler @types/howler
```

## 实现阶段

### 阶段1：基础架构（1-2天）
- [ ] 安装依赖包
- [ ] 创建Three.js场景
- [ ] 创建Cannon-es物理世界
- [ ] 建立渲染循环
- [ ] 实现基础骰子模型

### 阶段2：筛盅模型（1天）
- [ ] 创建玻璃筛盅3D模型
- [ ] 实现PBR材质
  - MeshPhysicalMaterial
  - roughness = 0.1
  - ior = 1.45
  - transmission = 1
- [ ] 添加环境光和反射
- [ ] 实现Fresnel效果

### 阶段3：物理系统（2天）
- [ ] 骰子刚体设置
- [ ] 碰撞检测
- [ ] 摩擦力和弹性
- [ ] 重力和阻尼
- [ ] 结果校正系统

### 阶段4：动画流程（2-3天）
- [ ] 盖盅动画（0.3s）
- [ ] 摇盅动画（1.2-1.8s）
  - 圆周轨迹
  - 噪声扰动
- [ ] 落盅动画（0.2s）
- [ ] 骰子物理模拟（1s）
- [ ] 抬盅动画（1s）
- [ ] 结果展示

### 阶段5：声效系统（1天）
- [ ] 摇盅摩擦声
- [ ] 骰子碰撞声
- [ ] 筛盅落下声
- [ ] 音效触发逻辑

### 阶段6：优化和测试（1-2天）
- [ ] 性能优化
- [ ] 移动端适配
- [ ] 降级方案
- [ ] 测试和调试

## 文件结构

```
src/
├── components/
│   └── game/
│       ├── DiceAnimation.tsx (保留，作为降级方案)
│       ├── DiceAnimationThree.tsx (新建，Three.js实现)
│       ├── DiceCup.tsx (筛盅组件)
│       ├── DicePhysics.tsx (物理系统)
│       └── DiceSound.tsx (声效系统)
├── lib/
│   ├── three/
│   │   ├── scene.ts (场景设置)
│   │   ├── materials.ts (材质定义)
│   │   ├── models.ts (模型创建)
│   │   └── lights.ts (光照设置)
│   ├── physics/
│   │   ├── world.ts (物理世界)
│   │   ├── bodies.ts (刚体定义)
│   │   └── collision.ts (碰撞处理)
│   └── animations/
│       ├── cupAnimation.ts (筛盅动画)
│       ├── diceAnimation.ts (骰子动画)
│       └── timeline.ts (时间轴管理)
└── public/
    └── sounds/
        ├── cup-shake.mp3
        ├── dice-collision.mp3
        └── cup-drop.mp3
```

## 状态机设计

```typescript
enum AnimationState {
  IDLE = 'idle',
  COVER_DOWN = 'cover_down',      // 盖盅
  CUP_SHAKE = 'cup_shake',        // 摇盅
  CUP_DROP = 'cup_drop',          // 落盅
  DICE_PHYSICS = 'dice_physics',  // 骰子物理
  RESULT_CORRECT = 'result_correct', // 结果校正
  CUP_UP = 'cup_up',              // 抬盅
  RESULT_SHOW = 'result_show',    // 展示结果
}

const ANIMATION_TIMELINE = {
  COVER_DOWN: 300,      // 0.3s
  CUP_SHAKE: 1500,      // 1.5s
  CUP_DROP: 200,        // 0.2s
  DICE_PHYSICS: 1000,   // 1.0s
  RESULT_CORRECT: 100,  // 0.1s
  CUP_UP: 1000,         // 1.0s
  RESULT_SHOW: 2000,    // 2.0s
};
```

## 性能目标

### 桌面端
- 60 FPS 稳定
- 内存占用 < 100MB
- 首次加载 < 2s

### 移动端
- 主流机型 60 FPS
- 低端机型 30 FPS（降级）
- 内存占用 < 50MB

## 降级策略

### 检测设备性能
```typescript
const isLowEndDevice = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  if (!gl) return true;
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) return false;
  
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  // 检测GPU型号，判断性能
  return /Mali|Adreno 3|PowerVR/.test(renderer);
};
```

### 降级方案
- 低端设备：使用当前CSS 3D实现
- 中端设备：简化物理模拟
- 高端设备：完整效果

## 开发优先级

### P0（必须实现）
1. Three.js基础场景
2. 骰子3D模型和物理
3. 基础动画流程
4. 结果校正系统

### P1（重要）
1. 玻璃筛盅材质
2. 完整动画流程
3. 声效系统
4. 性能优化

### P2（可选）
1. 高级光照效果
2. 粒子效果
3. 后处理效果
4. 更多动画细节

## 风险评估

### 技术风险
- Three.js学习曲线
- 物理引擎调试复杂
- 性能优化难度高

### 解决方案
- 参考官方示例
- 逐步迭代开发
- 保留降级方案

### 时间风险
- 预计开发时间：7-10天
- 可能延期因素：物理调试、性能优化

### 解决方案
- 分阶段交付
- 优先实现核心功能
- 保留当前实现作为备份

## 测试计划

### 功能测试
- [ ] 骰子显示正确
- [ ] 动画流畅
- [ ] 结果准确
- [ ] 声效同步

### 性能测试
- [ ] FPS监控
- [ ] 内存占用
- [ ] 加载时间
- [ ] 电池消耗

### 兼容性测试
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] 桌面浏览器
- [ ] 不同屏幕尺寸

## 下一步行动

1. **立即开始**：安装依赖包
2. **今天完成**：基础Three.js场景
3. **明天完成**：骰子模型和物理
4. **本周完成**：基础动画流程

## 参考资源

### Three.js
- 官方文档：https://threejs.org/docs/
- 示例：https://threejs.org/examples/

### Cannon-es
- GitHub：https://github.com/pmndrs/cannon-es
- 文档：https://pmndrs.github.io/cannon-es/

### 骰子物理示例
- Three.js Dice：https://github.com/byWulf/threejs-dice
- Cannon.js Dice：https://schteppe.github.io/cannon.js/examples/dice.html

### PBR材质
- Three.js PBR：https://threejs.org/examples/#webgl_materials_physical_clearcoat
- 玻璃材质：https://threejs.org/examples/#webgl_materials_physical_transmission
