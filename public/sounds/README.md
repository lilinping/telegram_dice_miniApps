# 音效文件说明

本目录存放游戏音效文件。由于实际音效文件需要单独采购或录制,这里仅作为占位说明。

## 所需音效文件列表

1. **dice-roll.mp3** - 骰子滚动声(1.5秒,循环播放)
2. **dice-land.mp3** - 骰子落地声(短促有力)
3. **bet-click.mp3** - 下注点击音效(轻快清脆)
4. **chip-select.mp3** - 筹码选择音效(金属碰撞声)
5. **win-small.mp3** - 小额中奖音效(清脆钱币声)
6. **win-big.mp3** - 大额中奖音效(欢快庆祝音)
7. **round-start.mp3** - 开盘提示音("叮咚"声)

## 音效规格要求

- **格式**: MP3 (128kbps)
- **总大小**: < 500KB
- **单文件**: < 100KB
- **采样率**: 44.1kHz
- **声道**: 单声道(Mono)

## 获取音效资源

免费音效网站:
- https://freesound.org
- https://soundbible.com
- https://mixkit.co/free-sound-effects

## 临时处理

在开发阶段,音效文件缺失不会导致错误,useSound Hook 会优雅地处理文件加载失败的情况。
