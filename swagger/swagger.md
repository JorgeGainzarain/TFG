# BookHub API
Documentación de mi API modular

## Version: 1.0.0

### /auth/register

#### POST
##### Summary:

Register a new user

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | User registered successfully |
| 400 | Validation error |
| 409 | User already exists |
| 500 | Server error |

### /auth/login

#### POST
##### Summary:

Login a user

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Login successful |
| 400 | Validation error |
| 401 | Invalid email or password |
| 500 | Server error |

### /auth/logout

#### POST
##### Summary:

Logout current user

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Logout successful or no active session |
| 500 | Server error |

### /auth/refresh

#### POST
##### Summary:

Refresh JWT token

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Token refreshed |
| 401 | Refresh token required or invalid |
| 500 | Server error |

### /auth/me

#### GET
##### Summary:

Get current authenticated user

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Current user retrieved successfully |
| 401 | User not authenticated |
| 500 | Server error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /books/trending

#### GET
##### Summary:

Get top trending books by rating and review count

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Trending books retrieved successfully |
| 500 | Server error |

### /books

#### GET
##### Summary:

Search for books

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| q | query | Search query (title, keywords) | Yes | string |
| orderBy | query | Order results by relevance or newest | No | string |
| category | query | Filter by category | No | [Categories](#Categories) |
| page | query | Page number (pagination) | No | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Books retrieved successfully |
| 400 | Search query is required or invalid |
| 404 | No books found matching the search criteria |
| 500 | Server error |
| 503 | Google Books API unavailable |

### /books/{id}

#### GET
##### Summary:

Get book by internal database ID or Google Books ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | Book internal ID or Google Books ID | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Book retrieved successfully |
| 404 | Book not found |
| 500 | Server error |

### /users/:userId/libraries

#### GET
##### Summary:

Get all libraries for the authenticated user, optionally filtered by book or title

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| bookId | query | Filter libraries containing a specific book | No | string |
| libraryTitle | query | Filter libraries by title | No | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Libraries retrieved successfully |
| 401 | Authentication required |
| 404 | No libraries found |
| 500 | Server error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### POST
##### Summary:

Create a new library for the authenticated user

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Library created successfully |
| 400 | Invalid request body |
| 500 | Server error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /users/:userId/libraries/{libraryId}/books

#### POST
##### Summary:

Add a book to a user's library

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| libraryId | path | Library ID | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Book added to library successfully |
| 404 | Library not found |
| 409 | Book already exists in library |
| 500 | Server error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /users/:userId/libraries/{libraryId}/books/{bookId}

#### DELETE
##### Summary:

Remove a book from a user's library

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| libraryId | path | Library ID | Yes | string |
| bookId | path | Book ID | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Book removed from library successfully |
| 400 | User ID and Book ID are required |
| 404 | Library not found |
| 500 | Server error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /books/{bookId}/reviews/{reviewId}/likes/me

#### GET
##### Summary:

Check if the authenticated user has liked a review

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| bookId | path | Book ID | Yes | string |
| reviewId | path | Review ID | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Like status retrieved successfully |
| 400 | Missing userId or reviewId |
| 401 | Authentication required |
| 500 | Server error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /books/{bookId}/reviews/{reviewId}/likes

#### POST
##### Summary:

Like or unlike a review (toggle)

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| bookId | path | Book ID | Yes | string |
| reviewId | path | Review ID | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Review liked or unliked successfully |
| 400 | Missing userId or reviewId |
| 401 | Authentication required |
| 500 | Server error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /books/{bookId}/reviews

#### GET
##### Summary:

Get all reviews for a book

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| bookId | path | Book ID | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Reviews retrieved successfully |
| 404 | No reviews found for this book |
| 500 | Server error |

#### POST
##### Summary:

Create a review for a book

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| bookId | path | Book ID | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Review created successfully |
| 400 | Invalid request body |
| 401 | Authentication required |
| 409 | Review already exists for this book and user |
| 500 | Server error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /books/{bookId}/reviews/{id}

#### PUT
##### Summary:

Update a review

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| bookId | path | Book ID | Yes | string |
| id | path | Review ID | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Review updated successfully |
| 400 | Invalid request body |
| 401 | Authentication required |
| 403 | Forbidden - not review owner |
| 404 | Review not found |
| 500 | Server error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### DELETE
##### Summary:

Delete a review

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| bookId | path | Book ID | Yes | string |
| id | path | Review ID | Yes | integer |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Review deleted successfully |
| 401 | Authentication required |
| 404 | Review not found |
| 500 | Server error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /health

#### GET
##### Summary:

Health check for BookHub API

##### Description:

Returns API status, timestamp, and authentication status.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | API is running |
| 500 | Server error |
