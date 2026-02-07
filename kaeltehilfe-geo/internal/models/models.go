package models

type Address struct {
	Street      *string  `json:"street,omitempty"`
	Housenumber *string  `json:"housenumber,omitempty"`
	City        *string  `json:"city,omitempty"`
	Postcode    *string  `json:"postcode,omitempty"`
	Distance    *float64 `json:"distance,omitempty"`
}
