# Database Methods

This is a guide to working with the database methods, including an introduction to: database structure, creating users, and logging in users.



# Importing Methods
Use `import { required_method_name } from src/db/users.ts`


# Database Structure

The SQLite database stores user data including: `id` (a unique, auto-incremented identifier for each user that is **1-indexed**), `username`, `password` (the hashed user password), `lvl`, `score`, `current_planet_id`.


## Creating users
**Description**
Creates a new user with the provided username and password.\
**Usage**\
`createUser(username: string, password: string)`\
**Arguments**\
`username`: Desired username\
`password`: Desired password\
**Return**\
A `Promise<number>` containing the user's `id`.

## Logging in
**Description**\
Checks against the database and attempts to log in a user from a given username and password.\
**Usage**\
`loginUser(username: string, password: string)`\
**Arguments**\
`username`: A username\
`password`: A password\
**Return**\
A `Promise<User | null>` . Return of type `User` if user was found (i.e. login was successful) and `null` otherwise.