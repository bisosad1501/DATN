package repository

import (
	"fmt"

	"github.com/bisosad1501/DATN/services/auth-service/internal/models"
	"github.com/jmoiron/sqlx"
)

type AuditLogRepository interface {
	Create(log *models.AuditLog) error
}

type auditLogRepository struct {
	db *sqlx.DB
}

func NewAuditLogRepository(db *sqlx.DB) AuditLogRepository {
	return &auditLogRepository{db: db}
}

func (r *auditLogRepository) Create(log *models.AuditLog) error {
	query := `
		INSERT INTO audit_logs (
			user_id, event_type, event_status, ip_address, user_agent,
			device_info, metadata, error_message
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at
	`

	err := r.db.QueryRowx(query,
		log.UserID,
		log.EventType,
		log.EventStatus,
		log.IPAddress,
		log.UserAgent,
		log.DeviceInfo,
		log.Metadata,
		log.ErrorMessage,
	).Scan(&log.ID, &log.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create audit log: %w", err)
	}

	return nil
}
