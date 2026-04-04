package handlers

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"

	"github.com/Businesskasper/kaeltehilfe/kaeltehilfe-geo/api/internal/models"
)

var APPROXIMATE_POINT_RADIUS_DEFAULT int = 15

type AddressQuerier interface {
	GetAddress(ctx context.Context, lat float64, lng float64, apprxPointRadius int) (models.Address, bool, error)
}

func HandleAddressQuery(db AddressQuerier) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		params, paramsErr := getParams(r.URL.Query(), APPROXIMATE_POINT_RADIUS_DEFAULT)
		if paramsErr != nil {
			slog.Warn("Address query rejected: invalid params", "error", paramsErr, "status", paramsErr.statusCode)
			http.Error(w, paramsErr.Error(), paramsErr.statusCode)
			return
		}

		slog.Debug("Address query", "lat", params.lat, "lng", params.lng, "radius", params.apprxPointRadius)
		address, hasData, err := db.GetAddress(r.Context(), params.lat, params.lng, params.apprxPointRadius)
		if err != nil {
			slog.Error("Address query failed: database error", "lat", params.lat, "lng", params.lng, "error", err)
			http.Error(w, "could not complete query", http.StatusInternalServerError)
			return
		}
		if !hasData {
			slog.Debug("Address query: no result found", "lat", params.lat, "lng", params.lng, "radius", params.apprxPointRadius)
			http.Error(w, "no address found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		if err := json.NewEncoder(w).Encode(address); err != nil {
			slog.Error("Address query failed: response encoding error", "error", err)
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

func (e *paramsError) Error() string {
	return e.message
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
