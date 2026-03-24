package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/Businesskasper/kaeltehilfe/kaeltehilfe-geo/api/internal/models"
)

func TestGetParams_ValidLatLng(t *testing.T) {
	q := url.Values{"lat": {"48.4"}, "lng": {"9.99"}}
	p, err := getParams(q, 15)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.lat != 48.4 {
		t.Errorf("lat = %f, want 48.4", p.lat)
	}
	if p.lng != 9.99 {
		t.Errorf("lng = %f, want 9.99", p.lng)
	}
	if p.apprxPointRadius != 15 {
		t.Errorf("apprxPointRadius = %d, want 15 (default)", p.apprxPointRadius)
	}
}

func TestGetParams_CustomRadius(t *testing.T) {
	q := url.Values{"lat": {"48.4"}, "lng": {"9.99"}, "apprxPointRadius": {"100"}}
	p, err := getParams(q, 15)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.apprxPointRadius != 100 {
		t.Errorf("apprxPointRadius = %d, want 100", p.apprxPointRadius)
	}
}

func TestGetParams_MissingLat(t *testing.T) {
	q := url.Values{"lng": {"9.99"}}
	_, err := getParams(q, 15)

	if err == nil {
		t.Fatal("expected error for missing lat")
	}
	if err.statusCode != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", err.statusCode, http.StatusBadRequest)
	}
}

func TestGetParams_MissingLng(t *testing.T) {
	q := url.Values{"lat": {"48.4"}}
	_, err := getParams(q, 15)

	if err == nil {
		t.Fatal("expected error for missing lng")
	}
	if err.statusCode != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", err.statusCode, http.StatusBadRequest)
	}
}

func TestGetParams_InvalidLat(t *testing.T) {
	q := url.Values{"lat": {"abc"}, "lng": {"9.99"}}
	_, err := getParams(q, 15)

	if err == nil {
		t.Fatal("expected error for non-numeric lat")
	}
	if err.statusCode != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", err.statusCode, http.StatusBadRequest)
	}
}

func TestGetParams_InvalidLng(t *testing.T) {
	q := url.Values{"lat": {"48.4"}, "lng": {"xyz"}}
	_, err := getParams(q, 15)

	if err == nil {
		t.Fatal("expected error for non-numeric lng")
	}
}

func TestGetParams_RadiusNotInteger(t *testing.T) {
	q := url.Values{"lat": {"48.4"}, "lng": {"9.99"}, "apprxPointRadius": {"3.5"}}
	_, err := getParams(q, 15)

	if err == nil {
		t.Fatal("expected error for float radius")
	}
}

func TestGetParams_RadiusZero(t *testing.T) {
	q := url.Values{"lat": {"48.4"}, "lng": {"9.99"}, "apprxPointRadius": {"0"}}
	_, err := getParams(q, 15)

	if err == nil {
		t.Fatal("expected error for radius = 0")
	}
}

func TestGetParams_RadiusNegative(t *testing.T) {
	q := url.Values{"lat": {"48.4"}, "lng": {"9.99"}, "apprxPointRadius": {"-5"}}
	_, err := getParams(q, 15)

	if err == nil {
		t.Fatal("expected error for negative radius")
	}
}

func TestGetParams_RadiusTooLarge(t *testing.T) {
	q := url.Values{"lat": {"48.4"}, "lng": {"9.99"}, "apprxPointRadius": {"201"}}
	_, err := getParams(q, 15)

	if err == nil {
		t.Fatal("expected error for radius > 200")
	}
}

func TestGetParams_RadiusExactly200(t *testing.T) {
	q := url.Values{"lat": {"48.4"}, "lng": {"9.99"}, "apprxPointRadius": {"200"}}
	p, err := getParams(q, 15)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.apprxPointRadius != 200 {
		t.Errorf("apprxPointRadius = %d, want 200", p.apprxPointRadius)
	}
}

func TestGetParams_RadiusExactly1(t *testing.T) {
	q := url.Values{"lat": {"48.4"}, "lng": {"9.99"}, "apprxPointRadius": {"1"}}
	p, err := getParams(q, 15)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.apprxPointRadius != 1 {
		t.Errorf("apprxPointRadius = %d, want 1", p.apprxPointRadius)
	}
}

type mockDB struct {
	address models.Address
	hasData bool
	err     error
}

func (m *mockDB) GetAddress(_ context.Context, _ float64, _ float64, _ int) (models.Address, bool, error) {
	return m.address, m.hasData, m.err
}

func ptr(s string) *string    { return &s }
func fptr(f float64) *float64 { return &f }

func TestHandler_Returns200_WithAddress(t *testing.T) {
	db := &mockDB{
		address: models.Address{
			Street:      ptr("Blumentopfstraße"),
			Housenumber: ptr("42"),
			City:        ptr("Ulm"),
			Postcode:    ptr("89073"),
			Distance:    fptr(12.5),
		},
		hasData: true,
	}

	handler := HandleAddressQuery(db)
	req := httptest.NewRequest(http.MethodGet, "/address?lat=48.4&lng=9.99", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}

	var addr models.Address
	if err := json.NewDecoder(rec.Body).Decode(&addr); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if *addr.Street != "Blumentopfstraße" {
		t.Errorf("street = %q, want %q", *addr.Street, "Blumentopfstraße")
	}
	if *addr.Housenumber != "42" {
		t.Errorf("housenumber = %q, want %q", *addr.Housenumber, "42")
	}
}

func TestHandler_Returns404_WhenNoData(t *testing.T) {
	db := &mockDB{hasData: false}

	handler := HandleAddressQuery(db)
	req := httptest.NewRequest(http.MethodGet, "/address?lat=48.4&lng=9.99", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusNotFound)
	}
}

func TestHandler_Returns500_OnDBError(t *testing.T) {
	db := &mockDB{err: errors.New("connection refused")}

	handler := HandleAddressQuery(db)
	req := httptest.NewRequest(http.MethodGet, "/address?lat=48.4&lng=9.99", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusInternalServerError)
	}
}

func TestHandler_Returns400_WhenMissingParams(t *testing.T) {
	db := &mockDB{}

	handler := HandleAddressQuery(db)
	req := httptest.NewRequest(http.MethodGet, "/address", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
}

func TestHandler_Returns400_WhenRadiusInvalid(t *testing.T) {
	db := &mockDB{}

	handler := HandleAddressQuery(db)
	req := httptest.NewRequest(http.MethodGet, "/address?lat=48.4&lng=9.99&apprxPointRadius=999", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
}
