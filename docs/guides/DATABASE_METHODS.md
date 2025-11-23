# Database Methods

This is a guide to working with the database methods, including an introduction to: database structure, creating users, and logging in users.

# Database Structure

The SQLite database table `users` user data including: `id` (a unique, auto-incremented identifier for each user that is **1-indexed**), `username`, `password` (the hashed user password), `lvl`, `score`, `current_planet_id`.

The SQLite database table `planets` stores a reference for each `planet_id`-`name` pair, as shown below:
| **`planet_id`** | **Name** |
|-----------------|---------------|
| 1 | Mercury |
| 2 | Venus |
| 3 | Earth |
| 4 | Mars |
| 5 | asteroidField |
| 6 | rapidFire |

The SQLite database table `user_progress` stores each user `id`-`planet_id` pair, along with a score. The score is `null` for any planet that is not unlocked. This means that each user may have up to 6 database rows; this allows for easier data access.

## **Tips**

It is **highly suggested** to store the `User` object that is returned by `loginUser` so that `User.id` can be used to call methods down the line. It may also be a good idea to store `static int PLANET_ID = getPlanetIdByName('foo')`.

# **User Methods (`userManager.ts`)**

**Usage:** `import { foo } from src/db/userManager.ts`

## Creating users

**Description**
Creates a new user with the provided username and password. Also initializes the save data so that the user has the first planet marked as unlocked, and all others marked as `null` (i.e., locked).
**Usage**
`createUser(username: string, password: string)`
**Arguments**
`username`: Desired username
`password`: Desired password
**Return**
A `Promise<number>` containing the user's `id`.

## Logging in

**Description**
Checks against the database and attempts to log in a user from a given username and password. Starts the autosave cycle for the user if the credentials are authenticated.
**Usage**
`loginUser(username: string, password: string)`
**Arguments**
`username`: A username
`password`: A password
**Return**
A `Promise<User | null>` . Return of type `User` if user was found (i.e. login was successful) and `null` otherwise.

## **Changing user's `current_planet`**

**Description**
Changes user's `current_planet` in the database. **This should be called when the user changes planets, as the `current_planet` field is used for other methods such as autosave!**
**Usage**
`changeUserCurrentPlanet(userId: number, planetId: number)`
**Arguments**
`userId`: the current user ID
`planetId`: the ID of the new current planet for the user.

## **Getting user's `current_planet`**

**Description**
Gets the user's `current_planet` as a `planet_id`.
**Usage**
`getUserCurrentPlanet(userId: number)`
**Arguments**
`userId`: the current user ID

# **Autosave Methods (`savedataManager.ts`)**

**Usage:** `import { startAutoSave, stopAutoSave } from src/db/savedataManager.ts`

## **Start Autosave**

**Description**
Starts auto save. **This SHOULD NOT need to be manually called as the loginUser() method starts this process automatically. ** This process is also linked to a Map to ensure that only one instance of the autosave is running for each user `id`
**Usage**
`startAutoSave(userId: number)`
**Arguments**
`userId`: the current user ID.

## **Stop Autosave**

**Description**
Stops auto save. **This should be called manually upon user logout, otherwise it will result in a resource leakage. NOTE: Currently, due to the requirement that this is manually called it cannot handle crashes or force exits!**
**Usage**
`stopAutoSave(userId: number)`
**Arguments**
`userId`: the current user ID.

# **User Progress Management Methods (`savedataManager.ts`)**

**Usage:** `import { save, foo, bar } from src/db/savedataManager.ts`

## **Save the score for a planet (CHECKPOINT)**

**Description**
Saves the current planet's score for the user. **This should be called when the user is exiting a planet or minigame!**
**Usage**
`save(userId: number)`
**Arguments**
`userId`: the current user ID.

## **Get current planet's score**

**Description**
Gets the score for the user's current planet. Upon changing planets, to display score this should be called **after** updating the user's current planet (using `changeUserCurrentPlanet()`).
**Usage**
`getCurrentPlanetScore(userId: number)`
**Arguments**
`userId`: the current user ID.
**Return**
Returns an object with the form:

```
{
	score: number,
	planet_id: number
}
```

or `null`.

## **Get user's unlocked planets**

**Description**
Gets the unlocked planets for any given user.
**Usage**
`getUnlockedPlanets(userId: number)`
**Arguments**
`userId`: the current user ID.
**Return**
An array of numbers containing the `planet_id`'s of unlocked planets (non-`null`).

## **Get planet ID by planet name**

**Description**
Gets the planet's ID from the name (_non-case sensitive_)
**Usage**
`getPlanetIdByName(planetName: string)`
**Arguments**
`planetName`: the planet name
**Return**
An `int` of the associated `planet_id`, or `null` if the planet name does not exist (refer to the database reference `planets` (shown above) for `planet_id`-`name` pairs).
