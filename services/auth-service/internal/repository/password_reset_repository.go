package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/bisosad1501/DATN/services/auth-service/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type PasswordResetRepository interface {
	Create(token *models.PasswordResetToken) error
	FindByTokenHash(tokenHash string) (*models.PasswordResetToken, error)
	FindByCode(code string) (*models.PasswordResetToken, error)
	MarkAsUsed(tokenID uuid.UUID) error
	DeleteExpired() error
	DeleteByUserID(userID uuid.UUID) error
}

type passwordResetRepository struct {
	db *sqlx.DB
}

func NewPasswordResetRepository(db *sqlx.DB) PasswordResetRepository {
	return &passwordResetRepository{db: db}
}

// Create creates a new password reset token
func (r *passwordResetRepository) Create(token *models.PasswordResetToken) error {
	query := `
		INSERT INTO password_reset_tokens (id, user_id, token_hash, code, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	if token.ID == uuid.Nil {
		token.ID = uuid.New()
	}
	if token.CreatedAt.IsZero() {
		token.CreatedAt = time.Now()
	}

	_, err := r.db.Exec(query, token.ID, token.UserID, token.TokenHash, token.Code, token.ExpiresAt, token.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to create password reset token: %w", err)
	}

	return nil
}

// FindByTokenHash finds a password reset token by its hash
func (r *passwordResetRepository) FindByTokenHash(tokenHash string) (*models.PasswordResetToken, error) {
	query := `
		SELECT id, user_id, token_hash, code, expires_at, used_at, created_at
		FROM password_reset_tokens
		WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
	`

	var token models.PasswordResetToken
	err := r.db.Get(&token, query, tokenHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("token not found or expired")
		}
		return nil, fmt.Errorf("failed to find token: %w", err)
	}

	return &token, nil
}

// FindByCode finds a password reset token by its 6-digit code
func (r *passwordResetRepository) FindByCode(code string) (*models.PasswordResetToken, error) {
	query := `
		SELECT id, user_id, token_hash, code, expires_at, used_at, created_at
		FROM password_reset_tokens
		WHERE code = $1 AND used_at IS NULL AND expires_at > NOW()
	`

	var token models.PasswordResetToken
	err := r.db.Get(&token, query, code)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("code not found or expired")
		}
		return nil, fmt.Errorf("failed to find token by code: %w", err)
	}

	return &token, nil
}

// MarkAsUsed marks a password reset token as used
func (r *passwordResetRepository) MarkAsUsed(tokenID uuid.UUID) error {
	query := `
		UPDATE password_reset_tokens
		SET used_at = NOW()
		WHERE id = $1
	`

	result, err := r.db.Exec(query, tokenID)
	if err != nil {
		return fmt.Errorf("failed to mark token as used: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("token not found")
	}

	return nil
}

// DeleteExpired deletes all expired or used tokens
func (r *passwordResetRepository) DeleteExpired() error {
	query := `
		DELETE FROM password_reset_tokens
		WHERE expires_at < NOW() OR used_at IS NOT NULL
	`

	_, err := r.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to delete expired tokens: %w", err)
	}

	return nil
}

// DeleteByUserID deletes all password reset tokens for a user
func (r *passwordResetRepository) DeleteByUserID(userID uuid.UUID) error {
	query := `
		DELETE FROM password_reset_tokens
		WHERE user_id = $1
	`

	_, err := r.db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user tokens: %w", err)
	}

	return nil
}
