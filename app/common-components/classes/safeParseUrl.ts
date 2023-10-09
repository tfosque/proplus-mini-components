export function safeParseUrl(url: string) {
    let isFullyQualified = false;
    if (!isFullUrl(url)) {
        url = joinUrlPaths('https://mytestdomain.xyz', url);
    } else {
        isFullyQualified = true;
    }

    //  Get the path and parameters of the URL using the built-in URL object
    const urlObject = new URL(url);
    const { href, origin, pathname, searchParams } = urlObject;

    //  Extract the parameters from the URL
    const parameters: Record<string, string> = {};
    searchParams.forEach((value: string, key: string) => {
        parameters[key] = value;
    });

    return {
        href: isFullyQualified ? href : url,
        origin: isFullyQualified ? origin : '',
        path: pathname,
        isFullyQualified,
        parameters
    };
}
function isFullUrl(url: string): boolean {
    //  Return true if the URL starts with http:// or https://
    if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
        return true;
    }
    return false;
}
//  This function is used to correctly join two or more path segments

export function joinUrlPaths(...paths: string[]) {
    return paths.reduce((path1, path2) => {
        if (path1.endsWith('/') && path2.startsWith('/')) {
            return path1 + path2.substr(1);
        } else if (!path1.endsWith('/') && !path2.startsWith('/')) {
            //  Don't add a path if path1 is blank
            if (path1 === '') {
                return path2;
            } else {
                return `${path1}/${path2}`;
            }
        } else {
            return path1 + path2;
        }
    }, '');
}
