const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
  APP_VERSION: `${API_BASE_URL}/app-version`,

  EVENTS: `${API_BASE_URL}/events`,
  EVENT_BY_ID: (id: string) => `${API_BASE_URL}/events/${id}`,
  JOIN_EVENT: (id: string) => `${API_BASE_URL}/events/${id}/join`,
  LEAVE_EVENT: (id: string) => `${API_BASE_URL}/events/${id}/leave`,
  REQUEST_JOIN: (id: string) => `${API_BASE_URL}/events/${id}/request-join`,
  EVENT_COMMENTS: (id: string) => `${API_BASE_URL}/events/${id}/comments`,
  APPROVE_REQUEST: (eventId: string, requestId: string) => `${API_BASE_URL}/events/${eventId}/requests/${requestId}/approve`,
  DENY_REQUEST: (eventId: string, requestId: string) => `${API_BASE_URL}/events/${eventId}/requests/${requestId}/deny`,
  GET_REQUESTS: (eventId: string, organizerUid: string) => `${API_BASE_URL}/events/${eventId}/requests?organizerUid=${organizerUid}`,
  APPROVE_TEAM_REQUEST: (eventId: string, teamId: string, requestId: string) => `${API_BASE_URL}/events/${eventId}/teams/${teamId}/requests/${requestId}/approve`,
  DENY_TEAM_REQUEST: (eventId: string, teamId: string, requestId: string) => `${API_BASE_URL}/events/${eventId}/teams/${teamId}/requests/${requestId}/deny`,
  SEARCH: (q: string) => `${API_BASE_URL}/search?q=${encodeURIComponent(q)}`,
  PLACES_AUTOCOMPLETE: (input: string) =>
    `${API_BASE_URL}/places/autocomplete?input=${encodeURIComponent(input)}`,

  LEAGUES: `${API_BASE_URL}/leagues`,
  MY_LEAGUES: (uid: string) => `${API_BASE_URL}/leagues?memberUid=${encodeURIComponent(uid)}`,
  LEAGUE_BY_ID: (id: string) => `${API_BASE_URL}/leagues/${id}`,
  LEAGUE_TEAMS: (id: string) => `${API_BASE_URL}/leagues/${id}/teams`,
  LEAGUE_SCHEDULE: (id: string) => `${API_BASE_URL}/leagues/${id}/schedule`,
  LEAGUE_PLAYOFFS: (id: string) => `${API_BASE_URL}/leagues/${id}/playoffs`,

  JOIN_LEAGUE_TEAM: (leagueId: string, teamId: string) => `${API_BASE_URL}/leagues/${leagueId}/teams/${teamId}/join`,
  LEAVE_LEAGUE_TEAM: (leagueId: string, teamId: string) => `${API_BASE_URL}/leagues/${leagueId}/teams/${teamId}/leave`,

  USER_RATINGS: (uid: string) => `${API_BASE_URL}/users/${uid}/ratings`,
};
