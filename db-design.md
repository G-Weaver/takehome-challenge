## Pages
- **Sign up** - User can create a new account
- **Log in** - User can sign in to their account
- **Dashboard** - Shows all events with search and filter capabilities
- **Event Management** - Create, edit, and delete events

## Authentication
- Supabase email/password authentication
- Server-side auth for Next.js following [Supabase docs](https://supabase.com/docs/guides/auth/server-side/nextjs)

## Database Schema

### Tables Overview
- **Sports table** - One-to-many relationship (each event has one sport, each sport can belong to many events)
- **Venues table** - Normalized for reusability across events
- **Events table** - Contains all required fields plus `created_by` for ownership/permissions

### Design Decision: Venues Array
The `events.venue_ids` field uses a UUID array rather than a join table. Since the requirements specify filtering by sport and name (not venues), this approach simplifies queries and development time for the MVP. In a production system, I would migrate to an `event_venues` join table to support inverse lookups and referential integrity constraints.

### `sports`
| Column     | Type          | Constraints      |
|------------|---------------|------------------|
| id         | UUID          | PRIMARY KEY      |
| name       | VARCHAR(100)  | UNIQUE, NOT NULL |
| created_at | TIMESTAMP     | DEFAULT NOW()    |

### `venues`
| Column     | Type         | Constraints   |
|------------|--------------|---------------|
| id         | UUID         | PRIMARY KEY   |
| name       | VARCHAR(255) | NOT NULL      |
| address    | TEXT         | NOT NULL      |
| created_at | TIMESTAMP    | DEFAULT NOW() |

### `events`
| Column      | Type         | Constraints        |
|-------------|--------------|--------------------|
| id          | UUID         | PRIMARY KEY        |
| name        | VARCHAR(255) | NOT NULL           |
| sport_id    | UUID         | FK → sports.id     |
| venue_ids   | UUID[]       | Array of venue IDs |
| date_time   | TIMESTAMP    | NOT NULL           |
| description | TEXT         |                    |
| created_by  | UUID         | FK → auth.users.id |
| created_at  | TIMESTAMP    | DEFAULT NOW()      |
| updated_at  | TIMESTAMP    | DEFAULT NOW()      |

### Relationships
- `events.sport_id` → `sports.id` (many-to-one)
- `events.venue_ids` → `venues.id` (many-to-many via array)
- `events.created_by` → `auth.users.id` (many-to-one)

### Permissions
Only the user who created an event (matched via `created_by`) can edit or delete that event. All users can view all events on the dashboard.



