package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/bisosad1501/DATN/services/auth-service/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type TokenRepository interface {
	CreateRefreshToken(token *models.RefreshToken) error
	FindRefreshToken(tokenHash string) (*models.RefreshToken, error)
	UpdateLastUsed(tokenID uuid.UUID) error
	RevokeToken(tokenID uuid.UUID, revokedBy uuid.UUID, reason string) error
	RevokeAllUserTokens(userID uuid.UUID) error
	CleanupExpiredTokens() error
}

type tokenRepository struct {
	db *sqlx.DB
}

func NewTokenRepository(db *sqlx.DB) TokenRepository {
	return &tokenRepository{db: db}
}

func (r *tokenRepository) CreateRefreshToken(token *models.RefreshToken) error {
	query := `
		INSERT INTO refresh_tokens (
			id, user_id, token_hash, device_id, device_name, device_type,
			user_agent, ip_address, expires_at, created_at, last_used_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at
	`

	now := time.Now()
	token.ID = uuid.New()
	token.CreatedAt = now
	token.LastUsedAt = now

	err := r.db.QueryRowx(query,
		token.ID,
		token.UserID,
		token.TokenHash,
		token.DeviceID,
		token.DeviceName,
		token.DeviceType,
		token.UserAgent,
		token.IPAddress,
		token.ExpiresAt,
		token.CreatedAt,
		token.LastUsedAt,
	).Scan(&token.ID, &token.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create refresh token: %w", err)
	}

	return nil
}

func (r *tokenRepository) FindRefreshToken(tokenHash string) (*models.RefreshToken, error) {
	query := `
		SELECT id, user_id, token_hash, device_id, device_name, device_type,
		       user_agent, ip_address, expires_at, revoked_at, revoked_by,
		       revoked_reason, created_at, last_used_at
		FROM refresh_tokens
		WHERE token_hash = $1 AND revoked_at IS NULL
	`

	var token models.RefreshToken
	err := r.db.Get(&token, query, tokenHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("token not found")
		}
		return nil, fmt.Errorf("failed to find token: %w", err)
	}

	return &token, nil
}

func (r *tokenRepository) UpdateLastUsed(tokenID uuid.UUID) error {
	query := `UPDATE refresh_tokens SET last_used_at = $2 WHERE id = $1`

	_, err := r.db.Exec(query, tokenID, time.Now())
	if err != nil {
		return fmt.Errorf("failed to update last used: %w", err)
	}

	return nil
}

func (r *tokenRepository) RevokeToken(tokenID uuid.UUID, revokedBy uuid.UUID, reason string) error {
	query := `
		UPDATE refresh_tokens
		SET revoked_at = $2, revoked_by = $3, revoked_reason = $4
		WHERE id = $1
	`

	_, err := r.db.Exec(query, tokenID, time.Now(), revokedBy, reason)
	if err != nil {
		return fmt.Errorf("failed to revoke token: %w", err)
	}

	return nil
}

func (r *tokenRepository) RevokeAllUserTokens(userID uuid.UUID) error {
	query := `
		UPDATE refresh_tokens
		SET revoked_at = $2, revoked_reason = $3
		WHERE user_id = $1 AND revoked_at IS NULL
	`

	_, err := r.db.Exec(query, userID, time.Now(), "logout_all")
	if err != nil {
		return fmt.Errorf("failed to revoke all tokens: %w", err)
	}

	return nil
}

func (r *tokenRepository) CleanupExpiredTokens() error {
	query := `DELETE FROM refresh_tokens WHERE expires_at < $1 OR revoked_at IS NOT NULL`

	_, err := r.db.Exec(query, time.Now())
	if err != nil {
		return fmt.Errorf("failed to cleanup tokens: %w", err)
	}

	return nil
}
