export function firstAndLast(str, n, n2) {
	return str.slice(0, n) + '..' + str.slice(-(n2 || n));
}
