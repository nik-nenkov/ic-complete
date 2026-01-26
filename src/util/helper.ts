export function sumArr(arr1: number[], arr2: number[]): number[] {
    if (arr1.length !== arr2.length) {
        throw new Error("Arrays must be of the same length");
    }
    return [arr1[0] + arr2[0], arr1[1] + arr2[1]];
}