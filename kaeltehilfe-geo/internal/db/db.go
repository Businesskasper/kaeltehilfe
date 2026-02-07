package db

import (
	"context"

	"github.com/Businesskasper/kaeltehilfe/kaeltehilfe-geo/api/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Database struct {
	pool *pgxpool.Pool
}

func NewDatabase(ctx context.Context, connectionString string) (*Database, error) {
	pool, err := pgxpool.New(ctx, connectionString)
	if err != nil {
		return nil, err
	}

	return &Database{pool: pool}, nil
}

func (db *Database) Close() {
	db.pool.Close()
}

func (db *Database) GetAddress(
	ctx context.Context,
	lat float64,
	lng float64,
	apprxPointRadius int,
) (models.Address, bool, error) {
	address := models.Address{}
	err := db.pool.QueryRow(ctx, `select housenumber, street, city, postcode, distance_m from nearest_building($1, $2, $3)`, lat, lng, apprxPointRadius).Scan(&address.Housenumber, &address.Street, &address.City, &address.Postcode, &address.Distance)
	if err != nil {
		return address, false, err
	}

	return address, true, nil
}

// func (db *Database) GetAddresses(
// 	ctx context.Context,
// 	lat float64,
// 	lng float64,
// ) ([]models.Address, error) {

// 	rows, err := db.pool.Query(
// 		ctx,
// 		`select housenumber, street, city, postcode, distance_m
// 		 from nearest_building($1, $2)`,
// 		lat,
// 		lng,
// 	)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer rows.Close()

// 	var result []models.Address

// 	for rows.Next() {
// 		var addr models.Address

// 		err := rows.Scan(
// 			&addr.Housenumber,
// 			&addr.Street,
// 			&addr.City,
// 			&addr.Postcode,
// 			&addr.Distance,
// 		)
// 		if err != nil {
// 			return nil, err
// 		}

// 		result = append(result, addr)
// 	}

// 	if rows.Err() != nil {
// 		return nil, rows.Err()
// 	}

// 	return result, nil
// }
