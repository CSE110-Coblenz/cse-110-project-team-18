/**
 * randomInt() returns the random integer between min and max
 * 
 * @param min the lower bound of random function
 * @param max the upper bound of random function
 * @returns a random integer in range of min and max
*/
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * randomChar() returns the random char in string
 * 
 * @param chars the sequence of characters wanted to randomly pick
 * @returns a random character in string
*/
export function randomChar(chars: string): string {
    const index = Math.floor(Math.random() * chars.length);
    return chars[index];
}