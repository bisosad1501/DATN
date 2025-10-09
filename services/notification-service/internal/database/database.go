package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

type Database struct {
	DB *sql.DB
}

func NewDatabase(connectionString string) (*Database, error) {
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Database connection established")

	return &Database{DB: db}, nil
}

func (d *Database) Close() error {
	if d.DB != nil {
		log.Println("Closing database connection...")
		return d.DB.Close()
	}
	return nil
}
