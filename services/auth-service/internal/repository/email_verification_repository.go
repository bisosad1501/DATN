package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/bisosad1501/DATN/services/auth-service/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type EmailVerificationRepository interface {
	Create(token *models.EmailVerificationToken) error
	FindByTokenHash(tokenHash string) (*models.EmailVerificationToken, error)
	FindByCode(code string) (*models.EmailVerificationToken, error)
	MarkAsVerified(tokenID uuid.UUID) error
	DeleteExpired() error
	DeleteByUserID(userID uuid.UUID) error
}

type emailVerificationRepository struct {
	db *sqlx.DB
}

func NewEmailVerificationRepository(db *sqlx.DB) EmailVerificationRepository {
	return &emailVerificationRepository{db: db}
}

// Create creates a new email verification token
func (r *emailVerificationRepository) Create(token *models.EmailVerificationToken) error {
	query := `
		INSERT INTO email_verification_tokens (id, user_id, token_hash, code, expires_at, created_at)
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
		return fmt.Errorf("failed to create email verification token: %w", err)
	}

	return nil
}

// FindByTokenHash finds an email verification token by its hash
func (r *emailVerificationRepository) FindByTokenHash(tokenHash string) (*models.EmailVerificationToken, error) {
	query := `
		SELECT id, user_id, token_hash, code, expires_at, verified_at, created_at
		FROM email_verification_tokens
		WHERE token_hash = $1 AND verified_at IS NULL AND expires_at > NOW()
	`

	var token models.EmailVerificationToken
	err := r.db.Get(&token, query, tokenHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("token not found or expired")
		}
		return nil, fmt.Errorf("failed to find token: %w", err)
	}

	return &token, nil
}

// FindByCode finds an email verification token by its 6-digit code
func (r *emailVerificationRepository) FindByCode(code string) (*models.EmailVerificationToken, error) {
	query := `
		SELECT id, user_id, token_hash, code, expires_at, verified_at, created_at
		FROM email_verification_tokens
		WHERE code = $1 AND verified_at IS NULL AND expires_at > NOW()
	`

	var token models.EmailVerificationToken
	err := r.db.Get(&token, query, code)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("code not found or expired")
		}
		return nil, fmt.Errorf("failed to find token by code: %w", err)
	}

	return &token, nil
}

// MarkAsVerified marks an email verification token as verified
func (r *emailVerificationRepository) MarkAsVerified(tokenID uuid.UUID) error {
	query := `
		UPDATE email_verification_tokens
		SET verified_at = NOW()
		WHERE id = $1
	`

	result, err := r.db.Exec(query, tokenID)
	if err != nil {
		return fmt.Errorf("failed to mark token as verified: %w", err)
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

// DeleteExpired deletes all expired or verified tokens
func (r *emailVerificationRepository) DeleteExpired() error {
	query := `
		DELETE FROM email_verification_tokens
		WHERE expires_at < NOW() OR verified_at IS NOT NULL
	`

	_, err := r.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to delete expired tokens: %w", err)
	}

	return nil
}

// DeleteByUserID deletes all email verification tokens for a user
func (r *emailVerificationRepository) DeleteByUserID(userID uuid.UUID) error {
	query := `
		DELETE FROM email_verification_tokens
		WHERE user_id = $1
	`

	_, err := r.db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user tokens: %w", err)
	}

	return nil
}
