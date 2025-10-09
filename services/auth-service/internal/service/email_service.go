package service

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"net/smtp"
)

// ---- Brand palette (aligned to the logo) ----
const (
	BrandRed      = "#E53935"
	TextDark      = "#111827"
	SoftBg        = "#FFF7F5"
	BorderSoftRed = "#FAD8D6"
)

type EmailService interface {
	SendPasswordResetEmail(toEmail, resetCode string) error
	SendVerificationEmail(toEmail, verificationCode string) error
}

type emailService struct {
	smtpHost     string
	smtpPort     string
	smtpUsername string
	smtpPassword string
	fromEmail    string
	fromName     string
}

func NewEmailService(host, port, username, password, fromEmail, fromName string) EmailService {
	return &emailService{
		smtpHost:     host,
		smtpPort:     port,
		smtpUsername: username,
		smtpPassword: password,
		fromEmail:    fromEmail,
		fromName:     fromName,
	}
}

// ---------- Shared minimal template ----------
func minimalTemplate(title, headline, introHTML, code, noteHTML string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:%s;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:10px;border:1px solid %s;">
    <tr>
      <td style="padding:24px;border-bottom:1px solid %s;">
        <div style="font-size:22px;line-height:1.2;color:%s;font-weight:700;letter-spacing:-0.3px">
          <span>IELTS</span><span style="color:%s">Go</span>
        </div>
        <div style="margin-top:6px;font-size:14px;color:#6B7280">%s</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 24px 8px 24px;">
        <h1 style="margin:0 0 12px 0;font-size:18px;color:%s">%s</h1>
        <div style="font-size:14px;color:#374151;line-height:1.7">%s</div>
        <div style="margin:20px 0;padding:18px;border:1px solid %s;border-radius:8px;background:%s;text-align:center">
          <div style="font-family:Consolas,Menlo,monospace;font-size:28px;letter-spacing:6px;font-weight:700;color:%s">%s</div>
        </div>
        <div style="font-size:12px;color:#6B7280;line-height:1.8">%s</div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 24px 24px 24px;color:#9CA3AF;font-size:12px;border-top:1px solid %s;">
        © 2025 IELTS<span style="color:%s">Go</span>. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>`, SoftBg, BorderSoftRed, BorderSoftRed, TextDark, BrandRed, title, TextDark, headline, introHTML, BorderSoftRed, SoftBg, BrandRed, code, noteHTML, BorderSoftRed, BrandRed)
}

// ---- Password reset (vi) – simple, elegant ----
func (s *emailService) SendPasswordResetEmail(toEmail, resetCode string) error {
	subject := "IELTSGo – Mã đặt lại mật khẩu"
	intro := `Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>IELTSGo</strong> của bạn. 
Vui lòng nhập mã dưới đây để tiếp tục.`
	note := `Mã có hiệu lực trong <strong>15 phút</strong>. 
Không chia sẻ mã này với bất kỳ ai. Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.`
	body := minimalTemplate(
		"Đặt lại mật khẩu",
		"Mã xác thực",
		intro,
		resetCode,
		note,
	)
	return s.sendEmail(toEmail, subject, body)
}

// ---- Email verification (en) – simple, elegant ----
func (s *emailService) SendVerificationEmail(toEmail, verificationCode string) error {
	subject := "IELTSGo – Verify your email"
	intro := `Thanks for signing up for <strong>IELTSGo</strong>. 
Please verify your email using the code below.`
	note := `This code expires in <strong>24 hours</strong>. 
If you didn’t create this account, you can safely ignore this email.`
	body := minimalTemplate(
		"Email verification",
		"Your verification code",
		intro,
		verificationCode,
		note,
	)
	return s.sendEmail(toEmail, subject, body)
}

// ---- Core send ----
func (s *emailService) sendEmail(to, subject, body string) error {
	auth := smtp.PlainAuth("", s.smtpUsername, s.smtpPassword, s.smtpHost)
	from := fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail)

	headers := map[string]string{
		"From":         from,
		"To":           to,
		"Subject":      subject,
		"MIME-Version": "1.0",
		"Content-Type": `text/html; charset="UTF-8"`,
	}

	msg := ""
	for k, v := range headers {
		msg += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	msg += "\r\n" + body

	addr := fmt.Sprintf("%s:%s", s.smtpHost, s.smtpPort)
	if err := smtp.SendMail(addr, auth, s.fromEmail, []string{to}, []byte(msg)); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	return nil
}

// ---- Secure 6-digit code ----
func Generate6DigitCode() string {
	// crypto/rand in [0, 999999]
	n, _ := rand.Int(rand.Reader, big.NewInt(1000000))
	return fmt.Sprintf("%06d", n.Int64())
}
