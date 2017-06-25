export default function sizeInBytesStr(size, digits) {

    const kilo = 1 << 10;
    const mega = 1 << 20;

    digits = digits || 2;

    if (size >= mega) {
        return (size / mega).toFixed(digits) + "mb";
    }
    if (size >= kilo) {
        return  (size / kilo).toFixed(digits) + "kb";
    }
    return size + "b";
}
