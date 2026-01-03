'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/contexts/TelegramContext';
import { useWallet } from '@/contexts/WalletContext';
import { apiService } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import Input from '@/components/ui/Input';
import ToastContainer, { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

/**
 * 修改密码页面
 * 
 * 功能：
 * 1. 检测用户是否已设置密码
 * 2. 如果未设置密码，提供设置初始密码功能
 * 3. 如果已设置密码，提供两种修改方式：
 *    - 使用旧密码修改
 *    - 使用邮箱验证码修改
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useTelegram();
  const { accountInfo } = useWallet();
  const userId = user?.id;

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [hasEmail, setHasEmail] = useState<boolean | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string>(''); // 当前邮箱地址
  const [mode, setMode] = useState<'set' | 'reset' | 'code' | 'recover'>('set'); // set: 设置初始密码, reset: 使用旧密码, code: 使用验证码, recover: 恢复账号
  const [showAddEmail, setShowAddEmail] = useState(false); // 是否显示添加邮箱表单
  
  // UID输入
  const [targetUserId, setTargetUserId] = useState<string>(userId ? String(userId) : '');
  
  // 表单数据
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState(''); // 用于创建/更新邮箱
  const [code, setCode] = useState('');
  const [emailCode, setEmailCode] = useState(''); // 用于邮箱验证码
  const [lastUserId, setLastUserId] = useState(''); // 原始用户ID（用于恢复账号）
  const [recoverPassword, setRecoverPassword] = useState(''); // 原始密码（用于恢复账号）
  
  // UI 状态
  const [codeSent, setCodeSent] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [emailCodeCountdown, setEmailCodeCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // 检查是否已设置密码和邮箱
  useEffect(() => {
    const checkStatus = async () => {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        // 设置超时时间
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('请求超时')), 10000)
        );

        // 同时检查密码和邮箱状态
        const [passwordResponse, emailResponse, accountResponse] = await Promise.race([
          Promise.all([
            apiService.hasSetPassword(targetUserId),
            apiService.hasSetEmail(targetUserId),
            apiService.queryAccount(targetUserId)
          ]),
          timeout
        ]) as any;
        
        if (passwordResponse.success) {
          setHasPassword(passwordResponse.data);
          setMode(passwordResponse.data ? 'reset' : 'set');
        } else {
          console.warn('检查密码状态失败:', passwordResponse.message);
          // 默认假设未设置密码
          setHasPassword(false);
          setMode('set');
        }
        
        if (emailResponse.success) {
          setHasEmail(emailResponse.data);
        } else {
          console.warn('检查邮箱状态失败:', emailResponse.message);
          // 默认假设未设置邮箱
          setHasEmail(false);
        }

        // 获取当前邮箱地址（从账户信息中）
        if (accountResponse.success && accountResponse.data) {
          // 假设账户信息中有邮箱字段，需要根据实际API响应调整
          const email = (accountResponse.data as any).email || '';
          setCurrentEmail(email);
        }
      } catch (error) {
        console.error('检查状态失败:', error);
        // 网络错误时使用默认值，不阻塞用户操作
        setHasPassword(false);
        setHasEmail(false);
        setMode('set');
        
        if (error instanceof Error && error.message === '请求超时') {
          toast.error('网络连接超时，请检查网络连接');
        } else {
          toast.error('无法连接到服务器，请稍后重试');
        }
      } finally {
        setLoading(false);
      }
    };

    if (targetUserId) {
      checkStatus();
    }
  }, [targetUserId]);

  // 验证码倒计时
  useEffect(() => {
    if (codeCountdown > 0) {
      const timer = setTimeout(() => {
        setCodeCountdown(codeCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [codeCountdown]);

  // 邮箱验证码倒计时
  useEffect(() => {
    if (emailCodeCountdown > 0) {
      const timer = setTimeout(() => {
        setEmailCodeCountdown(emailCodeCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCodeCountdown]);

  // 发送密码修改验证码
  const handleSendCode = async () => {
    if (!targetUserId) {
      toast.error('请输入UID');
      return;
    }

    try {
      setSubmitting(true);
      
      // 根据API文档，sendCodeForUpdatePassword 需要 email 参数
      // 如果已设置邮箱，使用当前邮箱地址；如果未设置，使用第一个邮箱（需要从账户信息获取）
      let emailToUse = email || currentEmail;
      
      // 如果还是没有邮箱，尝试从账户信息获取
      if (!emailToUse && hasEmail) {
        try {
          const accountResponse = await apiService.queryAccount(targetUserId);
          if (accountResponse.success && accountResponse.data) {
            const accountData = accountResponse.data as any;
            emailToUse = accountData.email || accountData.mail || '';
          }
        } catch (e) {
          console.error('获取账户信息失败:', e);
        }
      }
      
      // 如果还是没有邮箱地址，提示用户
      if (!emailToUse) {
        toast.error('无法获取邮箱地址，请先设置邮箱');
        return;
      }
      
      const response = await apiService.sendCodeForUpdatePassword(targetUserId, emailToUse);
      if (response.success) {
        toast.success(`验证码已发送到您的邮箱：${emailToUse}`);
        setCodeSent(true);
        setCodeCountdown(60);
      } else {
        toast.error(response.message || '发送验证码失败');
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      toast.error('发送验证码失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 发送邮箱创建/更新验证码
  const handleSendEmailCode = async () => {
    if (!targetUserId) {
      toast.error('请输入UID');
      return;
    }

    try {
      setSubmitting(true);
      // 根据是否已设置邮箱，选择不同的API
      if (hasEmail) {
        // 更新邮箱：验证码发送到旧邮箱（不需要新邮箱地址）
        const response = await apiService.sendCodeForUpdateEmail(targetUserId);
        if (response.success) {
          toast.success(`验证码已发送到您的当前邮箱：${currentEmail || '已设置邮箱'}，请查收`);
          setEmailCodeSent(true);
          setEmailCodeCountdown(60);
        } else {
          toast.error(response.message || '发送验证码失败');
        }
      } else {
        // 创建邮箱：需要新邮箱地址，验证码发送到新邮箱
        if (!newEmail) {
          toast.error('请输入邮箱地址');
          return;
        }
        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
          toast.error('请输入有效的邮箱地址');
          return;
        }
        const response = await apiService.sendCodeForCreateEmail(targetUserId, newEmail);
        if (response.success) {
          toast.success(`验证码已发送到您的新邮箱：${newEmail}，请查收`);
          setEmailCodeSent(true);
          setEmailCodeCountdown(60);
        } else {
          toast.error(response.message || '发送验证码失败');
        }
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      toast.error('发送验证码失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 创建/更新邮箱
  const handleCreateOrUpdateEmail = async () => {
    if (!targetUserId || !emailCode) {
      toast.error('请填写完整信息');
      return;
    }

    // 更新邮箱需要新邮箱地址，创建邮箱也需要邮箱地址
    if (hasEmail && !newEmail) {
      toast.error('请输入新邮箱地址');
      return;
    }
    
    if (!hasEmail && !newEmail) {
      toast.error('请输入邮箱地址');
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newEmail && !emailRegex.test(newEmail)) {
      toast.error('请输入有效的邮箱地址');
      return;
    }

    try {
      setSubmitting(true);
      const response = hasEmail
        ? await apiService.updateEmail(targetUserId, newEmail, emailCode)
        : await apiService.createEmail(targetUserId, newEmail, emailCode);
      
      if (response.success) {
        toast.success(hasEmail ? '邮箱更新成功' : '邮箱创建成功');
        setHasEmail(true);
        setShowAddEmail(false);
        setNewEmail('');
        setEmailCode('');
        setEmailCodeSent(false);
        // 刷新邮箱状态和邮箱地址
        const [emailResponse, accountResponse] = await Promise.all([
          apiService.hasSetEmail(targetUserId),
          apiService.queryAccount(targetUserId)
        ]);
        if (emailResponse.success) {
          setHasEmail(emailResponse.data);
        }
        if (accountResponse.success && accountResponse.data) {
          const accountData = accountResponse.data as any;
          const email = accountData.email || accountData.mail || '';
          if (email) {
            setCurrentEmail(email);
          }
        }
      } else {
        toast.error(response.message || (hasEmail ? '邮箱更新失败' : '邮箱创建失败'));
      }
    } catch (error) {
      console.error('操作失败:', error);
      toast.error(hasEmail ? '邮箱更新失败' : '邮箱创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 验证密码强度
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return '密码长度至少8位';
    }
    if (password.length > 20) {
      return '密码长度不能超过20位';
    }
    
    // 检查是否包含大写字母
    if (!/[A-Z]/.test(password)) {
      return '密码必须包含至少一个大写字母';
    }
    
    // 检查是否包含小写字母
    if (!/[a-z]/.test(password)) {
      return '密码必须包含至少一个小写字母';
    }
    
    // 检查是否包含特殊字符
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return '密码必须包含至少一个特殊字符';
    }
    
    return null;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetUserId) {
      toast.error('请输入UID');
      return;
    }

    // 验证UID格式（应该是数字）
    if (!/^\d+$/.test(targetUserId)) {
      toast.error('UID必须是数字');
      return;
    }

    // 恢复账号模式不需要验证新密码
    if (mode !== 'recover') {
      // 验证新密码
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }

      // 确认密码
      if (newPassword !== confirmPassword) {
        toast.error('两次输入的密码不一致');
        return;
      }
    }

    try {
      setSubmitting(true);

      if (mode === 'set') {
        // 设置初始密码
        const response = await apiService.setPassword(targetUserId, newPassword);
        if (response.success) {
          toast.success('密码设置成功');
          setTimeout(() => {
            router.back();
          }, 1500);
        } else {
          toast.error(response.message || '设置密码失败');
        }
      } else if (mode === 'reset') {
        // 使用旧密码重置
        if (!oldPassword) {
          toast.error('请输入旧密码');
          return;
        }
        const response = await apiService.resetPassword(targetUserId, newPassword, oldPassword);
        if (response.success) {
          toast.success('密码修改成功');
          // 清空表单
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => {
            router.back();
          }, 1500);
        } else {
          toast.error(response.message || '密码修改失败，请检查旧密码是否正确');
        }
      } else if (mode === 'code') {
        // 使用验证码修改
        if (!code) {
          toast.error('请输入验证码');
          return;
        }
        if (!codeSent) {
          toast.error('请先发送验证码');
          return;
        }
        const response = await apiService.updatePasswordWithCode(targetUserId, newPassword, code);
        if (response.success) {
          toast.success('密码修改成功');
          // 清空表单
          setNewPassword('');
          setConfirmPassword('');
          setCode('');
          setCodeSent(false);
          setTimeout(() => {
            router.back();
          }, 1500);
        } else {
          toast.error(response.message || '密码修改失败，请检查验证码是否正确');
        }
      } else if (mode === 'recover') {
        // 恢复账号
        if (!lastUserId) {
          toast.error('请输入原始用户ID');
          return;
        }
        if (!recoverPassword) {
          toast.error('请输入原始密码');
          return;
        }
        // 验证原始用户ID格式
        if (!/^\d+$/.test(lastUserId)) {
          toast.error('原始用户ID必须是数字');
          return;
        }
        const response = await apiService.recoverAccount(targetUserId, lastUserId, recoverPassword);
        if (response.success) {
          toast.success('账号恢复成功');
          // 清空表单
          setLastUserId('');
          setRecoverPassword('');
          // 刷新状态
          const passwordResponse = await apiService.hasSetPassword(targetUserId);
          if (passwordResponse.success) {
            setHasPassword(passwordResponse.data);
          }
          setTimeout(() => {
            router.back();
          }, 1500);
        } else {
          toast.error(response.message || '账号恢复失败，请检查原始用户ID和密码是否正确');
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
      toast.error(error instanceof Error ? error.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-darkest">
        <TopBar title="修改密码" showBack />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-text-secondary">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-darkest pb-20">
      <TopBar title={hasPassword ? '修改密码' : '设置密码'} showBack />
      <ToastContainer />

      <div className="max-w-md mx-auto px-4 py-6">
        {/* 说明文字 */}
        <div className="mb-6">
          <p className="text-text-secondary text-sm">
            {hasPassword
              ? '请选择一种方式修改密码'
              : '首次使用，请设置您的账户密码'}
          </p>
        </div>

        {/* UID输入框 */}
        <div className="mb-4">
          <Input
            type="text"
            label="用户UID"
            value={targetUserId}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // 只允许数字
              setTargetUserId(value);
              // 清空相关状态，因为切换用户需要重新检查
              setHasPassword(null);
              setCodeSent(false);
              setCode('');
              setOldPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setEmail('');
              if (value) {
                setLoading(true);
              }
            }}
            placeholder="请输入用户UID"
            required
            disabled={submitting}
          />
          {userId && targetUserId === String(userId) && (
            <p className="mt-1 text-xs text-text-secondary">当前用户UID</p>
          )}
        </div>

        {/* 修改方式选择 */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {hasPassword && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setCodeSent(false);
                    setCode('');
                    setEmail('');
                    setLastUserId('');
                    setRecoverPassword('');
                  }}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[100px]',
                    mode === 'reset'
                      ? 'bg-primary-gold text-black'
                      : 'bg-bg-medium text-text-secondary hover:bg-bg-dark'
                  )}
                >
                  使用旧密码
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('code');
                    setOldPassword('');
                    setLastUserId('');
                    setRecoverPassword('');
                  }}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[100px]',
                    mode === 'code'
                      ? 'bg-primary-gold text-black'
                      : 'bg-bg-medium text-text-secondary hover:bg-bg-dark'
                  )}
                >
                  使用验证码
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setMode('recover');
                setOldPassword('');
                setCodeSent(false);
                setCode('');
                setEmail('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[100px]',
                mode === 'recover'
                  ? 'bg-primary-gold text-black'
                  : 'bg-bg-medium text-text-secondary hover:bg-bg-dark'
              )}
            >
              恢复账号
            </button>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 旧密码（仅使用旧密码模式时显示） */}
          {mode === 'reset' && (
            <Input
              type="password"
              label="旧密码"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="请输入旧密码"
              required
              disabled={submitting}
            />
          )}

          {/* 邮箱和验证码（仅使用验证码模式时显示） */}
          {mode === 'code' && (
            <>
              {/* 添加/更新邮箱表单 - 移到验证码上面 */}
              {showAddEmail && (
            <div className="p-4 bg-bg-medium rounded-lg border border-border mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-primary font-semibold">
                  {hasEmail ? '更新邮箱' : '添加邮箱'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEmail(false);
                    setNewEmail('');
                    setEmailCode('');
                    setEmailCodeSent(false);
                  }}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {hasEmail && currentEmail && (
                  <div className="p-3 bg-bg-dark rounded-lg border border-border">
                    <p className="text-text-secondary text-xs mb-1">当前邮箱：</p>
                    <p className="text-text-primary text-sm font-medium">{currentEmail}</p>
                    <p className="text-text-secondary text-xs mt-2">
                      验证码将发送到此邮箱，请查收后输入验证码
                    </p>
                  </div>
                )}
                {hasEmail && !currentEmail && (
                  <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                    <p className="text-yellow-300 text-xs">
                      已设置邮箱，验证码将发送到您的当前邮箱
                    </p>
                  </div>
                )}
                <Input
                  type="email"
                  label={hasEmail ? '新邮箱地址' : '邮箱地址'}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={hasEmail ? '请输入新的邮箱地址' : '请输入邮箱地址'}
                  required={!hasEmail}
                  disabled={submitting || (hasEmail === true && !emailCodeSent)}
                />
                
                <div className="flex gap-2 items-end">
                  <Input
                    type="text"
                    label="验证码"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="请输入验证码"
                    required
                    disabled={submitting}
                    maxLength={6}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    disabled={submitting || emailCodeCountdown > 0 || (!hasEmail && !newEmail)}
                    className={cn(
                      'px-4 py-3 rounded-lg text-sm font-medium transition-all h-12',
                      'flex items-center justify-center whitespace-nowrap',
                      emailCodeCountdown > 0 || (!hasEmail && !newEmail)
                        ? 'bg-bg-medium text-text-disabled cursor-not-allowed'
                        : 'bg-primary-gold text-black hover:opacity-90'
                    )}
                  >
                    {emailCodeCountdown > 0 ? `${emailCodeCountdown}秒` : '发送验证码'}
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={handleCreateOrUpdateEmail}
                  disabled={submitting || !newEmail || !emailCode}
                  className={cn(
                    'w-full py-2 rounded-lg text-sm font-medium transition-all',
                    submitting || !newEmail || !emailCode
                      ? 'bg-bg-dark text-text-disabled cursor-not-allowed'
                      : 'bg-primary-gold text-black hover:opacity-90'
                  )}
                >
                  {submitting ? '处理中...' : (hasEmail ? '更新邮箱' : '创建邮箱')}
                </button>
              </div>
            </div>
              )}

              {!hasEmail ? (
                <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg mb-4">
                  <p className="text-yellow-300 text-sm mb-3">
                    该用户尚未设置邮箱，将使用第一个邮箱发送验证码
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddEmail(true)}
                    className="px-4 py-2 bg-primary-gold text-black rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    添加邮箱
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-green-300 text-sm">
                      已设置邮箱，验证码将发送到您的邮箱
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddEmail(true)}
                      className="px-3 py-1.5 bg-primary-gold text-black rounded-lg text-xs font-medium hover:opacity-90 whitespace-nowrap ml-3"
                    >
                      更新邮箱
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 items-end">
                <Input
                  type="text"
                  label="验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="请输入验证码"
                  required
                  disabled={submitting}
                  maxLength={6}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={submitting || codeCountdown > 0}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-all h-12',
                    'flex items-center justify-center whitespace-nowrap',
                    codeCountdown > 0
                      ? 'bg-bg-medium text-text-disabled cursor-not-allowed'
                      : 'bg-primary-gold text-black hover:opacity-90'
                  )}
                >
                  {codeCountdown > 0 ? `${codeCountdown}秒` : '发送验证码'}
                </button>
              </div>
            </>
          )}

          {/* 恢复账号表单 */}
          {mode === 'recover' && (
            <>
              <Input
                type="text"
                label="原始用户ID"
                value={lastUserId}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // 只允许数字
                  setLastUserId(value);
                }}
                placeholder="请输入原始用户ID"
                required
                disabled={submitting}
              />
              <Input
                type="password"
                label="原始密码"
                value={recoverPassword}
                onChange={(e) => setRecoverPassword(e.target.value)}
                placeholder="请输入原始密码"
                required
                disabled={submitting}
              />
              <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <p className="text-blue-300 text-xs">
                  通过原始的用户ID和密码恢复账户信息。恢复后，当前账户将继承原始账户的所有数据。
                </p>
              </div>
            </>
          )}

          {/* 新密码（恢复账号模式不显示） */}
          {mode !== 'recover' && (
            <Input
              type="password"
              label="新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码（至少8位，包含大小写字母和特殊字符）"
              required
              disabled={submitting}
              error={newPassword ? (validatePassword(newPassword) || undefined) : undefined}
            />
          )}

          {/* 确认密码（恢复账号模式不显示） */}
          {mode !== 'recover' && (
            <Input
              type="password"
              label="确认新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
              required
              disabled={submitting}
              error={
                confirmPassword && newPassword !== confirmPassword
                  ? '两次输入的密码不一致'
                  : undefined
              }
            />
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting || (mode === 'recover' && (!lastUserId || !recoverPassword)) || (mode !== 'recover' && (!newPassword || !confirmPassword))}
            className={cn(
              'w-full py-3 rounded-lg text-base font-semibold transition-all',
              submitting || (mode === 'recover' && (!lastUserId || !recoverPassword)) || (mode !== 'recover' && (!newPassword || !confirmPassword))
                ? 'bg-bg-medium text-text-disabled cursor-not-allowed'
                : 'bg-primary-gold text-black hover:opacity-90 active:scale-95'
            )}
          >
            {submitting 
              ? '处理中...' 
              : mode === 'recover'
                ? '恢复账号'
                : hasPassword 
                  ? '修改密码' 
                  : '设置密码'
            }
          </button>
        </form>

        {/* 安全提示 */}
        <div className="mt-6 p-4 bg-bg-medium rounded-lg">
          <p className="text-text-secondary text-xs leading-relaxed">
            <strong className="text-text-primary">密码要求：</strong>
            <br />
            • 密码长度至少8位，最多20位
            <br />
            • 必须包含至少一个大写字母（A-Z）
            <br />
            • 必须包含至少一个小写字母（a-z）
            <br />
            • 必须包含至少一个特殊字符（!@#$%^&*等）
            <br />
            • 建议使用字母、数字和特殊字符的组合
            <br />
            • 定期更换密码以提高账户安全性
          </p>
        </div>
      </div>
    </div>
  );
}

