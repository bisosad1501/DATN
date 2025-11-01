"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Server, Database, Shield, Bell, Mail, Eye, EyeOff } from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from '@/lib/i18n'

interface SystemHealth {
  status: "healthy" | "warning" | "critical"
  uptime: number
  cpu: number
  memory: number
  disk: number
  database: "connected" | "disconnected"
  cache: "connected" | "disconnected"
}

export default function AdminSettingsPage() {

  const t = useTranslations('common')

  const [loading, setLoading] = useState(false)
  const [health, setHealth] = useState<SystemHealth>({
    status: "healthy",
    uptime: 99.9,
    cpu: 45,
    memory: 62,
    disk: 38,
    database: "connected",
    cache: "connected",
  })
  const { toast } = useToast()
  const [showSmtpPassword, setShowSmtpPassword] = useState(false)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "IELTSGo",
    siteUrl: "https://ieltsgo.com",
    supportEmail: "support@ieltsgo.com",
    maintenanceMode: false,
  })

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "noreply@ieltsgo.com",
    smtpPassword: "••••••••",
    fromEmail: "noreply@ieltsgo.com",
    fromName: "IELTSGo",
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: "30",
    passwordMinLength: "8",
    requireSpecialChar: true,
    maxLoginAttempts: "5",
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    systemAlerts: true,
  })

  useEffect(() => {
    fetchSystemHealth()
    const interval = setInterval(fetchSystemHealth, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemHealth = async () => {
    try {
      const data = await adminApi.getSystemHealth()
      setHealth(data)
    } catch (error) {
      console.error("Failed to fetch system health:", error)
    }
  }

  const handleSaveGeneralSettings = async () => {
    setLoading(true)
    try {
      await adminApi.updateSettings("general", generalSettings)
      toast({
        title: t('settings_saved'),
        description: t('general_settings_updated_successfully'),
      })
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_save_settings'),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEmailSettings = async () => {
    setLoading(true)
    try {
      await adminApi.updateSettings("email", emailSettings)
      toast({
        title: t('settings_saved'),
        description: t('email_settings_updated_successfully'),
      })
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_save_settings'),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getMetricColor = (value: number) => {
    if (value < 50) return "bg-green-500"
    if (value < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('system_settings')}</h1>
        <p className="text-muted-foreground mt-1">{t('manage_system_configuration_and_monitor_')}</p>
      </div>

        {/* System Health Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              {t('system_health_monitor')}
            </CardTitle>
            <CardDescription>{t('realtime_system_performance_status')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('system_status')}</p>
                  <p className={`text-2xl font-bold ${getStatusColor(health.status)}`}>
                    {health.status === "healthy" ? t('healthy') : health.status === "warning" ? t('warning') : t('critical')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t('uptime')}</p>
                  <p className="text-2xl font-bold">{health.uptime}%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('cpu_usage')}</span>
                    <span className="font-medium">{health.cpu}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${getMetricColor(health.cpu)}`} style={{ width: `${health.cpu}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('memory')}</span>
                    <span className="font-medium">{health.memory}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${getMetricColor(health.memory)}`} style={{ width: `${health.memory}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('disk')}</span>
                    <span className="font-medium">{health.disk}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${getMetricColor(health.disk)}`} style={{ width: `${health.disk}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t('database')}</span>
                  </div>
                  <span
                    className={`text-sm font-medium ${health.database === "connected" ? "text-green-600" : "text-red-600"}`}
                  >
                    {health.database === "connected" ? t('connected') : t('disconnected')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t('cache')}</span>
                  </div>
                  <span
                    className={`text-sm font-medium ${health.cache === "connected" ? "text-green-600" : "text-red-600"}`}
                  >
                    {health.cache === "connected" ? t('connected') : t('disconnected')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              {t('general')}
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              {t('email')}
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              {t('security')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              {t('notifications')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('general_settings')}</CardTitle>
                <CardDescription>{t('configure_basic_system_settings')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('site_name')}</Label>
                  <Input
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('site_url')}</Label>
                  <Input
                    value={generalSettings.siteUrl}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('support_email')}</Label>
                  <Input
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('maintenance_mode')}</Label>
                    <p className="text-sm text-muted-foreground">{t('enable_maintenance_mode_to_prevent_user_')}</p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                  />
                </div>

                <Button onClick={handleSaveGeneralSettings} disabled={loading}>{t('save_changes')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('email_settings')}</CardTitle>
                <CardDescription>{t('configure_smtp_and_email_settings')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('smtp_host')}</Label>
                    <Input
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('smtp_port')}</Label>
                    <Input
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('smtp_username')}</Label>
                  <Input
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('smtp_password')}</Label>
                  <div className="relative">
                    <Input
                      type={showSmtpPassword ? "text" : "password"}
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      aria-label={showSmtpPassword ? t('hide_password') : t('show_password')}
                    >
                      {showSmtpPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('from_email')}</Label>
                    <Input
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('from_name')}</Label>
                    <Input
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveEmailSettings} disabled={loading}>{t('save_changes')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('security_settings')}</CardTitle>
                <CardDescription>{t('configure_security_and_authentication_se')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('two_factor_authentication')}</Label>
                    <p className="text-sm text-muted-foreground">{t('require_2fa_for_all_admin_accounts')}</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('session_timeout_minutes')}</Label>
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('password_minimum_length')}</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('require_special_characters')}</Label>
                    <p className="text-sm text-muted-foreground">{t('passwords_must_contain_special_character')}</p>
                  </div>
                  <Switch
                    checked={securitySettings.requireSpecialChar}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, requireSpecialChar: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('max_login_attempts')}</Label>
                  <Input
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                  />
                </div>

                <Button disabled={loading}>{t('save_changes')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('notification_settings')}</CardTitle>
                <CardDescription>{t('configure_notification_preferences')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('email_notifications')}</Label>
                    <p className="text-sm text-muted-foreground">{t('receive_notifications_via_email')}</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('push_notifications')}</Label>
                    <p className="text-sm text-muted-foreground">{t('receive_browser_push_notifications')}</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('sms_notifications')}</Label>
                    <p className="text-sm text-muted-foreground">{t('receive_notifications_via_sms')}</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('weekly_reports')}</Label>
                    <p className="text-sm text-muted-foreground">{t('receive_weekly_summary_reports')}</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, weeklyReports: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('system_alerts')}</Label>
                    <p className="text-sm text-muted-foreground">{t('receive_critical_system_alerts')}</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, systemAlerts: checked })
                    }
                  />
                </div>

                <Button disabled={loading}>{t('save_changes')}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
