package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"strconv"

	"github.com/Businesskasper/kaeltehilfe/kaeltehilfe-geo/api/internal/db"
)

var APPROXIMATE_POINT_RADIUS_DEFAULT int = 15

func HandleAddressQuery(db *db.Database) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		params, paramsErr := getParams(r.URL.Query(), APPROXIMATE_POINT_RADIUS_DEFAULT)
		if paramsErr != nil {
			log.Printf("params validation error: %v", paramsErr)
			http.Error(w, paramsErr.Error(), paramsErr.statusCode)
			return
		}

		log.Printf("get address for lat %f, lng %f, radius %d", params.lat, params.lng, params.apprxPointRadius)
		address, hasData, err := db.GetAddress(r.Context(), params.lat, params.lng, params.apprxPointRadius)
		if err != nil {
			log.Printf("database error: %v", err)
			http.Error(w, "could not complete query", http.StatusInternalServerError)
			return
		}
		if !hasData {
			http.Error(w, "no address found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		if err := json.NewEncoder(w).Encode(address); err != nil {
			log.Printf("encoding error: %v", err)
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
		}
	})
}

type params struct {
	lat              float64
	lng              float64
	apprxPointRadius int
}

type paramsError struct {
	statusCode int
	message    string
	error
}

func newParamsError(message string, statusCode int) *paramsError {
	return &paramsError{
		message:    message,
		statusCode: statusCode,
	}
}

func getParams(query url.Values, apprxPointRadiusDefault int) (*params, *paramsError) {
	latStr := query.Get("lat")
	lngStr := query.Get("lng")
	apprxPointRadiusStr := query.Get("apprxPointRadius")

	if latStr == "" || lngStr == "" {
		return nil, newParamsError("missing lat or lng query parameter", http.StatusBadRequest)
	}

	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		return nil, newParamsError("lat must be a float64", http.StatusBadRequest)
	}

	lng, err := strconv.ParseFloat(lngStr, 64)
	if err != nil {
		return nil, newParamsError("lng must be a float64", http.StatusBadRequest)
	}

	var apprxPointRadius = apprxPointRadiusDefault
	if apprxPointRadiusStr != "" {
		v, err := strconv.Atoi(apprxPointRadiusStr)
		if err != nil {
			return nil, newParamsError("apprxPointRadius must be an integer", http.StatusBadRequest)
		}
		apprxPointRadius = v
	}

	if apprxPointRadius <= 0 || apprxPointRadius > 200 {
		return nil, newParamsError("apprxPointRadius out of valid range (1–200 meters)", http.StatusBadRequest)
	}

	return &params{
		lat:              lat,
		lng:              lng,
		apprxPointRadius: apprxPointRadius,
	}, nil
}
