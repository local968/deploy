export function toLocaleString(number) {
    if (number === '' || !number) return number;
    
    const tonumber = Number(number);
    if (isNaN(tonumber)) {
        return number;
    } else {
        return parseFloat(tonumber).toLocaleString();
    }
}