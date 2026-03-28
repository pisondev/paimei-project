package invitations

type Invitation struct {
	ID                int     `json:"id"`
	EventName         string  `json:"event_name"`
	LocationDummy     string  `json:"location_dummy"`
	EventDate         string  `json:"event_date"`
	IsAccepted        bool    `json:"is_accepted"`
	AmeyOutfit        string  `json:"amey_outfit"`
	AmeyTopColor      *string `json:"amey_top_color"`
	AmeyBottomColor   *string `json:"amey_bottom_color"`
	PaisenOutfit      string  `json:"paisen_outfit"`
	PaisenTopColor    *string `json:"paisen_top_color"`
	PaisenBottomColor *string `json:"paisen_bottom_color"`
}

type AmeyAcceptRequest struct {
	Outfit      string `json:"outfit"`
	TopColor    string `json:"top_color"`
	BottomColor string `json:"bottom_color"`
}

type PaisenUpdateRequest struct {
	Outfit      string `json:"outfit"`
	TopColor    string `json:"top_color"`
	BottomColor string `json:"bottom_color"`
}
