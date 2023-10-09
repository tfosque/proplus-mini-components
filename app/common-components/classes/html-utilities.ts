export function stripTags(value: string) {
    return value.replace(/<[^>]*>?/gm, '  ');
}
