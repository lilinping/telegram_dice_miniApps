 'use client';

import React, { useEffect, useState } from 'react';
// 使用 Telegram WebApp 的弹窗作为轻量提示（若不可用则 fallback 到 alert）
import { cn } from '@/lib/utils';
import { apiService } from '@/lib/api';
import { useTelegram } from '@/contexts/TelegramContext';
import Modal from '@/components/ui/Modal';

export default function InviteCard({ className }: { className?: string }) {
  const { user } = useTelegram();
  const [inviteLink, setInviteLink] = useState<string>('');
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSimpleModal, setShowSimpleModal] = useState(true);
  const [invitees, setInvitees] = useState<Array<{ id?: string; name?: string; joinedAt?: string }>>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [generateAt, setGenerateAt] = useState<number | null>(null);
  const [copiedAt, setCopiedAt] = useState<number | null>(null);

  const loadInviteCount = async () => {
    if (!user) return;
    try {
      const resp = await fetch(`/api/backend/account/invite/count/${user.id}`, { method: 'GET' });
      const res = await resp.json();
      if (res && (res.success || res.code === 200)) {
        setCount(Number(res.data) || 0);
      } else {
        console.warn('Failed to load invite count', res);
      }
    } catch (e) {
      console.error('loadInviteCount error', e);
    }
  };

  const generateLink = async () => {
    if (!user) return;
    setLoading(true);
    setGenerateStatus('idle');
    try {
      const resp = await fetch(`/api/backend/account/invite/generate/${user.id}`, { method: 'GET' });
      const res = await resp.json();
      if (res && (res.success || res.code === 200) && res.data) {
        const link = String(res.data);
        setInviteLink(link);
        await loadInviteCount();
        // 打开预览弹窗并加载被邀请用户列表
        await fetchInvitees();
        setShowSimpleModal(true);
        setShowPreview(true);
        setGenerateStatus('success');
        setGenerateAt(Date.now());
      } else {
        // 显示失败原因
        // eslint-disable-next-line no-alert
        alert(res?.message || '生成邀请链接失败');
        setGenerateStatus('error');
      }
    } catch (e) {
      console.error('generateLink error', e);
      // eslint-disable-next-line no-alert
      alert('生成邀请链接异常');
      setGenerateStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!inviteLink) {
      // 没有链接时给出明确提示
      // eslint-disable-next-line no-alert
      alert('请先生成邀请链接');
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteLink);
      // 标记复制时间用于UI提示
      setCopiedAt(Date.now());
      // 复制后弹出预览（后端仅提供邀请数量接口，名单不可用）
      setInvitees([]);
      setShowSimpleModal(true);
      setShowPreview(true);
    } catch (e) {
      console.error('copy failed', e);
      // eslint-disable-next-line no-alert
      alert('复制失败，请手动复制');
    }
  };

  const fetchInvitees = async () => {
    // 后端当前仅提供邀请数量与生成链接接口，不返回被邀请用户名单。
    // 这里不再尝试调用未知的名单接口，直接清空 invitees 并返回。
    setInvitees([]);
    setPreviewLoading(false);
  };

  useEffect(() => {
    loadInviteCount();
  }, [user]);

  // helpers
  function formatTimeAgo(ts: number) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    return `${Math.floor(diff / 86400)} 天前`;
  }

  function showPopup(message: string) {
    // legacy: removed. Use modal and inline indicators instead.
    // 保留空实现以避免找不到函数的引用错误（如有）
    try {
      // eslint-disable-next-line no-alert
      alert(message);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className={cn('w-full rounded-2xl overflow-hidden bg-bg-dark border border-border p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div>
        <div className="text-sm text-text-secondary">邀请奖励</div>
          <div className="text-lg font-semibold">邀请好友，赢取奖励</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generateLink}
            disabled={loading}
            className="px-3 py-2 bg-primary-gold rounded-lg text-bg-dark font-semibold"
          >
            {loading ? '生成中...' : '生成邀请链接'}
          </button>
        </div>
      </div>

      <div className="mb-3 text-sm text-text-secondary">
        当前邀请数: <span className="font-medium text-white">{count !== null ? count : '--'}</span>
      </div>

      <div className="mb-3">
        <input
          readOnly
          value={inviteLink}
          placeholder="请先生成邀请链接"
          className="w-full bg-bg-medium rounded-md p-2 text-sm font-mono"
        />
      </div>

      {/* 链接复制在弹窗内进行，外部不提供复制或打开按钮 */}

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={showSimpleModal ? '邀请链接' : '邀请预览'}
        size={showSimpleModal ? 'small' : 'large'}
      >
        {showSimpleModal ? (
          <div className="space-y-4">
            <div className="text-sm text-text-secondary">生成的邀请链接（可复制）：</div>
            <div className="font-mono text-lg break-all bg-[#0b0b0b] p-6 rounded text-center">{inviteLink || '（暂无）'}</div>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (inviteLink) {
                    try {
                      await navigator.clipboard.writeText(inviteLink);
                      setCopiedAt(Date.now());
                    } catch (e) {
                      // eslint-disable-next-line no-alert
                      alert('复制失败');
                    }
                  }
                }}
                className="flex-1 py-3 rounded-md bg-primary-gold text-bg-dark font-semibold"
              >
                复制链接
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 py-3 rounded-md bg-bg-medium/60"
              >
                关闭
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowSimpleModal(false)}
                className="text-sm text-text-secondary underline"
              >
                查看详情
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-text-secondary">生成的邀请链接（可复制）：</div>
            <div className="font-mono text-sm break-all bg-[#0b0b0b] p-3 rounded">{inviteLink || '（暂无）'}</div>

            <div className="text-sm text-text-secondary mt-2">
              好友通过该邀请加入游戏有机会获得新手或活动奖励，邀请人也可在好友达到指定条件（如首次充值或有效流水）后获得相应邀请奖励。具体奖励规则请以邀请页说明为准。
            </div>

            <div className="text-sm text-text-secondary">邀请页欢迎文案预览：</div>
            <div className="bg-bg-medium p-3 rounded">
              <div className="mb-2">🎉 <strong>欢迎加入游戏！</strong></div>
              <div className="text-sm text-text-secondary mb-2">
                你是通过 <span className="text-white font-medium">{user?.firstName || user?.username || '邀请人'}</span> 的邀请进入游戏的
              </div>
              <div className="text-sm text-text-secondary">
                系统已为你送上 <span className="text-white font-medium">0.2 USDT</span> 新手奖励
              </div>
              <div className="mt-2 text-xs text-text-secondary">示例显示（请以后台实际文案与金额为准）</div>
            </div>

            <div className="text-sm text-text-secondary">邀请成功通知示例：</div>
            <div className="bg-bg-medium p-3 rounded">
              <div>✅ <strong>邀请成功！</strong></div>
              <div className="text-sm text-text-secondary mt-1">
                你的好友 <span className="text-white font-medium">{'{inviteeName}'}</span> 已通过你的邀请链接进入游戏。
              </div>
              <div className="text-sm text-text-secondary mt-1">
                当 TA 的有效游戏流水达到 <span className="text-white font-medium">{'{targetAmount}'}</span> USDT，你将获得 <span className="text-white font-medium">{'{rewardAmount}'}</span> USDT 邀请奖励。
              </div>
            </div>

            <div>
              <div className="text-sm text-text-secondary mb-2">已邀请的用户（最近 20 条）：</div>
              {previewLoading ? (
                <div className="text-sm text-text-secondary">载入中...</div>
              ) : invitees.length === 0 ? (
                <div className="text-sm text-text-secondary">暂无已邀请用户或接口未提供详细名单。</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-auto">
                  {invitees.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#0b0b0b] p-2 rounded">
                      <div>
                        <div className="text-white text-sm">{it.name || it.id || '匿名'}</div>
                        {it.joinedAt && <div className="text-xs text-text-secondary">{it.joinedAt}</div>}
                      </div>
                      <div className="text-xs text-text-secondary">{it.id ? `#${it.id}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (inviteLink) {
                    try {
                      await navigator.clipboard.writeText(inviteLink);
                      setCopiedAt(Date.now());
                    } catch (e) {
                      // eslint-disable-next-line no-alert
                      alert('复制失败');
                    }
                  }
                }}
                className="flex-1 py-2 rounded-md bg-primary-gold text-bg-dark font-semibold"
              >
                复制链接
              </button>
              <div className="flex items-center text-sm text-text-secondary">
                {copiedAt && <span className="text-green-400">已复制 • {formatTimeAgo(copiedAt)}</span>}
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 py-2 rounded-md bg-bg-medium/60"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </Modal>

      <div className="mt-3 text-xs text-text-secondary">
        欢迎文案将在邀请页面展示：<br />
        「🎉 欢迎加入游戏！你是通过 {`{inviterName}`} 的邀请进入游戏的；系统已为你送上 0.2 USDT 新手奖励。」<br />
        邀请成功通知示例：<br />
        「✅ 邀请成功！你的好友 {`{inviteeName}`} 已通过你的邀请链接进入游戏，当 TA 的有效流水达到 {`{targetAmount}`} USDT，你将获得 {`{rewardAmount}`} USDT 邀请奖励。」<br />
        温馨提示：好友通过邀请加入可获得对应的新手或活动奖励，邀请人则可在好友完成指定条件后获得邀请奖励，具体细则请查看「邀请好友」页的奖励规则。
      </div>
    </div>
  );
}



